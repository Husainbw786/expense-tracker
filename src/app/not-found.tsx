import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-4 pt-20">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-5xl">🧭</p>
        <p className="mt-3 text-lg font-semibold">This page isn&apos;t here</p>
        <p className="mt-1 text-sm text-gray-500">
          The trip may have been deleted, or the link is out of date.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white"
        >
          Back to my trips
        </Link>
      </div>
    </main>
  );
}
