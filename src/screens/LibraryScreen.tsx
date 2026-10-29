import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, APP_NAME } from '../theme/colors';
import { RootStackParamList, VideoItem } from '../types';
import { MOCK_VIDEOS } from '../data/mockVideos';
import { formatSize } from '../utils/format';
import IconButton from '../components/IconButton';
import StateView from '../components/StateView';
import VideoCard from '../components/VideoCard';

type Status = 'loading' | 'ready' | 'empty' | 'error';
type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export default function LibraryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const columns = width > height ? 2 : 1;
  const [status, setStatus] = useState<Status>('loading');
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // PLACEHOLDER: simulated load. Replaced by AsyncStorage / real library in a later phase.
  const load = useCallback((target: Status = 'ready') => {
    setStatus('loading');
    setTimeout(() => {
      setVideos(target === 'ready' ? MOCK_VIDEOS : []);
      setStatus(target);
    }, 600);
  }, []);

  useEffect(() => { load('ready'); }, [load]);

  const addVideos = () => Alert.alert('Not connected yet', 'Picking videos from the device arrives in a later phase.');
  const totalMb = videos.reduce((a, v) => a + v.sizeMb, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoDot} />
          <Text style={styles.brandText}>{APP_NAME}</Text>
        </View>
        <IconButton name="search-outline" label="Search (not connected)" onPress={addVideos} />
        <IconButton name="add-circle-outline" label="Add videos (not connected)" size={28} color={colors.primary} onPress={addVideos} />
      </View>

      {/* DEV ONLY: preview the loading/empty/error states. Remove before release. */}
      <View style={styles.devRow}>
        <Text style={styles.devLabel}>Preview state:</Text>
        {(['ready', 'empty', 'error'] as Status[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => { if (s === 'error') { setVideos([]); setStatus('error'); } else { load(s); } }}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {status === 'loading' && <StateView kind="loading" message="Loading your library…" />}
      {status === 'empty' && (
        <StateView kind="empty" title="No videos yet" message="Add videos from your device to start watching offline." actionLabel="Add videos" onAction={addVideos} />
      )}
      {status === 'error' && (
        <StateView kind="error" title="Couldn't load your library" message="Something went wrong while reading your videos." actionLabel="Try again" onAction={() => load('ready')} />
      )}
      {status === 'ready' && (
        <FlatList
          key={columns}
          data={videos}
          numColumns={columns}
          keyExtractor={(v) => v.id}
          columnWrapperStyle={columns > 1 ? { gap: spacing.lg } : undefined}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          ListHeaderComponent={<Text style={styles.summary}>{videos.length} videos · {formatSize(totalMb)}</Text>}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <VideoCard video={item} onPress={() => navigation.navigate('Player', { videoId: item.id })} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.secondary },
  brandText: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  devRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  devLabel: { color: colors.textSecondary, fontSize: 11 },
  chip: { backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  chipText: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  summary: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md },
});
