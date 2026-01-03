"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();

    const [product, setProduct] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("selectedProduct");
        if (stored) setProduct(stored);

        const onStorage = () => {
            setProduct(localStorage.getItem("selectedProduct"));
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-semibold text-lg">
                        Tesztmenedzser
                    </Link>

                    {session && (
                        <>
                            <Link href="/bugs">Bug lista</Link>
                            <Link href="/editor">Editor</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    {product && (
                        <button
                            onClick={() => router.push("/")}
                            className="text-sm text-gray-700 hover:underline"
                        >
                            Jelenleg kiválasztott termék:
                            <strong className="ml-1">
                                {product.replace(".md", "")}
                            </strong>
                            <span className="ml-2 text-blue-600">
                                (váltás)
                            </span>
                        </button>
                    )}

                    {session ? (
                        <>
                            <span className="text-sm text-gray-600">
                                {session.user?.email}
                            </span>
                            <button
                                onClick={() => signOut()}
                                className="text-sm text-blue-700"
                            >
                                Kilépés
                            </button>
                        </>
                    ) : (
                        <Link href="/login">Bejelentkezés</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
