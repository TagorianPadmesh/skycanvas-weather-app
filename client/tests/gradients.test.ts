import { getGradientKey } from '../theme/gradients';

describe('Weather Gradients', () => {
  describe('getGradientKey function', () => {
    test('returns day/night variants for clear weather', () => {
      expect(getGradientKey(0, true)).toBe('clear_day');
      expect(getGradientKey(0, false)).toBe('clear_night');
    });

    test('returns day/night variants for partly cloudy', () => {
      expect(getGradientKey(1, true)).toBe('partly_cloudy_day');
      expect(getGradientKey(1, false)).toBe('partly_cloudy_night');
    });

    test('returns day/night variants for overcast', () => {
      expect(getGradientKey(3, true)).toBe('overcast_day');
      expect(getGradientKey(3, false)).toBe('overcast_night');
    });

    test('returns same key regardless of day/night for rain', () => {
      expect(getGradientKey(61, true)).toBe('light_rain');
      expect(getGradientKey(61, false)).toBe('light_rain');
    });

    test('returns default for unknown weather codes', () => {
      expect(getGradientKey(999, true)).toBe('default');
      expect(getGradientKey(999, false)).toBe('default');
    });
  });
});