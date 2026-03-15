"use client";

import { useState } from "react";

interface DiscountInputProps {
  onCodeChange: (code: string) => void;
}

export function DiscountInput({ onCodeChange }: DiscountInputProps) {
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-accent-orange hover:underline font-bold"
      >
        Have a discount code?
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase());
          onCodeChange(e.target.value.toUpperCase());
        }}
        placeholder="Enter code"
        className="px-3 py-2 bg-bg-primary border-2 border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:border-accent-orange focus:outline-none w-40"
      />
      {code && <span className="text-xs text-success font-bold">Applied!</span>}
    </div>
  );
}
