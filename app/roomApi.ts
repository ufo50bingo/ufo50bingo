export function getRoomLink(
  id: string,
  password: string,
): string {
  const searchParams = new URLSearchParams({
    p: password,
  });
  return `/room/${id}?${searchParams.toString()}`;
}
