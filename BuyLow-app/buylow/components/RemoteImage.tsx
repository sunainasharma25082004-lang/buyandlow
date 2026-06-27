import React, { useState } from 'react';
import { Image, ImageStyle } from 'expo-image';
import { Platform, StyleProp } from 'react-native';
import { resolveMediaUrl } from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../constants/images';

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill';
  fallback?: string;
};

export default function RemoteImage({
  uri,
  style,
  contentFit = 'cover',
  fallback = PLACEHOLDER_PRODUCT,
}: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? fallback : resolveMediaUrl(uri) || fallback;

  return (
    <Image
      source={{ uri: resolved }}
      style={style}
      contentFit={contentFit}
      transition={200}
      onError={() => setFailed(true)}
      {...(Platform.OS === 'web' ? { referrerPolicy: 'no-referrer' as const } : {})}
    />
  );
}