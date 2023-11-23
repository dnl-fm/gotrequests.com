Deno.serve(async (request: Request) => {
  const kv = await Deno.openKv();
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  if (searchParams.get("master_reset")) {
    const entries = kv.list({ prefix: [] });

    for await (const entry of entries) {
      await kv.delete(entry.key);
    }

    return Response.json({ message: `reset complete cache storage` });
  }

  const paths = url.pathname.split("/").slice(1);
  const sessionId = paths[0];
  const sessionReset = searchParams.get("reset");

  if (!sessionId) {
    return Response.json({
      error: "missing 'session id'. E.g. https://drc.deno.dev/your-session-id",
    });
  }

  const cacheKey = ["requests", sessionId];

  if (sessionReset) {
    await kv.delete(cacheKey);
    return Response.json({ message: `reset cache for session '${sessionId}'` });
  }

  const method = request.method;
  let body = {};
  const query: Record<string, string> = {};
  const headers: Record<string, string> = {};

  if (method !== "GET") {
    body = await request.json().catch((err) => {});
  }

  for (const [key, value] of searchParams.entries()) {
    if (key.indexOf("drc_") !== -1) {
      continue;
    }

    query[key] = value;
  }

  for (const [key, value] of request.headers.entries()) {
    headers[key] = value;
  }

  const data = await kv.get<object[]>(cacheKey);
  const cachedData = data.value ? data.value : [];

  if (method === "POST") {
    cachedData.push({
      method,
      pathname,
      headers,
      query,
      body,
      createdAt: new Date().toISOString(),
    });

    await kv.set(cacheKey, cachedData);
  }

  return Response.json(cachedData.reverse() || []);
});
