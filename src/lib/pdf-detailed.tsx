import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { Summary } from "./calc";
import type { ExpenseWithDetails } from "./data";
import { registerBillFonts, INK } from "./pdf-fonts";
import {
  bs,
  Rs,
  BillHeader,
  SettlementSection,
  FamilyBalancesSection,
  BillFooter,
} from "./pdf-bill-parts";

// Expense ledger column widths
const W = { date: 58, cat: 56, paidBy: 72, ppl: 34, amt: 70 };

function LedgerSection({
  expenses,
  total,
}: {
  expenses: ExpenseWithDetails[];
  total: number;
}) {
  const sorted = [...expenses].sort(
    (a, b) => (a.spentOn ?? "").localeCompare(b.spentOn ?? "") || a.id - b.id
  );
  return (
    <View style={bs.section}>
      <Text style={bs.h2}>
        Expense <Text style={bs.h2em}>ledger</Text>
      </Text>
      <View style={bs.thRow}>
        <Text style={[bs.th, { width: W.date }]}>Date</Text>
        <Text style={[bs.th, { flex: 1 }]}>Description</Text>
        <Text style={[bs.th, { width: W.cat }]}>Category</Text>
        <Text style={[bs.th, { width: W.paidBy }]}>Paid by</Text>
        <Text style={[bs.th, { width: W.ppl, textAlign: "right" }]}>Shared</Text>
        <Text style={[bs.th, { width: W.amt, textAlign: "right" }]}>Amount</Text>
      </View>
      {sorted.map((e) => (
        <View key={e.id} style={bs.tr} wrap={false}>
          <Text style={[bs.td, bs.tdMuted, { width: W.date }]}>{e.spentOn ?? "—"}</Text>
          <Text style={[bs.td, { flex: 1 }]}>{e.description}</Text>
          <Text style={[bs.td, bs.tdMuted, { width: W.cat }]}>{e.category}</Text>
          <Text style={[bs.td, { width: W.paidBy }]}>{e.payerName}</Text>
          <Text style={[bs.amt, { width: W.ppl, color: INK.ink2 }]}>{e.participantCount}</Text>
          <Text style={[bs.amt, { width: W.amt }]}>
            <Rs n={e.amount} />
          </Text>
        </View>
      ))}
      <View style={bs.footRow}>
        <Text style={[bs.famName, { flex: 1 }]}>
          Total · {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
        </Text>
        <Text style={[bs.amt, bs.tdStrong, { width: W.amt }]}>
          <Rs n={total} />
        </Text>
      </View>
    </View>
  );
}

export function DetailedBillPDF({
  tripName,
  tripDate,
  summary,
  expenses,
  generatedOn,
}: {
  tripName: string;
  tripDate: string | null;
  summary: Summary;
  expenses: ExpenseWithDetails[];
  generatedOn: string;
}) {
  registerBillFonts();
  return (
    <Document title={`${tripName} — Detailed Bill`} author="Trip Splitter">
      <Page size="A4" style={bs.page}>
        <BillHeader
          tripName={tripName}
          tripDate={tripDate}
          summary={summary}
          generatedOn={generatedOn}
          kind="Detailed expense report"
        />
        <SettlementSection summary={summary} />
        <FamilyBalancesSection summary={summary} />
        <LedgerSection expenses={expenses} total={summary.totalSpent} />
        <BillFooter tripName={tripName} generatedOn={generatedOn} />
      </Page>
    </Document>
  );
}
