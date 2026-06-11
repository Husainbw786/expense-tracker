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
      <main className="flex flex-col items-center px-6 pt-24 text-center">
        <p className="ts-eyebrow ts-eyebrow--accent">Invite</p>
        <h1 className="ts-h2 mt-3">This invite link is not valid</h1>
        <p className="ts-micro mt-2 mb-7">It may have been revoked or expired.</p>
        <Link href="/" className="btn-ghost">
          Go home
        </Link>
      </main>
    );
  }

  const user = await getCurrentUser();
  // Logged out → send to login, preserving the invite so we come back here after auth.
  if (!user) redirect(`/login?invite=${encodeURIComponent(token)}`);

  return (
    <main className="flex flex-col items-center px-6 pt-24 text-center">
      <p className="ts-eyebrow ts-eyebrow--accent">You&apos;ve been invited to join</p>
      <h1 className="ts-display mt-3">{invite.tripName}</h1>
      <span className="chip mt-4">
        {invite.role === "editor" ? "Can add & edit expenses" : "View only"}
      </span>

      <form action={acceptInvite} className="mt-8 w-full max-w-xs">
        <input type="hidden" name="token" value={token} />
        <SubmitButton loadingText="Joining…" className="btn-primary w-full">
          Join trip <span aria-hidden="true">→</span>
        </SubmitButton>
      </form>
      <p className="ts-meta mt-4 normal-case">
        Joining as {user.name} ({user.email})
      </p>
    </main>
  );
}
