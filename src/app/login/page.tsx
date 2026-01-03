"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useSearchParams();

    const callbackUrl = params.get("callbackUrl") ?? "/";

    useEffect(() => {
        if (status === "authenticated") {
            router.replace(callbackUrl);
        }
    }, [status, callbackUrl, router]);

    if (status === "loading") {
        return <p>Bejelentkezés…</p>;
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <button
                onClick={() => signIn("github", { callbackUrl })}
                className="px-6 py-3 rounded bg-blue-600 text-white"
            >
                Bejelentkezés GitHubbal
            </button>
        </main>
    );
}
