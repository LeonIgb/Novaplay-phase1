import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';
import { RootStackParamList } from '../types';
import { MOCK_VIDEOS } from '../data/mockVideos';
import { formatSize } from '../utils/format';
import PlayerSurface from '../components/PlayerSurface';
import StateView from '../components/StateView';
import VideoCard from '../components/VideoCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export default function PlayerScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const video = MOCK_VIDEOS.find((v) => v.id === route.params.videoId);

  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [immersive, setImmersive] = useState(false);

  // PLACEHOLDER: fake clock so the progress bar moves. Replaced by the real player in Phase 2.
  useEffect(() => {
    if (!isPlaying || !video) return;
    const t = setInterval(() => setPosition((p) => Math.min(video.durationSec, p + 1)), 1000);
    return () => clearInterval(t);
  }, [isPlaying, video]);

  if (!video) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StateView kind="error" title="Video not found" message="This video is no longer in your library." actionLabel="Back to library" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  const notConnected = (what: string) => () => Alert.alert('Not connected yet', `${what} arrives in a later phase.`);
  const related = MOCK_VIDEOS.filter((v) => v.id !== video.id);

  const surface = (style: object) => (
    <PlayerSurface
      style={style}
      title={video.title}
      durationSec={video.durationSec}
      positionSec={position}
      isPlaying={isPlaying}
      immersive={immersive}
      onBack={() => navigation.goBack()}
      onTogglePlay={() => setIsPlaying((p) => !p)}
      onSeekBy={(d) => setPosition((p) => Math.min(video.durationSec, Math.max(0, p + d)))}
      onSeekRatio={(r) => setPosition(r * video.durationSec)}
      onToggleFullscreen={() => setImmersive((i) => !i)}
      onSettings={notConnected('Playback settings')}
    />
  );

  if (immersive) {
    return <View style={styles.root}>{surface({ flex: 1 })}</View>;
  }

  const actions = [
    ['heart-outline', 'Favorite'],
    ['speedometer-outline', 'Speed'],
    ['list-outline', 'Queue'],
    ['information-circle-outline', 'Details'],
  ] as const;

  const header = (
    <View>
      <View style={styles.info}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.meta}>{video.folder} · {formatSize(video.sizeMb)} · Added {video.addedLabel}</Text>
      </View>
      <View style={styles.actions}>
        {actions.map(([icon, label]) => (
          <Pressable key={label} onPress={notConnected(label)} style={styles.actionPill} accessibilityRole="button" accessibilityLabel={label}>
            <Ionicons name={icon} size={18} color={colors.primary} />
            <Text style={styles.actionText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Up next</Text>
    </View>
  );

  const list = (
    <FlatList
      data={related}
      keyExtractor={(v) => v.id}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      renderItem={({ item }) => (
        <VideoCard video={item} variant="row" onPress={() => navigation.replace('Player', { videoId: item.id })} />
      )}
    />
  );

  if (landscape) {
    return (
      <View style={[styles.root, styles.landscapeRow, { paddingLeft: insets.left, paddingRight: insets.right }]}>
        <View style={{ flex: 3 }}>{surface({ flex: 1 })}</View>
        <View style={{ flex: 2, paddingTop: insets.top }}>{list}</View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {surface({ width: '100%', aspectRatio: 16 / 9 })}
      {list}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  landscapeRow: { flexDirection: 'row' },
  info: { padding: spacing.lg, gap: 4 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  meta: { color: colors.textSecondary, fontSize: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  actionText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
