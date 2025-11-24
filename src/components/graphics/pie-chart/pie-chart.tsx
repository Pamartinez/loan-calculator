import { Component, h, Prop, Element } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'pie-chart',
  styleUrl: 'pie-chart.scss',
  shadow: true,
})
export class PieChart {
  @Prop() schedule: AmortizationRow[] = [];
  @Element() el: HTMLElement;

  private canvasRef: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;

  componentDidLoad() {
    this.drawChart();

    this.resizeObserver = new ResizeObserver(() => {
      this.drawChart();
    });

    if (this.canvasRef) {
      this.resizeObserver.observe(this.canvasRef);
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  componentDidUpdate() {
    this.drawChart();
  }

  private drawChart() {
    if (!this.canvasRef || this.schedule.length === 0) {
      return;
    }

    const canvas = this.canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate totals
    const totalPrincipal = this.schedule.reduce((sum, row) => sum + row.principal + row.additionalPrincipal, 0);
    const totalInterest = this.schedule.reduce((sum, row) => sum + row.interest, 0);
    const total = totalPrincipal + totalInterest;

    // Calculate percentages
    const principalPercent = (totalPrincipal / total) * 100;
    const interestPercent = (totalInterest / total) * 100;

    // Draw pie chart
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height) / 3;

    let currentAngle = -Math.PI / 2;

    // Draw principal slice
    const principalAngle = (totalPrincipal / total) * 2 * Math.PI;
    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + principalAngle);
    ctx.closePath();
    ctx.fill();

    // Draw interest slice
    currentAngle += principalAngle;
    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (2 * Math.PI - principalAngle));
    ctx.closePath();
    ctx.fill();

    // Draw legend
    const legendY = height - 60;
    const legendStartX = 20;

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Principal legend
    ctx.fillStyle = '#28a745';
    ctx.fillRect(legendStartX, legendY, 20, 20);
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const principalText = `Principal: ${this.formatCurrency(totalPrincipal)} (${principalPercent.toFixed(1)}%)`;
    ctx.fillText(principalText, legendStartX + 30, legendY + 10);

    // Interest legend
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(legendStartX, legendY + 30, 20, 20);
    ctx.fillStyle = '#333';
    const interestText = `Interest: ${this.formatCurrency(totalInterest)} (${interestPercent.toFixed(1)}%)`;
    ctx.fillText(interestText, legendStartX + 30, legendY + 40);

    // Title
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Principal vs Interest Breakdown', width / 2, 20);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    return (
      <div class="pie-chart-container">
        <canvas ref={(el) => (this.canvasRef = el)}></canvas>
      </div>
    );
  }
}
