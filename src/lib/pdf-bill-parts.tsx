import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Summary } from "./calc";
import { INK } from "./pdf-fonts";

export function fmtNum(n: number) {
  return Math.abs(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * ₹ amount for use inside a serif <Text>. Libre Baskerville has no U+20B9,
 * so the rupee sign renders in Josefin Sans at a slightly smaller size in
 * ink-2 (matching the app's .ts-money treatment); digits stay serif.
 */
export function Rs({ n }: { n: number }) {
  return (
    <>
      <Text style={{ fontFamily: "Josefin Sans", fontWeight: 400, fontSize: 7, color: INK.ink2 }}>
        ₹
      </Text>
      <Text>{fmtNum(n)}</Text>
    </>
  );
}

/** Larger ₹ for the stat strip numbers. */
export function RsBig({ n }: { n: number }) {
  return (
    <>
      <Text style={{ fontFamily: "Josefin Sans", fontWeight: 400, fontSize: 11, color: INK.ink2 }}>
        ₹
      </Text>
      <Text>{fmtNum(n)}</Text>
    </>
  );
}

export const bs = StyleSheet.create({
  page: {
    backgroundColor: INK.white,
    fontFamily: "Josefin Sans",
    fontWeight: 300,
    fontSize: 8.5,
    color: INK.ink,
    paddingTop: 46,
    paddingHorizontal: 48,
    paddingBottom: 52,
  },

  // header
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  wordmark: { fontFamily: "Sacramento", fontSize: 19, color: INK.ink },
  eyebrow: {
    fontFamily: "Josefin Sans",
    fontWeight: 600,
    fontSize: 6.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: INK.ink2,
  },
  eyebrowRose: {
    fontFamily: "Josefin Sans",
    fontWeight: 600,
    fontSize: 6.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: INK.rose,
  },
  title: {
    fontFamily: "Libre Baskerville",
    fontWeight: 400,
    fontSize: 25,
    color: INK.ink,
    marginTop: 16,
  },
  sub: { fontSize: 8, color: INK.ink2, letterSpacing: 0.5, marginTop: 7 },

  // stat strip
  stats: {
    flexDirection: "row",
    marginTop: 18,
    borderTop: `1 solid ${INK.ink}`,
    borderBottom: `1 solid ${INK.hairline}`,
  },
  statCell: { flexDirection: "column", gap: 5, paddingVertical: 10, paddingRight: 10 },
  statCellDivided: { borderLeft: `1 solid ${INK.hairline}`, paddingLeft: 11 },
  statNum: {
    fontFamily: "Libre Baskerville",
    fontWeight: 400,
    fontSize: 14.5,
    color: INK.ink,
  },

  // sections
  section: { marginTop: 26 },
  h2: { fontFamily: "Libre Baskerville", fontWeight: 400, fontSize: 13.5, color: INK.ink, marginBottom: 9 },
  h2em: { fontFamily: "Libre Baskerville", fontStyle: "italic", color: INK.rose },
  note: { fontSize: 9, color: INK.ink2 },

  // tables
  th: {
    fontFamily: "Josefin Sans",
    fontWeight: 600,
    fontSize: 6.4,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: INK.ink2,
    paddingBottom: 6,
  },
  thRow: { flexDirection: "row", borderBottom: `1 solid ${INK.ink}` },
  tr: { flexDirection: "row", borderBottom: `1 solid ${INK.hairline}`, alignItems: "baseline" },
  td: { fontSize: 8.5, paddingVertical: 7, paddingRight: 8, letterSpacing: 0.2 },
  tdMuted: { color: INK.ink2 },
  tdStrong: { fontWeight: 600 },
  tdMember: { paddingLeft: 14, fontWeight: 300 },
  amt: {
    fontFamily: "Libre Baskerville",
    fontWeight: 400,
    fontSize: 8.5,
    textAlign: "right",
    paddingVertical: 7,
  },
  famRow: {
    flexDirection: "row",
    borderTop: `1 solid ${INK.strong}`,
    backgroundColor: INK.bg,
    alignItems: "baseline",
  },
  famName: {
    fontFamily: "Josefin Sans",
    fontWeight: 600,
    fontSize: 7,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    paddingVertical: 7,
    paddingRight: 8,
  },
  footRow: { flexDirection: "row", borderTop: `1 solid ${INK.ink}`, alignItems: "baseline" },

  gets: { color: INK.green, fontWeight: 600 },
  owes: { color: INK.roseInk, fontWeight: 600 },
  even: { color: INK.ink3 },
  getsAmt: { color: INK.green },
  owesAmt: { color: INK.roseInk },

  // footer
  pageFooter: {
    position: "absolute",
    bottom: 22,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1 solid ${INK.hairline}`,
    paddingTop: 7,
  },
  footerText: {
    fontFamily: "Josefin Sans",
    fontWeight: 400,
    fontSize: 6.4,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: INK.ink2,
  },
});

export function BillHeader({
  tripName,
  tripDate,
  summary,
  generatedOn,
  kind,
}: {
  tripName: string;
  tripDate: string | null;
  summary: Summary;
  generatedOn: string;
  kind: string;
}) {
  return (
    <View>
      <View style={bs.brandRow}>
        <Text style={bs.wordmark}>Trip Splitter</Text>
        <Text style={bs.eyebrow}>{kind}</Text>
      </View>
      <Text style={bs.title}>{tripName}</Text>
      <Text style={bs.sub}>
        {[tripDate, `Generated ${generatedOn}`].filter(Boolean).join("   ·   ")}
      </Text>
      <View style={bs.stats}>
        <View style={[bs.statCell, { flex: 1.5 }]}>
          <Text style={bs.statNum}>
            <RsBig n={summary.totalSpent} />
          </Text>
          <Text style={bs.eyebrow}>Total spent</Text>
        </View>
        <View style={[bs.statCell, bs.statCellDivided, { flex: 1 }]}>
          <Text style={bs.statNum}>{summary.memberCount}</Text>
          <Text style={bs.eyebrow}>People</Text>
        </View>
        <View style={[bs.statCell, bs.statCellDivided, { flex: 1 }]}>
          <Text style={bs.statNum}>{summary.expenseCount}</Text>
          <Text style={bs.eyebrow}>Expenses</Text>
        </View>
        <View style={[bs.statCell, bs.statCellDivided, { flex: 1.2 }]}>
          <Text style={bs.statNum}>
            <RsBig n={summary.totalSpent / (summary.memberCount || 1)} />
          </Text>
          <Text style={bs.eyebrow}>Per person avg</Text>
        </View>
      </View>
    </View>
  );
}

const SW = { num: 22, amt: 80 };

export function SettlementSection({ summary }: { summary: Summary }) {
  return (
    <View style={bs.section}>
      <Text style={bs.h2}>
        Who pays <Text style={bs.h2em}>whom</Text>
      </Text>
      {summary.settlement.length === 0 ? (
        <Text style={bs.note}>Everyone is settled up — no transfers needed.</Text>
      ) : (
        <View>
          <View style={bs.thRow}>
            <Text style={[bs.th, { width: SW.num, textAlign: "right", paddingRight: 8 }]}>#</Text>
            <Text style={[bs.th, { flex: 1 }]}>From</Text>
            <Text style={[bs.th, { flex: 1 }]}>To</Text>
            <Text style={[bs.th, { width: SW.amt, textAlign: "right" }]}>Amount</Text>
          </View>
          {summary.settlement.map((t, i) => (
            <View key={i} style={bs.tr} wrap={false}>
              <Text
                style={[
                  bs.amt,
                  { width: SW.num, textAlign: "right", paddingRight: 8, color: INK.ink3 },
                ]}
              >
                {i + 1}
              </Text>
              <Text style={[bs.td, { flex: 1 }]}>{t.fromName}</Text>
              <Text style={[bs.td, bs.tdStrong, { flex: 1 }]}>{t.toName}</Text>
              <Text style={[bs.amt, { width: SW.amt }]}>
                <Rs n={t.amount} />
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const FW = { amt: 78 };

export function FamilyBalancesSection({ summary }: { summary: Summary }) {
  return (
    <View style={bs.section}>
      <Text style={bs.h2}>
        Family <Text style={bs.h2em}>balances</Text>
      </Text>
      <View style={bs.thRow}>
        <Text style={[bs.th, { flex: 1 }]}>Name</Text>
        <Text style={[bs.th, { width: FW.amt, textAlign: "right" }]}>Paid</Text>
        <Text style={[bs.th, { width: FW.amt, textAlign: "right" }]}>Share</Text>
        <Text style={[bs.th, { width: FW.amt + 14, textAlign: "right" }]}>Balance</Text>
      </View>
      {summary.familyBalances.map((f) => {
        const fSettled = Math.abs(f.net) < 0.01;
        return (
          <React.Fragment key={f.id}>
            <View style={bs.famRow} wrap={false}>
              <Text style={[bs.famName, { flex: 1 }]}>{f.name}</Text>
              <Text style={[bs.amt, bs.tdStrong, { width: FW.amt }]}>
                <Rs n={f.paid} />
              </Text>
              <Text style={[bs.amt, bs.tdStrong, { width: FW.amt }]}>
                <Rs n={f.share} />
              </Text>
              <Text
                style={[
                  bs.amt,
                  { width: FW.amt + 14 },
                  fSettled ? bs.even : f.net > 0 ? bs.getsAmt : bs.owesAmt,
                ]}
              >
                {fSettled ? (
                  "Even"
                ) : (
                  <>
                    {f.net > 0 ? "Gets " : "Owes "}
                    <Rs n={f.net} />
                  </>
                )}
              </Text>
            </View>
            {f.members.map((m) => {
              const ms = Math.abs(m.net) < 0.01;
              return (
                <View key={m.id} style={bs.tr} wrap={false}>
                  <Text style={[bs.td, bs.tdMember, { flex: 1 }]}>{m.name}</Text>
                  <Text style={[bs.amt, { width: FW.amt, color: INK.ink2 }]}>
                    <Rs n={m.paid} />
                  </Text>
                  <Text style={[bs.amt, { width: FW.amt, color: INK.ink2 }]}>
                    <Rs n={m.share} />
                  </Text>
                  <Text
                    style={[
                      bs.amt,
                      { width: FW.amt + 14 },
                      ms ? bs.even : m.net > 0 ? bs.getsAmt : bs.owesAmt,
                    ]}
                  >
                    {ms ? (
                      "Even"
                    ) : (
                      <>
                        {m.net > 0 ? "+" : "−"}
                        <Rs n={m.net} />
                      </>
                    )}
                  </Text>
                </View>
              );
            })}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function BillFooter({
  tripName,
  generatedOn,
}: {
  tripName: string;
  generatedOn: string;
}) {
  return (
    <View style={bs.pageFooter} fixed>
      <Text style={bs.footerText}>{tripName} · Settlement bill</Text>
      <Text
        style={bs.footerText}
        render={({ pageNumber, totalPages }) =>
          `Generated ${generatedOn} · Trip Splitter · ${pageNumber}/${totalPages}`
        }
      />
    </View>
  );
}
