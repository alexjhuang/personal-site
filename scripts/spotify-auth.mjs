import fs from "node:fs";
import http from "node:http";
import { randomBytes } from "node:crypto";

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    if (!fs.existsSync(filename)) continue;
    const raw = fs.readFileSync(filename, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } =
  process.env;

const DEFAULT_SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-read-currently-playing",
].join(" ");

function required(name, value) {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
}

function parseCodeArg() {
  const codeArg = process.argv.find((arg) => arg.startsWith("--code="));
  if (!codeArg) {
    throw new Error("Provide auth code as --code=<AUTH_CODE>");
  }
  return codeArg.slice("--code=".length);
}

function parseScopesArg() {
  const scopesArg = process.argv.find((arg) => arg.startsWith("--scopes="));
  return scopesArg ? scopesArg.slice("--scopes=".length) : DEFAULT_SCOPES;
}

function printUsage() {
  console.log("Usage:");
  console.log("  node scripts/spotify-auth.mjs auth-url [--scopes=scope1 scope2]");
  console.log("  node scripts/spotify-auth.mjs exchange --code=<AUTH_CODE>");
  console.log("  node scripts/spotify-auth.mjs bootstrap");
}

function getAuthUrl(scopes, state) {
  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", SPOTIFY_REDIRECT_URI);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  return url.toString();
}

async function exchangeCodeForToken(code) {
  const basic = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `Code exchange failed (${response.status}): ${JSON.stringify(payload)}`
    );
  }
  return payload;
}

function upsertLocalEnv(key, value) {
  const envPath = ".env.local";
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }

  const line = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const next = pattern.test(content)
    ? content.replace(pattern, line)
    : `${content.trimEnd()}\n${line}\n`.replace(/^\n/, "");
  fs.writeFileSync(envPath, next);
}

function waitForCodeViaCallback(expectedState) {
  const redirect = new URL(SPOTIFY_REDIRECT_URI);
  const port = Number(redirect.port || 80);
  const hostname = redirect.hostname;
  const pathname = redirect.pathname;

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url || "/", `http://${hostname}:${port}`);
      if (reqUrl.pathname !== pathname) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      const returnedState = reqUrl.searchParams.get("state");
      const code = reqUrl.searchParams.get("code");
      const err = reqUrl.searchParams.get("error");

      if (err) {
        res.statusCode = 400;
        res.end(`Spotify authorization failed: ${err}`);
        server.close();
        reject(new Error(`Spotify returned error: ${err}`));
        return;
      }

      if (!code) {
        res.statusCode = 400;
        res.end("Missing code in callback URL.");
        return;
      }

      if (returnedState !== expectedState) {
        res.statusCode = 400;
        res.end("State mismatch; aborting.");
        server.close();
        reject(new Error("State mismatch in Spotify callback."));
        return;
      }

      res.statusCode = 200;
      res.end("Spotify auth complete. You can close this tab.");
      server.close();
      resolve(code);
    });

    server.on("error", (error) => reject(error));
    server.listen(port, hostname);
  });
}

async function main() {
  const command = process.argv[2];
  if (!command || command === "help" || command === "--help") {
    printUsage();
    process.exit(0);
  }

  required("SPOTIFY_CLIENT_ID", SPOTIFY_CLIENT_ID);
  required("SPOTIFY_REDIRECT_URI", SPOTIFY_REDIRECT_URI);

  if (command === "auth-url") {
    const scopes = parseScopesArg();
    const url = getAuthUrl(scopes, "manual");
    console.log("Open this URL and approve access:");
    console.log(url);
    process.exit(0);
  }

  if (command === "exchange") {
    required("SPOTIFY_CLIENT_SECRET", SPOTIFY_CLIENT_SECRET);
    const code = parseCodeArg();
    const payload = await exchangeCodeForToken(code);
    console.log("Save this refresh token as SPOTIFY_REFRESH_TOKEN:");
    console.log(payload.refresh_token || "<missing refresh_token>");
    process.exit(0);
  }

  if (command === "bootstrap") {
    required("SPOTIFY_CLIENT_SECRET", SPOTIFY_CLIENT_SECRET);
    const scopes = parseScopesArg();
    const state = randomBytes(16).toString("hex");
    const authUrl = getAuthUrl(scopes, state);

    console.log("Open this URL and approve access:");
    console.log(authUrl);
    console.log("Waiting for callback on SPOTIFY_REDIRECT_URI...");

    const code = await waitForCodeViaCallback(state);
    const payload = await exchangeCodeForToken(code);
    const refreshToken = payload.refresh_token;

    if (!refreshToken) {
      throw new Error("Missing refresh_token in Spotify response.");
    }

    upsertLocalEnv("SPOTIFY_REFRESH_TOKEN", refreshToken);
    console.log("Saved SPOTIFY_REFRESH_TOKEN to .env.local");
    console.log("Also add this token to GitHub secret: SPOTIFY_REFRESH_TOKEN");
    process.exit(0);
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
