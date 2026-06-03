"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

type Member = { id: number; name: string; familyId: number; familyName: string };
type Family = { id: number; name: string };

const CATEGORIES = [
  "Travel", "Train", "Rickshaw", "Hotel", "Food", "Tickets", "Shopping", "Other",
];

const FAMILY_COLORS = [
  { headerBg: "bg-violet-50", avatarBg: "bg-violet-100", avatarText: "text-violet-600", selectedBg: "bg-violet-100", selectedText: "text-violet-700", selectedBorder: "border-violet-200" },
  { headerBg: "bg-emerald-50", avatarBg: "bg-emerald-100", avatarText: "text-emerald-600", selectedBg: "bg-emerald-100", selectedText: "text-emerald-700", selectedBorder: "border-emerald-200" },
  { headerBg: "bg-sky-50", avatarBg: "bg-sky-100", avatarText: "text-sky-600", selectedBg: "bg-sky-100", selectedText: "text-sky-700", selectedBorder: "border-sky-200" },
  { headerBg: "bg-amber-50", avatarBg: "bg-amber-100", avatarText: "text-amber-600", selectedBg: "bg-amber-100", selectedText: "text-amber-700", selectedBorder: "border-amber-200" },
  { headerBg: "bg-rose-50", avatarBg: "bg-rose-100", avatarText: "text-rose-600", selectedBg: "bg-rose-100", selectedText: "text-rose-700", selectedBorder: "border-rose-200" },
];

