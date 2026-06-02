// Pure calculation logic — no DB, no React. The heart of the app.

export type MemberInput = {
  id: number;
  name: string;
  familyId: number;
};

export type FamilyInput = {
  id: number;
  name: string;
};

export type ExpenseInput = {
  id: number;
  description: string;
  amount: number;
  paidBy: number; // member id
  participantIds: number[]; // members sharing this expense
};

export type MemberBalance = {
  id: number;
  name: string;
  familyId: number;
  paid: number; // total they paid out
  share: number; // total they are responsible for
  net: number; // paid - share (positive = should receive)
};

export type FamilyBalance = {
  id: number;
  name: string;
  memberCount: number;
  paid: number;
  share: number;
  net: number;
  members: MemberBalance[];
};

export type Transfer = {
  fromId: number; // who pays
  fromName: string;
  toId: number; // who receives
  toName: string;
  amount: number;
};

export type Summary = {
  totalSpent: number;
  expenseCount: number;
  memberCount: number;
  familyBalances: FamilyBalance[];
  memberBalances: MemberBalance[];
  settlement: Transfer[];
};

// round to 2 decimals to avoid floating-point noise
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeMemberBalances(
  members: MemberInput[],
  expenses: ExpenseInput[]
): MemberBalance[] {
  const paid = new Map<number, number>();
  const share = new Map<number, number>();
  for (const m of members) {
    paid.set(m.id, 0);
    share.set(m.id, 0);
  }

  for (const e of expenses) {
    const participants = e.participantIds.filter((id) => paid.has(id));
    if (participants.length === 0) continue; // nobody to split among → skip
    const perHead = e.amount / participants.length;

    if (paid.has(e.paidBy)) {
      paid.set(e.paidBy, (paid.get(e.paidBy) ?? 0) + e.amount);
    }
    for (const pid of participants) {
      share.set(pid, (share.get(pid) ?? 0) + perHead);
    }
  }

  // Keep full precision internally so totals reconcile exactly; round only at
  // display time (formatMoney). Rounding each share here would leave a few-paise
  // residue that breaks the "all nets sum to zero" invariant.
  return members.map((m) => {
    const p = paid.get(m.id) ?? 0;
    const s = share.get(m.id) ?? 0;
    return {
      id: m.id,
      name: m.name,
      familyId: m.familyId,
      paid: p,
      share: s,
      net: p - s,
    };
  });
}

export function computeFamilyBalances(
  families: FamilyInput[],
  memberBalances: MemberBalance[]
): FamilyBalance[] {
  return families.map((f) => {
    const fmembers = memberBalances.filter((m) => m.familyId === f.id);
    const paid = fmembers.reduce((a, m) => a + m.paid, 0);
    const share = fmembers.reduce((a, m) => a + m.share, 0);
    return {
      id: f.id,
      name: f.name,
      memberCount: fmembers.length,
      paid,
      share,
      net: paid - share,
      members: fmembers,
    };
  });
}

// Greedy debt simplification: match biggest creditor with biggest debtor.
// Works on any list of {id, name, net}. Returns the minimal-ish set of transfers.
export function settle(
  balances: { id: number; name: string; net: number }[]
): Transfer[] {
  const creditors = balances
    .filter((b) => b.net > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter((b) => b.net < -0.005)
    .map((b) => ({ ...b, net: -b.net })) // store debt as positive
    .sort((a, b) => b.net - a.net);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = round2(Math.min(c.net, d.net));

    if (amount > 0) {
      transfers.push({
        fromId: d.id,
        fromName: d.name,
        toId: c.id,
        toName: c.name,
        amount,
      });
    }

    c.net = round2(c.net - amount);
    d.net = round2(d.net - amount);

    if (c.net <= 0.005) ci++;
    if (d.net <= 0.005) di++;
  }

  return transfers;
}

export function buildSummary(
  families: FamilyInput[],
  members: MemberInput[],
  expenses: ExpenseInput[]
): Summary {
  const memberBalances = computeMemberBalances(members, expenses);
  const familyBalances = computeFamilyBalances(families, memberBalances);
  const settlement = settle(
    familyBalances.map((f) => ({ id: f.id, name: f.name, net: f.net }))
  );

  return {
    totalSpent: round2(expenses.reduce((a, e) => a + e.amount, 0)),
    expenseCount: expenses.length,
    memberCount: members.length,
    familyBalances,
    memberBalances,
    settlement,
  };
}

export function formatMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
