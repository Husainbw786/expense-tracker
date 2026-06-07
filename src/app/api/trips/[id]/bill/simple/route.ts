import { renderToBuffer } from "@react-pdf/renderer";
import { getTrip, getTripSummary } from "@/lib/data";
import { getCurrentUser, getTripRole } from "@/lib/auth";
import { SimpleBillPDF } from "@/lib/pdf-simple";
import { createElement } from "react";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tripId = Number(id);

  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!(await getTripRole(tripId, user.id))) return new Response("Forbidden", { status: 403 });

  const [trip, summary] = await Promise.all([
    getTrip(tripId),
    getTripSummary(tripId),
  ]);

  if (!trip) return new Response("Not found", { status: 404 });

  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const pdf = createElement(SimpleBillPDF, {
    tripName: trip.name,
    tripDate: trip.startDate,
    summary,
    generatedOn,
  });

  const buffer = await renderToBuffer(pdf as any);
  const filename = `${trip.name.replace(/\s+/g, "-")}-Summary.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
