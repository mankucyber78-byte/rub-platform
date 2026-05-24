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
import { promotePendingUrl, setStoredUser } from "@/lib/rub-storage";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setStoredUser({ email: email.trim(), name: "User" });
    promotePendingUrl();
    router.push("/verify");
  };

  const googleSignUp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setStoredUser({ email: "you@gmail.com", name: "User" });
    promotePendingUrl();
    router.push("/verify");
  };

  return (
    <AuthSplitLayout>
      <AuthFormCard>
        <h1 className="rub-font-display text-2xl font-bold text-white sm:text-3xl">
          Create your free account
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Start your website transformation
        </p>

        <div className="mt-8">
          <GoogleAuthButton label="Continue with Google" onClick={googleSignUp} />
        </div>

        <AuthDivider text="or continue with email" />

        <form onSubmit={submit} className="space-y-4">
          <FloatInput
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            icon="✉️"
          />
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
          <FloatInput
            id="confirm"
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={setConfirm}
            icon="🔒"
            rightSlot={
              <PasswordToggle
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
            }
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <GoldPrimaryButton type="submit" loading={loading}>
            Create Free Account →
          </GoldPrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[#C9A84C] hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-white/30">
          By signing up you agree to our Terms of Service and Privacy Policy
        </p>
      </AuthFormCard>
    </AuthSplitLayout>
  );
}
