// app/GlobalLayout.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* GLOBAL BACKGROUND IMAGE */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/bground.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <Header />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
      <SpeedInsights />
    </>
  );
}
