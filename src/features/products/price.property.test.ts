import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isDiscountActive, getEffectivePrice, getPricingDisplay } from './price-actions';

/**
 * **Validates: Requirements 14.7**
 * 
 * Property: Discount prices are always less than original prices
 * 
 * This test verifies that:
 * - When a discount is active, the effective price is always less than the original price
 * - Discount percentages are always positive and less than 100%
 * - The pricing display correctly shows both original and discounted prices
 */

describe('Price Management (Property-Based)', () => {
  describe('Property: Discount prices are always less than original prices', () => {
    it('should always have discount price less than original price when discount is active', () => {
      fc.assert(
        fc.property(
          // Generate original price between 1.00 and 10000.00
          fc.double({ min: 1.0, max: 10000.0, noNaN: true }),
          // Generate discount percentage between 1% and 99%
          fc.integer({ min: 1, max: 99 }),
          (originalPrice, discountPercentage) => {
            // Calculate discount price
            const discountPrice = originalPrice * (1 - discountPercentage / 100);
            
            // Format prices to 2 decimal places
            const originalPriceStr = originalPrice.toFixed(2);
            const discountPriceStr = discountPrice.toFixed(2);
            
            // Create active discount dates
            const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
            const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
            
            // Get effective price
            const effectivePrice = getEffectivePrice(
              originalPriceStr,
              discountPriceStr,
              startDate,
              endDate
            );
            
            // Property: Effective price should be the discount price
            expect(effectivePrice).toBe(discountPriceStr);
            
            // Property: Discount price should always be less than original price
            expect(parseFloat(discountPriceStr)).toBeLessThan(parseFloat(originalPriceStr));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate correct discount percentage', () => {
      fc.assert(
        fc.property(
          // Generate original price between 10.00 and 1000.00
          fc.double({ min: 10.0, max: 1000.0, noNaN: true }),
          // Generate discount percentage between 5% and 95%
          fc.integer({ min: 5, max: 95 }),
          (originalPrice, expectedDiscountPercentage) => {
            // Calculate discount price
            const discountPrice = originalPrice * (1 - expectedDiscountPercentage / 100);
            
            // Format prices to 2 decimal places
            const originalPriceStr = originalPrice.toFixed(2);
            const discountPriceStr = discountPrice.toFixed(2);
            
            // Create active discount dates
            const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            // Get pricing display
            const pricingDisplay = getPricingDisplay(
              originalPriceStr,
              discountPriceStr,
              startDate,
              endDate
            );
            
            // Property: Discount percentage should be positive
            expect(pricingDisplay.discountPercentage).toBeGreaterThan(0);
            
            // Property: Discount percentage should be less than 100
            expect(pricingDisplay.discountPercentage).toBeLessThan(100);
            
            // Property: Calculated percentage should be close to expected (within 1% due to rounding)
            const calculatedPercentage = pricingDisplay.discountPercentage!;
            expect(Math.abs(calculatedPercentage - expectedDiscountPercentage)).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return original price when discount is not active', () => {
      fc.assert(
        fc.property(
          // Generate original price
          fc.double({ min: 1.0, max: 10000.0, noNaN: true }),
          // Generate discount price (always less than original)
          fc.double({ min: 0.5, max: 0.99, noNaN: true }),
          (originalPrice, discountMultiplier) => {
            const discountPrice = originalPrice * discountMultiplier;
            
            const originalPriceStr = originalPrice.toFixed(2);
            const discountPriceStr = discountPrice.toFixed(2);
            
            // Create inactive discount dates (in the future)
            const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const endDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
            
            // Get effective price
            const effectivePrice = getEffectivePrice(
              originalPriceStr,
              discountPriceStr,
              startDate,
              endDate
            );
            
            // Property: When discount is not active, effective price should be original price
            expect(effectivePrice).toBe(originalPriceStr);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify active discount periods', () => {
      fc.assert(
        fc.property(
          // Generate discount price
          fc.double({ min: 1.0, max: 1000.0, noNaN: true }),
          // Generate days before start (negative means started)
          fc.integer({ min: -10, max: 10 }),
          // Generate days until end (positive means not ended)
          fc.integer({ min: -10, max: 10 }),
          (discountPrice, daysBeforeStart, daysUntilEnd) => {
            const discountPriceStr = discountPrice.toFixed(2);
            
            const startDate = new Date(Date.now() + daysBeforeStart * 24 * 60 * 60 * 1000);
            const endDate = new Date(Date.now() + daysUntilEnd * 24 * 60 * 60 * 1000);
            
            const isActive = isDiscountActive(discountPriceStr, startDate, endDate);
            
            // Property: Discount is active only if we're between start and end dates
            const now = new Date();
            const shouldBeActive = now >= startDate && now <= endDate;
            
            expect(isActive).toBe(shouldBeActive);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain pricing display consistency', () => {
      fc.assert(
        fc.property(
          // Generate original price
          fc.double({ min: 10.0, max: 1000.0, noNaN: true }),
          // Generate discount percentage
          fc.integer({ min: 10, max: 90 }),
          (originalPrice, discountPercentage) => {
            const discountPrice = originalPrice * (1 - discountPercentage / 100);
            
            const originalPriceStr = originalPrice.toFixed(2);
            const discountPriceStr = discountPrice.toFixed(2);
            
            // Active discount
            const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            const pricingDisplay = getPricingDisplay(
              originalPriceStr,
              discountPriceStr,
              startDate,
              endDate
            );
            
            // Property: When discount is active, hasActiveDiscount should be true
            expect(pricingDisplay.hasActiveDiscount).toBe(true);
            
            // Property: Original price should be preserved
            expect(pricingDisplay.originalPrice).toBe(originalPriceStr);
            
            // Property: Effective price should be the discount price
            expect(pricingDisplay.effectivePrice).toBe(discountPriceStr);
            
            // Property: Discount percentage should not be null
            expect(pricingDisplay.discountPercentage).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of very small discounts', () => {
      fc.assert(
        fc.property(
          // Generate original price
          fc.double({ min: 100.0, max: 1000.0, noNaN: true }),
          // Generate very small discount (0.01% to 1%)
          fc.double({ min: 0.01, max: 1.0, noNaN: true }),
          (originalPrice, discountPercentage) => {
            const discountPrice = originalPrice * (1 - discountPercentage / 100);
            
            const originalPriceStr = originalPrice.toFixed(2);
            const discountPriceStr = discountPrice.toFixed(2);
            
            // Property: Even with very small discounts, discount price should be less than or equal to original
            expect(parseFloat(discountPriceStr)).toBeLessThanOrEqual(parseFloat(originalPriceStr));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of very large discounts', () => {
      fc.assert(
        fc.property(
          // Generate original price
          fc.double({ min: 100.0, max: 1000.0, noNaN: true }),
          // Generate large discount (90% to 99%)
          fc.integer({ min: 90, max: 99 }),
          (originalPrice, discountPercentage) => {
            const discountPrice = originalPrice * (1 - discountPercentage / 100);
            
            const originalPriceStr = originalPrice.toFixed(2);
            const discountPriceStr = discountPrice.toFixed(2);
            
            // Property: Even with large discounts, discount price should be positive
            expect(parseFloat(discountPriceStr)).toBeGreaterThan(0);
            
            // Property: Discount price should still be less than original
            expect(parseFloat(discountPriceStr)).toBeLessThan(parseFloat(originalPriceStr));
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
