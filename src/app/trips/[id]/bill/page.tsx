import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrip, getTripExpensesWithDetails, getTripSummary } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { requireTripAccess } from "@/lib/auth";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function BillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  await requireTripAccess(tripId, "viewer");
  const [trip, expenses, summary] = await Promise.all([
    getTrip(tripId),
    getTripExpensesWithDetails(tripId),
    getTripSummary(tripId),
  ]);
  if (!trip) notFound();

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (a.spentOn && b.spentOn) return a.spentOn.localeCompare(b.spentOn);
    return a.id - b.id;
  });

  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      {/* Print styles injected via a style tag — scoped to this page */}
      <style>{`
        @media print {
          @page { margin: 16mm 14mm; size: A4; }
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Screen toolbar — hidden when printing */}
      <div className="no-print bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between max-w-3xl mx-auto">
        <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600 font-medium">
          ← Back to Summary
        </Link>
        <PrintButton />
      </div>

      {/* Bill content */}
      <div className="max-w-3xl mx-auto px-6 py-8 bg-white min-h-screen print:px-0 print:py-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
            {trip.startDate && (
              <p className="text-sm text-gray-500 mt-0.5">Trip date: {trip.startDate}</p>
            )}
            <p className="text-sm text-gray-400 mt-0.5">Generated: {generatedOn}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">{formatMoney(summary.totalSpent)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {summary.memberCount} people · {summary.expenseCount} expenses
            </p>
          </div>
        </div>

        {/* ── Section 1: All Expenses ── */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
            Expense Log
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">#</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Description</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Category</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Date</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Paid by</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Split</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Amount</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Per person</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map((e, i) => {
                const perPerson = e.participantCount > 0 ? e.amount / e.participantCount : 0;
                return (
                  <tr key={e.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 text-gray-400 border border-gray-200">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-900 border border-gray-200">{e.description}</td>
                    <td className="px-3 py-2 text-gray-600 border border-gray-200">{e.category}</td>
                    <td className="px-3 py-2 text-gray-500 border border-gray-200">{e.spentOn ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700 border border-gray-200">{e.payerName}</td>
                    <td className="px-3 py-2 text-gray-500 border border-gray-200">{e.participantCount} people</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900 border border-gray-200">{formatMoney(e.amount)}</td>
                    <td className="px-3 py-2 text-right text-gray-600 border border-gray-200">{formatMoney(perPerson)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white">
                <td colSpan={6} className="px-3 py-2 font-bold text-sm border border-gray-700">Total</td>
                <td className="px-3 py-2 text-right font-bold border border-gray-700">{formatMoney(summary.totalSpent)}</td>
                <td className="px-3 py-2 border border-gray-700"></td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* ── Section 2: Per-person balance ── */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
            Individual Balances
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Person</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Family</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Total Paid</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Fair Share</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary.familyBalances.map((f, fi) =>
                f.members.map((m, mi) => {
                  const settled = Math.abs(m.net) < 0.01;
                  return (
                    <tr key={m.id} className={fi % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-medium text-gray-900 border border-gray-200">{m.name}</td>
                      <td className="px-3 py-2 text-gray-500 border border-gray-200">
                        {mi === 0 ? f.name : ""}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700 border border-gray-200">{formatMoney(m.paid)}</td>
                      <td className="px-3 py-2 text-right text-gray-700 border border-gray-200">{formatMoney(m.share)}</td>
                      <td className={`px-3 py-2 text-right font-semibold border border-gray-200 ${settled ? "text-gray-400" : m.net > 0 ? "text-green-700" : "text-red-700"}`}>
                        {settled ? "Even" : m.net > 0 ? `Gets ${formatMoney(m.net)}` : `Owes ${formatMoney(-m.net)}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* ── Section 3: Family totals ── */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
            Family Summary
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Family</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Members</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Total Paid</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Fair Share</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary.familyBalances.map((f, i) => {
                const settled = Math.abs(f.net) < 0.01;
                return (
                  <tr key={f.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 font-semibold text-gray-900 border border-gray-200">{f.name}</td>
                    <td className="px-3 py-2 text-right text-gray-600 border border-gray-200">{f.memberCount}</td>
                    <td className="px-3 py-2 text-right text-gray-700 border border-gray-200">{formatMoney(f.paid)}</td>
                    <td className="px-3 py-2 text-right text-gray-700 border border-gray-200">{formatMoney(f.share)}</td>
                    <td className={`px-3 py-2 text-right font-bold border border-gray-200 ${settled ? "text-gray-400" : f.net > 0 ? "text-green-700" : "text-red-700"}`}>
                      {settled ? "Even" : f.net > 0 ? `Gets ${formatMoney(f.net)}` : `Owes ${formatMoney(-f.net)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ── Section 4: Settlement transfers ── */}
        <section className="break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
            Settlement — Who Pays Whom
          </h2>
          {summary.settlement.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Everyone is settled up — no transfers needed.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">From (pays)</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">To (receives)</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.settlement.map((t, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 font-medium text-red-700 border border-gray-200">{t.fromName}</td>
                    <td className="px-3 py-2 font-medium text-green-700 border border-gray-200">{t.toName}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900 border border-gray-200">{formatMoney(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          {trip.name} · Generated on {generatedOn} · Trip Splitter
        </div>

      </div>
    </>
  );
}
