import type { ValidationResult } from "@/app/api/subscriptions/validators";

interface CheckoutData {
  productId: string;
  discountCode?: string;
}

export function validateCheckoutRequest(
  body: Record<string, unknown>,
): ValidationResult<CheckoutData> {
  const { productId, discountCode } = body;

  if (!productId || typeof productId !== "string") {
    return { valid: false, error: "productId is required" };
  }

  return {
    valid: true,
    data: {
      productId,
      discountCode: typeof discountCode === "string" ? discountCode : undefined,
    },
  };
}
