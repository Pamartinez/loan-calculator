// Returns both standard and with-additional amortization schedules
export function getAmortizationSchedules(amortizationCalculatorData: AmortizationCalculatorData) {
  // Standard schedule: additionalPrincipal set to 0, no extra entries
  const standardSchedule = calculateAmortization({
    loanData: { ...amortizationCalculatorData.loanData, additionalPrincipal: 0 },
    amortizationEntries: [],
    paymentRecords: amortizationCalculatorData.paymentRecords,
  });

  // With additional schedule: use provided data as-is
  const withAdditionalSchedule = calculateAmortization(amortizationCalculatorData);

  return { standardSchedule, withAdditionalSchedule };
}
import { PaymentBreakdownData } from '../components';
import { AmortizationRow, LoanFormData, AmortizationData } from '../data/models';

function getMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' });
}

export interface AmortizationCalculatorData {
  loanData: LoanFormData;
  amortizationEntries: AmortizationData[];
  paymentRecords: PaymentBreakdownData[];
}

export function calculateAmortization(
  amortizationCalculatorData: AmortizationCalculatorData
): AmortizationRow[] {
  const { loanData, amortizationEntries } = amortizationCalculatorData;
  const schedule: AmortizationRow[] = [];
  const monthlyRate = loanData.rate / 100 / 12;
  const principalAndInterestPayment = loanData.totalMonthlyPayment - (loanData.escrow || 0);
  const additionalPrincipal = loanData.additionalPrincipal || 0;
  let remainingBalance = loanData.loanAmount;

  // Calculate loan term in months
  let loanTermMonths = 30 * 12; // Default 30 years
  if (loanData.loanTermsTime && loanData.loanTermsType) {
    loanTermMonths = loanData.loanTermsType === 'years'
      ? loanData.loanTermsTime * 12
      : loanData.loanTermsTime;
  } else if (loanData.loanTermsTime) {
    // If only loanTermsTime is provided, assume years
    loanTermMonths = loanData.loanTermsTime * 12;
  }

  // Parse start date
  const [startYear, startMonth] = loanData.startDate.split('-').map(Number);
  let currentYear = startYear;
  let currentMonth = startMonth;

  let yearlyPrincipal = 0;
  let yearlyAdditionalPrincipal = 0;
  let yearlyInterest = 0;
  let monthlyDetails: AmortizationRow[] = [];

  for (let month = 1; month <= loanTermMonths && remainingBalance > 0; month++) {


    // Format current date as YYYY-MM for comparison
    const currentDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;


    const paymentRecordsForMonth = amortizationCalculatorData.paymentRecords?.filter(
      (record) => record.date === currentDateStr
    ) || [];

    let interestPayment = remainingBalance * monthlyRate;

    if (paymentRecordsForMonth.length > 0) {
      interestPayment = paymentRecordsForMonth.reduce((sum, entry) => sum + entry.interest, 0);
    }

    let principalPayment = principalAndInterestPayment - interestPayment;


    // Check if there are additional payments for this month and sum them
    const additionalEntriesForMonth = amortizationEntries.filter(entry => entry.date === currentDateStr);
    const extraPrincipalPayment = additionalEntriesForMonth.reduce((sum, entry) => sum + entry.amount, 0);
    const extraPrincipalPayment2 = paymentRecordsForMonth.reduce((sum, entry) => sum + entry.additionalPrincipal, 0);

    // Total additional principal for this month
    const totalAdditionalPrincipal = additionalPrincipal + extraPrincipalPayment + extraPrincipalPayment2;

    // Ensure we don't overpay
    if (principalPayment + totalAdditionalPrincipal > remainingBalance) {
      principalPayment = remainingBalance - totalAdditionalPrincipal;
      if (principalPayment < 0) principalPayment = remainingBalance;
    }

    yearlyInterest += interestPayment;
    yearlyPrincipal += principalPayment;
    yearlyAdditionalPrincipal += totalAdditionalPrincipal;

    remainingBalance -= (principalPayment + totalAdditionalPrincipal);

    // Prevent negative balance
    if (remainingBalance < 0) remainingBalance = 0;

    // Add monthly detail
    monthlyDetails.push({
      time: getMonthName(currentMonth),
      principal: principalPayment,
      additionalPrincipal: totalAdditionalPrincipal,
      interest: interestPayment,
      remainingBalance: remainingBalance,
      details: [],
    });

    // Check if we're at year end (December) or loan is paid off
    const isYearEnd = currentMonth === 12;
    const isLoanPaidOff = remainingBalance === 0;

    if (isYearEnd || isLoanPaidOff) {
      schedule.push({
        time: currentYear,
        principal: yearlyPrincipal,
        additionalPrincipal: yearlyAdditionalPrincipal,
        interest: yearlyInterest,
        remainingBalance,
        details: monthlyDetails,
      });

      // Reset yearly totals
      yearlyPrincipal = 0;
      yearlyAdditionalPrincipal = 0;
      yearlyInterest = 0;
      monthlyDetails = [];

      if (isLoanPaidOff) break;
    }

    // Move to next month
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return schedule;
}
