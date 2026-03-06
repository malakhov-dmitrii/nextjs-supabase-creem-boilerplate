import { Creem } from "creem";

const apiKey = process.env.CREEM_API_KEY!;

export const creem = new Creem({
  apiKey,
  serverIdx: apiKey.startsWith("creem_test_") ? 1 : 0,
});
