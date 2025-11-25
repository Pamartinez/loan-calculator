[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

# Loan Calculator Web Component

A comprehensive, feature-rich loan amortization calculator built as a reusable web component using Stencil. This component provides powerful loan analysis tools with interactive visualizations, detailed amortization schedules, and PDF export capabilities.

## Features

### 🧮 Loan Calculations
- **Complete Amortization Schedules**: Calculate detailed monthly payment breakdowns including principal, interest, and remaining balance
- **Additional Principal Payments**: Compare loan scenarios with and without extra principal payments
- **Flexible Loan Terms**: Support for both years and months-based loan terms
- **Escrow Management**: Include escrow payments in total monthly payment calculations
- **Multiple Loan Comparison**: Manage and compare multiple loan scenarios simultaneously

### 📊 Interactive Visualizations
- **Balance Graph**: Track remaining loan balance over time
- **Pie Charts**: Visualize total interest vs. principal payments
- **Cumulative Payment Graph**: See the accumulation of payments over the loan lifecycle
- **Savings Comparison**: Compare costs between standard and accelerated payment schedules
- **Payoff Progress**: Visual timeline showing loan payoff milestones
- **Key Metrics Dashboard**: At-a-glance view of critical loan statistics

### 📄 Reporting & Export
- **PDF Generation**: Export comprehensive loan reports with all calculations and schedules
- **Detailed Loan Reports**: Complete amortization tables with yearly summaries
- **Print-Friendly Formatting**: Optimized layouts for physical reports

### 💾 Data Management
- **Local Storage Persistence**: Automatically saves loan data between sessions
- **Create/Edit/Delete Loans**: Full CRUD operations for loan scenarios
- **Tabbed Interface**: Easy navigation between multiple loan comparisons
- **Form Validation**: Real-time input validation for all loan parameters

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Shadow DOM Encapsulation**: Styles won't conflict with your application
- **Custom Input Components**: Specialized number and text inputs with validation
- **Modal Dialogs**: Clean popup interfaces for forms and confirmations
- **Collapsible Sections**: Optimize screen space with expandable/collapsible panels

## Components

This package includes several reusable web components:

- `<loan-calculator-app>` - Main application component with full functionality
- `<loan-calculator>` - Standalone loan input form
- `<loan-summary>` - Display loan details and amortization schedules
- `<loan-report>` - Printable loan report with all details
- `<amortization-schedule>` - Generic amortization table component
- `<amortization-schedule-with-additional>` - Schedule including extra principal payments
- `<amortization-schedule-without-additional>` - Standard amortization schedule
- `<balance-graph>` - Chart showing balance over time
- `<pie-chart>` - Configurable pie chart visualization
- `<bar-chart>` - Configurable bar chart visualization
- `<key-metrics-dashboard>` - Summary metrics display
- `<payoff-progress>` - Timeline visualization
- `<savings-comparison-graph>` - Comparison chart
- `<cumulative-payment-graph>` - Payment accumulation chart
- `<number-input>` - Validated number input field
- `<text-input>` - Validated text input field
- `<tabs-controller>` - Tab navigation component
- `<popup-modal>` - Modal dialog component

## Installation & Usage

### NPM Installation

```bash
npm install loan-calculator
```

### Quick Start

#### Using the Complete Application

```html
<script type="module" src="https://unpkg.com/loan-calculator/dist/loan-calculator/loan-calculator.esm.js"></script>

<loan-calculator-app></loan-calculator-app>
```

#### Using Individual Components

```tsx
import 'loan-calculator/dist/components/loan-calculator';

function App() {
  const handleFormSubmit = (event) => {
    const loanData = event.detail;
    console.log('Loan submitted:', loanData);
  };

  return (
    <loan-calculator 
      onFormSubmit={handleFormSubmit}
    />
  );
}
```

#### With Initial Data

```html
<loan-calculator-app id="calculator"></loan-calculator-app>

<script>
  const calculator = document.getElementById('calculator');
  calculator.loanDataDictionary = {
    'loan-1': {
      id: 'loan-1',
      displayName: 'My Home Loan',
      loanAmount: 400000,
      rate: 6.5,
      totalMonthlyPayment: 3200,
      escrow: 500,
      additionalPrincipal: 200,
      startDate: '2024-01',
      loanTermsTime: 30,
      loanTermsType: 'years'
    }
  };
</script>
```

## API Reference

### `<loan-calculator-app>`

The main application component with full functionality.

**Properties:**
- None (manages state internally with localStorage)

**Events:**
- `formSubmit` - Emitted when a loan is added/updated
- `deleteLoan` - Emitted when a loan is deleted

---

### `<loan-calculator>`

Standalone loan input form component.

**Properties:**
- `initialFormData?: LoanFormData` - Pre-populate the form with loan data

**Events:**
- `formValidityChange: CustomEvent<boolean>` - Form validation state changes
- `formSubmit: CustomEvent<LoanFormData>` - Form submitted with valid data

**Methods:**
- `getFormData(): Promise<LoanFormData>` - Retrieve current form data

---

### `<loan-summary>`

Display loan details and amortization schedules.

**Properties:**
- `loanData: LoanFormData` - Loan data to display

**Events:**
- `deleteLoan: CustomEvent<string>` - Delete button clicked
- `summaryTabChange: CustomEvent<{loanId: string, tabIndex: number}>` - Tab changed

---

### `<amortization-schedule>`

Generic amortization table display.

**Properties:**
- `schedule: AmortizationRow[]` - Array of amortization data
- Custom CSS properties for styling bar charts

---

### Data Models

#### `LoanFormData`

```typescript
interface LoanFormData {
  id: string | null;
  displayName: string;
  loanAmount: number | null;
  rate: number | null;
  totalMonthlyPayment: number | null;
  escrow?: number;
  additionalPrincipal?: number;
  startDate: string | null; // Format: 'YYYY-MM'
  loanTermsTime?: number;
  loanTermsType?: 'years' | 'months';
  summaryTabSelected?: number;
}
```

#### `AmortizationRow`

```typescript
interface AmortizationRow {
  year: number;
  month: string;
  interestPayment: number;
  principalPayment: number;
  additionalPrincipalPayment: number;
  remainingBalance: number;
  yearlyInterest: number;
  yearlyPrincipal: number;
  yearlyAdditionalPrincipal: number;
  isYearEnd: boolean;
}
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

```bash
npm install
```

### Development Server

```bash
npm start
```

This will start a development server at `http://localhost:3333` with hot reloading.


### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory with multiple output targets:
- ES modules
- CommonJS
- Standalone bundle
- Custom elements bundle

### Running Tests

```bash
npm test
```

## Styling

All components use Shadow DOM and can be customized using CSS custom properties (CSS variables). Components include default styling but can be themed to match your application.

### Example Customization

```css
loan-calculator-app {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --font-family: 'Arial', sans-serif;
}
```

## Browser Support

This component works in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES Modules

For older browsers, polyfills may be required.

## Use Cases

- **Mortgage Calculators**: Perfect for real estate websites and financial institutions
- **Auto Loan Calculators**: Calculate car loan payments and comparisons
- **Student Loan Analysis**: Compare repayment strategies
- **Personal Loan Planning**: Evaluate loan options and payment schedules
- **Financial Planning Tools**: Integrate into broader financial planning applications
- **Educational Tools**: Teach amortization concepts and financial literacy

## Features in Detail

### Amortization Calculations

The calculator uses precise financial formulas to compute:
- Monthly payment breakdowns (principal + interest)
- Remaining balance after each payment
- Total interest paid over loan lifetime
- Impact of additional principal payments
- Accelerated payoff timelines
- Year-end summaries with cumulative totals

### Visual Analytics

Multiple chart types help users understand their loans:
- **Balance Graph**: Line chart showing declining balance over time
- **Pie Chart**: Proportion of total interest vs. principal
- **Cumulative Graphs**: Track total payments accumulated
- **Savings Comparison**: Side-by-side comparison of payment strategies
- **Payoff Timeline**: Visual representation of loan milestones

### PDF Export

Generate comprehensive PDF reports including:
- Loan details and parameters
- Complete amortization schedules
- Visual charts and graphs
- Comparison tables
- Year-by-year summaries

The PDF generation is client-side, requiring no server interaction.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/Pamartinez/loan-calculator).

---

Built with ❤️ using [Stencil](https://stenciljs.com)