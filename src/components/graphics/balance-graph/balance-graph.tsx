import { Component, h, Prop, Element, State } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'balance-graph',
  styleUrl: 'balance-graph.scss',
  shadow: true,
})
export class BalanceGraph {
  @Prop() schedule: AmortizationRow[] = [];
  @Element() el: HTMLElement;
  @State() tooltipData: { x: number; y: number; visible: boolean; year: number; balance: string } = {
    x: 0,
    y: 0,
    visible: false,
    year: 0,
    balance: '',
  };

  private canvasRef: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;
  private graphData: any[] = [];
  private scaleXFunc: (year: number) => number;
  private scaleYFunc: (value: number) => number;
  private padding: any;

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

    this.padding = isSmall
      ? { top: 40, right: 20, bottom: 55, left: 70 }
      : isMedium
        ? { top: 45, right: 30, bottom: 65, left: 80 }
        : { top: 50, right: 50, bottom: 75, left: 90 };

    const padding = this.padding;
    const fontSize = isSmall ? 11 : isMedium ? 12 : 13;
    const titleFontSize = isSmall ? 15 : isMedium ? 17 : 19;
    const axisTitleFontSize = isSmall ? 11 : isMedium ? 12 : 14;

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(padding.left, padding.top, graphWidth, graphHeight);

    // Get data points
    const data = this.schedule.map((row) => ({
      year: typeof row.time === 'number' ? row.time : parseInt(row.time as string),
      balance: row.remainingBalance,
    }));

    this.graphData = data;

    // Calculate scales
    const maxBalance = Math.max(...data.map((d) => d.balance));
    const minYear = data[0].year;
    const maxYear = data[data.length - 1].year;
    const yearRange = maxYear - minYear;

    this.scaleXFunc = (year: number) => padding.left + ((year - minYear) / yearRange) * graphWidth;
    this.scaleYFunc = (balance: number) => padding.top + graphHeight - (balance / maxBalance) * graphHeight;
    const scaleX = this.scaleXFunc;
    const scaleY = this.scaleYFunc;

    // Draw grid lines
    ctx.strokeStyle = '#e8eaed';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);

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

    // Create gradient fill under the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
    gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.15)');
    gradient.addColorStop(1, 'rgba(249, 115, 22, 0.02)');

    // Draw filled area
    ctx.fillStyle = gradient;
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
    // Close the path to the x-axis
    ctx.lineTo(scaleX(data[data.length - 1].year), height - padding.bottom);
    ctx.lineTo(scaleX(data[0].year), height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw line graph with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(249, 115, 22, 0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
    ctx.restore();

    // Draw data points
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    const pointRadius = isSmall ? 3 : 4;
    data.forEach((point) => {
      const x = scaleX(point.year);
      const y = scaleY(point.balance);
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });

    // Draw axes
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';

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
    ctx.fillStyle = '#1a202c';
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';

    // X-axis labels (years) - adjust step for small screens
    const labelYearStep = isSmall ? yearStep * 2 : yearStep;
    for (let year = minYear; year <= maxYear; year += labelYearStep) {
      const x = scaleX(year);
      ctx.fillText(year.toString(), x, height - padding.bottom + (isSmall ? 18 : 25));
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
    ctx.font = `600 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a202c';
    ctx.fillText('Remaining Balance Over Time', width / 2, isSmall ? 20 : 25);

    // X-axis title
    ctx.font = `500 ${axisTitleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#4a5568';
    ctx.fillText('Date', width / 2, height - (isSmall ? 10 : 15));

    // Y-axis title
    ctx.save();
    ctx.translate(isSmall ? 12 : 18, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(isSmall ? 'Balance ($)' : 'Remaining Balance ($)', 0, 0);
    ctx.restore();
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
      const py = this.scaleYFunc(point.balance);
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
        balance: formatCurrency(closestPoint.balance),
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
      <div class="graph-container section">
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
              top: `${this.tooltipData.y - 60}px`,
            }}
          >
            <div class="tooltip-header">Year {this.tooltipData.year}</div>
            <div class="tooltip-row">
              <span class="tooltip-label">Remaining Balance:</span>
              <span class="tooltip-value">{this.tooltipData.balance}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
