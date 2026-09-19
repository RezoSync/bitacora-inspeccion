import { StyleSheet } from 'react-native';

// Tema oscuro con acento verde brillante. Se mantienen los nombres de
// tokens que ya usaban las pantallas (colors.ink, colors.muted, styles.card,
// styles.button, etc.) para no romper nada que no sea puramente visual;
// se agregan tokens nuevos (surface, border, badges, stats) para el resto
// del rediseño.
export const colors = {
  bg: '#0A0E0C',
  bgAlt: '#0D1412',
  surface: '#141B19',
  surfaceAlt: '#1B2422',
  surfaceHigh: '#212B28',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  green: '#3EFF93',
  greenStrong: '#1FE377',
  greenSoft: 'rgba(62,255,147,0.14)',
  greenSoftStrong: 'rgba(62,255,147,0.26)',
  greenInk: '#04160D',
  ink: '#F3FBF7',
  muted: '#8FA69C',
  faint: '#5C6E66',
  white: '#FFFFFF',
  danger: '#FF6B7A',
  dangerSoft: 'rgba(255,107,122,0.14)',
  amber: '#FFC24B',
  amberSoft: 'rgba(255,194,75,0.14)',
  line: 'rgba(255,255,255,0.07)',
  teal: '#3EFF93', // alias retro-compatible con el acento anterior
};

export const radius = { sm: 12, md: 18, lg: 24, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 };

export const shadow = {
  glow: {
    shadowColor: colors.green,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },

  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  label: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 15,
    fontSize: 16,
    color: colors.ink,
  },

  button: {
    backgroundColor: colors.green,
    borderRadius: radius.md,
    padding: 17,
    alignItems: 'center',
    ...shadow.glow,
  },
  buttonText: { color: colors.greenInk, fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },

  buttonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buttonSecondaryText: { color: colors.ink, fontWeight: '700', fontSize: 15 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    gap: 8,
    ...shadow.soft,
  },

  error: { color: colors.danger, fontSize: 14, fontWeight: '600' },

  // --- tokens nuevos para el rediseño ---
  statValue: { color: colors.green, fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  statLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },

  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glow,
  },
});
