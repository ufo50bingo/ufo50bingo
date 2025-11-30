const CSRF_REGEX = /name="csrfmiddlewaretoken" value="([a-zA-Z0-9]+)"/;
const BINGOSYNC_BASE_URL = "https://celestebingo.rhelmot.io/";

export default async function getCsrfData(): Promise<{
  cookie: string;
  token: string;
}> {
  const initialResponse = await fetch(BINGOSYNC_BASE_URL, {
    method: "GET",
    credentials: "include",
  });
  if (!initialResponse.ok) {
    throw new Error(`Response status: ${initialResponse.status}`);
  }

  const bodyText = await initialResponse.text();
  const result = bodyText.match(CSRF_REGEX);
  if (result == null || result.length < 2) {
    throw new Error(`Failed to find CSRF token in bingosync response`);
  }
  const token = result[1];
  const cookie = initialResponse.headers.get("Set-Cookie");
  if (cookie == null) {
    throw new Error(`Failed to get CSRF cookie in bingosync response`);
  }

  return { cookie, token };
}
