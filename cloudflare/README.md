# Cloudflare blog metrics worker

This worker tracks blog views and exposes a secured stats endpoint for the nightly GitHub Action.

## Endpoints

- `POST /api/view?slug=your-slug`
  - Increments the view counter for a blog post.
- `GET /api/likes?slug=your-slug`
  - Returns `{ slug, likes }` for a blog post.
- `POST /api/like?slug=your-slug`
  - Increments the like counter for a blog post.
- `POST /api/unlike?slug=your-slug`
  - Decrements the like counter for a blog post.
- `GET /api/stats?token=YOUR_TOKEN`
  - Returns `{ views: { slug: count } }`.

## Setup

1) Create a new Cloudflare Worker and KV namespace.
2) Bind the KV namespace as `BLOG_VIEWS`.
3) Set a secret `METRICS_TOKEN` (random string).
4) Deploy `cloudflare/worker.js`.
5) Set `BLOG_METRICS_URL` in GitHub repo secrets to:
   `https://<your-worker>.workers.dev/api/stats?token=<METRICS_TOKEN>`
6) Set `VITE_METRICS_ENDPOINT` in your local `.env` (see `.env.example`) to:
   `https://<your-worker>.workers.dev/api/view`

## Notes

- The view endpoint is public (no token) so the site can call it.
- The stats endpoint is protected by `METRICS_TOKEN` and used by the nightly workflow.
