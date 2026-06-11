"use client";

import { useFormStatus } from "react-dom";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

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
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending ? (
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

export function SubmitLink({
  children,
  loadingText = "…",
  className,
}: {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
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
