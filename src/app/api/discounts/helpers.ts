import type { ValidationResult } from "@/app/api/subscriptions/validators";

interface DiscountCreateData {
  name: string;
  type: "percentage" | "fixed";
  percentage?: number;
  amount?: number;
  duration: "forever" | "once" | "repeating";
  durationInMonths?: number;
  maxRedemptions?: number;
  code?: string;
  appliesToProducts: string[];
}

export function validateDiscountCreate(
  body: Record<string, unknown>,
): ValidationResult<DiscountCreateData> {
  const { name, type, percentage, amount, duration, appliesToProducts } = body;

  if (!name || typeof name !== "string") {
    return { valid: false, error: "name is required" };
  }
  if (type !== "percentage" && type !== "fixed") {
    return { valid: false, error: "type must be 'percentage' or 'fixed'" };
  }
  if (!Array.isArray(appliesToProducts) || appliesToProducts.length === 0) {
    return { valid: false, error: "appliesToProducts must be a non-empty array" };
  }
  if (type === "percentage") {
    if (typeof percentage !== "number" || percentage <= 0 || percentage > 100) {
      return { valid: false, error: "percentage must be between 1 and 100" };
    }
  }
  if (type === "fixed") {
    if (typeof amount !== "number" || amount <= 0) {
      return { valid: false, error: "amount must be a positive number" };
    }
  }
  if (!["forever", "once", "repeating"].includes(duration as string)) {
    return { valid: false, error: "duration must be 'forever', 'once', or 'repeating'" };
  }

  return {
    valid: true,
    data: {
      name: name as string,
      type: type as "percentage" | "fixed",
      percentage: percentage as number | undefined,
      amount: amount as number | undefined,
      duration: duration as "forever" | "once" | "repeating",
      durationInMonths: body.durationInMonths as number | undefined,
      maxRedemptions: body.maxRedemptions as number | undefined,
      code: body.code as string | undefined,
      appliesToProducts: appliesToProducts as string[],
    },
  };
}

interface CheckoutParams {
  productId: string;
  successUrl: string;
  discountCode?: string;
  metadata?: { user_id: string };
}

export function buildCheckoutWithDiscount(
  productId: string,
  successUrl: string,
  discountCode: string | undefined,
  userId: string,
): CheckoutParams {
  return {
    productId,
    successUrl,
    discountCode: discountCode || undefined,
    metadata: { user_id: userId },
  };
}
