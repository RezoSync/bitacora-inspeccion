import { Text, View } from 'react-native';
import { colors, styles as base } from '../styles';
import { VisitStatus } from '../types';

const CONFIG: Record<VisitStatus, { label: string; fg: string; bg: string }> = {
  in_progress: { label: 'En progreso', fg: colors.amber, bg: colors.amberSoft },
  completed: { label: 'Completada', fg: colors.green, bg: colors.greenSoft },
  cancelled: { label: 'Cancelada', fg: colors.danger, bg: colors.dangerSoft },
};

export default function StatusBadge({ status }: { status: VisitStatus }) {
  const config = CONFIG[status];
  return (
    <View style={[base.badge, { backgroundColor: config.bg }]}>
      <Text style={[base.badgeText, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}
