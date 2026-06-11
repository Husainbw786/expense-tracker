import Link from "next/link";
import { getTrips } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { createTrip } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
}

export default async function TripsHome() {
  const user = await requireUser();
  const trips = await getTrips(user.id);

  return (
    <main className="px-6 pb-28">
      {/* Greeting */}
      <div className="pt-8 pb-7">
        <p className="ts-eyebrow ts-eyebrow--accent">Welcome back</p>
        <h1 className="ts-display mt-2">
          Hi, <em>{user.name.split(" ")[0]}</em>
        </h1>
        <p className="ts-micro mt-2">
          {trips.length} {trips.length === 1 ? "trip" : "trips"} on the ledger
        </p>
      </div>

      {/* Trip ledger */}
      <div className="ts-ledgerhead">
        <p className="ts-eyebrow ts-eyebrow--accent">Recent trips</p>
      </div>
      {trips.length === 0 ? (
        <p className="ts-micro border-b border-hairline py-5">
          No trips yet — create your first one below.
        </p>
      ) : (
        <div>
          {trips.map((t) => (
            <Link key={t.id} href={`/trips/${t.id}`} className="ts-row group">
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-serif text-[1.05rem] text-ink">{t.name}</span>
                <span className="ts-meta">
                  {[
                    fmtDate(t.startDate),
                    `${t.memberCount} ${t.memberCount === 1 ? "PERSON" : "PEOPLE"}`,
                    t.role.toUpperCase(),
                  ]
                    .filter(Boolean)
                    .join("  ·  ")}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2.5">
                <span className="ts-money text-[1.08rem]">{formatMoney(t.total)}</span>
                <span className="-translate-x-1 text-[0.95rem] text-rose opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* New trip */}
      <div className="pt-10">
        <div className="ts-ledgerhead">
          <p className="ts-eyebrow ts-eyebrow--accent">Plan the next one</p>
        </div>
        <form action={createTrip} className="flex flex-col gap-4 pt-5">
          <label className="flex flex-col gap-1.5">
            <span className="ts-eyebrow">Trip name</span>
            <input name="name" required placeholder="Goa 2026" className="input" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ts-eyebrow">Start date</span>
            <input name="startDate" type="date" className="input" />
          </label>
          <SubmitButton loadingText="Creating…" className="btn-primary w-full">
            Create Trip <span aria-hidden="true">→</span>
          </SubmitButton>
        </form>
        <p className="ts-micro mt-5 text-[0.76rem] leading-relaxed">
          Families &amp; people live in{" "}
          <Link href="/people" className="ts-textlink ts-textlink--rose">
            People
          </Link>{" "}
          and are reused across every trip.
        </p>
      </div>
    </main>
  );
}
