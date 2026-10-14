import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

type CategoryTab = {
  id: string;
  label: string;
  iconType: 'feather' | 'ionicons' | 'mci';
  iconName: string;
  route?: string;
};

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All', iconType: 'feather', iconName: 'grid' },
  { id: 'electronics', label: 'Electronics', iconType: 'feather', iconName: 'headphones', route: '/category/Electronics' },
  { id: 'crockry', label: 'Crockery', iconType: 'ionicons', iconName: 'cafe-outline', route: '/category/crockry' },
  { id: 'kitchen', label: 'Kitchen', iconType: 'mci', iconName: 'blender-outline', route: '/category/crockry' },
  { id: 'homeliving', label: 'Home Decor', iconType: 'feather', iconName: 'home', route: '/category/crockry' },
  { id: 'deals', label: 'Festive Deals', iconType: 'feather', iconName: 'gift', route: '/(tabs)/search' },
  { id: 'under199', label: 'Under ₹199', iconType: 'feather', iconName: 'tag', route: '/(tabs)/search' },
];

type Props = {
  activeId?: string;
  onSelect?: (id: string) => void;
};

export default function QuickCategoryNav({ activeId = 'all', onSelect }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(activeId);

  const handlePress = (tab: CategoryTab) => {
    setSelected(tab.id);
    if (onSelect) {
      onSelect(tab.id);
    }
    if (tab.route && tab.id !== 'all') {
      router.push(tab.route as any);
    }
  };

  const renderIcon = (tab: CategoryTab, isSelected: boolean) => {
    const color = isSelected ? '#0F172A' : '#64748B';
    const size = 18;

    if (tab.iconType === 'ionicons') {
      return <Ionicons name={tab.iconName as any} size={size} color={color} />;
    }
    if (tab.iconType === 'mci') {
      return <MaterialCommunityIcons name={tab.iconName as any} size={size} color={color} />;
    }
    return <Feather name={tab.iconName as any} size={size} color={color} />;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((tab) => {
          const isSelected = selected === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handlePress(tab)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                {renderIcon(tab, isSelected)}
              </View>
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                {tab.label}
              </Text>
              {isSelected ? <View style={styles.activeIndicator} /> : <View style={styles.inactiveIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    minWidth: 54,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconBoxSelected: {
    backgroundColor: '#F1F5F9',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  tabLabelSelected: {
    fontWeight: '800',
    color: '#0F172A',
  },
  activeIndicator: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  inactiveIndicator: {
    width: '100%',
    height: 2.5,
    backgroundColor: 'transparent',
  },
});
