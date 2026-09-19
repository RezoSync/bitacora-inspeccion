import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../styles';

interface SlideToStartProps {
  label: string;
  runningLabel?: string;
  // Puede ser síncrono o async. Si lanza un error (por ejemplo una petición
  // que falla o el backend rechaza los datos), el control vuelve a su
  // posición inicial en vez de quedarse "trabado" en completado.
  onComplete: () => void | Promise<void>;
  disabled?: boolean;
}

const THUMB_SIZE = 58;
const TRACK_PAD = 4;
const COMPLETE_RATIO = 0.82;

export default function SlideToStart({ label, runningLabel = 'Iniciando…', onComplete, disabled }: SlideToStartProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [running, setRunning] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;

  const maxTranslate = Math.max(trackWidth - THUMB_SIZE - TRACK_PAD * 2, 1);

  // El PanResponder se crea UNA sola vez (useRef). Para que sus handlers
  // siempre usen los valores más recientes de props/estado (y no una
  // "foto" del primer render, que era el bug: se llamaba siempre al
  // `onComplete` inicial, con el formulario vacío) se leen desde refs que
  // se actualizan en cada render.
  const onCompleteRef = useRef(onComplete);
  const disabledRef = useRef(disabled);
  const runningRef = useRef(running);
  const maxTranslateRef = useRef(maxTranslate);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { maxTranslateRef.current = maxTranslate; }, [maxTranslate]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ]),
    );
    if (!running && !disabled) loop.start();
    return () => loop.stop();
  }, [running, disabled, pulse]);

  const reset = useCallback(() => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 7, tension: 60 }).start();
    setRunning(false);
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current && !runningRef.current,
      onMoveShouldSetPanResponder: (_, gesture) => !disabledRef.current && !runningRef.current && Math.abs(gesture.dx) > 2,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      },
      onPanResponderMove: (_, gesture) => {
        const max = maxTranslateRef.current;
        const next = Math.min(Math.max(gesture.dx, 0), max);
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const max = maxTranslateRef.current;
        const next = Math.min(Math.max(gesture.dx, 0), max);
        if (next >= max * COMPLETE_RATIO) {
          Animated.spring(translateX, { toValue: max, useNativeDriver: true, friction: 7 }).start();
          setRunning(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          Promise.resolve()
            .then(() => onCompleteRef.current())
            .catch(() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
              reset();
            });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        if (!runningRef.current) reset();
      },
    }),
  ).current;

  const textOpacity = translateX.interpolate({
    inputRange: [0, Math.max(maxTranslate * 0.6, 1)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // El relleno verde se anima con `transform: translateX` (soportado por el
  // driver nativo) en vez de `width` (NO soportado con useNativeDriver, de
  // ahí el warning "Style property 'width' is not supported"). La vista de
  // relleno mide el ancho completo de la pista de forma estática y se
  // desliza desde -trackWidth hasta 0 para simular el crecimiento.
  const fillOffset = translateX.interpolate({
    inputRange: [0, Math.max(maxTranslate, 1)],
    outputRange: [THUMB_SIZE + TRACK_PAD - Math.max(trackWidth, THUMB_SIZE + TRACK_PAD * 2), 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, disabled && styles.trackDisabled]}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, { width: trackWidth || undefined, transform: [{ translateX: fillOffset }] }]}
      />

      <Animated.Text style={[styles.label, { opacity: textOpacity }]} numberOfLines={1}>
        {running ? runningLabel : label}
      </Animated.Text>

      <Animated.View {...panResponder.panHandlers} style={[styles.thumb, { transform: [{ translateX }] }]}>
        <Animated.View style={[styles.chevrons, { opacity: running ? 1 : pulse }]}>
          <Text style={styles.chevron}>›</Text>
          <Text style={[styles.chevron, styles.chevronFaint]}>›</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const TRACK_HEIGHT = THUMB_SIZE + TRACK_PAD * 2;

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackDisabled: { opacity: 0.5 },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.greenSoftStrong,
  },
  label: {
    textAlign: 'center',
    color: colors.muted,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  thumb: {
    position: 'absolute',
    left: TRACK_PAD,
    top: TRACK_PAD,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  chevrons: { flexDirection: 'row', marginLeft: 4 },
  chevron: { color: colors.greenInk, fontSize: 22, fontWeight: '900', marginHorizontal: -4 },
  chevronFaint: { opacity: 0.55 },
});