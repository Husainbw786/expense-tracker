import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripRoster } from "@/lib/data";
import {
  addFamilyToTrip,
  removeFamilyFromTrip,
  addMemberToTrip,
  removeMemberFromTrip,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function TripMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const roster = await getTripRoster(tripId);
  const onTripCount = roster.reduce(
    (a, g) => a + g.members.filter((m) => m.onTrip).length,
    0
  );

  return (
    <main className="px-4 pt-6">
      <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600">
        ← {trip.name}
      </Link>
      <h1 className="mt-1 text-2xl font-bold">Who&apos;s on this trip</h1>
      <p className="mt-1 text-sm text-gray-500">
        {onTripCount} people added. Tap a name to add/remove them.
      </p>

      {roster.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No families in your roster yet. Add them in{" "}
          <Link href="/people" className="font-medium text-indigo-600">
            People
          </Link>{" "}
          first.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {roster.map((g) => (
            <div key={g.family.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{g.family.name}</span>
                <form
                  action={g.allOn ? removeFamilyFromTrip : addFamilyToTrip}
                >
                  <input type="hidden" name="tripId" value={tripId} />
                  <input type="hidden" name="familyId" value={g.family.id} />
                  <button className="text-xs font-medium text-indigo-600">
                    {g.allOn ? "Remove all" : "Add whole family"}
                  </button>
                </form>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.members.length === 0 ? (
                  <span className="text-xs text-gray-400">No people yet.</span>
                ) : (
                  g.members.map((m) => (
                    <form
                      key={m.id}
                      action={m.onTrip ? removeMemberFromTrip : addMemberToTrip}
                    >
                      <input type="hidden" name="tripId" value={tripId} />
                      <input type="hidden" name="memberId" value={m.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                          m.onTrip
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.onTrip ? "✓ " : "+ "}
                        {m.name}
                      </button>
                    </form>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 px-1 text-xs text-gray-400">
        Need to add a new person to your family list? Go to{" "}
        <Link href="/people" className="text-indigo-600">
          People
        </Link>
        .
      </p>
    </main>
  );
}
