import { Component, h, Prop, Element } from '@stencil/core';
import { LoanFormData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';

@Component({
  tag: 'savings-comparison-graph',
  styleUrl: 'savings-comparison-graph.scss',
  shadow: true,
})
export class SavingsComparisonGraph {
  @Prop() loanData: LoanFormData;
  @Element() el: HTMLElement;

  private canvasRef: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;

  componentDidLoad() {
    this.drawGraph();

    this.resizeObserver = new ResizeObserver(() => {
      this.drawGraph();
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
    this.drawGraph();
  }

  private drawGraph() {
    if (!this.canvasRef || !this.loanData || !this.loanData.additionalPrincipal) {
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

    const isSmall = width < 500;

    ctx.clearRect(0, 0, width, height);

    // Calculate data
    const standardSchedule = calculateAmortization({ ...this.loanData, additionalPrincipal: 0 });
    const withAdditionalSchedule = calculateAmortization(this.loanData);

    const standardInterest = standardSchedule.reduce((sum, row) => sum + row.interest, 0);
    const withAdditionalInterest = withAdditionalSchedule.reduce((sum, row) => sum + row.interest, 0);
    const interestSaved = standardInterest - withAdditionalInterest;
    const timeSaved = standardSchedule.length - withAdditionalSchedule.length;

    // Chart settings
    const padding = { top: 60, right: 40, bottom: 80, left: 80 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const barWidth = graphWidth / 6;
    const gap = barWidth / 2;

    const maxValue = Math.max(standardInterest, withAdditionalInterest);

    // Draw bars
    const drawBar = (x: number, value: number, color: string, label: string) => {
      const barHeight = (value / maxValue) * graphHeight;
      const y = padding.top + graphHeight - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Value on top
      ctx.fillStyle = '#333';
      ctx.font = `${isSmall ? 11 : 13}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.formatCurrency(value), x + barWidth / 2, y - 10);

      // Label
      ctx.font = `${isSmall ? 10 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const words = label.split(' ');
      words.forEach((word, i) => {
        ctx.fillText(word, x + barWidth / 2, height - padding.bottom + 20 + i * 15);
      });
    };

    const x1 = padding.left + gap;
    const x2 = x1 + barWidth + gap * 2;

    drawBar(x1, standardInterest, '#dc3545', 'Without Additional');
    drawBar(x2, withAdditionalInterest, '#28a745', 'With Additional');

    // Savings arrow and text
    const arrowX = x2 + barWidth + gap;
    const arrowY = padding.top + graphHeight / 2;

    ctx.fillStyle = '#28a745';
    ctx.font = `bold ${isSmall ? 14 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('SAVINGS', arrowX, arrowY - 40);

    ctx.font = `${isSmall ? 12 : 14}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(this.formatCurrency(interestSaved), arrowX, arrowY - 15);
    ctx.fillText(`${timeSaved} years`, arrowX, arrowY + 5);

    // Draw Y-axis
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#333';
    ctx.font = `${isSmall ? 10 : 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (maxValue / 5) * i;
      const y = padding.top + (graphHeight / 5) * i;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: isSmall ? 'compact' : 'standard',
        compactDisplay: isSmall ? 'short' : undefined,
      } as any).format(value);
      ctx.fillText(formatted, padding.left - 10, y);
    }

    // Title
    ctx.font = `bold ${isSmall ? 14 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Total Interest Comparison', width / 2, 30);
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
    if (!this.loanData || !this.loanData.additionalPrincipal || this.loanData.additionalPrincipal === 0) {
      return null;
    }

    return (
      <div class="savings-graph-container">
        <canvas ref={(el) => (this.canvasRef = el)}></canvas>
      </div>
    );
  }
}
