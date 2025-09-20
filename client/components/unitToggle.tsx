import { useUnitStore } from '../store/unitSlice';
import { IconButton } from 'react-native-paper';

export function UnitToggle() {
  const unit = useUnitStore((s) => s.unit);
  const setUnit = useUnitStore((s) => s.setUnit);

  return (
    <IconButton
      icon={unit === 'C' ? 'temperature-celsius' : 'temperature-fahrenheit'}
      iconColor="rgba(255,255,255,0.9)"
      size={24}
      onPress={() => setUnit(unit === 'C' ? 'F' : 'C')}
      accessibilityLabel="Toggle temperature unit"
      style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
      }}
    />
  );
}