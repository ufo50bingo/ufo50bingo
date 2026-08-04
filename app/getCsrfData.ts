import { getBaseUrl, RoomBackend } from "./roomApi";

const CSRF_REGEX = /name="csrfmiddlewaretoken" value="([a-zA-Z0-9]+)"/;

export default async function getCsrfData(roomBackend: RoomBackend): Promise<{
  cookie: string;
  token: string;
}> {
  const initialResponse = await fetch(getBaseUrl(roomBackend), {
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
