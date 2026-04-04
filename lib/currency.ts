const lkrFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Format numbers as Sri Lankan Rupees (LKR)
export function formatCurrency(amount: number) {
  return lkrFormatter.format(amount);
}
