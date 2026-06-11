import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center px-6 pt-24 text-center">
      <p className="ts-eyebrow ts-eyebrow--accent">Not found</p>
      <h1 className="ts-h2 mt-3">This page isn&apos;t here</h1>
      <p className="ts-micro mt-2 mb-7">
        The trip may have been deleted, or the link is out of date.
      </p>
      <Link href="/" className="btn-ghost">
        Back to my trips
      </Link>
    </main>
  );
}
