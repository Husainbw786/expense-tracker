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
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "··";
}

const TILES = [
  ["var(--surface-accent)", "var(--rose)"],
  ["#E5EBDF", "#4E7355"],
  ["#EFE7D5", "#9A7A33"],
  ["#E7E6E0", "#6B6A63"],
];

export default async function TripsHome() {
  const user = await requireUser();
  const trips = await getTrips(user.id);
  const totalTracked = trips.reduce((a, t) => a + t.total, 0);

  return (
    <main className="px-5 pb-32">
      {/* Greeting */}
      <div className="pt-3">
        <p className="ts-micro">Welcome back</p>
        <h1 className="ts-display mt-0.5">Hi, {user.name.split(" ")[0]}</h1>
      </div>

      {/* Hero total */}
      <div
        className="mt-5 rounded-[18px] border p-5"
        style={{ background: "var(--surface-accent)", borderColor: "#ECDBCE" }}
      >
        <p className="text-[0.82rem] font-semibold text-rose">Total tracked</p>
        <p className="ts-money mt-1.5 text-[2.45rem] leading-none">{formatMoney(totalTracked)}</p>
        <p className="ts-micro mt-1.5">
          Across {trips.length} {trips.length === 1 ? "trip" : "trips"}
        </p>
      </div>

      {/* Recent trips */}
      <div className="mt-7 flex items-center justify-between">
        <p className="text-[0.94rem] font-semibold text-ink">Recent trips</p>
        <span className="ts-meta">
          {trips.length} {trips.length === 1 ? "trip" : "trips"}
        </span>
      </div>

      {trips.length === 0 ? (
        <p className="ts-micro mt-3 rounded-[15px] border border-hairline bg-surface-card px-4 py-5">
          No trips yet — create your first one below.
        </p>
      ) : (
        <div className="mt-3">
          {trips.map((t, i) => (
            <Link key={t.id} href={`/trips/${t.id}`} className="ts-row">
              <span
                className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[13px] text-[0.95rem] font-bold"
                style={{ background: TILES[i % 4][0], color: TILES[i % 4][1] }}
              >
                {initials(t.name)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[1.02rem] font-semibold text-ink">{t.name}</span>
                <span className="ts-meta truncate">
                  {[fmtDate(t.startDate), `${t.memberCount} ${t.memberCount === 1 ? "person" : "people"}`, t.role]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="ts-money shrink-0 text-[1rem]">{formatMoney(t.total)}</span>
              <svg
                className="shrink-0 text-ink-3"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* New trip */}
      <div className="card mt-6 p-5">
        <p className="text-[0.94rem] font-semibold text-ink">Plan the next one</p>
        <form action={createTrip} className="mt-4 flex flex-col gap-2.5">
          <input name="name" required placeholder="Trip name — e.g. Goa 2026" className="input" />
          <input name="startDate" type="date" className="input" />
          <SubmitButton loadingText="Creating…" className="btn-primary w-full">
            Create trip
          </SubmitButton>
        </form>
        <p className="ts-micro mt-4 text-[0.8rem] leading-relaxed">
          Families &amp; people live in{" "}
          <Link href="/people" className="ts-textlink">
            People
          </Link>{" "}
          and are reused across every trip.
        </p>
      </div>
    </main>
  );
}
