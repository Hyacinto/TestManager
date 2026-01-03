import "./globals.css";
import AuthProvider from "@/components//AuthProvider";
import Navbar from "@/components/ui/Navbar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="hu">
            <body>
                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
                            {children}
                        </main>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
