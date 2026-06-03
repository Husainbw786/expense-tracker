import { renderToBuffer } from "@react-pdf/renderer";
import { getTrip, getTripSummary, getTripExpensesWithDetails } from "@/lib/data";
import { DetailedBillPDF } from "@/lib/pdf-detailed";
import { createElement } from "react";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tripId = Number(id);

  const [trip, summary, expenses] = await Promise.all([
    getTrip(tripId),
    getTripSummary(tripId),
    getTripExpensesWithDetails(tripId),
  ]);

  if (!trip) return new Response("Not found", { status: 404 });

  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const pdf = createElement(DetailedBillPDF, {
    tripName: trip.name,
    tripDate: trip.startDate,
    summary,
    expenses,
    generatedOn,
  });

  const buffer = await renderToBuffer(pdf as any);
  const filename = `${trip.name.replace(/\s+/g, "-")}-Detailed.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
