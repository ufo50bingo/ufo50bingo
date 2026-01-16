import Link from "next/link";
import { Suspense } from "react";
import useNewHref from "./useNewHref";

type LinkProps = React.ComponentProps<typeof Link>;

export default function LinkWithVariant(props: LinkProps) {
  return (
    <Suspense fallback={<Link {...props} />}>
      <Inner {...props} />
    </Suspense>
  );
}

function Inner(props: LinkProps) {
  const newHref = useNewHref(props.href);
  return newHref == null ? (
    <Link {...props} />
  ) : (
    <Link {...props} href={newHref} />
  );
}
