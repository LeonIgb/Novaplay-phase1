import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { formatTime } from '../utils/format';
import IconButton from './IconButton';
import ProgressBar from './ProgressBar';

type Props = {
  style?: StyleProp<ViewStyle>;
  title: string;
  durationSec: number;
  positionSec: number;
  isPlaying: boolean;
  immersive: boolean;
  onBack: () => void;
  onTogglePlay: () => void;
  onSeekBy: (deltaSec: number) => void;
  onSeekRatio: (ratio: number) => void;
  onToggleFullscreen: () => void;
  onSettings: () => void;
};

// UI shell only. The black area below is where the real video view mounts in Phase 2.
export default function PlayerSurface(p: Props) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const progress = p.durationSec > 0 ? p.positionSec / p.durationSec : 0;

  return (
    <View style={[styles.surface, p.style]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setControlsVisible((v) => !v)} accessibilityLabel="Toggle controls">
        <View style={styles.placeholderWrap}>
          <Text style={styles.placeholderText}>Video area · playback engine not connected yet</Text>
        </View>
      </Pressable>

      {controlsVisible && (
        <>
          <View style={styles.top} pointerEvents="box-none">
            <IconButton name="chevron-down" label="Back to library" size={28} onPress={p.onBack} />
            {p.immersive ? <Text style={styles.topTitle} numberOfLines={1}>{p.title}</Text> : <View style={{ flex: 1 }} />}
            <IconButton name="settings-outline" label="Playback settings" onPress={p.onSettings} />
          </View>

          <View style={styles.center} pointerEvents="box-none">
            <IconButton name="play-back" label="Back 10 seconds" size={30} onPress={() => p.onSeekBy(-10)} />
            <Pressable onPress={p.onTogglePlay} style={styles.playBtn} accessibilityRole="button" accessibilityLabel={p.isPlaying ? 'Pause' : 'Play'}>
              <IconButton name={p.isPlaying ? 'pause' : 'play'} label={p.isPlaying ? 'Pause' : 'Play'} size={34} color={colors.video} onPress={p.onTogglePlay} />
            </Pressable>
            <IconButton name="play-forward" label="Forward 10 seconds" size={30} onPress={() => p.onSeekBy(10)} />
          </View>

          <View style={styles.bottom} pointerEvents="box-none">
            <View style={styles.timeRow}>
              <Text style={styles.time}>
                {formatTime(p.positionSec)} <Text style={styles.timeDim}>/ {formatTime(p.durationSec)}</Text>
              </Text>
              <IconButton name={p.immersive ? 'contract-outline' : 'expand-outline'} label="Toggle fullscreen" size={22} onPress={p.onToggleFullscreen} />
            </View>
            <ProgressBar progress={progress} buffered={Math.min(1, progress + 0.12)} onSeek={p.onSeekRatio} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: colors.video, overflow: 'hidden' },
  placeholderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: 'rgba(167,177,192,0.5)', fontSize: 12 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.overlay },
  topTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600', marginHorizontal: spacing.sm },
  center: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36 },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md, paddingBottom: spacing.xs, backgroundColor: colors.overlay },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { color: colors.text, fontSize: 12, fontWeight: '600' },
  timeDim: { color: colors.textSecondary, fontWeight: '400' },
});
