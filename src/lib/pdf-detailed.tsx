import React from "react";
import {
  Document, Page, View, Text, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Summary } from "./calc";
import type { ExpenseWithDetails } from "./data";

const C = {
  indigo:      "#4f46e5",
  indigoLight: "#eef2ff",
  indigoDark:  "#3730a3",
  emerald:     "#059669",
  emeraldBg:   "#ecfdf5",
  rose:        "#e11d48",
  roseBg:      "#fff1f2",
  gray900:     "#111827",
  gray700:     "#374151",
  gray500:     "#6b7280",
  gray300:     "#d1d5db",
  gray200:     "#e5e7eb",
  gray100:     "#f3f4f6",
  gray50:      "#f9fafb",
  white:       "#ffffff",
};

const FAMILY_COLORS = [
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#e0f2fe", text: "#0c4a6e" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#ffe4e6", text: "#9f1239" },
];

const CAT_COLORS: Record<string, string> = {
  Travel: "#3b82f6", Train: "#6366f1", Rickshaw: "#eab308",
  Hotel: "#f97316", Food: "#22c55e", Tickets: "#a855f7",
  Shopping: "#ec4899", Other: "#9ca3af",
};

Font.registerHyphenationCallback((word) => [word]);

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica", fontSize: 8.5, color: C.gray700, paddingBottom: 40 },

  // Header
  headerBar:   { backgroundColor: C.indigo, padding: "18 28 14" },
  headerRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tripName:    { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.3 },
  billType:    { fontSize: 8, color: "#a5b4fc", marginTop: 1, letterSpacing: 0.8, textTransform: "uppercase" },
  headerSub:   { fontSize: 8.5, color: "#a5b4fc", marginTop: 3 },
  totalBox:    { alignItems: "flex-end" },
  totalLabel:  { fontSize: 7.5, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 0.8 },
  totalAmt:    { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, marginTop: 2 },
  statsRow:    { flexDirection: "row", marginTop: 12, gap: 0 },
  statBox:     { flex: 1, backgroundColor: C.indigoDark, paddingVertical: 7, paddingHorizontal: 10, borderRight: `1 solid #4338ca` },
  statNum:     { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.white },
  statLbl:     { fontSize: 7, color: "#a5b4fc", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  // Body
  body:        { padding: "14 28" },
  section:     { marginBottom: 16 },
  sectionHdr:  { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.indigo, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, borderBottom: `1.5 solid ${C.indigo}`, paddingBottom: 3 },

  // Table
  table:       { borderRadius: 5, overflow: "hidden", border: `1 solid ${C.gray200}` },
  tHead:       { flexDirection: "row", backgroundColor: C.indigo },
  tHeadCell:   { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.white, paddingVertical: 6, paddingHorizontal: 7, textTransform: "uppercase", letterSpacing: 0.5 },
  tRow:        { flexDirection: "row", borderTop: `1 solid ${C.gray200}` },
  tRowAlt:     { flexDirection: "row", borderTop: `1 solid ${C.gray200}`, backgroundColor: C.gray50 },
  tCell:       { fontSize: 8.5, paddingVertical: 5.5, paddingHorizontal: 7, color: C.gray700 },
  tCellBold:   { fontSize: 8.5, paddingVertical: 5.5, paddingHorizontal: 7, color: C.gray900, fontFamily: "Helvetica-Bold" },
  tFoot:       { flexDirection: "row", backgroundColor: C.gray900 },
  tFootCell:   { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.white, paddingVertical: 6, paddingHorizontal: 7 },

  // Category dot
  catDot:      { width: 6, height: 6, borderRadius: 3, marginTop: 1.5, marginRight: 5 },

  // Balance table
  balGets:     { color: C.emerald, fontFamily: "Helvetica-Bold" },
  balOwes:     { color: C.rose, fontFamily: "Helvetica-Bold" },
  balEven:     { color: C.gray500 },

  // Settlement
  settlCard:   { backgroundColor: C.gray50, borderRadius: 5, border: `1 solid ${C.gray200}`, padding: "8 12", marginBottom: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fromBadge:   { backgroundColor: C.roseBg, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9, fontSize: 8.5, color: C.rose, fontFamily: "Helvetica-Bold" },
  toBadge:     { backgroundColor: C.emeraldBg, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9, fontSize: 8.5, color: C.emerald, fontFamily: "Helvetica-Bold" },
  arrow:       { fontSize: 11, color: C.gray300, marginHorizontal: 6 },
  transferAmt: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.gray900 },

  // Family summary card
  famCard:     { marginBottom: 7, borderRadius: 5, overflow: "hidden", border: `1 solid ${C.gray200}` },
  famHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "7 10" },
  famName:     { fontSize: 10, fontFamily: "Helvetica-Bold" },
  famMeta:     { fontSize: 7.5, marginTop: 1.5 },
  netBadge:    { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9, fontSize: 8.5, fontFamily: "Helvetica-Bold" },

  // Footer
  footer:      { position: "absolute", bottom: 14, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${C.gray300}`, paddingTop: 5 },
  footerText:  { fontSize: 7, color: C.gray500 },
  pageNum:     { fontSize: 7, color: C.gray500 },
});

// Column widths for expense table (must sum ≈ page width - 56 padding = 539)
const EXP_COL = { num: 22, desc: 140, cat: 52, date: 54, paidBy: 65, split: 42, amt: 62, perPerson: 62 };

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
  const sorted = [...expenses].sort((a, b) =>
    (a.spentOn ?? "").localeCompare(b.spentOn ?? "") || a.id - b.id
  );

  return (
    <Document title={`${tripName} — Detailed Bill`} author="Trip Splitter">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerBar}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.billType}>Detailed Expense Report</Text>
              <Text style={s.tripName}>{tripName}</Text>
              <Text style={s.headerSub}>
                {tripDate ? `Trip date: ${tripDate}  ·  ` : ""}
                Generated {generatedOn}
              </Text>
            </View>
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>Total Spent</Text>
              <Text style={s.totalAmt}>{fmt(summary.totalSpent)}</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statNum}>{summary.memberCount}</Text>
              <Text style={s.statLbl}>People</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{summary.familyBalances.length}</Text>
              <Text style={s.statLbl}>Families</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{summary.expenseCount}</Text>
              <Text style={s.statLbl}>Expenses</Text>
            </View>
            <View style={[s.statBox, { borderRight: 0 }]}>
              <Text style={s.statNum}>{fmt(summary.totalSpent / (summary.memberCount || 1))}</Text>
              <Text style={s.statLbl}>Avg per person</Text>
            </View>
          </View>
        </View>

        <View style={s.body}>

          {/* ── Section 1: Expense Log ── */}
          <View style={s.section}>
            <Text style={s.sectionHdr}>Expense Log</Text>
            <View style={s.table}>
              <View style={s.tHead}>
                <Text style={[s.tHeadCell, { width: EXP_COL.num }]}>#</Text>
                <Text style={[s.tHeadCell, { flex: 1 }]}>Description</Text>
                <Text style={[s.tHeadCell, { width: EXP_COL.cat }]}>Category</Text>
                <Text style={[s.tHeadCell, { width: EXP_COL.date }]}>Date</Text>
                <Text style={[s.tHeadCell, { width: EXP_COL.paidBy }]}>Paid by</Text>
                <Text style={[s.tHeadCell, { width: EXP_COL.split, textAlign: "center" }]}>Split</Text>
                <Text style={[s.tHeadCell, { width: EXP_COL.amt, textAlign: "right" }]}>Amount</Text>
                <Text style={[s.tHeadCell, { width: EXP_COL.perPerson, textAlign: "right" }]}>Per unit</Text>
              </View>
              {sorted.map((e, i) => {
                const perUnit = e.totalUnits > 0 ? e.amount / e.totalUnits : 0;
                const dotColor = CAT_COLORS[e.category] ?? CAT_COLORS.Other;
                const RowStyle = i % 2 === 0 ? s.tRow : s.tRowAlt;
                return (
                  <View key={e.id} style={RowStyle} wrap={false}>
                    <Text style={[s.tCell, { width: EXP_COL.num, color: C.gray500 }]}>{i + 1}</Text>
                    <View style={[{ flex: 1, flexDirection: "row", paddingVertical: 5.5, paddingHorizontal: 7 }]}>
                      <View style={[s.catDot, { backgroundColor: dotColor }]} />
                      <Text style={{ fontSize: 8.5, color: C.gray900, fontFamily: "Helvetica-Bold", flex: 1 }}>{e.description}</Text>
                    </View>
                    <Text style={[s.tCell, { width: EXP_COL.cat, color: dotColor }]}>{e.category}</Text>
                    <Text style={[s.tCell, { width: EXP_COL.date }]}>{e.spentOn ?? "—"}</Text>
                    <Text style={[s.tCell, { width: EXP_COL.paidBy }]}>{e.payerName}</Text>
                    <Text style={[s.tCell, { width: EXP_COL.split, textAlign: "center" }]}>
                      {e.participantCount}p / {e.totalUnits}u
                    </Text>
                    <Text style={[s.tCellBold, { width: EXP_COL.amt, textAlign: "right" }]}>{fmt(e.amount)}</Text>
                    <Text style={[s.tCell, { width: EXP_COL.perPerson, textAlign: "right" }]}>{fmtShort(perUnit)}</Text>
                  </View>
                );
              })}
              <View style={s.tFoot}>
                <Text style={[s.tFootCell, { flex: 1 }]}>Total  ({sorted.length} expenses)</Text>
                <Text style={[s.tFootCell, { width: EXP_COL.amt + EXP_COL.perPerson, textAlign: "right" }]}>{fmt(summary.totalSpent)}</Text>
              </View>
            </View>
          </View>

          {/* ── Section 2: Individual Balances ── */}
          <View style={s.section} break>
            <Text style={s.sectionHdr}>Individual Balances</Text>
            <View style={s.table}>
              <View style={s.tHead}>
                <Text style={[s.tHeadCell, { flex: 1 }]}>Person</Text>
                <Text style={[s.tHeadCell, { width: 90 }]}>Family</Text>
                <Text style={[s.tHeadCell, { width: 75, textAlign: "right" }]}>Total Paid</Text>
                <Text style={[s.tHeadCell, { width: 75, textAlign: "right" }]}>Fair Share</Text>
                <Text style={[s.tHeadCell, { width: 90, textAlign: "right" }]}>Balance</Text>
              </View>
              {summary.familyBalances.map((f, fi) =>
                f.members.map((m, mi) => {
                  const settled = Math.abs(m.net) < 0.01;
                  const RowStyle = fi % 2 === 0 ? s.tRow : s.tRowAlt;
                  return (
                    <View key={m.id} style={RowStyle} wrap={false}>
                      <Text style={[s.tCellBold, { flex: 1 }]}>{m.name}</Text>
                      <Text style={[s.tCell, { width: 90, color: C.gray500 }]}>{mi === 0 ? f.name : ""}</Text>
                      <Text style={[s.tCell, { width: 75, textAlign: "right" }]}>{fmt(m.paid)}</Text>
                      <Text style={[s.tCell, { width: 75, textAlign: "right" }]}>{fmt(m.share)}</Text>
                      <Text style={[s.tCellBold, { width: 90, textAlign: "right" },
                        settled ? s.balEven : m.net > 0 ? s.balGets : s.balOwes
                      ]}>
                        {settled ? "Even" : m.net > 0 ? `Gets ${fmt(m.net)}` : `Owes ${fmt(-m.net)}`}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* ── Section 3: Family Summary ── */}
          <View style={s.section}>
            <Text style={s.sectionHdr}>Family Summary</Text>
            {summary.familyBalances.map((f, fi) => {
              const c = FAMILY_COLORS[fi % FAMILY_COLORS.length];
              const settled = Math.abs(f.net) < 0.01;
              return (
                <View key={f.id} style={s.famCard} wrap={false}>
                  <View style={[s.famHeader, { backgroundColor: c.bg }]}>
                    <View>
                      <Text style={[s.famName, { color: c.text }]}>{f.name}</Text>
                      <Text style={[s.famMeta, { color: c.text }]}>
                        {f.memberCount} people  ·  Paid {fmt(f.paid)}  ·  Share {fmt(f.share)}
                      </Text>
                    </View>
                    <Text style={[
                      s.netBadge,
                      settled ? { backgroundColor: C.gray100, color: C.gray500 }
                        : f.net > 0 ? { backgroundColor: C.emeraldBg, color: C.emerald }
                        : { backgroundColor: C.roseBg, color: C.rose },
                    ]}>
                      {settled ? "Even" : f.net > 0 ? `Gets ${fmt(f.net)}` : `Owes ${fmt(-f.net)}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Section 4: Settlement ── */}
          <View style={s.section}>
            <Text style={s.sectionHdr}>Settlement — Who Pays Whom</Text>
            {summary.settlement.length === 0 ? (
              <View style={[s.settlCard, { backgroundColor: C.emeraldBg, borderColor: C.emerald }]}>
                <Text style={{ fontSize: 9, color: C.emerald, fontFamily: "Helvetica-Bold" }}>
                  Everyone is settled up — no transfers needed!
                </Text>
              </View>
            ) : (
              summary.settlement.map((t, i) => (
                <View key={i} style={s.settlCard} wrap={false}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text style={s.fromBadge}>{t.fromName}</Text>
                    <Text style={s.arrow}> → </Text>
                    <Text style={s.toBadge}>{t.toName}</Text>
                  </View>
                  <Text style={s.transferAmt}>{fmt(t.amount)}</Text>
                </View>
              ))
            )}
          </View>

        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{tripName}  ·  Detailed Bill  ·  Generated {generatedOn}</Text>
          <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
