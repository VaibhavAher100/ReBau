
import { Condition, MaterialCategory, MaterialItem } from '../types';

// Embodied carbon factors in kg CO2e per kg of material
const CARBON_FACTORS: Record<MaterialCategory, number> = {
  [MaterialCategory.METAL]: 1.9,
  [MaterialCategory.BRICK]: 0.24,
  [MaterialCategory.CONCRETE]: 0.13,
  [MaterialCategory.WOOD]: -1.6, // Carbon stored
  [MaterialCategory.GLASS]: 1.4,
  [MaterialCategory.PLASTIC]: 3.1,
  [MaterialCategory.ELECTRICAL]: 2.0,
  [MaterialCategory.OTHER]: 0.5
};

// Rough kg-per-unit heuristics to convert item quantity strings to mass
const KG_PER_UNIT: Record<MaterialCategory, number> = {
  [MaterialCategory.METAL]: 8,     // steel/metal piece ~8kg
  [MaterialCategory.BRICK]: 2.5,   // standard brick ~2.5kg
  [MaterialCategory.CONCRETE]: 20, // concrete block ~20kg
  [MaterialCategory.WOOD]: 15,     // timber beam/unit ~15kg
  [MaterialCategory.GLASS]: 12,    // glass panel ~12kg
  [MaterialCategory.PLASTIC]: 3,   // plastic piece ~3kg
  [MaterialCategory.ELECTRICAL]: 2, // electrical component ~2kg
  [MaterialCategory.OTHER]: 5
};

// Discount fractions vs new price per condition
const DISCOUNT_FRACTION: Record<Condition, number> = {
  [Condition.NEW]: 0.5,
  [Condition.GOOD]: 0.5,
  [Condition.FAIR]: 0.35,
  [Condition.POOR]: 0.2,
  [Condition.SCRAP]: 0.1
};

/** Parse leading number from quantity string, fallback 1 */
function parseQuantityKg(item: MaterialItem): number {
  const match = item.quantity.match(/^(\d+(\.\d+)?)/);
  const count = match ? parseFloat(match[1]) : 1;
  return count * KG_PER_UNIT[item.category];
}

/** kg CO2 saved vs manufacturing new material of same mass */
export function co2SavedKg(item: MaterialItem): number {
  const kg = parseQuantityKg(item);
  const factor = CARBON_FACTORS[item.category];
  // For wood, factor is negative (stores carbon) - reuse still saves manufacturing emissions
  const effectiveFactor = Math.abs(factor);
  return Math.round(kg * effectiveFactor * 10) / 10;
}

/** Discount fraction for an item's condition */
export function gradeDiscount(condition: Condition): number {
  return DISCOUNT_FRACTION[condition];
}

/** Estimated new price (what buyer would pay new) */
export function estimatedNewPrice(item: MaterialItem): number {
  const discount = gradeDiscount(item.condition);
  if (discount === 0) return item.estimatedValue;
  return Math.round(item.estimatedValue / discount);
}

/** EUR saved vs buying new */
export function eurSaved(item: MaterialItem): number {
  return Math.round(estimatedNewPrice(item) - item.estimatedValue);
}

/** Cumulative CO2 saved from a list of items */
export function totalCo2Saved(items: MaterialItem[]): number {
  return Math.round(items.reduce((acc, item) => acc + co2SavedKg(item), 0) * 10) / 10;
}

/** Cumulative EUR saved from a list of items */
export function totalEurSaved(items: MaterialItem[]): number {
  return items.reduce((acc, item) => acc + eurSaved(item), 0);
}
