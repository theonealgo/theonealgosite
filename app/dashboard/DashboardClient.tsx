//app/dashboard/DashboardClient.tsx
'use client';

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 1. Listen for auth state and fetch profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        setProfile(userDoc.exists() ? userDoc.data() : null);
      } else {
        router.push("/auth");
      }
    });
    return () => unsub();
  }, [router]);

  // 2. Focus username field if missing
  useEffect(() => {
    if (profile && !profile.tradingViewUsername && inputRef.current) {
      inputRef.current.focus();
    }
  }, [profile]);

  // 3. Show loading while fetching
  if (!user) {
    return <p className="p-8 text-center">Please sign in.</p>;
  }

  // 4. Update TradingView Username
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        tradingViewUsername: username,
      });
      setProfile((p: any) => ({ ...p, tradingViewUsername: username }));

      // (Optional) notify you by email
      // await fetch("/api/notify-admin-signup", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: user.email,
      //     tradingViewUsername: username,
      //     plan: profile?.plan,
      //     billing: profile?.billing,
      //   }),
      // });

      setMessage("Thanks! You'll receive an email shortly.");
      setUsername("");
    } catch (err: any) {
      setMessage("Something went wrong: " + err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      {/* Always show logged in user */}
      <h1 className="text-2xl font-bold text-white mb-2">
        Welcome, {user.displayName || user.email || "Trader"}!
      </h1>
      <div className="text-gray-400 mb-6">
        You are signed in as: <span className="text-teal-300">{user.email}</span>
      </div>

      {/* TradingView username form */}
      {!profile?.tradingViewUsername ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-white">
            <span className="text-white">TradingView Username</span>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded"
              disabled={isLoading}
            />
          </label>
          <button
            type="submit"
            className="w-full bg-teal-500 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </form>
      ) : (
        <div className="text-lg text-white">
          Your TradingView Username:{" "}
          <span className="text-teal-400 font-semibold">{profile.tradingViewUsername}</span>
        </div>
      )}

      {/* Message feedback */}
      {message && (
        <p className={message.startsWith("Thanks!") ? "text-green-400" : "text-red-500"}>
          {message}
        </p>
      )}
    </div>
  );
}
