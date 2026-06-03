import React from "react";
import {
  Document, Page, View, Text, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Summary } from "./calc";

// ── Palette ──────────────────────────────────────────────────────────────
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
  gray100:     "#f3f4f6",
  white:       "#ffffff",
};

const FAMILY_COLORS = [
  { bg: "#ede9fe", text: "#5b21b6" }, // violet
  { bg: "#d1fae5", text: "#065f46" }, // emerald
  { bg: "#e0f2fe", text: "#0c4a6e" }, // sky
  { bg: "#fef3c7", text: "#92400e" }, // amber
  { bg: "#ffe4e6", text: "#9f1239" }, // rose
];

Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica", fontSize: 9, color: C.gray700, paddingBottom: 40 },

  // Header
  headerBar:  { backgroundColor: C.indigo, padding: "20 28" },
  headerTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tripName:   { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.3 },
  headerSub:  { fontSize: 9, color: "#a5b4fc", marginTop: 3 },
  totalBox:   { alignItems: "flex-end" },
  totalLabel: { fontSize: 8, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 0.8 },
  totalAmt:   { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.white, marginTop: 2 },

  statsRow:   { flexDirection: "row", gap: 0 },
  statBox:    { flex: 1, backgroundColor: C.indigoDark, paddingVertical: 8, paddingHorizontal: 12, borderRight: `1 solid #4338ca` },
  statNum:    { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.white },
  statLbl:    { fontSize: 7.5, color: "#a5b4fc", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.6 },

  // Body
  body:       { padding: "18 28" },
  sectionHdr: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.indigo, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, borderBottom: `1.5 solid ${C.indigo}`, paddingBottom: 4 },

  // Family card
  familyCard:     { marginBottom: 10, borderRadius: 6, overflow: "hidden", border: `1 solid ${C.gray300}` },
  familyHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "8 12" },
  familyName:     { fontSize: 11, fontFamily: "Helvetica-Bold" },
  familyMeta:     { fontSize: 8, marginTop: 2 },
  netBadge:       { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9, fontSize: 9, fontFamily: "Helvetica-Bold" },
  memberRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5, paddingHorizontal: 12, borderTop: `1 solid ${C.gray100}` },
  memberName:     { fontSize: 8.5, color: C.gray700 },
  memberAmounts:  { flexDirection: "row", gap: 12, alignItems: "center" },
  memberAmtLabel: { fontSize: 7.5, color: C.gray500 },
  memberNet:      { fontSize: 9, fontFamily: "Helvetica-Bold", minWidth: 70, textAlign: "right" },

  // Settlement
  settlementCard: { backgroundColor: C.gray100, borderRadius: 6, padding: "10 12", marginBottom: 6 },
  transferRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fromBadge:      { backgroundColor: C.roseBg, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 8, fontSize: 9, color: C.rose, fontFamily: "Helvetica-Bold" },
  toBadge:        { backgroundColor: C.emeraldBg, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 8, fontSize: 9, color: C.emerald, fontFamily: "Helvetica-Bold" },
  arrow:          { fontSize: 11, color: C.gray500, paddingHorizontal: 6 },
  transferAmt:    { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.gray900 },
  transferNote:   { fontSize: 7.5, color: C.gray500, marginTop: 3 },

  // Footer
  footer: { position: "absolute", bottom: 14, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${C.gray300}`, paddingTop: 6 },
  footerText: { fontSize: 7.5, color: C.gray500 },
  pageNum: { fontSize: 7.5, color: C.gray500 },
});

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SimpleBillPDF({
  tripName,
  tripDate,
  summary,
  generatedOn,
}: {
  tripName: string;
  tripDate: string | null;
  summary: Summary;
  generatedOn: string;
}) {
  return (
    <Document title={`${tripName} — Summary Bill`} author="Trip Splitter">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerBar}>
          <View style={s.headerTop}>
            <View>
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
          <View style={[s.statsRow, { marginTop: 14 }]}>
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
              <Text style={s.statLbl}>Per person avg</Text>
            </View>
          </View>
        </View>

        <View style={s.body}>

          {/* ── Family Balances ── */}
          <Text style={[s.sectionHdr, { marginTop: 4 }]}>Family Balances</Text>
          {summary.familyBalances.map((f, fi) => {
            const c = FAMILY_COLORS[fi % FAMILY_COLORS.length];
            const settled = Math.abs(f.net) < 0.01;
            return (
              <View key={f.id} style={s.familyCard}>
                <View style={[s.familyHeader, { backgroundColor: c.bg }]}>
                  <View>
                    <Text style={[s.familyName, { color: c.text }]}>{f.name}</Text>
                    <Text style={[s.familyMeta, { color: c.text }]}>
                      {f.memberCount} {f.memberCount === 1 ? "member" : "members"}  ·  Paid {fmt(f.paid)}  ·  Share {fmt(f.share)}
                    </Text>
                  </View>
                  <Text style={[
                    s.netBadge,
                    settled
                      ? { backgroundColor: C.gray100, color: C.gray500 }
                      : f.net > 0
                      ? { backgroundColor: C.emeraldBg, color: C.emerald }
                      : { backgroundColor: C.roseBg, color: C.rose },
                  ]}>
                    {settled ? "Even" : f.net > 0 ? `Gets ${fmt(f.net)}` : `Owes ${fmt(-f.net)}`}
                  </Text>
                </View>
                {f.members.map((m) => {
                  const ms = Math.abs(m.net) < 0.01;
                  return (
                    <View key={m.id} style={s.memberRow}>
                      <Text style={s.memberName}>{m.name}</Text>
                      <View style={s.memberAmounts}>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={s.memberAmtLabel}>Paid {fmt(m.paid)}</Text>
                          <Text style={s.memberAmtLabel}>Share {fmt(m.share)}</Text>
                        </View>
                        <Text style={[
                          s.memberNet,
                          ms ? { color: C.gray500 } : m.net > 0 ? { color: C.emerald } : { color: C.rose },
                        ]}>
                          {ms ? "Even" : m.net > 0 ? `+${fmt(m.net)}` : fmt(m.net)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}

          {/* ── Settlement ── */}
          <Text style={[s.sectionHdr, { marginTop: 14 }]}>Settlement — Who Pays Whom</Text>
          {summary.settlement.length === 0 ? (
            <View style={[s.settlementCard, { backgroundColor: C.emeraldBg }]}>
              <Text style={{ fontSize: 9, color: C.emerald, fontFamily: "Helvetica-Bold" }}>
                🎉  Everyone is settled up — no transfers needed!
              </Text>
            </View>
          ) : (
            summary.settlement.map((t, i) => (
              <View key={i} style={[s.settlementCard, { marginBottom: 6 }]}>
                <View style={s.transferRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text style={s.fromBadge}>{t.fromName}</Text>
                    <Text style={s.arrow}> → </Text>
                    <Text style={s.toBadge}>{t.toName}</Text>
                  </View>
                  <Text style={s.transferAmt}>{fmt(t.amount)}</Text>
                </View>
                <Text style={s.transferNote}>{t.fromName} pays {t.toName} to settle up</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{tripName}  ·  Summary Bill  ·  Generated {generatedOn}</Text>
          <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
