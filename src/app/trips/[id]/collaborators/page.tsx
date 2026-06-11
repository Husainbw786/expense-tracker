import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripCollaborators, getTripInvites } from "@/lib/data";
import { requireTripAccess } from "@/lib/auth";
import {
  createInvite,
  revokeInvite,
  removeCollaborator,
  setCollaboratorRole,
  addCollaboratorByEmail,
} from "@/app/actions";
import { SubmitButton, SubmitLink } from "@/components/SubmitButton";
import CopyInvite from "@/components/CopyInvite";

export const dynamic = "force-dynamic";

export default async function CollaboratorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ added?: string; updated?: string; notfound?: string; msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tripId = Number(id);
  await requireTripAccess(tripId, "owner");
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const [collaborators, invites] = await Promise.all([
    getTripCollaborators(tripId),
    getTripInvites(tripId),
  ]);

  const banner = sp.added
    ? { ok: true, text: `Added ${sp.added}` }
    : sp.updated
    ? { ok: true, text: `Updated ${sp.updated}'s role` }
    : sp.notfound
    ? { ok: false, text: `No account found for "${sp.notfound}". Ask them to sign up first, or share an invite link below.` }
    : sp.msg
    ? { ok: false, text: sp.msg }
    : null;

  return (
    <main className="px-6 pb-28">
      <div className="pt-7">
        <Link
          href={`/trips/${tripId}`}
          className="ts-textlink ts-textlink--rose inline-flex items-center gap-1.5"
        >
          ← {trip.name}
        </Link>
        <div className="ts-ledgerhead mt-5">
          <p className="ts-eyebrow ts-eyebrow--accent">Share &amp; invite</p>
        </div>
        <h1 className="ts-h2 mt-3.5">
          Who can <em>see this trip</em>
        </h1>
      </div>

      <div className="flex flex-col gap-9 pt-6">
        {banner && (
          <div
            className={`border px-4 py-3 text-[0.82rem] tracking-[0.02em] ${
              banner.ok
                ? "border-green/30 bg-[#EDF6F1] text-green"
                : "border-rose-border bg-surface-accent text-rose-ink"
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Invite by email (direct add if they have an account) */}
        <section>
          <div className="ts-ledgerhead">
            <p className="ts-eyebrow ts-eyebrow--accent">Invite by email</p>
          </div>
          <form action={addCollaboratorByEmail} className="flex flex-col gap-3.5 pt-4">
            <input type="hidden" name="tripId" value={tripId} />
            <p className="ts-micro">
              If this person already has an account, they get access instantly.
            </p>
            <input name="email" type="email" required placeholder="their@email.com" className="input" />
            <div className="flex gap-2.5">
              <select name="role" defaultValue="editor" className="input flex-1">
                <option value="editor">Editor — can add &amp; edit</option>
                <option value="viewer">Viewer — read only</option>
              </select>
              <SubmitButton loadingText="Adding…" className="btn-primary shrink-0">
                Add
              </SubmitButton>
            </div>
          </form>
        </section>

        {/* Generate invite link */}
        <section>
          <div className="ts-ledgerhead">
            <p className="ts-eyebrow ts-eyebrow--accent">Create an invite link</p>
          </div>
          <p className="ts-micro pt-4">
            Generate a secret link and share it (WhatsApp, etc.). Whoever opens it signs up
            and joins this trip with the role you pick.
          </p>
          <div className="flex gap-2.5 pt-3.5">
            <form action={createInvite} className="flex-1">
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="role" value="editor" />
              <SubmitButton loadingText="Creating…" className="btn-primary w-full">
                Editor link
              </SubmitButton>
            </form>
            <form action={createInvite} className="flex-1">
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="role" value="viewer" />
              <SubmitButton loadingText="Creating…" className="btn-ghost w-full">
                Viewer link
              </SubmitButton>
            </form>
          </div>
        </section>

        {/* Active invite links */}
        {invites.length > 0 && (
          <section>
            <div className="ts-ledgerhead">
              <p className="ts-eyebrow ts-eyebrow--accent">Active links</p>
              <span className="ts-meta">{invites.length}</span>
            </div>
            <div>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 border-b border-hairline py-3.5"
                >
                  <div className="min-w-0">
                    <span className="chip">{inv.role}</span>
                    <p className="ts-meta mt-1.5 truncate normal-case">/invite/{inv.token}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <CopyInvite token={inv.token} role={inv.role} />
                    <span className="text-border-strong">·</span>
                    <form action={revokeInvite}>
                      <input type="hidden" name="inviteId" value={inv.id} />
                      <input type="hidden" name="tripId" value={tripId} />
                      <SubmitLink className="ts-textlink ts-textlink--danger">Revoke</SubmitLink>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* People with access */}
        <section>
          <div className="ts-ledgerhead">
            <p className="ts-eyebrow ts-eyebrow--accent">People with access</p>
            <span className="ts-meta">{collaborators.length}</span>
          </div>
          <div>
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 border-b border-hairline py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] tracking-[0.03em] text-ink">{c.name}</p>
                  <p className="ts-meta mt-1 truncate normal-case">{c.email}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  {c.role === "owner" ? (
                    <span className="chip border-rose-border bg-surface-accent text-rose-ink">
                      Owner
                    </span>
                  ) : (
                    <>
                      <span className="chip">{c.role === "editor" ? "Editor" : "Viewer"}</span>
                      <form action={setCollaboratorRole}>
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="userId" value={c.userId} />
                        <input
                          type="hidden"
                          name="role"
                          value={c.role === "editor" ? "viewer" : "editor"}
                        />
                        <SubmitLink className="ts-textlink ts-textlink--rose">
                          {c.role === "editor" ? "→ Viewer" : "→ Editor"}
                        </SubmitLink>
                      </form>
                      <form action={removeCollaborator}>
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="userId" value={c.userId} />
                        <SubmitLink className="ts-textlink ts-textlink--danger">Remove</SubmitLink>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
