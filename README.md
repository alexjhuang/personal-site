# Personal Site

Live: https://alexjhuang.com

## Local development

```sh
npm ci
npm run dev
```

## Spotify integration setup

### 1) Spotify app settings

In Spotify Developer Dashboard app settings:

- Website: `https://alexjhuang.com`
- Redirect URI: `http://127.0.0.1:8888/callback`

### 2) Bootstrap refresh token (one-time)

Create `.env.local`:

```sh
cat > .env.local <<'EOF'
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
SPOTIFY_REDIRECT_URI="http://127.0.0.1:8888/callback"
EOF
```

Run one command:

```sh
npm run spotify:bootstrap
```

It will print an auth URL, wait for callback, exchange the code, and write
`SPOTIFY_REFRESH_TOKEN` to `.env.local`.

### 3) Configure GitHub Actions secrets

Repository Settings -> Secrets and variables -> Actions -> New repository secret:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

### 4) Run local Spotify data update (optional)

```sh
npm run spotify:update
```

This updates `public/spotify-stats.json`.

### 5) Automated nightly updates

The `Update Spotify stats` workflow runs nightly and commits updates to:

- `public/spotify-stats.json`

After secrets are set, this is fully unattended.
