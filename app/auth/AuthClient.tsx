"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

type PlanKey = "the_one_stock" | "the_one_elite" | "the_one_premium";
const PLAN_CONFIG: Record<PlanKey, { label: string; monthly: number; yearly: number }> = {
  the_one_stock: { label: "The One: Stock Swing Analyzer", monthly: 49.99, yearly: 499.90 },
  the_one_elite: { label: "The One Elite – Dynamic Liquidity", monthly: 59.99, yearly: 599.90 },
  the_one_premium: { label: "The One Premium (both indicators)", monthly: 99.99, yearly: 999.90 },
};

export default function AuthClient() {
  const params = useSearchParams();
  const router = useRouter();
  const hint = params.get("screen_hint");
  const [view, setView] = useState<"signup" | "login" | "forgot">(
    hint === "login" ? "login" : hint === "forgot" ? "forgot" : "signup"
  );

  const [tvUser, setTvUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<PlanKey>(
    (params.get("plan") as PlanKey) || "the_one_stock"
  );
  const [billing, setBilling] = useState<"monthly" | "yearly">(
    params.get("billing") === "yearly" ? "yearly" : "monthly"
  );
  const price = billing === "monthly" ? PLAN_CONFIG[plan].monthly : PLAN_CONFIG[plan].yearly;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // --- SIGN UP ---
  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Save extra fields in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        tradingViewUsername: tvUser,
        plan,
        billing,
        createdAt: serverTimestamp(),
        signupMethod: "email",
        status: "trial",
      });

      // 3. Notify admin via API route (Mailgun)
      await fetch('/api/notify-admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tradingViewUsername: tvUser,
          plan,
          billing,
        }),
      });

      setSuccessMsg("Signup successful! You'll receive an email shortly.");
      setTimeout(() => router.push("/dashboard"), 2000); // small delay to see msg
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIN ---
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  // --- GOOGLE LOGIN ---
  async function handleGoogle() {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      // Check if user doc exists, if not, create it (first Google login)
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          tradingViewUsername: "", // can prompt later
          plan: "the_one_stock",   // default or let user pick after
          billing: "monthly",
          createdAt: serverTimestamp(),
          signupMethod: "google",
          status: "trial",
        });
      }
      // You can also send a notify-admin here if you want (optional)
      setSuccessMsg("Google signup successful!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  // --- FORGOT PASSWORD ---
  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset link sent to " + email);
    } catch (err: any) {
      setError(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  // --- LAYOUT STARTS HERE ---
  
return (
  <div className="relative w-full h-screen overflow-hidden bg-white">

    {/* Clouds video - only left half */}
   <div className="absolute inset-y-0 left-0 w-1/2 h-full z-10 pointer-events-none">
  <video
    src="/videos/clouds.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
    style={{ objectFit: "cover", width: "100%", height: "100%" }}
  />
</div>

    {/* The form block, right-aligned */}
    <div className="absolute inset-y-0 right-0 flex items-center justify-center w-1/2 z-20">
      <div className="w-full max-w-md space-y-4 mx-auto">
        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg overflow-hidden">
          {(["signup", "login", "forgot"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setView(tab);
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-3 font-semibold ${
                view === tab ? "bg-teal-500 text-black" : "bg-gray-700 text-white"
              }`}
            >
              {tab === "signup" ? "Sign Up" : tab === "login" ? "Log In" : "Forgot Password"}
            </button>
          ))}
        </div>

          {error && <div className="text-center text-red-500">{error}</div>}
          {successMsg && <div className="text-center text-green-400">{successMsg}</div>}

          {/* Sign Up */}
          {view === "signup" && (
            <form
              onSubmit={handleSignup}
              className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-[#4285F4] text-white hover:opacity-90"
              >
                <FcGoogle size={24} /> Continue with Google
              </button>
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-600" />
                <span className="px-4 text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-600" />
              </div>
              <input
                type="text"
                placeholder="TradingView Username"
                required
                value={tvUser}
                onChange={(e) => setTvUser(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              />
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as PlanKey)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              >
                {Object.entries(PLAN_CONFIG).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-4 justify-center text-white">
                {(["monthly", "yearly"] as const).map((cycle) => (
                  <label key={cycle} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={billing === cycle}
                      onChange={() => setBilling(cycle)}
                    />{" "}
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 py-3 rounded-lg font-semibold text-black"
              >
                {loading ? "Processing…" : `Start 30-Day Free Trial ($${price})`}
              </button>
            </form>
          )}

          {/* Log In */}
          {view === "login" && (
            <form
              onSubmit={handleLogin}
              className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-[#4285F4] text-white hover:opacity-90"
              >
                <FcGoogle size={24} /> Continue with Google
              </button>
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-600" />
                <span className="px-4 text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-600" />
              </div>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 py-3 rounded-lg font-semibold text-white"
              >
                {loading ? "Logging in…" : "Log In"}
              </button>
              <p className="text-center text-gray-400">
                <Link
                  href="/auth?screen_hint=signup"
                  className="text-teal-400 hover:underline"
                >
                  Need an account?
                </Link>
              </p>
            </form>
          )}

          {/* Forgot Password */}
          {view === "forgot" && (
            <form
              onSubmit={handleForgot}
              className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 py-3 rounded-lg font-semibold text-white"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
