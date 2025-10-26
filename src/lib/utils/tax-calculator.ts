export interface TaxRates {
  country: string;
  province?: string;
  gst?: number;
  pst?: number;
  hst?: number;
  vat?: number;
  totalRate: number;
  description: string;
}

const TAX_RATES: TaxRates[] = [
  { country: 'Canada', province: 'Ontario', hst: 13, totalRate: 13, description: 'HST 13%' },
  { country: 'Canada', province: 'Quebec', gst: 5, pst: 9.975, totalRate: 14.975, description: 'GST 5% + QST 9.975%' },
  { country: 'Canada', province: 'British Columbia', gst: 5, pst: 7, totalRate: 12, description: 'GST 5% + PST 7%' },
  { country: 'Canada', province: 'Alberta', gst: 5, totalRate: 5, description: 'GST 5%' },
  { country: 'Canada', province: 'Saskatchewan', gst: 5, pst: 6, totalRate: 11, description: 'GST 5% + PST 6%' },
  { country: 'Canada', province: 'Manitoba', gst: 5, pst: 7, totalRate: 12, description: 'GST 5% + PST 7%' },
  { country: 'Canada', province: 'Nova Scotia', hst: 15, totalRate: 15, description: 'HST 15%' },
  { country: 'Canada', province: 'New Brunswick', hst: 15, totalRate: 15, description: 'HST 15%' },
  { country: 'Canada', province: 'Newfoundland and Labrador', hst: 15, totalRate: 15, description: 'HST 15%' },
  { country: 'Canada', province: 'Prince Edward Island', hst: 15, totalRate: 15, description: 'HST 15%' },
  { country: 'Canada', province: 'Yukon', gst: 5, totalRate: 5, description: 'GST 5%' },
  { country: 'Canada', province: 'Northwest Territories', gst: 5, totalRate: 5, description: 'GST 5%' },
  { country: 'Canada', province: 'Nunavut', gst: 5, totalRate: 5, description: 'GST 5%' },
  
  { country: 'United States', province: 'California', totalRate: 7.25, description: 'Sales Tax 7.25%' },
  { country: 'United States', province: 'New York', totalRate: 4, description: 'Sales Tax 4%' },
  { country: 'United States', province: 'Texas', totalRate: 6.25, description: 'Sales Tax 6.25%' },
  { country: 'United States', province: 'Florida', totalRate: 6, description: 'Sales Tax 6%' },
  { country: 'United States', province: 'Washington', totalRate: 6.5, description: 'Sales Tax 6.5%' },
  { country: 'United States', province: 'Alaska', totalRate: 0, description: 'No State Sales Tax' },
  { country: 'United States', province: 'Delaware', totalRate: 0, description: 'No State Sales Tax' },
  { country: 'United States', province: 'Montana', totalRate: 0, description: 'No State Sales Tax' },
  { country: 'United States', province: 'New Hampshire', totalRate: 0, description: 'No State Sales Tax' },
  { country: 'United States', province: 'Oregon', totalRate: 0, description: 'No State Sales Tax' },
  
  { country: 'United Kingdom', vat: 20, totalRate: 20, description: 'VAT 20%' },
  { country: 'Germany', vat: 19, totalRate: 19, description: 'VAT 19%' },
  { country: 'France', vat: 20, totalRate: 20, description: 'VAT 20%' },
  { country: 'Australia', gst: 10, totalRate: 10, description: 'GST 10%' },
  { country: 'New Zealand', gst: 15, totalRate: 15, description: 'GST 15%' },
  { country: 'Ireland', vat: 23, totalRate: 23, description: 'VAT 23%' },
  { country: 'Spain', vat: 21, totalRate: 21, description: 'VAT 21%' },
  { country: 'Italy', vat: 22, totalRate: 22, description: 'VAT 22%' },
  { country: 'Netherlands', vat: 21, totalRate: 21, description: 'VAT 21%' },
  { country: 'Belgium', vat: 21, totalRate: 21, description: 'VAT 21%' },
  { country: 'Sweden', vat: 25, totalRate: 25, description: 'VAT 25%' },
  { country: 'Norway', vat: 25, totalRate: 25, description: 'VAT 25%' },
  { country: 'Denmark', vat: 25, totalRate: 25, description: 'VAT 25%' },
  { country: 'Finland', vat: 24, totalRate: 24, description: 'VAT 24%' },
];

export function calculateTaxRate(country?: string | null, province?: string | null): number | null {
  if (!country) return null;

  const normalizedCountry = country.trim();
  const normalizedProvince = province?.trim() || '';

  if (normalizedProvince) {
    const matchedRateWithProvince = TAX_RATES.find(
      rate => 
        rate.country.toLowerCase() === normalizedCountry.toLowerCase() &&
        rate.province?.toLowerCase() === normalizedProvince.toLowerCase()
    );
    if (matchedRateWithProvince) {
      return matchedRateWithProvince.totalRate;
    }
  }

  const countryLevelRate = TAX_RATES.find(
    rate => rate.country.toLowerCase() === normalizedCountry.toLowerCase() && !rate.province
  );

  return countryLevelRate ? countryLevelRate.totalRate : null;
}

export function getTaxDescription(country?: string | null, province?: string | null): string {
  if (!country) return '';

  const normalizedCountry = country.trim();
  const normalizedProvince = province?.trim() || '';

  if (normalizedProvince) {
    const matchedRateWithProvince = TAX_RATES.find(
      rate => 
        rate.country.toLowerCase() === normalizedCountry.toLowerCase() &&
        rate.province?.toLowerCase() === normalizedProvince.toLowerCase()
    );
    if (matchedRateWithProvince) {
      return matchedRateWithProvince.description;
    }
  }

  const countryLevelRate = TAX_RATES.find(
    rate => rate.country.toLowerCase() === normalizedCountry.toLowerCase() && !rate.province
  );

  return countryLevelRate?.description || '';
}

export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return (subtotal * taxRate) / 100;
}

export function getAllTaxRates(): TaxRates[] {
  return TAX_RATES;
}
