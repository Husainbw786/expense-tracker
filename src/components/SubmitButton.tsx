"use client";

import { useRef, useState } from "react";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/**
 * Why requestAnimationFrame?
 *
 * React 18 flushes state updates from DOM event handlers synchronously —
 * before the browser runs its default action (form submission). If we call
 * setLoading(true) directly in onClick the button is marked disabled and
 * re-rendered BEFORE the browser submits the form, which silently blocks it.
 *
 * requestAnimationFrame defers the visual update to the next paint frame, so
 * the form submission fires first, then the spinner appears.
 *
 * A ref (submittingRef) blocks any double-clicks during that one-frame gap.
 */
export function SubmitButton({
  children,
  loadingText,
  className,
  disabled,
}: {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    // Block double-clicks
    if (submittingRef.current) {
      e.preventDefault();
      return;
    }
    // Don't show loader if the form is invalid (browser will show validation errors)
    const form = e.currentTarget.closest("form");
    if (form && !form.checkValidity()) return;

    submittingRef.current = true;
    // Defer so the form submits before React re-renders the button as disabled
    requestAnimationFrame(() => setLoading(true));
  }

  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={className}
      onClick={handleClick}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          {loadingText ?? "Please wait…"}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Compact link-style variant (Delete / Remove buttons)
export function SubmitLink({
  children,
  loadingText = "…",
  className,
}: {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (submittingRef.current) {
      e.preventDefault();
      return;
    }
    submittingRef.current = true;
    requestAnimationFrame(() => setLoading(true));
  }

  return (
    <button
      type="submit"
      disabled={loading}
      className={className}
      onClick={handleClick}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          <Spinner />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
