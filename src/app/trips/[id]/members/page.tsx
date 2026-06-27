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
import TripTabs from "@/components/TripTabs";
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
    <main className="px-5 pb-32">
      {/* Header */}
      <div className="pt-3">
        <Link href={`/trips/${tripId}`} className="ts-textlink inline-flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          {trip.name}
        </Link>
      </div>

      <div className="mt-3">
        <TripTabs tripId={tripId} active="ontrip" />
      </div>

      {roster.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty roster</p>
          <p className="ts-h2 mt-3">No families yet</p>
          <p className="ts-micro mt-2 mb-6">Add families and people first.</p>
          <Link href="/people" className="btn-primary">
            Go to People
          </Link>
        </div>
      ) : (
        <div className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[0.94rem] font-semibold text-ink">Who&apos;s coming</p>
            <span
              className="rounded-full px-2.5 py-1 text-[0.74rem] font-semibold"
              style={{ background: "var(--green-bg)", color: "var(--green)" }}
            >
              {onTripCount} coming
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {roster.map((g) => {
              const onCount = g.members.filter((m) => m.onTrip).length;
              return (
                <section key={g.family.id} className="card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[0.94rem] font-semibold text-ink">{g.family.name}</p>
                    <span className="flex items-center gap-3">
                      <span className="ts-meta">
                        {onCount} / {g.members.length}
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
                    <p className="ts-micro">No people in this family yet.</p>
                  ) : (
                    <div className="ts-chips">
                      {g.members.map((m) => (
                        <form key={m.id} action={m.onTrip ? removeMemberFromTrip : addMemberToTrip}>
                          <input type="hidden" name="tripId" value={tripId} />
                          <input type="hidden" name="memberId" value={m.id} />
                          <SubmitLink loadingText="…" className={`ts-chip ${m.onTrip ? "is-on" : ""}`}>
                            <span className="flex items-center gap-1.5">
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
          </div>

          <p className="ts-micro pt-5 text-center text-[0.82rem]">
            Need to add someone new?{" "}
            <Link href="/people" className="ts-textlink">
              Go to People
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
