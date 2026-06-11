import { Font } from "@react-pdf/renderer";

/**
 * Editorial bill typography — same families as the app UI.
 * Google Fonts static TTFs (react-pdf can't consume variable/woff2 fonts);
 * fetched once per server instance and cached by react-pdf.
 */
let registered = false;

export function registerBillFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Libre Baskerville",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/librebaskerville/v24/kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4SCQ.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/librebaskerville/v24/kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17ujFgkSCQ.ttf",
        fontWeight: 700,
      },
      {
        src: "https://fonts.gstatic.com/s/librebaskerville/v24/kmKWZrc3Hgbbcjq75U4uslyuy4kn0qNccR04_RUJeby2OU36SgNK.ttf",
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  });

  Font.register({
    family: "Josefin Sans",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/josefinsans/v34/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_GbQXME.ttf",
        fontWeight: 300,
      },
      {
        src: "https://fonts.gstatic.com/s/josefinsans/v34/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_DjQXME.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/josefinsans/v34/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_ObXXME.ttf",
        fontWeight: 600,
      },
    ],
  });

  Font.register({
    family: "Sacramento",
    src: "https://fonts.gstatic.com/s/sacramento/v17/buEzpo6gcdjy0EiZMBUG0Co.ttf",
  });

  Font.registerHyphenationCallback((word) => [word]);
}

/** Editorial palette — mirrors globals.css tokens */
export const INK = {
  ink: "#1A1714",
  ink2: "#6A635C",
  ink3: "#A8A09A",
  hairline: "#EAE5DF",
  strong: "#D8D2CB",
  rose: "#B85C72",
  roseInk: "#7A3348",
  green: "#3A7D52",
  bg: "#FEFDFB",
  white: "#FFFFFF",
};
