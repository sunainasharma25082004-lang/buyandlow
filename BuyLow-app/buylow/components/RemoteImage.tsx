import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageStyle } from 'expo-image';
import { Platform, StyleProp, StyleSheet, View } from 'react-native';
import { resolveMediaUrl } from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../constants/images';
import { Colors } from '../constants/colors';
import Skeleton from './ui/Skeleton';

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
  const [loaded, setLoaded] = useState(false);

  const primaryUri = useMemo(
    () => resolveMediaUrl(uri) || fallback,
    [uri, fallback],
  );
  const displayUri = failed ? fallback : primaryUri;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [uri]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setLoaded(false);
      return;
    }
    setLoaded(true);
  };

  return (
    <View style={[styles.wrap, style]}>
      {!loaded ? (
        <Skeleton borderRadius={0} style={StyleSheet.absoluteFillObject} />
      ) : null}
      <Image
        key={displayUri}
        source={{ uri: displayUri }}
        style={[StyleSheet.absoluteFillObject, loaded ? styles.visible : styles.hidden]}
        contentFit={contentFit}
        transition={200}
        onLoad={handleLoad}
        onError={handleError}
        recyclingKey={displayUri}
        {...(Platform.OS === 'web' ? { referrerPolicy: 'no-referrer' as const } : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: Colors.lightBlue,
  },
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
});