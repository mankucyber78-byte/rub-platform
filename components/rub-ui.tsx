"use client";

import { motion, AnimatePresence } from "framer-motion";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 text-sm text-red-400"
      role="alert"
    >
      {message}
    </motion.p>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 text-sm text-emerald-400"
    >
      {message}
    </motion.p>
  );
}

export function FriendlyError({
  onRetry,
  onSupport,
}: {
  onRetry?: () => void;
  onSupport?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-xl"
    >
      <p className="text-lg font-semibold text-white">Oops! Something went wrong.</p>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Don&apos;t worry — your website is safe. Please try again or contact
        support.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-[#C9A84C] px-6 py-3 text-sm font-bold text-[#0D1117]"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onSupport ?? (() => window.open("mailto:support@rub.app"))}
          className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white/80"
        >
          Contact Support
        </button>
      </div>
    </motion.div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border p-6 sm:p-8 backdrop-blur-xl ${
              variant === "danger"
                ? "border-red-500/40 glass-card"
                : "border-[#C9A84C]/30 glass-card-gold"
            }`}
          >
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60 ${
                  variant === "danger"
                    ? "bg-red-500/90 text-white"
                    : "bg-[#C9A84C] text-[#0D1117]"
                }`}
              >
                {loading && <Spinner />}
                {confirmLabel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/70 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ProgressOverlay({
  open,
  title,
  progress,
  message,
}: {
  open: boolean;
  title: string;
  progress: number;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0D1117]/90 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl glass-card-gold p-8 text-center">
            <Spinner className="mx-auto h-8 w-8 text-[#C9A84C]" />
            <p className="mt-4 font-semibold text-white">{title}</p>
            {message && (
              <p className="mt-2 text-sm text-white/50">{message}</p>
            )}
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-[#C9A84C]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
