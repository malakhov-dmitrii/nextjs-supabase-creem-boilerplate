interface RawTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string | number;
}

interface FormattedTransaction {
  id: string;
  displayAmount: string;
  status: string;
  created_at: string;
}

const CURRENCY_MAP: Record<string, { locale: string; currency: string }> = {
  usd: { locale: "en-US", currency: "USD" },
  eur: { locale: "en-IE", currency: "EUR" },
  gbp: { locale: "en-GB", currency: "GBP" },
};

export function formatTransaction(tx: RawTransaction): FormattedTransaction {
  const mapping = CURRENCY_MAP[tx.currency.toLowerCase()] ?? CURRENCY_MAP.usd;

  const displayAmount = new Intl.NumberFormat(mapping.locale, {
    style: "currency",
    currency: mapping.currency,
  }).format(tx.amount / 100);

  return {
    id: tx.id,
    displayAmount,
    status: tx.status,
    created_at:
      typeof tx.created_at === "number"
        ? new Date(tx.created_at).toISOString()
        : String(tx.created_at),
  };
}
