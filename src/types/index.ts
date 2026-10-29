export type VideoItem = {
  id: string;
  title: string;
  durationSec: number;
  sizeMb: number;
  addedLabel: string;
  folder: string;
  tint: string; // placeholder thumbnail color (real thumbnails come later)
};

export type RootStackParamList = {
  Library: undefined;
  Player: { videoId: string };
};