export default function ExpenseForm({
  tripId,
  members,
  families,
  action,
  initial,
  submitLabel = "Save expense",
}: {
  tripId: number;
  members: Member[];
  families: Family[];
  action: (formData: FormData) => void | Promise<void>;
  initial?: {
    id?: number;
    description?: string;
    amount?: number;
    category?: string;
    spentOn?: string | null;
    paidBy?: number;
    participants?: { memberId: number; units: number }[];
  };
  submitLabel?: string;
}) {
  const allIds = useMemo(() => members.map((m) => m.id), [members]);

  // units: Map<memberId, units>. 0 = not selected, ≥1 = selected with that many units
  const [units, setUnits] = useState<Map<number, number>>(() => {
    const m = new Map<number, number>();
    if (initial?.participants && initial.participants.length > 0) {
      for (const p of initial.participants) m.set(p.memberId, p.units);
    } else {
      for (const id of allIds) m.set(id, 1);
    }
    return m;
  });

  const [amount, setAmount] = useState<string>(
    initial?.amount ? String(initial.amount) : ""
  );

  const selected = useMemo(
    () => [...units.entries()].filter(([, u]) => u > 0),
    [units]
  );
  const totalUnits = selected.reduce((s, [, u]) => s + u, 0);
  const amountValue = Number(amount);
  const perUnit =
    totalUnits > 0 && Number.isFinite(amountValue) && amountValue > 0
      ? amountValue / totalUnits
      : 0;

  const byFamily = useMemo(() => {
    return families
      .map((f, fi) => ({
        family: f,
        members: members.filter((m) => m.familyId === f.id),
        colorIdx: fi,
      }))
      .filter((g) => g.members.length > 0);
  }, [families, members]);

  function getUnits(id: number) {
    return units.get(id) ?? 0;
  }

  function setMemberUnits(id: number, u: number) {
    setUnits((prev) => {
      const next = new Map(prev);
      next.set(id, Math.max(0, u));
      return next;
    });
  }

  function toggleMember(id: number) {
    const current = getUnits(id);
    setMemberUnits(id, current > 0 ? 0 : 1);
  }

  function setFamilyAll(ids: number[], on: boolean) {
    setUnits((prev) => {
      const next = new Map(prev);
      for (const id of ids) next.set(id, on ? 1 : 0);
      return next;
    });
  }

  return (
    <form action={action} className="px-4 pt-4 pb-6 space-y-4">
      <input type="hidden" name="tripId" value={tripId} />
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Description
        </label>
        <input
          name="description"
          required
          defaultValue={initial?.description ?? ""}
          placeholder="What was this for?"
          className="input"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
          <input
            name="amount"
            required
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="input pl-8"
          />
        </div>
      </div>

      {/* Date + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
          <input name="spentOn" type="date" defaultValue={initial?.spentOn ?? ""} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
          <select name="category" defaultValue={initial?.category ?? "Other"} className="input">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Paid by */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Paid by</label>
        <select name="paidBy" required defaultValue={initial?.paidBy ?? ""} className="input">
          <option value="" disabled>Select person</option>
          {byFamily.map((g) => (
            <optgroup key={g.family.id} label={g.family.name}>
              {g.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Split with — units stepper */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Split with ({selected.length} people · {totalUnits} units)
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFamilyAll(allIds, true)}
              className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">All</button>
            <button type="button" onClick={() => setFamilyAll(allIds, false)}
              className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">None</button>
          </div>
        </div>

        {/* Tip shown only when any member has units > 1 */}
        {selected.some(([, u]) => u > 1) && (
          <div className="mb-2 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
            <span className="text-amber-500 text-sm mt-0.5">ℹ</span>
            <p className="text-xs text-amber-700">
              Someone has more than 1 unit. They&apos;ll be charged proportionally more.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {byFamily.map((g) => {
            const c = FAMILY_COLORS[g.colorIdx % FAMILY_COLORS.length];
            const ids = g.members.map((m) => m.id);
            const allOn = ids.every((id) => getUnits(id) > 0);
            return (
              <div key={g.family.id} className="card overflow-hidden">
                <div className={`flex items-center justify-between px-4 py-2 ${c.headerBg}`}>
                  <span className="text-xs font-semibold text-gray-600">{g.family.name}</span>
                  <button type="button" onClick={() => setFamilyAll(ids, !allOn)}
                    className="text-xs font-medium text-indigo-500">
                    {allOn ? "Remove all" : "Add all"}
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {g.members.map((m) => {
                    const u = getUnits(m.id);
                    const isOn = u > 0;
                    return (
                      <div key={m.id} className="flex items-center px-4 py-2.5 gap-3">
                        {/* Avatar + name — tap to toggle on/off */}
                        <button
                          type="button"
                          onClick={() => toggleMember(m.id)}
                          className="flex items-center gap-2.5 flex-1 text-left"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isOn ? `${c.avatarBg} ${c.avatarText}` : "bg-gray-100 text-gray-400"}`}>
                            {m.name[0]}
                          </div>
                          <span className={`text-sm ${isOn ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                            {m.name}
                          </span>
                        </button>

                        {/* Units stepper — only visible when selected */}
                        {isOn ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Per-unit cost label */}
                            {perUnit > 0 && (
                              <span className="text-xs text-gray-400 mr-1">
                                ₹{(perUnit * u).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </span>
                            )}
                            <button type="button" onClick={() => setMemberUnits(m.id, u - 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center hover:bg-gray-200">
                              −
                            </button>
                            <span className={`w-5 text-center text-sm font-bold ${u > 1 ? "text-indigo-600" : "text-gray-700"}`}>
                              {u}
                            </span>
                            <button type="button" onClick={() => setMemberUnits(m.id, u + 1)}
                              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center hover:bg-indigo-200">
                              +
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => toggleMember(m.id)}
                            className="text-xs text-indigo-500 font-medium flex-shrink-0">
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {selected.length === 0 && (
          <p className="mt-2 text-xs text-rose-500 font-medium">Select at least one person.</p>
        )}

        {/* Hidden inputs — memberId + units per participant */}
        {selected.map(([id, u]) => (
          <span key={id}>
            <input type="hidden" name="participants" value={id} />
            <input type="hidden" name={`participant_units_${id}`} value={u} />
          </span>
        ))}
      </div>

      {/* Per-unit summary bar */}
      {perUnit > 0 && (
        <div className="bg-indigo-50 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-400">Per unit</p>
              <p className="text-base font-bold text-indigo-700">
                ₹{perUnit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-400">{selected.length} people · {totalUnits} units</p>
              {selected.some(([, u]) => u > 1) && (
                <p className="text-xs text-indigo-500 font-medium mt-0.5">Weighted split active</p>
              )}
            </div>
          </div>
        </div>
      )}

      <SubmitButton
        loadingText="Saving…"
        disabled={selected.length === 0}
        className="w-full rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white text-sm disabled:opacity-40 shadow-sm"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
