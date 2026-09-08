import QRCode from "qrcode";

// Devuelve un <svg> (string) con el QR. Se usa server-side en la landing — módulos
// oscuros sobre blanco para que cualquier lector lo agarre bien.
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0B0C16", light: "#ffffff" },
  });
}
