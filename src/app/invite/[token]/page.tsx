import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInviteByToken } from "@/lib/data";
import { acceptInvite } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite || !invite.active) {
    return (
      <main className="px-5 pt-20 text-center">
        <div className="card p-8">
          <p className="text-4xl mb-3">🔗</p>
          <p className="font-semibold text-gray-800">This invite link is not valid</p>
          <p className="text-sm text-gray-400 mt-1">It may have been revoked or expired.</p>
          <Link href="/" className="mt-4 inline-block rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  const user = await getCurrentUser();
  // Logged out → send to login, preserving the invite so we come back here after auth.
  if (!user) redirect(`/login?invite=${encodeURIComponent(token)}`);

  return (
    <main className="px-5 pt-20">
      <div className="card p-8 text-center">
        <p className="text-4xl mb-3">🧳</p>
        <p className="text-sm text-gray-400">You&apos;ve been invited to join</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{invite.tripName}</h1>
        <span
          className={`chip mt-3 ${
            invite.role === "editor" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {invite.role === "editor" ? "Can add & edit expenses" : "View only"}
        </span>

        <form action={acceptInvite} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <SubmitButton
            loadingText="Joining…"
            className="w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60"
          >
            Join trip
          </SubmitButton>
        </form>
        <p className="text-xs text-gray-400 mt-3">Joining as {user.name} ({user.email})</p>
      </div>
    </main>
  );
}
