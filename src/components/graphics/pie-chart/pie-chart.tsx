import { Component, h, Prop, Element, State } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';
import { formatCurrency } from '../../../utils/utils';

@Component({
  tag: 'pie-chart',
  styleUrl: 'pie-chart.scss',
  shadow: true,
})
export class PieChart {
  @Prop() schedule: AmortizationRow[] = [];
  @Element() el: HTMLElement;
  @State() hoveredSection: 'principal' | 'interest' | null = null;

  private canvasRef: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;
  private animationFrame: number | null = null;
  private hoverScale = 0;

  componentDidLoad() {
    this.drawChart();

    this.resizeObserver = new ResizeObserver(() => {
      this.drawChart();
    });

    if (this.canvasRef) {
      this.resizeObserver.observe(this.canvasRef);
      this.canvasRef.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvasRef.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.canvasRef) {
      this.canvasRef.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvasRef.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  componentDidUpdate() {
    this.drawChart();
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.canvasRef || this.schedule.length === 0) return;

    const rect = this.canvasRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    // Calculate angle and distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(width, height) / 3;

    if (distance > radius) {
      if (this.hoveredSection !== null) {
        this.hoveredSection = null;
        this.animateHover();
      }
      return;
    }

    let angle = Math.atan2(dy, dx);
    angle = angle + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    const totalPrincipal = this.schedule.reduce((sum, row) => sum + row.principal + row.additionalPrincipal, 0);
    const totalInterest = this.schedule.reduce((sum, row) => sum + row.interest, 0);
    const total = totalPrincipal + totalInterest;
    const principalAngle = (totalPrincipal / total) * 2 * Math.PI;

    const newSection = angle < principalAngle ? 'principal' : 'interest';

    if (this.hoveredSection !== newSection) {
      this.hoveredSection = newSection;
      this.animateHover();
    }
  }

  private handleMouseLeave() {
    if (this.hoveredSection !== null) {
      this.hoveredSection = null;
      this.animateHover();
    }
  }

  private animateHover() {
    const targetScale = this.hoveredSection ? 1 : 0;
    const animate = () => {
      const speed = 0.15;
      this.hoverScale += (targetScale - this.hoverScale) * speed;

      if (Math.abs(targetScale - this.hoverScale) > 0.01) {
        this.drawChart();
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.hoverScale = targetScale;
        this.drawChart();
        this.animationFrame = null;
      }
    };

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    animate();
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

    // Responsive layout
    const isSmallScreen = width < 1200;
    const isMobile = width < 600;

    // Draw 3D pie chart - larger size with proper spacing
    const centerX = isSmallScreen ? width / 2 : width / 2 - 100;
    const centerY = isSmallScreen ? height / 2 - 60 : height / 2 - 10;
    const radius = isSmallScreen
      ? Math.min(width - 60, height - 200) / 2.3
      : Math.min(width - 200, height - 80) / 2.6;
    const depth = 20; // 3D depth

    let currentAngle = -Math.PI / 2;
    const principalAngle = (totalPrincipal / total) * 2 * Math.PI;

    // Calculate hover effects
    const principalScale = this.hoveredSection === 'principal' ? 1 + (this.hoverScale * 0.1) : 1;
    const interestScale = this.hoveredSection === 'interest' ? 1 + (this.hoverScale * 0.1) : 1;
    const principalOffset = this.hoveredSection === 'principal' ? this.hoverScale * 8 : 0;
    const interestOffset = this.hoveredSection === 'interest' ? this.hoverScale * 8 : 0;

    // Draw 3D depth (sides of the pie)
    for (let i = depth; i > 0; i--) {
      const offsetY = centerY + i;
      const shadowAlpha = 1 - (i / depth) * 0.5;

      // Draw principal side
      const principalMidAngle = currentAngle + principalAngle / 2;
      const principalCenterX = centerX + Math.cos(principalMidAngle) * principalOffset;
      const principalCenterY = offsetY + Math.sin(principalMidAngle) * principalOffset;

      ctx.fillStyle = `rgba(32, 133, 55, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(principalCenterX, principalCenterY);
      ctx.arc(principalCenterX, principalCenterY, radius * principalScale, currentAngle, currentAngle + principalAngle);
      ctx.closePath();
      ctx.fill();

      // Draw interest side
      const interestMidAngle = currentAngle + principalAngle + (2 * Math.PI - principalAngle) / 2;
      const interestCenterX = centerX + Math.cos(interestMidAngle) * interestOffset;
      const interestCenterY = offsetY + Math.sin(interestMidAngle) * interestOffset;

      ctx.fillStyle = `rgba(176, 42, 55, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(interestCenterX, interestCenterY);
      ctx.arc(interestCenterX, interestCenterY, radius * interestScale, currentAngle + principalAngle, currentAngle + (2 * Math.PI));
      ctx.closePath();
      ctx.fill();
    }

    // Draw top of the pie (brighter colors)
    // Draw principal slice
    const principalMidAngle = currentAngle + principalAngle / 2;
    const principalCenterX = centerX + Math.cos(principalMidAngle) * principalOffset;
    const principalCenterY = centerY + Math.sin(principalMidAngle) * principalOffset;

    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.moveTo(principalCenterX, principalCenterY);
    ctx.arc(principalCenterX, principalCenterY, radius * principalScale, currentAngle, currentAngle + principalAngle);
    ctx.closePath();
    ctx.fill();

    // Add gradient for 3D effect
    const principalGradient = ctx.createRadialGradient(
      principalCenterX - radius * principalScale / 3,
      principalCenterY - radius * principalScale / 3,
      0,
      principalCenterX,
      principalCenterY,
      radius * principalScale
    );
    principalGradient.addColorStop(0, '#3dd65d');
    principalGradient.addColorStop(1, '#28a745');
    ctx.fillStyle = principalGradient;
    ctx.fill();

    // Add glow effect when hovered
    if (this.hoveredSection === 'principal' && this.hoverScale > 0) {
      ctx.shadowBlur = 15 * this.hoverScale;
      ctx.shadowColor = '#28a745';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw interest slice
    currentAngle += principalAngle;
    const interestMidAngle = currentAngle + (2 * Math.PI - principalAngle) / 2;
    const interestCenterX = centerX + Math.cos(interestMidAngle) * interestOffset;
    const interestCenterY = centerY + Math.sin(interestMidAngle) * interestOffset;

    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.moveTo(interestCenterX, interestCenterY);
    ctx.arc(interestCenterX, interestCenterY, radius * interestScale, currentAngle, currentAngle + (2 * Math.PI - principalAngle));
    ctx.closePath();
    ctx.fill();

    // Add gradient for 3D effect
    const interestGradient = ctx.createRadialGradient(
      interestCenterX - radius * interestScale / 3,
      interestCenterY - radius * interestScale / 3,
      0,
      interestCenterX,
      interestCenterY,
      radius * interestScale
    );
    interestGradient.addColorStop(0, '#ff5566');
    interestGradient.addColorStop(1, '#dc3545');
    ctx.fillStyle = interestGradient;
    ctx.fill();

    // Add glow effect when hovered
    if (this.hoveredSection === 'interest' && this.hoverScale > 0) {
      ctx.shadowBlur = 15 * this.hoverScale;
      ctx.shadowColor = '#dc3545';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw legend with improved styling (responsive positioning)
    let legendX, legendY, legendWidth;
    const legendItemHeight = 32;

    if (isSmallScreen) {
      // Bottom centered layout for smaller screens - moved down more
      legendWidth = Math.min(width - 40, 450);
      legendX = (width - legendWidth) / 2 + 10;
      legendY = height - 75;
    } else {
      // Right side layout for larger screens - moved down
      legendWidth = 280;
      legendX = width - 300;
      legendY = height / 2 - 30;
    }

    // Draw legend background
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(legendX - 10, legendY - 10, legendWidth, 80, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Draw border
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX - 10, legendY - 10, legendWidth, 80, 12);
    ctx.stroke();

    const fontSize = isMobile ? 12 : 14;
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    // Principal legend
    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, 24, 24, 6);
    ctx.fill();

    ctx.fillStyle = '#212529';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const principalText = `Principal: ${formatCurrency(totalPrincipal)} (${principalPercent.toFixed(1)}%)`;
    ctx.fillText(principalText, legendX + 34, legendY + 12);

    // Interest legend
    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.roundRect(legendX, legendY + legendItemHeight, 24, 24, 6);
    ctx.fill();

    ctx.fillStyle = '#212529';
    const interestText = `Interest: ${formatCurrency(totalInterest)} (${interestPercent.toFixed(1)}%)`;
    ctx.fillText(interestText, legendX + 34, legendY + legendItemHeight + 12);

    // Title with improved styling
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#212529';
    const title = 'Principal vs. Interest';
    ctx.fillText(title, width / 2, 25);
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    return (
      <div class="pie-chart-container section">
        <canvas ref={(el) => (this.canvasRef = el)}></canvas>
      </div>
    );
  }
}
