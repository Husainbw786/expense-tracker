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
    ? { ok: true, text: `Added ${sp.added} ✓` }
    : sp.updated
    ? { ok: true, text: `Updated ${sp.updated}'s role ✓` }
    : sp.notfound
    ? { ok: false, text: `No account found for "${sp.notfound}". Ask them to sign up first, or share an invite link below.` }
    : sp.msg
    ? { ok: false, text: sp.msg }
    : null;

  return (
    <main className="pb-28">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600 font-medium">
          ← {trip.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900">Share &amp; Invite</h1>
        <p className="text-sm text-gray-400">Invite others to view or co-manage this trip</p>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {banner && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm ${
              banner.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Invite by email (direct add if they have an account) */}
        <div>
          <p className="section-label">Invite by email</p>
          <form action={addCollaboratorByEmail} className="card p-4 space-y-3">
            <input type="hidden" name="tripId" value={tripId} />
            <p className="text-sm text-gray-500">
              If this person already has an account, they get access instantly.
            </p>
            <input
              name="email"
              type="email"
              required
              placeholder="their@email.com"
              className="input"
            />
            <div className="flex gap-2">
              <select name="role" defaultValue="editor" className="input flex-1">
                <option value="editor">Editor — can add &amp; edit</option>
                <option value="viewer">Viewer — read only</option>
              </select>
              <SubmitButton
                loadingText="Adding…"
                className="shrink-0 rounded-2xl bg-indigo-600 px-5 font-semibold text-white text-sm disabled:opacity-60"
              >
                Add
              </SubmitButton>
            </div>
          </form>
        </div>
        {/* Generate invite link */}
        <div>
          <p className="section-label">Create an invite link</p>
          <div className="card p-4 space-y-3">
            <p className="text-sm text-gray-500">
              Generate a secret link and share it (WhatsApp, etc.). Whoever opens it signs
              up and joins this trip with the role you pick.
            </p>
            <div className="flex gap-2">
              <form action={createInvite} className="flex-1">
                <input type="hidden" name="tripId" value={tripId} />
                <input type="hidden" name="role" value="editor" />
                <SubmitButton
                  loadingText="Creating…"
                  className="w-full rounded-2xl bg-emerald-600 py-2.5 font-semibold text-white text-sm disabled:opacity-60"
                >
                  + Editor link (can edit)
                </SubmitButton>
              </form>
              <form action={createInvite} className="flex-1">
                <input type="hidden" name="tripId" value={tripId} />
                <input type="hidden" name="role" value="viewer" />
                <SubmitButton
                  loadingText="Creating…"
                  className="w-full rounded-2xl bg-gray-700 py-2.5 font-semibold text-white text-sm disabled:opacity-60"
                >
                  + Viewer link (read only)
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>

        {/* Active invite links */}
        {invites.length > 0 && (
          <div>
            <p className="section-label">Active links</p>
            <div className="space-y-2">
              {invites.map((inv) => (
                <div key={inv.id} className="card p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`chip ${
                        inv.role === "editor"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {inv.role}
                    </span>
                    <p className="text-xs text-gray-400 mt-1 truncate">/invite/{inv.token}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CopyInvite token={inv.token} role={inv.role} />
                    <form action={revokeInvite}>
                      <input type="hidden" name="inviteId" value={inv.id} />
                      <input type="hidden" name="tripId" value={tripId} />
                      <SubmitLink className="text-xs font-medium text-rose-500">Revoke</SubmitLink>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People with access */}
        <div>
          <p className="section-label">People with access ({collaborators.length})</p>
          <div className="space-y-2">
            {collaborators.map((c) => (
              <div key={c.id} className="card p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {c.role === "owner" ? (
                    <span className="chip bg-indigo-50 text-indigo-600">Owner</span>
                  ) : (
                    <>
                      <span
                        className={`chip ${
                          c.role === "editor"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.role === "editor" ? "Editor" : "Viewer"}
                      </span>
                      <form action={setCollaboratorRole}>
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="userId" value={c.userId} />
                        <input
                          type="hidden"
                          name="role"
                          value={c.role === "editor" ? "viewer" : "editor"}
                        />
                        <SubmitLink className="text-xs font-medium text-indigo-600">
                          {c.role === "editor" ? "→ Viewer" : "→ Editor"}
                        </SubmitLink>
                      </form>
                      <form action={removeCollaborator}>
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="userId" value={c.userId} />
                        <SubmitLink className="text-xs font-medium text-rose-500">Remove</SubmitLink>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 px-1">
            Tap the role chip to switch a person between Editor and Viewer.
          </p>
        </div>
      </div>
    </main>
  );
}
