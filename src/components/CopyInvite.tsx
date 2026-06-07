"use client";

import { useState } from "react";

export default function CopyInvite({ token, role }: { token: string; role: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback: select via prompt
      window.prompt("Copy this invite link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
    >
      {copied ? "Copied ✓" : `Copy ${role} link`}
    </button>
  );
}
