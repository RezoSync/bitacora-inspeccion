import { View, StyleSheet } from 'react-native';

// Set de iconos mínimo construido solo con Views (sin librerías nuevas de
// íconos/SVG) para mantener un estilo de línea moderno y consistente con
// el tema oscuro + verde. Cada icono recibe `size` y `color`.

interface IconProps {
  size?: number;
  color?: string;
}

export function PlusIcon({ size = 22, color = '#04160D' }: IconProps) {
  const thickness = Math.max(2, Math.round(size * 0.14));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: thickness, backgroundColor: color, borderRadius: thickness / 2 }} />
      <View style={{ position: 'absolute', width: thickness, height: size, backgroundColor: color, borderRadius: thickness / 2 }} />
    </View>
  );
}

export function CameraIcon({ size = 22, color = '#3EFF93' }: IconProps) {
  const w = size;
  const h = size * 0.78;
  return (
    <View style={{ width: w, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: w,
          height: h,
          borderRadius: 5,
          borderWidth: Math.max(2, size * 0.09),
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: h * 0.42,
            height: h * 0.42,
            borderRadius: h * 0.21,
            borderWidth: Math.max(1.5, size * 0.08),
            borderColor: color,
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: w * 0.34,
          height: size * 0.2,
          backgroundColor: color,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      />
    </View>
  );
}

export function GalleryIcon({ size = 22, color = '#3EFF93' }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 5,
        borderWidth: Math.max(2, size * 0.09),
        borderColor: color,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size * 0.24,
          height: size * 0.24,
          borderRadius: size * 0.12,
          borderWidth: Math.max(1.5, size * 0.08),
          borderColor: color,
          top: size * 0.14,
          left: size * 0.14,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.9,
          height: size * 0.9,
          borderTopWidth: Math.max(1.5, size * 0.08),
          borderColor: color,
          transform: [{ rotate: '28deg' }],
          bottom: -size * 0.18,
          left: size * 0.05,
        }}
      />
    </View>
  );
}

export function LogoutIcon({ size = 20, color = '#8FA69C' }: IconProps) {
  const thickness = Math.max(1.6, size * 0.11);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.62,
          height: size * 0.82,
          borderWidth: thickness,
          borderColor: color,
          borderRadius: 4,
          position: 'absolute',
          left: 0,
        }}
      />
      <View style={{ position: 'absolute', right: 0, width: size * 0.5, height: thickness, backgroundColor: color, borderRadius: thickness / 2 }} />
      <View
        style={{
          position: 'absolute',
          right: 0,
          width: size * 0.26,
          height: size * 0.26,
          borderTopWidth: thickness,
          borderRightWidth: thickness,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function ChevronIcon({ size = 18, color = '#5C6E66' }: IconProps) {
  const thickness = Math.max(1.6, size * 0.16);
  return (
    <View
      style={{
        width: size * 0.5,
        height: size * 0.5,
        borderTopWidth: thickness,
        borderRightWidth: thickness,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

export function CheckIcon({ size = 16, color = '#04160D' }: IconProps) {
  const thickness = Math.max(1.8, size * 0.16);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.62,
          height: thickness,
          backgroundColor: color,
          borderRadius: thickness / 2,
          position: 'absolute',
          transform: [{ rotate: '45deg' }, { translateX: size * 0.06 }, { translateY: -size * 0.02 }],
        }}
      />
      <View
        style={{
          width: size * 0.32,
          height: thickness,
          backgroundColor: color,
          borderRadius: thickness / 2,
          position: 'absolute',
          transform: [{ rotate: '-45deg' }, { translateX: -size * 0.16 }, { translateY: size * 0.08 }],
        }}
      />
    </View>
  );
}

export const styles = StyleSheet.create({});
