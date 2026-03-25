import type { ValidationResult } from "@/app/api/subscriptions/validators";

export const CREDIT_UNLIMITED = -1;

export function isUnlimited(balance: number): boolean {
  return balance === CREDIT_UNLIMITED;
}

interface SpendData {
  amount: number;
  reason: string;
}

const PLAN_CREDITS: Record<string, number> = {
  starter: 100,
  pro: 500,
  enterprise: CREDIT_UNLIMITED,
};

export function getCreditAllocation(plan: string): number {
  return PLAN_CREDITS[plan.toLowerCase()] ?? 100;
}

export function validateSpendRequest(body: Record<string, unknown>): ValidationResult<SpendData> {
  const { amount, reason } = body;

  if (typeof amount !== "number" || amount <= 0) {
    return { valid: false, error: "amount must be a positive number" };
  }
  if (!reason || typeof reason !== "string" || reason.trim() === "") {
    return { valid: false, error: "reason is required" };
  }

  return { valid: true, data: { amount, reason: reason.trim() } };
}
