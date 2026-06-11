import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip } from "@/lib/data";
import { getTripActivity } from "@/lib/activity";
import { requireTripAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "trip.created": "Trip",
  "trip.imported": "Import",
  "expense.added": "Expense",
  "expense.updated": "Expense",
  "expense.deleted": "Expense",
  "member.added": "People",
  "member.removed": "People",
  "family.added": "People",
  "family.removed": "People",
  "member.joined": "Access",
  "collaborator.added": "Access",
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
    <main className="px-6 pb-28">
      <div className="pt-7">
        <Link
          href={`/trips/${tripId}`}
          className="ts-textlink ts-textlink--rose inline-flex items-center gap-1.5"
        >
          ← {trip.name}
        </Link>
        <div className="ts-ledgerhead mt-5">
          <p className="ts-eyebrow ts-eyebrow--accent">Activity</p>
          {entries.length > 0 && <span className="ts-meta">{entries.length} entries</span>}
        </div>
        <h1 className="ts-h2 mt-3.5">
          Who did <em>what</em>
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Quiet so far</p>
          <p className="ts-h2 mt-3">No activity yet</p>
        </div>
      ) : (
        <div className="pt-1">
          {entries.map((e) => {
            const when =
              e.createdAt instanceof Date
                ? e.createdAt
                : new Date(e.createdAt as unknown as number);
            return (
              <div key={e.id} className="border-b border-hairline py-3.5">
                <p className="text-[0.88rem] leading-relaxed tracking-[0.02em] text-ink">
                  <span className="font-semibold">{e.actorName ?? "Someone"}</span>{" "}
                  {e.summary}
                </p>
                <p className="ts-meta mt-1.5">
                  {(ACTION_LABEL[e.action] ?? "•").toUpperCase()} ·{" "}
                  {when
                    .toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                    .toUpperCase()}{" "}
                  · {timeAgo(when).toUpperCase()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
