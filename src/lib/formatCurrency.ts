export function formatCurrency(amount: number | null | undefined, currency = "PKR") {
  if (amount === null || amount === undefined) return `${currency} 0.00`;
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback
    return `${currency} ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}

export default formatCurrency;
