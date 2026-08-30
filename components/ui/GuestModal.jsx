"use client";

import Link from "next/link";
import { Lock, X } from "lucide-react";

export default function GuestModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <X size={18} />
        </button>

        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255, 107, 53,0.12)" }}
        >
          <Lock size={26} color="#FF6B35" />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Create a Free Account
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sign up to save your content, publish to WordPress, and unlock all
          features.
        </p>

        <Link
          href="/signup"
          className="mt-6 block w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#FF6B35",
            boxShadow: "0 4px 15px rgba(255, 107, 53,0.3)",
          }}
        >
          Sign Up Free
        </Link>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-lg border py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          style={{ borderColor: "#e5e5e5" }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
