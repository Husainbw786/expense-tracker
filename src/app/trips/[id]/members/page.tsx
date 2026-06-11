import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripRoster } from "@/lib/data";
import {
  addFamilyToTrip,
  removeFamilyFromTrip,
  addMemberToTrip,
  removeMemberFromTrip,
} from "@/app/actions";
import { SubmitLink } from "@/components/SubmitButton";
import { requireTripAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TripMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  await requireTripAccess(tripId, "editor");
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const roster = await getTripRoster(tripId);
  const onTripCount = roster.reduce(
    (a, g) => a + g.members.filter((m) => m.onTrip).length,
    0
  );

  return (
    <main className="px-6 pb-28">
      {/* Header */}
      <div className="pt-7">
        <Link
          href={`/trips/${tripId}`}
          className="ts-textlink ts-textlink--rose inline-flex items-center gap-1.5"
        >
          ← {trip.name}
        </Link>
        <div className="ts-ledgerhead mt-5">
          <p className="ts-eyebrow ts-eyebrow--accent">On this trip</p>
          <span className="ts-meta">{onTripCount} coming</span>
        </div>
        <h1 className="ts-h2 mt-3.5">
          Who&apos;s <em>coming</em>
        </h1>
      </div>

      {roster.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty roster</p>
          <p className="ts-h2 mt-3">No families yet</p>
          <p className="ts-micro mt-2 mb-6">Add families and people first.</p>
          <Link href="/people" className="btn-ghost">
            Go to People
          </Link>
        </div>
      ) : (
        <div className="pt-2">
          {roster.map((g) => {
            const onCount = g.members.filter((m) => m.onTrip).length;
            return (
              <section key={g.family.id} className="border-b border-hairline py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[0.9rem] tracking-[0.03em] text-ink">{g.family.name}</p>
                  <span className="flex items-baseline gap-3">
                    <span className="ts-meta">
                      {onCount}/{g.members.length}
                    </span>
                    <form action={g.allOn ? removeFamilyFromTrip : addFamilyToTrip}>
                      <input type="hidden" name="tripId" value={tripId} />
                      <input type="hidden" name="familyId" value={g.family.id} />
                      <SubmitLink
                        className={`ts-textlink ${g.allOn ? "ts-textlink--danger" : "ts-textlink--rose"}`}
                      >
                        {g.allOn ? "Remove all" : "Add all"}
                      </SubmitLink>
                    </form>
                  </span>
                </div>
                {g.members.length === 0 ? (
                  <p className="ts-micro pt-3">No people in this family yet.</p>
                ) : (
                  <div className="ts-chips pt-3.5">
                    {g.members.map((m) => (
                      <form key={m.id} action={m.onTrip ? removeMemberFromTrip : addMemberToTrip}>
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="memberId" value={m.id} />
                        <SubmitLink
                          loadingText="…"
                          className={`ts-chip ${m.onTrip ? "is-on" : ""}`}
                        >
                          <span className="flex items-center gap-2">
                            {m.name}
                            <span className="ts-chip__mark">{m.onTrip ? "✓" : "+"}</span>
                          </span>
                        </SubmitLink>
                      </form>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          <p className="ts-micro pt-5 text-center text-[0.76rem]">
            Need to add someone new?{" "}
            <Link href="/people" className="ts-textlink ts-textlink--rose">
              Go to People
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
