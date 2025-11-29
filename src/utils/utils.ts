export function format(first?: string, middle?: string, last?: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

/**
 * Formats a number as USD currency with 2 decimal places
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(value: number, minimumFractionDigits: number = 2, maximumFractionDigits: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  }).format(value);
}


/**
 * Gets the currency symbol for a given currency code
 * @param currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
 * @param locale - Optional locale (defaults to 'en-US')
 * @returns The currency symbol (e.g., '$', '€', '¥')
 */
export function getCurrencySymbol(currencyCode: string): string {
  // Use Intl.NumberFormat to format a value and extract the symbol
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);
  // Find the first non-digit, non-space, non-comma, non-dot character
  const match = formatted.match(/[^\d\s,.]+/);
  return match ? match[0] : '';
}


