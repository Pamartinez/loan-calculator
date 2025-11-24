import { Component, h, Prop, Element } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'balance-graph',
  styleUrl: 'balance-graph.scss',
  shadow: true,
})
export class BalanceGraph {
  @Prop() schedule: AmortizationRow[] = [];
  @Element() el: HTMLElement;

  private canvasRef: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;

  componentDidLoad() {
    this.drawGraph();

    // Set up resize observer for responsive redrawing
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
    if (!this.canvasRef || this.schedule.length === 0) {
      return;
    }

    const canvas = this.canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Responsive padding and font sizes based on width
    const isSmall = width < 500;
    const isMedium = width >= 500 && width < 800;

    const padding = isSmall
      ? { top: 30, right: 20, bottom: 45, left: 55 }
      : isMedium
        ? { top: 35, right: 30, bottom: 50, left: 65 }
        : { top: 40, right: 40, bottom: 60, left: 80 };

    const fontSize = isSmall ? 10 : isMedium ? 11 : 12;
    const titleFontSize = isSmall ? 12 : isMedium ? 14 : 16;
    const axisTitleFontSize = isSmall ? 11 : isMedium ? 12 : 14;

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get data points
    const data = this.schedule.map((row) => ({
      year: typeof row.time === 'number' ? row.time : parseInt(row.time as string),
      balance: row.remainingBalance,
    }));

    // Calculate scales
    const maxBalance = Math.max(...data.map((d) => d.balance));
    const minYear = data[0].year;
    const maxYear = data[data.length - 1].year;
    const yearRange = maxYear - minYear;

    const scaleX = (year: number) => padding.left + ((year - minYear) / yearRange) * graphWidth;
    const scaleY = (balance: number) => padding.top + graphHeight - (balance / maxBalance) * graphHeight;

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal grid lines (5 lines)
    const numGridLines = isSmall ? 4 : 5;
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding.top + (graphHeight / numGridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines (show every 4 years)
    const yearStep = Math.ceil(yearRange / 8);
    for (let year = minYear; year <= maxYear; year += yearStep) {
      const x = scaleX(year);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw line graph
    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = scaleX(point.year);
      const y = scaleY(point.balance);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';

    // X-axis labels (years) - adjust step for small screens
    const labelYearStep = isSmall ? yearStep * 2 : yearStep;
    for (let year = minYear; year <= maxYear; year += labelYearStep) {
      const x = scaleX(year);
      ctx.fillText(year.toString(), x, height - padding.bottom + (isSmall ? 15 : 20));
    }

    // Y-axis labels (balance)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const numYLabels = isSmall ? 4 : 5;
    for (let i = 0; i <= numYLabels; i++) {
      const balance = maxBalance - (maxBalance / numYLabels) * i;
      const y = padding.top + (graphHeight / numYLabels) * i;

      // Simplify currency format for small screens
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: isSmall ? 'compact' : 'standard',
        compactDisplay: isSmall ? 'short' : undefined,
      } as any).format(balance);
      ctx.fillText(formatted, padding.left - (isSmall ? 5 : 10), y);
    }

    // Title
    ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Remaining Balance Over Time', width / 2, isSmall ? 15 : 20);

    // X-axis title
    ctx.font = `${axisTitleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Date', width / 2, height - (isSmall ? 10 : 15));

    // Y-axis title
    ctx.save();
    ctx.translate(isSmall ? 10 : 15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(isSmall ? 'Balance ($)' : 'Remaining Balance ($)', 0, 0);
    ctx.restore();
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    return (
      <div class="graph-container">
        <canvas ref={(el) => (this.canvasRef = el)}></canvas>
      </div>
    );
  }
}
