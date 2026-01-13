export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/api/view") {
      const slug = url.searchParams.get("slug");
      if (!slug) {
        return new Response("Missing slug", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const key = `blog:${slug}`;
      const current = Number((await env.BLOG_VIEWS.get(key)) || 0);
      await env.BLOG_VIEWS.put(key, String(current + 1));
      return Response.json({ slug, views: current + 1 }, { headers: corsHeaders });
    }

    if (url.pathname === "/api/like") {
      const slug = url.searchParams.get("slug");
      if (!slug) {
        return new Response("Missing slug", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const key = `like:${slug}`;
      const current = Number((await env.BLOG_VIEWS.get(key)) || 0);
      await env.BLOG_VIEWS.put(key, String(current + 1));
      return Response.json({ slug, likes: current + 1 }, { headers: corsHeaders });
    }

    if (url.pathname === "/api/unlike") {
      const slug = url.searchParams.get("slug");
      if (!slug) {
        return new Response("Missing slug", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const key = `like:${slug}`;
      const current = Number((await env.BLOG_VIEWS.get(key)) || 0);
      const next = Math.max(0, current - 1);
      await env.BLOG_VIEWS.put(key, String(next));
      return Response.json({ slug, likes: next }, { headers: corsHeaders });
    }

    if (url.pathname === "/api/likes") {
      const slug = url.searchParams.get("slug");
      if (!slug) {
        return new Response("Missing slug", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const key = `like:${slug}`;
      const current = Number((await env.BLOG_VIEWS.get(key)) || 0);
      return Response.json({ slug, likes: current }, { headers: corsHeaders });
    }

    if (url.pathname === "/api/stats") {
      const token = url.searchParams.get("token");
      if (!token || token !== env.METRICS_TOKEN) {
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      }

      const list = await env.BLOG_VIEWS.list({ prefix: "blog:" });
      const views = {};
      for (const key of list.keys) {
        const slug = key.name.replace("blog:", "");
        const count = Number((await env.BLOG_VIEWS.get(key.name)) || 0);
        views[slug] = count;
      }

      return Response.json({ views }, { headers: corsHeaders });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
