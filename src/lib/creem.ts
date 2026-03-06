import { Creem } from "creem";

export const creem = new Creem({
  apiKey: process.env.CREEM_API_KEY!,
  serverIdx: 1, // test environment
});
