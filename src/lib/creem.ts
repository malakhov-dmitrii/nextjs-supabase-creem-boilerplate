import { Creem } from "creem";

export function getServerIdx(apiKey: string): 0 | 1 {
  return apiKey.startsWith("creem_test_") ? 1 : 0;
}

const apiKey = process.env.CREEM_API_KEY ?? "";

export const creem = new Creem({
  apiKey: apiKey || "placeholder",
  serverIdx: getServerIdx(apiKey),
});
