export type ValidationResult<T> = { valid: true; data: T } | { valid: false; error: string };

interface CancelData {
  subscriptionId: string;
  mode: "immediate" | "scheduled";
}

export function validateCancelRequest(body: Record<string, unknown>): ValidationResult<CancelData> {
  const { subscriptionId, mode } = body;

  if (!subscriptionId || typeof subscriptionId !== "string") {
    return { valid: false, error: "subscriptionId is required" };
  }

  const resolvedMode = mode ?? "scheduled";
  if (resolvedMode !== "immediate" && resolvedMode !== "scheduled") {
    return { valid: false, error: "mode must be 'immediate' or 'scheduled'" };
  }

  return {
    valid: true,
    data: { subscriptionId, mode: resolvedMode as "immediate" | "scheduled" },
  };
}

interface UpgradeData {
  subscriptionId: string;
  newProductId: string;
}

export function validateUpgradeRequest(
  body: Record<string, unknown>,
): ValidationResult<UpgradeData> {
  const { subscriptionId, newProductId } = body;

  if (!subscriptionId || typeof subscriptionId !== "string") {
    return { valid: false, error: "subscriptionId is required" };
  }
  if (!newProductId || typeof newProductId !== "string") {
    return { valid: false, error: "newProductId is required" };
  }

  return { valid: true, data: { subscriptionId, newProductId } };
}

interface SeatUpdateData {
  subscriptionId: string;
  units: number;
}

export function validateSeatUpdate(
  body: Record<string, unknown>,
): ValidationResult<SeatUpdateData> {
  const { subscriptionId, units } = body;

  if (!subscriptionId || typeof subscriptionId !== "string") {
    return { valid: false, error: "subscriptionId is required" };
  }
  if (typeof units !== "number" || units <= 0) {
    return { valid: false, error: "units must be a positive number" };
  }

  return { valid: true, data: { subscriptionId, units } };
}
