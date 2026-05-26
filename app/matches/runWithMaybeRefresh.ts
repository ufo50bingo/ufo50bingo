import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default async function runWithMaybeRefresh(
  router: AppRouterInstance,
  matchesUrl: string | null,
  getShouldRefresh: () => Promise<boolean>,
  inFinally: () => void,
): Promise<void> {
  if (matchesUrl == null) {
    try {
      await getShouldRefresh();
    } finally {
      inFinally();
      return;
    }
  }
  let shouldRefresh = false;
  try {
    // HACK: This prevents navigation to the single match page on revalidation
    history.pushState({}, "", matchesUrl);
    shouldRefresh = await getShouldRefresh();
  } finally {
    // HACK: Revert back to the expected URL
    history.back();
    inFinally();
    if (shouldRefresh) {
      router.refresh();
    }
  }
}
