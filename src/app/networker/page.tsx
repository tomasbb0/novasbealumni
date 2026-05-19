"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function NetworkerRedirectInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const qs = params?.toString();
    router.replace(qs ? `/agent/?${qs}` : "/agent/");
  }, [router, params]);

  return null;
}

export default function NetworkerRedirect() {
  return (
    <Suspense fallback={null}>
      <NetworkerRedirectInner />
    </Suspense>
  );
}
