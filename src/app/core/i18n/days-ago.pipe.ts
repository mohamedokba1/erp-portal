import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({ name: 'daysAgo', standalone: true, pure: false })
export class DaysAgoPipe implements PipeTransform {
  private lang = inject(LanguageService);

  transform(days: number): string {
    return this.lang.isEn() ? `${days} days ago` : `منذ ${days} يوم`;
  }
}
