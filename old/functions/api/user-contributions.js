addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/helloWorld') {
    return new Response('Hello from Cloudflare Worker!', {
      headers: { 'content-type': 'text/plain' }
    });
  } else if (path === '/userContributions') {
    return handleUserContributions(request);
  }

  return new Response('Not found', { status: 404 });
}

async function getUserContributions(request) {
  const { username, year } = await request.json();

  if (!username || !year) {
    return new Response('Error: missing data', { status: 400 });
  }

  const githubUrl = `https://skyline.github.com/${username}/${year}.json`;

  try {
    const response = await fetch(githubUrl);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

async function handleUserContributions(request) {
  // Set CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');

  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  return getUserContributions(request);
}
