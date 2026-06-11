"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

type Member = { id: number; name: string; familyId: number; familyName: string };
type Family = { id: number; name: string };

const CATEGORIES = [
  "Travel", "Train", "Rickshaw", "Hotel", "Food", "Tickets", "Shopping", "Other",
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
  const [category, setCategory] = useState<string>(initial?.category ?? "Other");

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
      .map((f) => ({
        family: f,
        members: members.filter((m) => m.familyId === f.id),
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
    <form action={action} className="flex flex-col gap-5 px-6 pt-4 pb-8">
      <input type="hidden" name="tripId" value={tripId} />
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="category" value={category} />

      {/* Description */}
      <label className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Description</span>
        <input
          name="description"
          required
          defaultValue={initial?.description ?? ""}
          placeholder="What was this for?"
          className="input"
        />
      </label>

      {/* Amount */}
      <label className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Amount</span>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.85rem] text-ink-2">
            ₹
          </span>
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
      </label>

      {/* Date */}
      <label className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Date</span>
        <input name="spentOn" type="date" defaultValue={initial?.spentOn ?? ""} className="input" />
      </label>

      {/* Category — bordered segmented control */}
      <div className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Category</span>
        <div className="flex flex-wrap border border-hairline">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`border border-hairline px-3 py-2 text-[0.7rem] uppercase tracking-[0.12em] transition-colors duration-150 -m-px ${
                category === c
                  ? "relative z-10 border-rose bg-surface-accent text-rose-ink font-semibold"
                  : "bg-transparent text-ink-2 hover:text-rose"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Paid by */}
      <label className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Paid by</span>
        <select name="paidBy" required defaultValue={initial?.paidBy ?? ""} className="input">
          <option value="" disabled>
            Select person
          </option>
          {byFamily.map((g) => (
            <optgroup key={g.family.id} label={g.family.name}>
              {g.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {/* Split with */}
      <div>
        <div className="ts-ledgerhead">
          <span className="ts-eyebrow ts-eyebrow--accent">Split with</span>
          <span className="flex items-baseline gap-3">
            <span className="ts-meta">
              {selected.length} people · {totalUnits} units
            </span>
            <button
              type="button"
              onClick={() => setFamilyAll(allIds, true)}
              className="ts-textlink ts-textlink--rose"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFamilyAll(allIds, false)}
              className="ts-textlink"
            >
              None
            </button>
          </span>
        </div>

        {selected.some(([, u]) => u > 1) && (
          <p className="ts-micro border-b border-hairline py-2.5 text-[0.76rem]">
            Weighted split — someone has more than 1 unit and will be charged
            proportionally more.
          </p>
        )}

        {byFamily.map((g) => {
          const ids = g.members.map((m) => m.id);
          const allOn = ids.every((id) => getUnits(id) > 0);
          return (
            <div key={g.family.id} className="border-b border-hairline py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[0.9rem] tracking-[0.03em] text-ink">{g.family.name}</p>
                <button
                  type="button"
                  onClick={() => setFamilyAll(ids, !allOn)}
                  className={`ts-textlink ${allOn ? "ts-textlink--danger" : "ts-textlink--rose"}`}
                >
                  {allOn ? "Remove all" : "Add all"}
                </button>
              </div>
              <div className="ts-chips pt-3.5">
                {g.members.map((m) => {
                  const u = getUnits(m.id);
                  const isOn = u > 0;
                  return (
                    <span key={m.id} className={`ts-chip ${isOn ? "is-on" : ""} !p-0`}>
                      <button
                        type="button"
                        onClick={() => toggleMember(m.id)}
                        className="flex items-center gap-2 py-2 pl-3 pr-1"
                      >
                        {m.name}
                        <span className="ts-chip__mark">{isOn ? "✓" : "+"}</span>
                      </button>
                      {isOn && (
                        <span className="flex items-center gap-0.5 border-l border-rose-border py-1 pl-1.5 pr-1.5">
                          {perUnit > 0 && (
                            <span className="ts-money mr-1 text-[0.72rem] text-rose-ink">
                              ₹{(perUnit * u).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setMemberUnits(m.id, u - 1)}
                            className="flex h-5 w-5 items-center justify-center text-[0.8rem] text-ink-2 hover:text-rose"
                            aria-label="fewer units"
                          >
                            −
                          </button>
                          <span
                            className={`w-4 text-center text-[0.78rem] tabular-nums ${
                              u > 1 ? "font-semibold text-rose" : "text-ink"
                            }`}
                          >
                            {u}
                          </span>
                          <button
                            type="button"
                            onClick={() => setMemberUnits(m.id, u + 1)}
                            className="flex h-5 w-5 items-center justify-center text-[0.8rem] text-ink-2 hover:text-rose"
                            aria-label="more units"
                          >
                            +
                          </button>
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        {selected.length === 0 && (
          <p className="ts-micro pt-3 text-rose-ink">Select at least one person.</p>
        )}

        {/* Hidden inputs — memberId + units per participant */}
        {selected.map(([id, u]) => (
          <span key={id}>
            <input type="hidden" name="participants" value={id} />
            <input type="hidden" name={`participant_units_${id}`} value={u} />
          </span>
        ))}
      </div>

      {/* Per-unit summary */}
      {perUnit > 0 && (
        <div className="flex items-baseline justify-between gap-4 border-y border-hairline py-3.5">
          <span className="flex flex-col gap-1">
            <span className="ts-eyebrow">Per unit</span>
            <span className="ts-money text-[1.08rem]">
              ₹{perUnit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </span>
          <span className="flex flex-col items-end gap-1">
            <span className="ts-meta">
              {selected.length} people · {totalUnits} units
            </span>
            {selected.some(([, u]) => u > 1) && (
              <span className="ts-meta text-rose">weighted split</span>
            )}
          </span>
        </div>
      )}

      <SubmitButton
        loadingText="Saving…"
        disabled={selected.length === 0}
        className="btn-primary w-full"
      >
        {submitLabel} <span aria-hidden="true">→</span>
      </SubmitButton>
    </form>
  );
}
