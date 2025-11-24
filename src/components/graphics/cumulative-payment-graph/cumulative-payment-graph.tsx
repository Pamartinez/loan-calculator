import { Component, h, Prop, Element } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'cumulative-payment-graph',
  styleUrl: 'cumulative-payment-graph.scss',
  shadow: true,
})
export class CumulativePaymentGraph {
  @Prop() schedule: AmortizationRow[] = [];
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

    const isSmall = width < 500;
    const isMedium = width >= 500 && width < 800;

    const padding = isSmall
      ? { top: 30, right: 20, bottom: 60, left: 60 }
      : isMedium
        ? { top: 35, right: 30, bottom: 70, left: 70 }
        : { top: 40, right: 40, bottom: 80, left: 80 };

    const fontSize = isSmall ? 10 : isMedium ? 11 : 12;
    const titleFontSize = isSmall ? 12 : isMedium ? 14 : 16;

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Calculate cumulative data
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    const data = this.schedule.map((row) => {
      cumulativePrincipal += row.principal + row.additionalPrincipal;
      cumulativeInterest += row.interest;
      return {
        year: typeof row.time === 'number' ? row.time : parseInt(row.time as string),
        cumulativePrincipal,
        cumulativeInterest,
        cumulativeTotal: cumulativePrincipal + cumulativeInterest,
      };
    });

    const maxValue = Math.max(...data.map((d) => d.cumulativeTotal));
    const minYear = data[0].year;
    const maxYear = data[data.length - 1].year;
    const yearRange = maxYear - minYear;

    const scaleX = (year: number) => padding.left + ((year - minYear) / yearRange) * graphWidth;
    const scaleY = (value: number) => padding.top + graphHeight - (value / maxValue) * graphHeight;

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const numGridLines = isSmall ? 4 : 5;
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding.top + (graphHeight / numGridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const yearStep = Math.ceil(yearRange / 8);
    for (let year = minYear; year <= maxYear; year += yearStep) {
      const x = scaleX(year);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw lines
    const drawLine = (dataKey: 'cumulativeTotal' | 'cumulativePrincipal' | 'cumulativeInterest', color: string, lineWidth: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = scaleX(point.year);
        const y = scaleY(point[dataKey]);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    drawLine('cumulativeTotal', '#6c757d', 2.5);
    drawLine('cumulativePrincipal', '#28a745', 2.5);
    drawLine('cumulativeInterest', '#dc3545', 2.5);

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';

    const labelYearStep = isSmall ? yearStep * 2 : yearStep;
    for (let year = minYear; year <= maxYear; year += labelYearStep) {
      const x = scaleX(year);
      ctx.fillText(year.toString(), x, height - padding.bottom + (isSmall ? 15 : 20));
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= numGridLines; i++) {
      const value = maxValue - (maxValue / numGridLines) * i;
      const y = padding.top + (graphHeight / numGridLines) * i;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: isSmall ? 'compact' : 'standard',
        compactDisplay: isSmall ? 'short' : undefined,
      } as any).format(value);
      ctx.fillText(formatted, padding.left - (isSmall ? 5 : 10), y);
    }

    // Title
    ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Cumulative Payments Over Time', width / 2, isSmall ? 15 : 20);

    // Legend
    const legendY = height - padding.bottom + (isSmall ? 30 : 40);
    const legendSpacing = isSmall ? width / 3 : 150;
    const legendStartX = width / 2 - legendSpacing;

    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const drawLegendItem = (x: number, color: string, text: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, legendY - 6, isSmall ? 15 : 20, isSmall ? 2 : 3);
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(text, x + (isSmall ? 20 : 25), legendY);
    };

    drawLegendItem(legendStartX, '#28a745', 'Principal');
    drawLegendItem(legendStartX + legendSpacing, '#dc3545', 'Interest');
    drawLegendItem(legendStartX + legendSpacing * 2, '#6c757d', 'Total');
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    return (
      <div class="cumulative-graph-container">
        <canvas ref={(el) => (this.canvasRef = el)}></canvas>
      </div>
    );
  }
}
