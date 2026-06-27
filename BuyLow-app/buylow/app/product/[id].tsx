import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  Animated,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import RemoteImage from '../../components/RemoteImage';
import { resolveMediaUrl } from '../../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import storage from '../../utils/storage';
import { Colors, Shadows } from '../../constants/colors';
import {
  getProduct,
  getRelatedProducts,
  formatINR,
  getDiscountPercent,
  getProductReviews,
  addProductReview,
  uploadReviewImage,
} from '../../services/api';
import ProductRail from '../../components/home/ProductRail';
import { SCREEN_WIDTH, horizontalPadding } from '../../utils/responsive';
import { Product } from '../../types/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CAROUSEL_HEIGHT = Math.min(SCREEN_WIDTH * 0.85, 360);

const ReviewPhotos = ({ images }: { images?: string[] }) => {
  if (!images?.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotosRow}>
      {images.map((img, idx) => (
        <RemoteImage key={`${img}-${idx}`} uri={img} style={styles.reviewPhoto} contentFit="cover" />
      ))}
    </ScrollView>
  );
};

export default function ProductDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState<any | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, user, token } = useAuth();
  
  const isFaved = product ? isInWishlist(product._id) : false;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(''));
  };

  const loadReviewsData = useCallback(async (prodId: string) => {
    try {
      const res = await getProductReviews(prodId, token);
      if (res.success) {
        setReviews(res.reviews || []);
        setAverageRating(res.averageRating || 0);
        setTotalReviews(res.totalReviews || 0);
        setUserReview(res.userReview);
      }
    } catch (e) {
      console.warn('Could not fetch reviews', e);
    }
  }, [token]);

  useEffect(() => {
    if (!id) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    let active = true;

    getProduct(id)
      .then(async (prod) => {
        if (!active) return;
        setProduct(prod);
        loadReviewsData(prod._id);

        if (prod.category) {
          setRelatedLoading(true);
          getRelatedProducts(prod.category, prod._id, 8)
            .then((items) => { if (active) setRelatedProducts(items); })
            .catch(() => { if (active) setRelatedProducts([]); })
            .finally(() => { if (active) setRelatedLoading(false); });
        }

        try {
          const stored = await storage.getItem('recently_viewed');
          let recent = stored ? JSON.parse(stored) : [];
          recent = recent.filter((item: Product) => item._id !== prod._id);
          recent.unshift(prod);
          if (recent.length > 10) recent.pop();
          await storage.setItem('recently_viewed', JSON.stringify(recent));
        } catch (e) {
          console.error('Failed to save recently viewed', e);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load product');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, token, loadReviewsData]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product, 1);
      triggerToast('Added to Shopping Cart!');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.name} on BuyLow India! Only ₹${formatINR(product.price)}`,
        url: resolveMediaUrl(product.image),
        title: product.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to your wishlist.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    if (product) {
      try {
        await toggleWishlist(product._id);
        triggerToast(!isFaved ? 'Added to Wishlist!' : 'Removed from Wishlist!');
      } catch {
        Alert.alert('Error', 'Failed to update wishlist. Please try again.');
      }
    }
  };

  const appendReviewPhotos = (uris: string[]) => {
    setReviewPhotos((prev) => [...prev, ...uris].slice(0, 5));
  };

  const pickReviewPhotos = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera/photo access to upload review images.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: 5 - reviewPhotos.length,
          quality: 0.8,
        });

    if (!result.canceled && result.assets?.length) {
      appendReviewPhotos(result.assets.map((a) => a.uri));
    }
  };

  const handleOpenReviewForm = () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to rate and review this product.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (userReview) {
      setNewRating(userReview.rating);
      setNewComment(userReview.comment);
      setReviewPhotos(userReview.images || []);
    } else {
      setNewRating(5);
      setNewComment('');
      setReviewPhotos([]);
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to post reviews.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    if (!newComment.trim()) {
      Alert.alert('Input Error', 'Please write a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const uploadedUrls: string[] = [];
      for (const uri of reviewPhotos) {
        if (uri.startsWith('http') || uri.startsWith('/uploads')) {
          uploadedUrls.push(uri);
        } else {
          const url = await uploadReviewImage(uri, token);
          uploadedUrls.push(url);
        }
      }

      const res = await addProductReview(
        product!._id,
        newRating,
        newComment,
        token,
        uploadedUrls,
      );
      if (res.success) {
        Alert.alert('Review Saved', 'Thank you for your feedback!');
        setNewComment('');
        setReviewPhotos([]);
        setShowReviewForm(false);
        await loadReviewsData(product!._id);
        if (product) {
          const updated = await getProductReviews(product._id, token);
          if (updated.success && updated.averageRating) {
            setAverageRating(updated.averageRating);
            setTotalReviews(updated.totalReviews || 0);
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {toastMessage ? (
        <Animated.View style={[styles.toastContainer, { opacity: toastAnim }]}>
          <Feather name="check-circle" size={16} color={Colors.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.imageContainer, { height: CAROUSEL_HEIGHT }]}>
          {images.length > 1 ? (
            <>
              <Carousel
                loop
                width={SCREEN_WIDTH}
                height={CAROUSEL_HEIGHT}
                autoPlay={false}
                data={images}
                scrollAnimationDuration={800}
                onSnapToItem={setImageIndex}
                renderItem={({ item }) => (
                  <View style={styles.carouselImageWrap}>
                    <RemoteImage uri={item} style={styles.image} contentFit="contain" />
                  </View>
                )}
              />
              <View style={styles.dotsRow}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[styles.dot, idx === imageIndex && styles.dotActive]}
                  />
                ))}
              </View>
            </>
          ) : (
            <RemoteImage uri={product.image} style={styles.image} contentFit="contain" />
          )}

          {discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}% OFF</Text>
            </View>
          )}

          <TouchableOpacity style={styles.favButton} onPress={handleWishlist}>
            <Ionicons name={isFaved ? "heart" : "heart-outline"} size={26} color={isFaved ? Colors.secondary : Colors.textLight} />
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
              <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
              <Ionicons name="star" size={13} color={Colors.white} />
            </View>
            <Text style={styles.ratingCount}>{totalReviews} customer reviews</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description || 'No description available for this product.'}</Text>

          <View style={styles.divider} />

          <View style={styles.relatedSection}>
            <ProductRail
              title="Related Products"
              subtitle={`More in ${product.category}`}
              icon="layers"
              products={relatedProducts}
              loading={relatedLoading}
              emptyText={relatedLoading ? '' : 'No related products found'}
              showDiscount
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>

          {!userReview && !showReviewForm ? (
            <TouchableOpacity style={styles.reviewCtaCard} onPress={handleOpenReviewForm} activeOpacity={0.9}>
              <View style={styles.reviewCtaLeft}>
                <Text style={styles.reviewCtaTitle}>Rate this product</Text>
                <Text style={styles.reviewCtaSub}>
                  {user ? 'Share rating, comment & photos' : 'Login to write a review'}
                </Text>
                <View style={styles.starsPreview}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star-outline" size={18} color={Colors.secondary} />
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}

          {showReviewForm ? (
            <View style={styles.writeReviewBox}>
              <View style={styles.writeReviewHeader}>
                <Text style={styles.writeReviewTitle}>{userReview ? 'Edit Your Review' : 'Your Review'}</Text>
                <TouchableOpacity onPress={() => setShowReviewForm(false)}>
                  <Text style={styles.cancelReview}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.starsSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setNewRating(star)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
                    <Ionicons
                      name={star <= newRating ? 'star' : 'star-outline'}
                      size={32}
                      color={Colors.secondary}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingHint}>{newRating}/5</Text>
              </View>

              <Text style={styles.ratingLabel}>Your Comment</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Tell others about quality, delivery, value for money..."
                placeholderTextColor={Colors.textLight}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                underlineColorAndroid="transparent"
                selectionColor={Colors.primary}
              />
              <Text style={styles.charCount}>{newComment.length}/500</Text>

              <Text style={styles.photoLabel}>Add Photos (optional, max 5)</Text>
              <View style={styles.reviewPhotoPicker}>
                {reviewPhotos.map((uri, idx) => (
                  <View key={`${uri}-${idx}`} style={styles.pickedPhotoWrap}>
                    <RemoteImage uri={uri} style={styles.pickedPhoto} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => setReviewPhotos((p) => p.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close" size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                {reviewPhotos.length < 5 && (
                  <>
                    <TouchableOpacity style={styles.addPhotoBtn} onPress={() => pickReviewPhotos(false)}>
                      <Ionicons name="images-outline" size={22} color={Colors.primary} />
                      <Text style={styles.addPhotoText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addPhotoBtn} onPress={() => pickReviewPhotos(true)}>
                      <Ionicons name="camera-outline" size={22} color={Colors.primary} />
                      <Text style={styles.addPhotoText}>Camera</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitReviewBtn, submittingReview && styles.submitReviewDisabled]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color={Colors.white} />
                    <Text style={styles.submitReviewText}>Submit Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.reviewsCountTitle}>
              {totalReviews} Customer Review{totalReviews === 1 ? '' : 's'}
            </Text>
            {userReview && !showReviewForm ? (
              <TouchableOpacity onPress={handleOpenReviewForm}>
                <Text style={styles.writeReviewLink}>Edit Review</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {userReview && !showReviewForm ? (
            <View style={styles.userReviewBox}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>Your Review (Verified)</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Ionicons key={i} name="star" size={12} color={i <= userReview.rating ? Colors.secondary : Colors.border} />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{userReview.comment}</Text>
              <ReviewPhotos images={userReview.images} />
            </View>
          ) : null}

          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to share your opinion!</Text>
          ) : (
            reviews.filter(r => r._id !== userReview?._id).map((rev) => (
              <View key={rev._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{rev.userName || 'Verified Buyer'}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Ionicons key={i} name="star" size={12} color={i <= rev.rating ? Colors.secondary : Colors.border} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{rev.comment}</Text>
                <ReviewPhotos images={rev.images} />
                <Text style={styles.reviewDate}>
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            ))
          )}

        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomBarWrap}>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Feather name="shopping-cart" size={18} color={Colors.primary} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={() => { handleAddToCart(); router.push('/cart'); }}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
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
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 999,
    gap: 8,
    ...Shadows.medium,
  },
  toastText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(21,101,192,0.25)',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
  imageContainer: {
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
    maxWidth: 280,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  favButton: {
    position: 'absolute',
    bottom: -16,
    right: 24,
    backgroundColor: Colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
    zIndex: 10,
  },
  detailsContainer: {
    paddingHorizontal: horizontalPadding,
    paddingTop: 28,
    paddingBottom: 20,
  },
  brand: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 26,
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
    marginBottom: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  ratingValue: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  ratingCount: {
    fontSize: 13,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  relatedSection: {
    marginHorizontal: -horizontalPadding,
    marginBottom: 4,
  },
  reviewCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightBlue,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  reviewCtaLeft: {
    flex: 1,
    paddingRight: 12,
  },
  reviewCtaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewCtaSub: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  starsPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewsCountTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  writeReviewLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  noReviewsText: {
    color: Colors.textLight,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  writeReviewBox: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 20,
    ...Shadows.small,
  },
  writeReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  writeReviewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  cancelReview: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  starsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingHint: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
    marginLeft: 4,
  },
  reviewInput: {
    backgroundColor: '#E8F1FB',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    fontSize: 15,
    color: Colors.text,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'right',
    marginBottom: 12,
  },
  submitReviewBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitReviewDisabled: {
    opacity: 0.7,
  },
  submitReviewText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  userReviewBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewItem: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontWeight: '700',
    color: Colors.text,
    fontSize: 13,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  reviewPhotosRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  reviewPhoto: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  reviewPhotoPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  pickedPhotoWrap: {
    position: 'relative',
  },
  pickedPhoto: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  addPhotoText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  bottomBarWrap: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 14,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addToCartText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyNowText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
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
    fontSize: 15,
    color: Colors.text,
  },
});
