import QRCode from "qrcode";

export async function generateQrPng(data: string, size = 400): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: "png",
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

export async function generateQrDataUrl(data: string, size = 400): Promise<string> {
  return QRCode.toDataURL(data, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
