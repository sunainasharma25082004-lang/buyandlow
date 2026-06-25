import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../../constants/colors';
import { getProduct, resolveMediaUrl, formatINR, getDiscountPercent } from '../../services/api';
import { Product } from '../../types/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, user } = useAuth();
  
  const isFaved = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    if (!id) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    let active = true;
    getProduct(id)
      .then(async (prod) => {
        if (active) {
          setProduct(prod);
          // Add to recently viewed
          try {
            const stored = await AsyncStorage.getItem('recently_viewed');
            let recent = stored ? JSON.parse(stored) : [];
            recent = recent.filter((item: Product) => item._id !== prod._id);
            recent.unshift(prod);
            if (recent.length > 10) recent.pop();
            await AsyncStorage.setItem('recently_viewed', JSON.stringify(recent));
          } catch (e) { console.error('Failed to save recently viewed', e); }
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load product');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product, 1);
      alert('Added to cart!');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.name} on BuyLow India! Only ₹${formatINR(product.price)}`,
        url: resolveMediaUrl(product.image), // Optional if app has deep links
        title: product.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      alert('Please login to add to wishlist');
      return;
    }
    if (product) {
      try {
        await toggleWishlist(product._id);
      } catch {
        alert('Failed to update wishlist');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const discount = getDiscountPercent(product.price, product.oldPrice);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {images.length > 1 ? (
            <Carousel
              loop
              width={width}
              height={300}
              autoPlay={false}
              data={images}
              scrollAnimationDuration={1000}
              renderItem={({ item }) => (
                <View style={styles.carouselImageWrap}>
                  <Image source={{ uri: resolveMediaUrl(item) }} style={styles.image} contentFit="contain" />
                </View>
              )}
            />
          ) : (
            <Image
              source={{ uri: resolveMediaUrl(product.image) }}
              style={styles.image}
              contentFit="contain"
            />
          )}

          {discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          <TouchableOpacity style={styles.favButton} onPress={handleWishlist}>
            <Ionicons name={isFaved ? "heart" : "heart-outline"} size={28} color={isFaved ? Colors.secondary : Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{formatINR(product.price)}</Text>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>₹{formatINR(product.oldPrice)}</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingValue}>{product.rating ?? 0}</Text>
              <Ionicons name="star" size={14} color={Colors.white} />
            </View>
            <Text style={styles.ratingCount}>{product.reviews ?? 0} verified reviews</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description || 'No description available for this product.'}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {(product.reviews ?? 0) === 0 ? (
             <Text style={styles.description}>No reviews yet. Be the first to review!</Text>
          ) : (
             <View style={styles.reviewItem}>
               <View style={styles.reviewHeader}>
                 <Text style={styles.reviewAuthor}>Verified Buyer</Text>
                 <View style={styles.reviewStars}>
                   {[1,2,3,4,5].map(i => (
                     <Ionicons key={i} name="star" size={12} color={i <= (product.rating || 0) ? Colors.secondary : Colors.border} />
                   ))}
                 </View>
               </View>
               <Text style={styles.reviewText}>Great product! Exactly as described.</Text>
             </View>
          )}

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Feather name="shopping-cart" size={20} color={Colors.primary} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={() => { handleAddToCart(); router.push('/cart'); }}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
  },
  imageContainer: {
    height: 300,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  carouselImageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: 300,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  favButton: {
    position: 'absolute',
    bottom: -16,
    right: 24,
    backgroundColor: Colors.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
    zIndex: 10,
  },
  detailsContainer: {
    padding: 24,
    paddingTop: 32,
  },
  brand: {
    fontSize: 13,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
  },
  oldPrice: {
    fontSize: 16,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingValue: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  reviewItem: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    color: Colors.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyNowText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
});
