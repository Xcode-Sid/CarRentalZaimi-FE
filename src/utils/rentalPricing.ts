export interface DayDiscount {
  percent: number;
  amount: number;
}

/** Day-based discount tiers for base rental price only. */
export function getDayDiscount(days: number): DayDiscount {
  if (days >= 14) return { percent: 15, amount: 0.15 };
  if (days >= 7) return { percent: 10, amount: 0.1 };
  if (days >= 3) return { percent: 5, amount: 0.05 };
  return { percent: 0, amount: 0 };
}

/** Returns rounded discounted base total for day rentals. */
export function getDiscountedBaseTotal(baseTotal: number, discountPercent: number) {
  const safePercent = Math.max(0, Math.min(100, discountPercent));
  const discountAmount = Math.round((baseTotal * safePercent) / 100);
  const total = Math.max(0, baseTotal - discountAmount);
  return { discountAmount, total };
}
