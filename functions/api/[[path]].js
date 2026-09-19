export async function onRequest(context) {
  const { request, params, env } = context;

  const incomingUrl = new URL(request.url);

  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '');

  const targetUrl = new URL(`/${path}${incomingUrl.search}`, env.BACKEND_URL);

  return fetch(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  });
}
