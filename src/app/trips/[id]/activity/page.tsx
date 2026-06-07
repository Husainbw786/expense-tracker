import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip } from "@/lib/data";
import { getTripActivity } from "@/lib/activity";
import { requireTripAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = {
  "trip.created": "🎉",
  "trip.imported": "📥",
  "expense.added": "➕",
  "expense.updated": "✏️",
  "expense.deleted": "🗑️",
  "member.added": "🧑",
  "member.removed": "🚶",
  "family.added": "👨‍👩‍👧",
  "family.removed": "👋",
  "member.joined": "🤝",
};

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  await requireTripAccess(tripId, "viewer");
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const entries = await getTripActivity(tripId);

  return (
    <main className="pb-28">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600 font-medium">
          ← {trip.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900">Activity</h1>
        <p className="text-sm text-gray-400">Full history of who did what</p>
      </div>

      <div className="px-4 pt-4">
        {entries.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">🕑</p>
            <p className="font-semibold text-gray-800">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => {
              const when = e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt as unknown as number);
              return (
                <div key={e.id} className="card p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                    {ICON[e.action] ?? "•"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{e.actorName ?? "Someone"}</span>{" "}
                      {e.summary}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {when.toLocaleString("en-IN", {
                        day: "numeric", month: "short",
                        hour: "numeric", minute: "2-digit",
                      })}{" "}
                      · {timeAgo(when)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
