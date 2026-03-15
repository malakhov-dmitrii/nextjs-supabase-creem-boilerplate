import type { ValidationResult } from "@/app/api/subscriptions/validators";

interface ActivateData {
  key: string;
  instanceName: string;
}

export function validateActivateRequest(
  body: Record<string, unknown>,
): ValidationResult<ActivateData> {
  const { key, instanceName } = body;
  if (!key || typeof key !== "string") {
    return { valid: false, error: "key is required" };
  }
  if (!instanceName || typeof instanceName !== "string") {
    return { valid: false, error: "instanceName is required" };
  }
  return { valid: true, data: { key, instanceName } };
}

interface ValidateData {
  key: string;
  instanceId: string;
}

export function validateValidateRequest(
  body: Record<string, unknown>,
): ValidationResult<ValidateData> {
  const { key, instanceId } = body;
  if (!key || typeof key !== "string") {
    return { valid: false, error: "key is required" };
  }
  if (!instanceId || typeof instanceId !== "string") {
    return { valid: false, error: "instanceId is required" };
  }
  return { valid: true, data: { key, instanceId } };
}

interface DeactivateData {
  key: string;
  instanceId: string;
}

export function validateDeactivateRequest(
  body: Record<string, unknown>,
): ValidationResult<DeactivateData> {
  const { key, instanceId } = body;
  if (!key || typeof key !== "string") {
    return { valid: false, error: "key is required" };
  }
  if (!instanceId || typeof instanceId !== "string") {
    return { valid: false, error: "instanceId is required" };
  }
  return { valid: true, data: { key, instanceId } };
}
