import { StyleSheet } from 'react-native';

export const colors = { ink: '#102a43', muted: '#627d98', teal: '#0f766e', bg: '#f4f7f5', line: '#d9e2ec', white: '#ffffff', danger: '#b42318' };

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16 },
  button: { backgroundColor: colors.teal, borderRadius: 8, padding: 15, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  card: { backgroundColor: colors.white, borderRadius: 10, padding: 16, borderColor: colors.line, borderWidth: 1, gap: 7 },
  error: { color: colors.danger, fontSize: 14 },
});
