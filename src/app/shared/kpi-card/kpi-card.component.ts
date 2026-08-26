import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCard } from '../../core/models/models';
import { SparklineComponent } from '../sparkline/sparkline.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, SparklineComponent, TranslatePipe],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  @Input({ required: true }) kpi!: KpiCard;

  get accentColor(): string {
    const map: Record<string, string> = {
      navy: 'var(--navy-800)',
      success: 'var(--success-600)',
      warning: 'var(--warning-600)',
      info: 'var(--steel-600)',
    };
    return map[this.kpi.accent];
  }

  get isPositive(): boolean {
    return this.kpi.delta >= 0;
  }
}
