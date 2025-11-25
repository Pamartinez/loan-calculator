export enum NumericInputTypeEnum {
  Integer = 'Integer',
  Decimal = 'Decimal',
  Percentage = 'Percentage',
}

export interface LoanFormData {
  id?: string;
  displayName?: string;
  loanAmount: number;
  rate: number;
  totalMonthlyPayment: number;
  escrow: number;
  additionalPrincipal: number;
  startDate?: string;
  canBeDeleted: boolean | true;
  summaryTabSelected?: number;
  loanTermsTime?: number;
  loanTermsType?: 'years' | 'months';
}

export interface AmortizationRow {
  time: number | string;
  principal: number;
  additionalPrincipal: number;
  interest: number;
  remainingBalance: number;
  details: AmortizationRow[];
}

export interface AmortizationData {
  amount: number;
  date: string;
  id: string;
}