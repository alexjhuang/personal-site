import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "spotify-stats.json");

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), filename);
    if (!fs.existsSync(envPath)) continue;
    const raw = fs.readFileSync(envPath, "utf8");
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

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
  process.env;

function getDefaultPayload() {
  return {
    updatedAt: new Date().toISOString().slice(0, 10),
    listeningTodayMinutes: 0,
    weeklyEnergy: [
      { label: "Mon", energy: 0 },
      { label: "Tue", energy: 0 },
      { label: "Wed", energy: 0 },
      { label: "Thu", energy: 0 },
      { label: "Fri", energy: 0 },
      { label: "Sat", energy: 0 },
      { label: "Sun", energy: 0 },
    ],
    topTracks: [],
    topArtists: [],
    currentlyPlaying: null,
  };
}

function dayIndexUtc(isoDate) {
  const day = new Date(isoDate).getUTCDay();
  return (day + 6) % 7;
}

async function getAccessToken() {
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
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token refresh failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

async function spotifyGet(pathname, accessToken) {
  const response = await fetch(`https://api.spotify.com/v1${pathname}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify GET ${pathname} failed (${response.status}): ${text}`);
  }

  return response.json();
}

function roundEnergyByDay(items) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const nowMs = now.getTime();
  const startOfWeek = new Date(nowMs);
  const daysSinceMonday = (startOfWeek.getUTCDay() + 6) % 7;
  startOfWeek.setUTCHours(0, 0, 0, 0);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysSinceMonday);
  const startMs = startOfWeek.getTime();

  for (const item of items) {
    const playedAtMs = Date.parse(item.played_at);
    if (Number.isNaN(playedAtMs) || playedAtMs < startMs || playedAtMs > nowMs) {
      continue;
    }
    const idx = dayIndexUtc(item.played_at);
    counts[idx] += 1;
  }

  const max = Math.max(1, ...counts);
  return labels.map((label, idx) => ({
    label,
    energy: counts[idx] === 0 ? 0 : Number((counts[idx] / max).toFixed(2)),
  }));
}

function minutesToday(items) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  let totalMs = 0;
  for (const item of items) {
    const playedAtMs = Date.parse(item.played_at);
    if (Number.isNaN(playedAtMs) || playedAtMs < oneDayAgo || playedAtMs > now) {
      continue;
    }
    totalMs += Number(item.track?.duration_ms || 0);
  }

  return Math.round(totalMs / 60000);
}

async function main() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    console.log(
      "Spotify secrets are missing (SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET/SPOTIFY_REFRESH_TOKEN); skipping update."
    );
    process.exit(0);
  }

  const accessToken = await getAccessToken();

  const [topTracks, topArtists, recentlyPlayed, currentlyPlaying] = await Promise.all([
    spotifyGet("/me/top/tracks?limit=5&time_range=short_term", accessToken),
    spotifyGet("/me/top/artists?limit=5&time_range=short_term", accessToken),
    spotifyGet("/me/player/recently-played?limit=50", accessToken),
    spotifyGet("/me/player/currently-playing", accessToken),
  ]);

  const recentItems = recentlyPlayed?.items || [];

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    listeningTodayMinutes: minutesToday(recentItems),
    weeklyEnergy: roundEnergyByDay(recentItems),
    topTracks: (topTracks?.items || []).map((track) => ({
      name: track.name,
      artist: (track.artists || []).map((a) => a.name).join(", "),
      url: track.external_urls?.spotify || "",
    })),
    topArtists: (topArtists?.items || []).map((artist) => ({
      name: artist.name,
      url: artist.external_urls?.spotify || "",
    })),
    currentlyPlaying:
      currentlyPlaying?.is_playing && currentlyPlaying?.item
        ? {
            name: currentlyPlaying.item.name,
            artist: (currentlyPlaying.item.artists || [])
              .map((a) => a.name)
              .join(", "),
            url: currentlyPlaying.item.external_urls?.spotify || "",
          }
        : null,
  };

  const finalPayload = {
    ...getDefaultPayload(),
    ...payload,
  };

  fs.writeFileSync(outputPath, JSON.stringify(finalPayload, null, 2));
  console.log(`Updated spotify stats at ${finalPayload.updatedAt}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
