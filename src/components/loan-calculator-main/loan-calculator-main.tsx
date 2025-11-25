import { Component, h, State } from '@stencil/core';
import { TabItem } from '../tabs-controller/tabs-controller';

@Component({
  tag: 'loan-calculator-main',
  styleUrl: 'loan-calculator-main.scss',
  shadow: true,
})
export class LoanCalculatorMain {
  @State() activeTabIndex: number = 0;

  private getTabs(): TabItem[] {
    return [
      {
        name: 'Legacy Calculator',
        content: (
          <div class="tab-panel">
            <loan-calculator-app></loan-calculator-app>
          </div>
        ),
      },
      {
        name: 'Amortization Calculator',
        content: (
          <div class="tab-panel">
            <loan-amortization-calculator></loan-amortization-calculator>
          </div>
        ),
      },
      {
        name: 'Export/Import Data',
        content: (
          <div class="tab-panel">
            <export-json-controller></export-json-controller>
          </div>
        ),
      },
    ];
  }

  private handleTabChange = (event: CustomEvent<number>) => {
    this.activeTabIndex = event.detail;
  };

  render() {
    return (
      <div class="loan-calculator-app">
        <header class="app-header">
          <h1>Loan Calculator Suite</h1>
          <p class="subtitle">Manage your loans, analyze amortization, and export your data</p>
        </header>

        <main class="app-content">
          <tabs-controller
            tabs={this.getTabs()}
            defaultActiveIndex={this.activeTabIndex}
            onTabChange={this.handleTabChange}
          />
        </main>
      </div>
    );
  }
}
