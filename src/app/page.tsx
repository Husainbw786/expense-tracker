import Link from "next/link";
import { getTrips } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { createTrip } from "@/app/actions";
import { logout } from "@/app/auth/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "bg-indigo-50 text-indigo-600" },
  editor: { label: "Editor", cls: "bg-emerald-50 text-emerald-600" },
  viewer: { label: "Viewer", cls: "bg-gray-100 text-gray-500" },
};

export default async function TripsHome() {
  const user = await requireUser();
  const trips = await getTrips(user.id);

  return (
    <main className="px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-sm text-gray-400 mt-0.5">Hi {user.name.split(" ")[0]} 👋</p>
        </div>
        <form action={logout}>
          <button
            className="h-10 px-3 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs"
            title={`Logged in as ${user.email}`}
          >
            Log out
          </button>
        </form>
      </div>

      {/* Trip list */}
      {trips.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">✈️</p>
          <p className="font-semibold text-gray-800">No trips yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first trip below</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="section-label">Recent</p>
          {trips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.id}`}
              className="card p-4 block active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-base">{t.name}</p>
                    <span className={`chip ${ROLE_BADGE[t.role]?.cls ?? ""}`}>
                      {ROLE_BADGE[t.role]?.label ?? t.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="chip bg-indigo-50 text-indigo-600">
                      {t.memberCount} {t.memberCount === 1 ? "person" : "people"}
                    </span>
                    {t.startDate && (
                      <span className="chip bg-gray-100 text-gray-500">{t.startDate}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-lg font-bold text-gray-900">{formatMoney(t.total)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">total spent</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New trip form */}
      <div className="mt-6">
        <p className="section-label">New trip</p>
        <form action={createTrip} className="card p-4 space-y-3">
          <input
            name="name"
            required
            placeholder="Trip name (e.g. Goa 2026)"
            className="input"
          />
          <div className="flex gap-2">
            <input name="startDate" type="date" className="input flex-1" />
            <SubmitButton
              loadingText="Creating…"
              className="shrink-0 rounded-2xl bg-indigo-600 px-6 font-semibold text-white text-sm disabled:opacity-60"
            >
              Create
            </SubmitButton>
          </div>
        </form>
      </div>

      <p className="mt-5 px-1 text-xs text-gray-400 text-center">
        Families &amp; people live in{" "}
        <Link href="/people" className="text-indigo-500 font-medium">
          People
        </Link>{" "}
        and are reused across every trip.
      </p>
    </main>
  );
}
