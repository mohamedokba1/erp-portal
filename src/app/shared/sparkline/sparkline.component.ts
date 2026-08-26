import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.viewBox]="'0 0 100 32'" preserveAspectRatio="none" class="spark">
      <polyline [attr.points]="points()" [attr.stroke]="color" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <polygon [attr.points]="fillPoints()" [attr.fill]="color" opacity="0.08" />
    </svg>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 32px; }
    .spark { width: 100%; height: 100%; display: block; }
  `],
})
export class SparklineComponent {
  @Input() data: number[] = [];
  @Input() color = '#2C5F8A';

  points = computed(() => {
    if (!this.data || this.data.length === 0) return '';
    const max = Math.max(...this.data);
    const min = Math.min(...this.data);
    const range = max - min || 1;
    const stepX = 100 / (this.data.length - 1);
    return this.data
      .map((v, i) => {
        const x = i * stepX;
        const y = 30 - ((v - min) / range) * 28;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  fillPoints = computed(() => {
    const pts = this.points();
    if (!pts) return '';
    return `0,32 ${pts} 100,32`;
  });
}
