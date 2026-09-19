export async function onRequest({ request, params, env }) {
  if (!env.BACKEND_URL) {
    return Response.json({ error: 'BACKEND_URL is missing' }, { status: 500 });
  }

  const incomingUrl = new URL(request.url);

  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '');

  const backendBase = env.BACKEND_URL.replace(/\/$/, '');

  const targetUrl = `${backendBase}/${path}${incomingUrl.search}`;
  console.log('BACKEND_URL =', env.BACKEND_URL);
  console.log('request =', request.url);
  console.log('path =', params.path);
  console.log({
    backendBase,
    path,
    targetUrl,
  });

  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  });
}
