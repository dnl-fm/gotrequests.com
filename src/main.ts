import generateUniqueId from "https://esm.sh/generate-unique-id@2.0.3";

import { Http } from "./http.ts";

Deno.serve(async (request: Request) => {
  const kv = await Deno.openKv();

  const url = new URL(Deno.env.get("URL") || request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;
  const paths = pathname.split("/").slice(1);
  const searchParams = url.searchParams;

  const isLogsRequest = pathname.indexOf("logs") !== -1;
  const isRefreshRequest = pathname.indexOf("refresh") !== -1;
  const isNonRecordRequest = isLogsRequest || isRefreshRequest;
  const sessionId = isNonRecordRequest ? paths[1] : hostname.split(".")[0];

  // ############################################
  // reset request

  const resetToken = Deno.env.get("RESET_TOKEN");
  const isResetRequest = searchParams.get("reset");
  const isValidResetRequest = isResetRequest && isResetRequest === resetToken;

  if (isValidResetRequest) {
    const entries = kv.list({ prefix: [] });

    for await (const entry of entries) {
      await kv.delete(entry.key);
    }

    return Response.json({ message: `reset complete cache storage` });
  }

  // ############################################
  // requirements

  if (!sessionId && !isNonRecordRequest) {
    return Response.json({
      error: {
        message: "use only valid URLs.",
        urls: {
          requests: `https://your-session-id.gotrequests.com`,
          logs: `https://gotrequests.com/logs/your-session-id`,
          refresh: `https://gotrequests.com/refresh/your-session-id`,
        },
      },
    });
  }

  console.log(`- handle for url ${url.toString()} with session ${sessionId}`);

  const today = new Date().toISOString().split("T")[0];
  const cacheKey = ["requests", sessionId, today];
  const data = await kv.get<object[]>(cacheKey);
  const cachedData = data.value ? data.value : [];

  // ############################################
  // refresh request

  if (isRefreshRequest) {
    console.log(`- refresh request for session ${sessionId}`);

    const entries = kv.list({ prefix: ["requests", sessionId] });

    for await (const entry of entries) {
      await kv.delete(entry.key);
    }

    return Response.json({ message: `as fresh as an ice cold glass milk` });
  }

  // ############################################
  // logs request

  if (isLogsRequest) {
    console.log(`- logs request for session ${sessionId}`);
    return Response.json(cachedData);
  }

  // ############################################
  // requests request

  console.log(`- record request for session ${sessionId}`);
  const request_id = generateUniqueId();

  cachedData.push({
    request_id,
    method: request.method,
    hostname,
    pathname,
    headers: Http.getHeaders(request),
    query: Http.getQuery(searchParams),
    body: await Http.getBody(request),
    created_at: new Date().toISOString(),
  });

  await kv.set(cacheKey, cachedData);

  return Response.json({ message: `request ${request_id} received` }, {
    status: 201,
  });
});
