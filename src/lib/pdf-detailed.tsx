import React from "react";
import {
  Document, Page, View, Text, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Summary } from "./calc";
import type { ExpenseWithDetails } from "./data";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  indigo:      "#4f46e5",
  indigoDark:  "#3730a3",
  indigoLight: "#eef2ff",
  emerald:     "#059669",
  emeraldBg:   "#d1fae5",
  rose:        "#e11d48",
  roseBg:      "#ffe4e6",
  gray900:     "#111827",
  gray700:     "#374151",
  gray600:     "#4b5563",
  gray500:     "#6b7280",
  gray400:     "#9ca3af",
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
  { bg: "#fef3c7", text: "#78350f" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#ccfbf1", text: "#134e4a" },
  { bg: "#f3e8ff", text: "#6b21a8" },
  { bg: "#ffedd5", text: "#7c2d12" },
];

const CAT_COLOR: Record<string, string> = {
  Hotel: "#f97316", Travel: "#6366f1", Train: "#6366f1",
  Rickshaw: "#eab308", Food: "#22c55e", Tickets: "#a855f7",
  Shopping: "#ec4899", Other: "#9ca3af",
};

Font.registerHyphenationCallback((word) => [word]);

function rupee(n: number) {
  return "₹" + Math.abs(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
}

function initials(name: string) {
  return name.split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2);
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:        { backgroundColor: C.white, fontFamily: "Helvetica", fontSize: 8.5, color: C.gray700, paddingBottom: 44 },

  // Header
  headerBand:  { backgroundColor: C.indigo, padding: "22 32 0" },
  hRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  hLabel:      { fontSize: 8, color: "#a5b4fc", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  hTitle:      { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.3 },
  hSub:        { fontSize: 9, color: "#a5b4fc", marginTop: 5 },
  hTotalLabel: { fontSize: 8, color: "#a5b4fc", letterSpacing: 1, textTransform: "uppercase", textAlign: "right" },
  hTotalAmt:   { fontSize: 24, fontFamily: "Helvetica-Bold", color: C.white, textAlign: "right", marginTop: 3 },
  statsRow:    { flexDirection: "row", marginTop: 16 },
  statBox:     { flex: 1, backgroundColor: C.indigoDark, paddingVertical: 8, paddingHorizontal: 12, borderRight: `1 solid #4338ca` },
  statNum:     { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.white },
  statLbl:     { fontSize: 7, color: "#a5b4fc", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 },

  // Body
  body:        { padding: "18 32" },
  secHdr:      { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.indigo, textTransform: "uppercase",
                  letterSpacing: 2, borderBottom: `2 solid ${C.indigo}`, paddingBottom: 4, marginBottom: 10 },

  // Table
  table:       { border: `1 solid ${C.gray200}`, borderRadius: 4, overflow: "hidden" },
  tHead:       { flexDirection: "row", backgroundColor: C.indigo },
  tHCell:      { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.white,
                  paddingVertical: 6, paddingHorizontal: 7, textTransform: "uppercase", letterSpacing: 0.5 },
  tRow:        { flexDirection: "row", borderTop: `1 solid ${C.gray200}`, backgroundColor: C.white },
  tRowAlt:     { flexDirection: "row", borderTop: `1 solid ${C.gray200}`, backgroundColor: C.gray50 },
  tCell:       { fontSize: 8.5, paddingVertical: 5.5, paddingHorizontal: 7, color: C.gray700 },
  tCellBold:   { fontSize: 8.5, fontFamily: "Helvetica-Bold", paddingVertical: 5.5, paddingHorizontal: 7, color: C.gray900 },
  tFoot:       { flexDirection: "row", backgroundColor: C.gray900 },
  tFootCell:   { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.white, paddingVertical: 7, paddingHorizontal: 7 },
  catDot:      { width: 6, height: 6, borderRadius: 3, marginTop: 2, marginRight: 5 },

  // Family card
  famCard:     { marginBottom: 10, borderRadius: 5, overflow: "hidden", border: `1 solid ${C.gray200}` },
  famHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "9 12" },
  famAvatar:   { width: 32, height: 32, borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 9 },
  famName:     { fontSize: 11, fontFamily: "Helvetica-Bold" },
  famMeta:     { fontSize: 7.5, marginTop: 2 },
  netBadge:    { borderRadius: 99, paddingVertical: 4, paddingHorizontal: 10, fontSize: 9, fontFamily: "Helvetica-Bold" },
  memSubHdr:   { flexDirection: "row", borderTop: `1 solid ${C.gray200}`, backgroundColor: C.gray100, paddingVertical: 4 },
  memSubCell:  { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.gray500, paddingHorizontal: 10,
                  textTransform: "uppercase", letterSpacing: 0.5 },

  // Settlement
  settlInfo:   { backgroundColor: "#f0fdf4", border: `1 solid #bbf7d0`, borderRadius: 4, padding: "7 11", marginBottom: 10 },
  settlInfoTxt:{ fontSize: 8.5, color: "#065f46" },
  settlGroup:  { marginBottom: 12 },
  settlLabel:  { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  settlLine:   { flex: 1, height: 1, backgroundColor: C.gray200 },
  settlBadge:  { backgroundColor: C.emeraldBg, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 10,
                  fontSize: 8, fontFamily: "Helvetica-Bold", color: C.emerald, marginHorizontal: 8 },
  settlGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  settlCard:   { width: "31.5%", backgroundColor: C.white, border: `1 solid ${C.gray200}`, borderRadius: 5,
                  padding: "7 9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  settlFrom:   { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.gray900 },
  settlFam:    { fontSize: 7.5, color: C.gray400, marginTop: 1 },
  settlAmt:    { backgroundColor: C.roseBg, borderRadius: 5, paddingVertical: 3, paddingHorizontal: 6,
                  fontSize: 9, fontFamily: "Helvetica-Bold", color: C.rose },

  // Footer
  footer:      { position: "absolute", bottom: 14, left: 32, right: 32,
                  flexDirection: "row", justifyContent: "space-between",
                  borderTop: `1 solid ${C.gray300}`, paddingTop: 5 },
  footerTxt:   { fontSize: 7, color: C.gray400 },
  pageNum:     { fontSize: 7, color: C.gray400 },
});

// Expense table column widths (A4 = 595 - 64 padding = 531 usable)
const W = { num: 18, cat: 55, date: 50, paidBy: 65, ppl: 30, amt: 62, per: 55 };

// ─── PDF Component ───────────────────────────────────────────────────────────
export function DetailedBillPDF({
  tripName, tripDate, summary, expenses, generatedOn,
}: {
  tripName: string;
  tripDate: string | null;
  summary: Summary;
  expenses: ExpenseWithDetails[];
  generatedOn: string;
}) {
  const sorted = [...expenses].sort(
    (a, b) => (a.spentOn ?? "").localeCompare(b.spentOn ?? "") || a.id - b.id
  );

  // Build member→family map for settlement group labels
  const memberFam = new Map<number, string>();
  for (const f of summary.familyBalances) {
    for (const m of f.members) memberFam.set(m.id, f.name);
  }

  // Group settlement by recipient
  type STransfer = { fromName: string; fromFamily: string; amount: number };
  type SGroup    = { toName: string; toFamily: string; transfers: STransfer[] };
  const groupMap = new Map<number, SGroup>();
  for (const t of summary.settlement) {
    if (!groupMap.has(t.toId)) {
      groupMap.set(t.toId, {
        toName: t.toName,
        toFamily: memberFam.get(t.toId) ?? "",
        transfers: [],
      });
    }
    groupMap.get(t.toId)!.transfers.push({
      fromName: t.fromName,
      fromFamily: memberFam.get(t.fromId) ?? "",
      amount: t.amount,
    });
  }
  const settlGroups = [...groupMap.values()];

  return (
    <Document title={`${tripName} — Detailed Bill`} author="Trip Splitter">
      <Page size="A4" style={s.page}>

        {/* ══ HEADER ══ */}
        <View style={s.headerBand}>
          <View style={s.hRow}>
            <View>
              <Text style={s.hLabel}>Detailed Expense Report</Text>
              <Text style={s.hTitle}>{tripName}</Text>
              <Text style={s.hSub}>
                {tripDate ? `Trip date: ${tripDate}  ·  ` : ""}Generated {generatedOn}
              </Text>
            </View>
            <View>
              <Text style={s.hTotalLabel}>Total Spent</Text>
              <Text style={s.hTotalAmt}>{rupee(summary.totalSpent)}</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            {([
              [String(summary.memberCount), "People"],
              [String(summary.familyBalances.length), "Families"],
              [String(summary.expenseCount), "Expenses"],
              [rupee(summary.totalSpent / Math.max(summary.memberCount, 1)), "Avg / person"],
            ] as [string, string][]).map(([n, l], i) => (
              <View key={l} style={[s.statBox, i === 3 ? { borderRight: 0 } : {}]}>
                <Text style={s.statNum}>{n}</Text>
                <Text style={s.statLbl}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.body}>

          {/* ══ SECTION 1: EXPENSE LOG ══ */}
          <Text style={[s.secHdr, { marginTop: 4 }]}>1 · Expense Log</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.tHCell, { width: W.num }]}>#</Text>
              <Text style={[s.tHCell, { flex: 1 }]}>Description</Text>
              <Text style={[s.tHCell, { width: W.cat }]}>Category</Text>
              <Text style={[s.tHCell, { width: W.date }]}>Date</Text>
              <Text style={[s.tHCell, { width: W.paidBy }]}>Paid by</Text>
              <Text style={[s.tHCell, { width: W.ppl, textAlign: "center" }]}>Ppl</Text>
              <Text style={[s.tHCell, { width: W.amt, textAlign: "right" }]}>Amount</Text>
              <Text style={[s.tHCell, { width: W.per, textAlign: "right" }]}>Per person</Text>
            </View>

            {sorted.map((e, i) => {
              const perPerson = e.participantCount > 0 ? e.amount / e.participantCount : 0;
              const dot       = CAT_COLOR[e.category] ?? CAT_COLOR.Other;
              const Row       = i % 2 === 0 ? s.tRow : s.tRowAlt;
              return (
                <View key={e.id} style={Row} wrap={false}>
                  <Text style={[s.tCell, { width: W.num, color: C.gray400 }]}>{i + 1}</Text>
                  <View style={{ flex: 1, flexDirection: "row", paddingVertical: 5.5, paddingHorizontal: 7, alignItems: "flex-start" }}>
                    <View style={[s.catDot, { backgroundColor: dot }]} />
                    <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.gray900, flex: 1 }}>
                      {e.description}
                    </Text>
                  </View>
                  <Text style={[s.tCell, { width: W.cat, color: dot, fontFamily: "Helvetica-Bold" }]}>{e.category}</Text>
                  <Text style={[s.tCell, { width: W.date, color: C.gray500 }]}>{e.spentOn ?? "—"}</Text>
                  <Text style={[s.tCell, { width: W.paidBy }]}>{e.payerName}</Text>
                  <Text style={[s.tCell, { width: W.ppl, textAlign: "center", color: C.gray500 }]}>{e.participantCount}</Text>
                  <Text style={[s.tCellBold, { width: W.amt, textAlign: "right" }]}>{rupee(e.amount)}</Text>
                  <Text style={[s.tCell, { width: W.per, textAlign: "right", color: C.gray600 }]}>{rupee(perPerson)}</Text>
                </View>
              );
            })}

            <View style={s.tFoot}>
              <Text style={[s.tFootCell, { flex: 1 }]}>Total  ({sorted.length} expense{sorted.length !== 1 ? "s" : ""})</Text>
              <Text style={[s.tFootCell, { width: W.amt + W.per, textAlign: "right", fontSize: 11 }]}>{rupee(summary.totalSpent)}</Text>
            </View>
          </View>

          {/* ══ SECTION 2: FAMILY & MEMBER BREAKDOWN ══ */}
          <Text style={[s.secHdr, { marginTop: 20 }]} break>2 · Family &amp; Member Breakdown</Text>

          {summary.familyBalances.map((fam, fi) => {
            const c       = FAMILY_COLORS[fi % FAMILY_COLORS.length];
            const settled = Math.abs(fam.net) < 0.5;
            return (
              <View key={fam.id} style={s.famCard} wrap={false}>

                {/* Family header */}
                <View style={[s.famHeader, { backgroundColor: c.bg }]}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={[s.famAvatar, { backgroundColor: c.text }]}>
                      <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: c.bg }}>
                        {initials(fam.name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[s.famName, { color: c.text }]}>{fam.name}</Text>
                      <Text style={[s.famMeta, { color: c.text }]}>
                        {fam.memberCount} {fam.memberCount === 1 ? "person" : "people"}
                        {"  ·  "}Paid {rupee(fam.paid)}
                        {"  ·  "}Share {rupee(fam.share)}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text style={{ fontSize: 7, color: c.text, textAlign: "right", marginBottom: 3,
                      letterSpacing: 0.8, textTransform: "uppercase" }}>Family Total</Text>
                    <Text style={[s.netBadge,
                      settled
                        ? { backgroundColor: C.gray100, color: C.gray500 }
                        : fam.net > 0
                          ? { backgroundColor: C.emeraldBg, color: C.emerald }
                          : { backgroundColor: C.roseBg,    color: C.rose },
                    ]}>
                      {settled ? "Settled ✓" : fam.net > 0 ? `Gets  ${rupee(fam.net)}` : `Pays  ${rupee(-fam.net)}`}
                    </Text>
                  </View>
                </View>

                {/* Member column header */}
                <View style={s.memSubHdr}>
                  <Text style={[s.memSubCell, { flex: 1 }]}>Person</Text>
                  <Text style={[s.memSubCell, { width: 75, textAlign: "right" }]}>Paid</Text>
                  <Text style={[s.memSubCell, { width: 75, textAlign: "right" }]}>Share</Text>
                  <Text style={[s.memSubCell, { width: 95, textAlign: "right" }]}>Balance</Text>
                </View>

                {/* Member rows */}
                {fam.members.map((mem, mi) => {
                  const ms = Math.abs(mem.net) < 0.5;
                  return (
                    <View key={mem.id} style={{
                      flexDirection: "row", borderTop: `1 solid ${C.gray200}`,
                      backgroundColor: mi % 2 === 0 ? C.white : C.gray50,
                    }} wrap={false}>
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", padding: "5 10" }}>
                        <View style={{ width: 20, height: 20, borderRadius: 99, backgroundColor: c.bg,
                          alignItems: "center", justifyContent: "center", marginRight: 7 }}>
                          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: c.text }}>
                            {mem.name[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.gray900 }}>{mem.name}</Text>
                      </View>
                      <Text style={[s.tCell, { width: 75, textAlign: "right", color: mem.paid > 0 ? C.gray700 : C.gray400 }]}>
                        {mem.paid > 0 ? rupee(mem.paid) : "—"}
                      </Text>
                      <Text style={[s.tCell, { width: 75, textAlign: "right" }]}>{rupee(mem.share)}</Text>
                      <Text style={[s.tCellBold, { width: 95, textAlign: "right",
                        color: ms ? C.gray400 : mem.net > 0 ? C.emerald : C.rose,
                      }]}>
                        {ms ? "Even ✓" : mem.net > 0 ? `Gets  ${rupee(mem.net)}` : `Pays  ${rupee(-mem.net)}`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}

          {/* ══ SECTION 3: SETTLEMENT ══ */}
          <Text style={[s.secHdr, { marginTop: 20 }]}>3 · Settlement — Who Pays Whom</Text>
          <View style={s.settlInfo}>
            <Text style={s.settlInfoTxt}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>How to use: </Text>
              Each card shows a person and the exact amount to transfer to the recipient.
              Once all transfers are made, every family is settled.
            </Text>
          </View>

          {settlGroups.length === 0 ? (
            <View style={[s.settlInfo, { backgroundColor: C.emeraldBg, borderColor: C.emerald }]}>
              <Text style={[s.settlInfoTxt, { color: C.emerald, fontFamily: "Helvetica-Bold" }]}>
                Everyone is already settled up — no transfers needed!
              </Text>
            </View>
          ) : (
            settlGroups.map((grp, gi) => (
              <View key={gi} style={s.settlGroup} wrap={false}>
                <View style={s.settlLabel}>
                  <View style={s.settlLine} />
                  <Text style={s.settlBadge}>
                    Receiving: {grp.toName}  ({grp.toFamily})
                  </Text>
                  <View style={s.settlLine} />
                </View>
                <View style={s.settlGrid}>
                  {grp.transfers.map((t, ti) => (
                    <View key={ti} style={s.settlCard} wrap={false}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.settlFrom}>{t.fromName}</Text>
                        <Text style={s.settlFam}>{t.fromFamily}</Text>
                      </View>
                      <Text style={s.settlAmt}>{rupee(t.amount)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}

        </View>

        {/* ══ FOOTER ══ */}
        <View style={s.footer} fixed>
          <Text style={s.footerTxt}>{tripName}  ·  Detailed Bill  ·  Generated {generatedOn}</Text>
          <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
