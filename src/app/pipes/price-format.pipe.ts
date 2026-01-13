import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  pure: true,
  standalone: true,
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, symbol = '₦'): string {
    const v = Number(value ?? 0);
    if (isNaN(v)) return `${symbol}0.00`;
    return `${symbol}${v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
