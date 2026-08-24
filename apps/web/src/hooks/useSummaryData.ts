if (isBonus) {
  // Add to bonus credits total instead of recurring debt
  totalBonus += monthlyMain;
} else {
  // Add to recurring debt expenses
  totalMonthly += monthlyMain;

  // ONLY non-bonus expenses reach this calculation!
  if (!mostExpensive || monthlyMain > mostExpensive.monthly) {
    mostExpensive = {
      id: sub.id,
      name: sub.name,
      monthly: monthlyMain,
      logo: sub.logo,
      record: sub,
    };
  }
}
