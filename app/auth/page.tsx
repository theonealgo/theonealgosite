"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthDefaultPage() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const hint = params.get("screen_hint");
    if (hint === "login") router.replace("/auth/login");
    else if (hint === "forgot") router.replace("/auth/forgot");
    else router.replace("/auth/signup");
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-400">
      Loading...
    </div>
  );
}
