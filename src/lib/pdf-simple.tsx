import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import type { Summary } from "./calc";
import { registerBillFonts } from "./pdf-fonts";
import {
  bs,
  BillHeader,
  SettlementSection,
  FamilyBalancesSection,
  BillFooter,
} from "./pdf-bill-parts";

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
  registerBillFonts();
  return (
    <Document title={`${tripName} — Settlement Bill`} author="Trip Splitter">
      <Page size="A4" style={bs.page}>
        <BillHeader
          tripName={tripName}
          tripDate={tripDate}
          summary={summary}
          generatedOn={generatedOn}
          kind="Trip settlement bill"
        />
        <SettlementSection summary={summary} />
        <FamilyBalancesSection summary={summary} />
        <BillFooter tripName={tripName} generatedOn={generatedOn} />
      </Page>
    </Document>
  );
}
