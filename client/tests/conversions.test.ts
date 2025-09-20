import { toF, toC } from '../utils/conversions';

describe('Temperature Conversions', () => {
  describe('toF (Celsius to Fahrenheit)', () => {
    test('converts 0°C to 32°F', () => {
      expect(toF(0)).toBe(32);
    });

    test('converts 100°C to 212°F', () => {
      expect(toF(100)).toBe(212);
    });

    test('converts 20°C to 68°F', () => {
      expect(toF(20)).toBe(68);
    });
  });

  describe('toC (Fahrenheit to Celsius)', () => {
    test('converts 32°F to 0°C', () => {
      expect(toC(32)).toBe(0);
    });

    test('converts 212°F to 100°C', () => {
      expect(toC(212)).toBe(100);
    });

    test('converts 68°F to 20°C', () => {
      expect(toC(68)).toBe(20);
    });
  });
});