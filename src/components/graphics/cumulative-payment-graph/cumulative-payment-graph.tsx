import { Component, h, Prop, Element, State } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'cumulative-payment-graph',
  styleUrl: 'cumulative-payment-graph.scss',
  shadow: true,
})
export class CumulativePaymentGraph {
  @Prop() schedule: AmortizationRow[] = [];
  @Element() el: HTMLElement;
  @State() tooltipData: { x: number; y: number; visible: boolean; year: number; principal: string; interest: string; total: string } = {
    x: 0,
    y: 0,
    visible: false,
    year: 0,
    principal: '',
    interest: '',
    total: '',
  };

  private canvasRef: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;
  private graphData: any[] = [];
  private scaleXFunc: (year: number) => number;
  private scaleYFunc: (value: number) => number;
  private padding: any;

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

    this.padding = isSmall
      ? { top: 40, right: 20, bottom: 70, left: 70 }
      : isMedium
        ? { top: 45, right: 30, bottom: 80, left: 80 }
        : { top: 50, right: 50, bottom: 90, left: 90 };

    const padding = this.padding;
    const fontSize = isSmall ? 11 : isMedium ? 12 : 13;
    const titleFontSize = isSmall ? 15 : isMedium ? 17 : 19;

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

    this.graphData = data;
    const maxValue = Math.max(...data.map((d) => d.cumulativeTotal));
    const minYear = data[0].year;
    const maxYear = data[data.length - 1].year;
    const yearRange = maxYear - minYear;

    this.scaleXFunc = (year: number) => padding.left + ((year - minYear) / yearRange) * graphWidth;
    this.scaleYFunc = (value: number) => padding.top + graphHeight - (value / maxValue) * graphHeight;
    const scaleX = this.scaleXFunc;
    const scaleY = this.scaleYFunc;

    // Draw background
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(padding.left, padding.top, graphWidth, graphHeight);

    // Draw grid
    ctx.strokeStyle = '#e8eaed';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);

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

    // Draw lines with shadows and gradients
    const drawLine = (dataKey: 'cumulativeTotal' | 'cumulativePrincipal' | 'cumulativeInterest', color: string, lineWidth: number, shadowColor: string) => {
      ctx.save();
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
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
      ctx.restore();
    };

    drawLine('cumulativeTotal', '#4a5568', 3, 'rgba(74, 85, 104, 0.2)');
    drawLine('cumulativePrincipal', '#10b981', 3, 'rgba(16, 185, 129, 0.2)');
    drawLine('cumulativeInterest', '#ef4444', 3, 'rgba(239, 68, 68, 0.2)');

    // Draw axes
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#1a202c';
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';

    const labelYearStep = isSmall ? yearStep * 2 : yearStep;
    for (let year = minYear; year <= maxYear; year += labelYearStep) {
      const x = scaleX(year);
      ctx.fillText(year.toString(), x, height - padding.bottom + (isSmall ? 18 : 25));
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
    ctx.font = `600 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a202c';
    ctx.fillText('Cumulative Payments Over Time', width / 2, isSmall ? 20 : 25);

    // Legend with improved design
    const legendY = height - padding.bottom + (isSmall ? 40 : 50);
    const legendSpacing = isSmall ? width / 3 : 160;
    const legendStartX = width / 2 - legendSpacing;

    ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

    const drawLegendItem = (x: number, color: string, text: string) => {
      // Draw line segment
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, legendY - 4);
      ctx.lineTo(x + (isSmall ? 20 : 24), legendY - 4);
      ctx.stroke();

      // Draw text
      ctx.fillStyle = '#2d3748';
      ctx.textAlign = 'left';
      ctx.fillText(text, x + (isSmall ? 26 : 30), legendY);
    };

    drawLegendItem(legendStartX, '#10b981', 'Principal');
    drawLegendItem(legendStartX + legendSpacing, '#ef4444', 'Interest');
    drawLegendItem(legendStartX + legendSpacing * 2, '#4a5568', 'Total');
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.canvasRef || !this.graphData.length) return;

    const rect = this.canvasRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const padding = this.padding;
    if (!padding) return;

    // Check if mouse is within graph area
    if (x < padding.left || x > rect.width - padding.right || y < padding.top || y > rect.height - padding.bottom) {
      this.tooltipData = { ...this.tooltipData, visible: false };
      return;
    }

    // Find closest data point
    let closestPoint = null;
    let minDistance = Infinity;

    this.graphData.forEach(point => {
      const px = this.scaleXFunc(point.year);
      const py = this.scaleYFunc(point.cumulativeTotal);
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

      if (distance < minDistance && distance < 30) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    if (closestPoint) {
      const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

      this.tooltipData = {
        x: event.clientX,
        y: event.clientY,
        visible: true,
        year: closestPoint.year,
        principal: formatCurrency(closestPoint.cumulativePrincipal),
        interest: formatCurrency(closestPoint.cumulativeInterest),
        total: formatCurrency(closestPoint.cumulativeTotal),
      };
    } else {
      this.tooltipData = { ...this.tooltipData, visible: false };
    }
  }

  private handleMouseLeave = () => {
    this.tooltipData = { ...this.tooltipData, visible: false };
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    return (
      <div class="cumulative-graph-container section">
        <canvas
          ref={(el) => (this.canvasRef = el)}
          onMouseMove={this.handleMouseMove}
          onMouseLeave={this.handleMouseLeave}
        ></canvas>
        {this.tooltipData.visible && (
          <div
            class="tooltip"
            style={{
              left: `${this.tooltipData.x + 10}px`,
              top: `${this.tooltipData.y - 80}px`,
            }}
          >
            <div class="tooltip-header">Year {this.tooltipData.year}</div>
            <div class="tooltip-row">
              <span class="tooltip-label principal">Principal:</span>
              <span class="tooltip-value">{this.tooltipData.principal}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label interest">Interest:</span>
              <span class="tooltip-value">{this.tooltipData.interest}</span>
            </div>
            <div class="tooltip-row total">
              <span class="tooltip-label">Total:</span>
              <span class="tooltip-value">{this.tooltipData.total}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
