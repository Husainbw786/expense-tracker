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

const FAMILY_COLORS = [
  { headerBg: "bg-violet-50", headerBorder: "border-violet-100", avatarBg: "bg-violet-100", avatarText: "text-violet-600", btnBg: "bg-violet-100", btnText: "text-violet-600", countText: "text-violet-500" },
  { headerBg: "bg-emerald-50", headerBorder: "border-emerald-100", avatarBg: "bg-emerald-100", avatarText: "text-emerald-600", btnBg: "bg-emerald-100", btnText: "text-emerald-600", countText: "text-emerald-500" },
  { headerBg: "bg-sky-50", headerBorder: "border-sky-100", avatarBg: "bg-sky-100", avatarText: "text-sky-600", btnBg: "bg-sky-100", btnText: "text-sky-600", countText: "text-sky-500" },
  { headerBg: "bg-amber-50", headerBorder: "border-amber-100", avatarBg: "bg-amber-100", avatarText: "text-amber-600", btnBg: "bg-amber-100", btnText: "text-amber-600", countText: "text-amber-500" },
  { headerBg: "bg-rose-50", headerBorder: "border-rose-100", avatarBg: "bg-rose-100", avatarText: "text-rose-600", btnBg: "bg-rose-100", btnText: "text-rose-600", countText: "text-rose-500" },
];

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

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
    <main className="pb-28">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600 font-medium">
          ← {trip.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900">On This Trip</h1>
        <p className="text-sm text-gray-400">{onTripCount} people coming</p>
      </div>

      <div className="px-4 pt-4">
        {roster.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
            <p className="font-semibold text-gray-800">No families in roster</p>
            <p className="mt-1 text-sm text-gray-400">
              Add families in{" "}
              <Link href="/people" className="text-indigo-600 font-medium">People</Link>{" "}
              first.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="section-label">Toggle who&apos;s coming</p>
            {roster.map((g, gi) => {
              const c = FAMILY_COLORS[gi % FAMILY_COLORS.length];
              const onCount = g.members.filter((m) => m.onTrip).length;
              return (
                <div key={g.family.id} className="card overflow-hidden">
                  {/* Family header */}
                  <div className={`flex items-center justify-between px-4 py-3 ${c.headerBg} border-b ${c.headerBorder}`}>
                    <div className="flex items-center gap-3">
                      <div className={`avatar-circle w-9 h-9 ${c.avatarBg} ${c.avatarText}`}>
                        {g.family.name.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{g.family.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${c.countText}`}>
                        {onCount}/{g.members.length}
                      </span>
                      <form action={g.allOn ? removeFamilyFromTrip : addFamilyToTrip}>
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="familyId" value={g.family.id} />
                        <SubmitLink className={`text-xs font-medium px-2.5 py-1 rounded-lg ${c.btnBg} ${c.btnText} disabled:opacity-50`}>
                          {g.allOn ? "Remove all" : "Add all"}
                        </SubmitLink>
                      </form>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="divide-y divide-gray-50">
                    {g.members.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-400">No people yet.</p>
                    ) : (
                      g.members.map((m) => (
                        <form
                          key={m.id}
                          action={m.onTrip ? removeMemberFromTrip : addMemberToTrip}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <input type="hidden" name="tripId" value={tripId} />
                          <input type="hidden" name="memberId" value={m.id} />
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full ${m.onTrip ? c.avatarBg : "bg-gray-100"} ${m.onTrip ? c.avatarText : "text-gray-400"} flex items-center justify-center text-xs font-bold`}>
                              {m.name[0]}
                            </div>
                            <span className={`text-sm ${m.onTrip ? "text-gray-800" : "text-gray-400"}`}>
                              {m.name}
                            </span>
                          </div>
                          <SubmitLink loadingText="" className="disabled:opacity-50">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${m.onTrip ? "bg-indigo-600" : "border-2 border-gray-200"}`}>
                              {m.onTrip && <CheckIcon />}
                            </div>
                          </SubmitLink>
                        </form>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 px-1 text-xs text-gray-400 text-center">
          Need to add someone new?{" "}
          <Link href="/people" className="text-indigo-500 font-medium">Go to People</Link>
        </p>
      </div>
    </main>
  );
}
