import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import RemoteImage from '../../components/RemoteImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import storage from '../../utils/storage';

import { Colors, Shadows } from '../../constants/colors';
import { formatINR, getProducts } from '../../services/api';
import type { Product } from '../../types/api';

export default function SearchScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
    }, [])
  );

  const loadRecentSearches = async () => {
    try {
      const stored = await storage.getItem('recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) { console.error(e); }
  };

  const saveRecentSearch = async (term: string) => {
    if (!term.trim()) return;
    try {
      const stored = await storage.getItem('recent_searches');
      let recent: string[] = stored ? JSON.parse(stored) : [];
      recent = recent.filter(t => t.toLowerCase() !== term.toLowerCase());
      recent.unshift(term.trim());
      if (recent.length > 5) recent.pop();
      await storage.setItem('recent_searches', JSON.stringify(recent));
      setRecentSearches(recent);
    } catch (e) { console.error(e); }
  };

  const clearRecentSearches = async () => {
    await storage.removeItem('recent_searches');
    setRecentSearches([]);
  };

  useEffect(() => {
    if (!keyword.trim()) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      getProducts({ keyword: keyword.trim(), limit: 20 })
        .then((res) => {
          setProducts(res.products || []);
          if (res.products && res.products.length > 0) {
            saveRecentSearch(keyword);
          }
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.inputContainer}>
          <Feather name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            placeholder="Search for products, brands and more..."
            placeholderTextColor={Colors.textLight}
            style={styles.input}
            value={keyword}
            onChangeText={setKeyword}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : !keyword.trim() ? (
        <View style={styles.recentContainer}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentTags}>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.recentTag}
                    onPress={() => setKeyword(term)}
                  >
                    <Feather name="clock" size={14} color={Colors.textLight} />
                    <Text style={styles.recentTagText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.stateBox}>
               <Feather name="search" size={48} color={Colors.border} style={{marginBottom: 16}} />
               <Text style={styles.stateText}>Start typing to search for trendy products.</Text>
            </View>
          )}
        </View>
      ) : products.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{`No products found for "${keyword}".`}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultCard}
              onPress={() => router.push(`/product/${item._id}`)}
            >
              <View style={styles.imageWrap}>
                <RemoteImage uri={item.image} style={styles.resultImage} contentFit="contain" />
              </View>
              <View style={styles.resultBody}>
                <Text style={styles.resultBrand}>{item.brand}</Text>
                <Text style={styles.resultTitle} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.resultPrice}>₹{formatINR(item.price)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.text,
  },
  recentContainer: {
    flex: 1,
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  clearText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  recentTagText: {
    fontSize: 14,
    color: Colors.text,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  resultCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  imageWrap: {
    width: 90,
    height: 90,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultBody: {
    flex: 1,
    justifyContent: 'center',
  },
  resultBrand: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  stateBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});