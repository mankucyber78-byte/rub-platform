"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthDivider,
  AuthFormCard,
  AuthSplitLayout,
  FloatInput,
  GoogleAuthButton,
  GoldPrimaryButton,
  PasswordToggle,
} from "@/components/rub-auth-ui";
import { getStoredUrl, setStoredUser } from "@/lib/rub-storage";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setStoredUser({ email: email.trim() || "you@email.com", name: "User" });
    const hasUrl = !!getStoredUrl();
    router.push(hasUrl ? "/verify" : "/dashboard");
  };

  const googleSignIn = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setStoredUser({ email: "you@gmail.com", name: "User" });
    const hasUrl = !!getStoredUrl();
    router.push(hasUrl ? "/verify" : "/dashboard");
  };

  return (
    <AuthSplitLayout>
      <div className="mb-6 lg:hidden">
        <Link href="/" className="rub-font-display text-2xl font-bold text-[#C9A84C]">
          RUB
        </Link>
      </div>
      <AuthFormCard>
        <h1 className="rub-font-display text-2xl font-bold text-white sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-white/50">Sign in to your RUB account</p>

        <div className="mt-8">
          <GoogleAuthButton label="Continue with Google" onClick={googleSignIn} />
        </div>

        <AuthDivider text="or sign in with email" />

        <form onSubmit={submit} className="space-y-4">
          <FloatInput
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            icon="✉️"
          />
          <div>
            <FloatInput
              id="password"
              label="Password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={setPassword}
              icon="🔒"
              rightSlot={
                <PasswordToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
              }
            />
            <div className="mt-2 text-right">
              <button type="button" className="text-xs font-medium text-[#C9A84C] hover:underline">
                Forgot password?
              </button>
            </div>
          </div>

          <GoldPrimaryButton type="submit" loading={loading}>
            Sign In →
          </GoldPrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-[#C9A84C] hover:underline">
            Sign up free
          </Link>
        </p>
      </AuthFormCard>
    </AuthSplitLayout>
  );
}
