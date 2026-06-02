import Link from "next/link";
import { getTrips } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { createTrip } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function TripsHome() {
  const trips = await getTrips();

  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-bold">🧳 My Trips</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create a trip, add who&apos;s coming, then log expenses.
      </p>

      {/* New trip */}
      <form action={createTrip} className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-700">Start a new trip</p>
        <input
          name="name"
          required
          placeholder="Trip name (e.g. Goa 2026)"
          className="input mt-2"
        />
        <div className="mt-2 flex gap-2">
          <input name="startDate" type="date" className="input flex-1" />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-indigo-600 px-5 font-semibold text-white"
          >
            Create
          </button>
        </div>
      </form>

      {/* Trip list */}
      <div className="mt-6 space-y-3">
        {trips.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No trips yet. Create your first one above. 👆
          </div>
        ) : (
          trips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {t.memberCount} people
                    {t.startDate ? ` · ${t.startDate}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatMoney(t.total)}</p>
                  <p className="text-xs text-gray-400">total</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <p className="mt-6 px-1 text-xs text-gray-400">
        Tip: families &amp; people live in{" "}
        <Link href="/people" className="text-indigo-600">
          People
        </Link>{" "}
        and are reused across every trip.
      </p>
    </main>
  );
}
