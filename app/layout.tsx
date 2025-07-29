// app/layout.tsx
import "./styles/globals.css";
import Header from "../components/Header";  // <-- REMOVE dynamic()
import Footer from "../components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Providers from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";
import ClientPathnameProvider from "./ClientPathnameProvider";

export const metadata = {
  title: "The One Algo",
  description: "Built with TradingView® technology",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="relative antialiased text-white flex flex-col min-h-screen overflow-x-hidden">
        <Providers session={session}>
          <Suspense fallback={null}>
            <ClientPathnameProvider>
              {(pathname: string) => (
                <>
                  <Header forceWhiteBg={pathname.startsWith("/auth")} />
                  <main className="flex-grow pt-16">{children}</main>
                  <Footer />
                </>
              )}
            </ClientPathnameProvider>
          </Suspense>
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
