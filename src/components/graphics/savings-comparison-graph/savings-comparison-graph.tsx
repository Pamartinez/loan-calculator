import { Component, h, Prop, Element } from '@stencil/core';
import { LoanFormData, AmortizationData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';
import { formatCurrency } from '../../../utils/utils';

@Component({
  tag: 'savings-comparison-graph',
  styleUrl: 'savings-comparison-graph.scss',
  shadow: true,
})
export class SavingsComparisonGraph {
  @Prop() loanData: LoanFormData;
  @Prop() amortizationEntries: AmortizationData[] = [];
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

    const isXSmall = width < 400;
    const isSmall = width >= 400 && width < 560;
    const isMedium = width >= 560 && width < 720;
    const isLarge = width >= 720 && width < 1055;

    ctx.clearRect(0, 0, width, height);

    // Calculate data
    const standardSchedule = calculateAmortization({ ...this.loanData, additionalPrincipal: 0 }, []);
    const withAdditionalSchedule = calculateAmortization(this.loanData, this.amortizationEntries);

    const standardInterest = standardSchedule.reduce((sum, row) => sum + row.interest, 0);
    const withAdditionalInterest = withAdditionalSchedule.reduce((sum, row) => sum + row.interest, 0);
    const interestSaved = Math.abs(standardInterest - withAdditionalInterest);
    const timeSaved = standardSchedule.length - withAdditionalSchedule.length;

    // Chart settings
    const padding = {
      top: 40,
      right: isXSmall ? 8 : isSmall ? 10 : isMedium ? 15 : isLarge ? 20 : 60,
      bottom: 100,
      left: isXSmall ? 55 : isSmall ? 60 : isMedium ? 70 : 90
    };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const barWidth = Math.min(
      isXSmall ? 60 : isSmall ? 70 : isMedium ? 85 : isLarge ? 100 : 150,
      graphWidth / 3.5
    );
    const gap = isXSmall ? 15 : isSmall ? 20 : isMedium ? 28 : isLarge ? 35 : 80;

    const maxValue = Math.max(standardInterest, withAdditionalInterest, 1) * 1.05;

    // Helper function to draw rounded rectangle
    const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (graphHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw bars with gradients and shadows
    const drawBar = (x: number, value: number, colors: { start: string; end: string }, label: string, icon: string) => {
      const barHeight = Math.max((value / maxValue) * graphHeight, 0);
      const y = padding.top + graphHeight - barHeight;
      const cornerRadius = 8;
      const minVisibleHeight = 8; // Minimum height to show a proper bar

      // Only draw bar if it has meaningful height
      if (barHeight >= minVisibleHeight) {
        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, colors.start);
        gradient.addColorStop(1, colors.end);
        ctx.fillStyle = gradient;

        // Draw bar with rounded top only, square bottom to meet the baseline
        ctx.beginPath();
        ctx.moveTo(x, padding.top + graphHeight);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.lineTo(x + barWidth - cornerRadius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + cornerRadius);
        ctx.lineTo(x + barWidth, padding.top + graphHeight);
        ctx.closePath();
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw subtle border (top and sides only)
        ctx.strokeStyle = colors.end;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, padding.top + graphHeight);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.lineTo(x + barWidth - cornerRadius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + cornerRadius);
        ctx.lineTo(x + barWidth, padding.top + graphHeight);
        ctx.stroke();

        // Value on top with background
        const valueText = formatCurrency(value);
        ctx.font = `bold ${isSmall ? 13 : 15}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const textMetrics = ctx.measureText(valueText);
        const textWidth = textMetrics.width;
        const textX = x + barWidth / 2;
        const textY = y - 12;

        // Background for value
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = colors.end;
        ctx.lineWidth = 2;
        roundRect(textX - textWidth / 2 - 8, textY - 20, textWidth + 16, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.end;
        ctx.fillText(valueText, textX, textY - 2);
      }

      // Icon and label
      ctx.font = `${isXSmall ? 16 : isSmall ? 18 : isMedium ? 20 : 24}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(icon, x + barWidth / 2, height - padding.bottom + 8);

      ctx.fillStyle = '#495057';
      ctx.font = `600 ${isXSmall ? 9 : isSmall ? 10 : isMedium ? 11 : 13}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textBaseline = 'top';
      const words = label.split(' ');
      words.forEach((word, i) => {
        ctx.fillText(word, x + barWidth / 2, height - padding.bottom + 32 + i * (isXSmall ? 14 : isSmall ? 15 : 18));
      });
    };

    const centerX = padding.left + graphWidth / 2;
    const x1 = centerX - barWidth - gap / 2;
    const x2 = centerX + gap / 2;

    drawBar(x1, standardInterest, { start: '#ff6b6b', end: '#dc3545' }, 'Without Additional', '📊');

    // Only draw the second bar if there's actually a difference (savings > 0)
    if (interestSaved > 1) {
      drawBar(x2, withAdditionalInterest, { start: '#51cf66', end: '#28a745' }, 'With Additional', '✅');
    }

    // Draw savings indicator with arrow - only if there are actual savings
    if (interestSaved > 1) {
      const savingsBoxWidth = isXSmall ? 82 : isSmall ? 90 : isMedium ? 105 : isLarge ? 115 : 140;
      const savingsBoxHeight = isXSmall ? 60 : isSmall ? 65 : isMedium ? 72 : isLarge ? 78 : 85;
      const savingsX = width - padding.right - savingsBoxWidth / 2 - (isXSmall ? 8 : isSmall ? 12 : isMedium ? 15 : isLarge ? 18 : 25);
      const savingsY = padding.top + graphHeight / 2;

      // Savings box
      ctx.fillStyle = 'rgba(212, 237, 218, 0.95)';
      ctx.strokeStyle = '#28a745';
      ctx.lineWidth = isXSmall ? 2 : 3;
      roundRect(savingsX - savingsBoxWidth / 2, savingsY - savingsBoxHeight / 2, savingsBoxWidth, savingsBoxHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Savings content
      ctx.fillStyle = '#28a745';
      ctx.font = `bold ${isXSmall ? 8 : isSmall ? 9 : isMedium ? 10 : isLarge ? 11 : 13}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💰 SAVINGS', savingsX, savingsY - (isXSmall ? 16 : isSmall ? 17 : isMedium ? 18 : isLarge ? 20 : 22));

      ctx.font = `bold ${isXSmall ? 11 : isSmall ? 12 : isMedium ? 13 : isLarge ? 14 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(formatCurrency(interestSaved), savingsX, savingsY + 2);

      ctx.font = `600 ${isXSmall ? 9 : isSmall ? 10 : isMedium ? 11 : isLarge ? 12 : 14}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(`⏱️ ${timeSaved} months`, savingsX, savingsY + (isXSmall ? 16 : isSmall ? 17 : isMedium ? 18 : isLarge ? 19 : 22));
    }

    // Draw Y-axis
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#495057';
    ctx.font = `600 ${isSmall ? 10 : 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
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

    // Y-axis label
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#495057';
    ctx.font = `600 ${isSmall ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Total Interest Paid', 0, 0);
    ctx.restore();
  }

  render() {
    if (!this.loanData || !this.loanData.additionalPrincipal || this.loanData.additionalPrincipal === 0) {
      return null;
    }

    const standardSchedule = calculateAmortization({ ...this.loanData, additionalPrincipal: 0 }, []);
    const withAdditionalSchedule = calculateAmortization(this.loanData, this.amortizationEntries);
    const standardInterest = standardSchedule.reduce((sum, row) => sum + row.interest, 0);
    const withAdditionalInterest = withAdditionalSchedule.reduce((sum, row) => sum + row.interest, 0);
    const interestSaved = standardInterest - withAdditionalInterest;
    const timeSaved = standardSchedule.length - withAdditionalSchedule.length;

    return (
      <div class="savings-graph-container section">
        <div class="graph-header">
          <h3 class="graph-title">💰 Savings Impact Analysis</h3>
          <p class="graph-subtitle">See how additional principal payments reduce your total interest</p>
        </div>

        <div class="savings-metrics">
          <div class="metric-card interest-saved">
            <div class="metric-icon">💵</div>
            <div class="metric-content">
              <span class="metric-label">Total Interest Saved</span>
              <span class="metric-value">{formatCurrency(interestSaved)}</span>
            </div>
          </div>

          <div class="metric-card time-saved">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <span class="metric-label">Time Saved</span>
              <span class="metric-value">{timeSaved} months</span>
            </div>
          </div>
        </div>

        <div class="canvas-wrapper">
          <canvas ref={(el) => (this.canvasRef = el)}></canvas>
        </div>
      </div>
    );
  }
}
