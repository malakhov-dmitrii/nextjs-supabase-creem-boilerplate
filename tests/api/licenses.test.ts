import { describe, it, expect } from "vitest";
import {
  validateActivateRequest,
  validateValidateRequest,
  validateDeactivateRequest,
} from "@/app/api/licenses/validators";

describe("validateActivateRequest", () => {
  it("accepts valid request", () => {
    const result = validateActivateRequest({ key: "LIC-123", instanceName: "my-laptop" });
    expect(result.valid).toBe(true);
  });

  it("rejects missing key", () => {
    const result = validateActivateRequest({ instanceName: "my-laptop" });
    expect(result.valid).toBe(false);
  });

  it("rejects empty key", () => {
    const result = validateActivateRequest({ key: "", instanceName: "my-laptop" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing instanceName", () => {
    const result = validateActivateRequest({ key: "LIC-123" });
    expect(result.valid).toBe(false);
  });
});

describe("validateValidateRequest", () => {
  it("accepts valid request", () => {
    const result = validateValidateRequest({ key: "LIC-123", instanceId: "inst_1" });
    expect(result.valid).toBe(true);
  });

  it("rejects missing key", () => {
    const result = validateValidateRequest({ instanceId: "inst_1" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing instanceId", () => {
    const result = validateValidateRequest({ key: "LIC-123" });
    expect(result.valid).toBe(false);
  });
});

describe("validateDeactivateRequest", () => {
  it("accepts valid request", () => {
    const result = validateDeactivateRequest({ key: "LIC-123", instanceId: "inst_1" });
    expect(result.valid).toBe(true);
  });

  it("rejects missing instanceId", () => {
    const result = validateDeactivateRequest({ key: "LIC-123" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing key", () => {
    const result = validateDeactivateRequest({ instanceId: "inst_1" });
    expect(result.valid).toBe(false);
  });
});
