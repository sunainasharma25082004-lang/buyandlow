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
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RemoteImage from '../../components/RemoteImage';
import { resolveMediaUrl } from '../../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import storage from '../../utils/storage';
import { Colors, Shadows, Gradients } from '../../constants/colors';
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
import { SCREEN_WIDTH } from '../../utils/responsive';
import { Product } from '../../types/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { isDeliveryAllowed, DELIVERY_CONFIG } from '../../constants/delivery';

const CAROUSEL_HEIGHT = Math.min(SCREEN_WIDTH * 0.9, 380);

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

  // Delivery Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;

  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist, user, token } = useAuth();
  const { t } = useLanguage();

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

  const loadReviewsData = useCallback(
    async (prodId: string) => {
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
    },
    [token]
  );

  useEffect(() => {
    if (!id) {
      setError(t('product.invalid'));
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
            .then((items) => {
              if (active) setRelatedProducts(items);
            })
            .catch(() => {
              if (active) setRelatedProducts([]);
            })
            .finally(() => {
              if (active) setRelatedLoading(false);
            });
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
        if (active) setError(err.message || t('product.loadFailed'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, token, loadReviewsData, t]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product, 1);
      triggerToast(t('product.addedToCart'));
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      await addToCart(product, 1);
      if (!user) {
        router.push({ pathname: '/(auth)/login', params: { returnTo: '/checkout' } });
      } else {
        router.push('/checkout');
      }
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: t('product.shareMessage', { name: product.name, price: formatINR(product.price) }),
        url: resolveMediaUrl(product.image),
        title: product.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      Alert.alert(t('auth.loginRequired'), t('auth.loginToWishlist'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.login'),
          onPress: () =>
            router.push({
              pathname: '/(auth)/login',
              params: { returnTo: `/product/${product?._id}` },
            }),
        },
      ]);
      return;
    }
    if (product) {
      try {
        await toggleWishlist(product._id);
        triggerToast(!isFaved ? t('product.addedWishlist') : t('product.removedWishlist'));
      } catch {
        Alert.alert(t('common.error'), t('product.wishlistFailed'));
      }
    }
  };

  const handleCheckPincode = () => {
    const cleanPin = pincode.trim();
    if (cleanPin.length === 6 && /^\d+$/.test(cleanPin)) {
      if (isDeliveryAllowed('zirakpur', cleanPin)) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 2);
        const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        setPincodeStatus(`Fast delivery to Zirakpur by ${formattedDate}`);
      } else {
        setPincodeStatus(DELIVERY_CONFIG.errorMessage);
      }
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code');
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
      Alert.alert(t('product.permissionNeeded'), t('product.photoPermission'));
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
      Alert.alert(t('auth.loginRequired'), t('auth.loginToReview'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.login'),
          onPress: () =>
            router.push({
              pathname: '/(auth)/login',
              params: { returnTo: `/product/${product?._id}` },
            }),
        },
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
      Alert.alert(t('auth.loginRequired'), t('product.loginToPostReview'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.login'),
          onPress: () =>
            router.push({
              pathname: '/(auth)/login',
              params: { returnTo: `/product/${product?._id}` },
            }),
        },
      ]);
      return;
    }
    if (!newComment.trim()) {
      Alert.alert(t('common.error'), t('product.reviewInputError'));
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
        uploadedUrls
      );
      if (res.success) {
        Alert.alert(t('product.reviewSaved'), t('product.reviewThanks'));
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
      Alert.alert(t('common.error'), err.message || t('product.reviewSubmitFailed'));
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
        <Text style={styles.errorText}>{error || t('product.notFound')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const discount = getDiscountPercent(product.price, product.oldPrice);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const savingsAmount = product.oldPrice && product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  const stockCount =
    (product as any).stock !== undefined
      ? Number((product as any).stock)
      : (product as any).countInStock !== undefined
      ? Number((product as any).countInStock)
      : 10;
  const inStock = stockCount > 0;
  const isLowStock = inStock && stockCount <= 5;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {toastMessage ? (
        <Animated.View style={[styles.toastContainer, { opacity: toastAnim }]}>
          <Feather name="check-circle" size={16} color={Colors.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={21} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/cart')}
            activeOpacity={0.7}
          >
            <Feather name="shopping-bag" size={20} color={Colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Product Image Carousel */}
        <View style={[styles.imageContainer, { height: CAROUSEL_HEIGHT }]}>
          {images.length > 1 ? (
            <>
              <Carousel
                loop
                width={SCREEN_WIDTH}
                height={CAROUSEL_HEIGHT}
                autoPlay={false}
                data={images}
                scrollAnimationDuration={500}
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

          {discount ? (
            <LinearGradient
              colors={['#E53935', '#C62828']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </LinearGradient>
          ) : null}

          <View style={styles.assuredPill}>
            <MaterialIcons name="verified" size={13} color="#2563EB" />
            <Text style={styles.assuredText}>BuyLow Assured</Text>
          </View>

          <TouchableOpacity style={styles.favButton} onPress={handleWishlist} activeOpacity={0.85}>
            <Ionicons
              name={isFaved ? 'heart' : 'heart-outline'}
              size={24}
              color={isFaved ? Colors.secondary : Colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsContainer}>
          {product.brand ? (
            <View style={styles.brandRow}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.brandSeparator}>•</Text>
              <Text style={styles.categoryTag}>{product.category}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{product.name}</Text>

          {/* Pricing & Savings Block */}
          <View style={styles.priceCard}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.price}>{formatINR(product.price)}</Text>
              {product.oldPrice && product.oldPrice > product.price ? (
                <Text style={styles.oldPrice}>₹{formatINR(product.oldPrice)}</Text>
              ) : null}
            </View>

            {savingsAmount > 0 ? (
              <View style={styles.savingsBanner}>
                <Ionicons name="sparkles" size={13} color="#059669" />
                <Text style={styles.savingsText}>
                  Special Price: You save ₹{formatINR(savingsAmount)} ({discount}% off)
                </Text>
              </View>
            ) : null}

            <Text style={styles.taxesText}>Inclusive of all taxes</Text>
          </View>

          {/* Rating Summary & In-Stock indicator */}
          <View style={styles.statusRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingValue}>{averageRating > 0 ? averageRating.toFixed(1) : '4.5'}</Text>
              <Ionicons name="star" size={12} color={Colors.white} />
            </View>
            <Text style={styles.ratingCount}>
              {totalReviews > 0 ? t('product.customerReviews', { count: String(totalReviews) }) : 'Ratings & Reviews'}
            </Text>

            <View style={[styles.stockStatus, isLowStock && styles.stockStatusLow, !inStock && styles.stockStatusOut]}>
              <View style={[styles.stockDot, isLowStock && styles.stockDotLow, !inStock && styles.stockDotOut]} />
              <Text style={[styles.stockText, isLowStock && styles.stockTextLow, !inStock && styles.stockTextOut]}>
                {!inStock ? 'Out of Stock' : isLowStock ? `Only ${stockCount} left!` : 'In Stock'}
              </Text>
            </View>
          </View>

          {/* E-Commerce Trust Badges Grid (Amazon / Flipkart / Meesho Style) */}
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Feather name="truck" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.trustTitle}>Free Delivery</Text>
              <Text style={styles.trustSubtitle}>Fast Dispatch</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Feather name="rotate-ccw" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.trustTitle}>7 Days Return</Text>
              <Text style={styles.trustSubtitle}>Hassle-Free</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Feather name="shield" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.trustTitle}>100% Genuine</Text>
              <Text style={styles.trustSubtitle}>Direct Quality</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Feather name="dollar-sign" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.trustTitle}>Pay On Delivery</Text>
              <Text style={styles.trustSubtitle}>Cash / UPI</Text>
            </View>
          </View>

          {/* Delivery Pincode Checker Card */}
          <View style={styles.pincodeCard}>
            <View style={styles.pincodeHeader}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.pincodeTitle}>Check Delivery (Zirakpur)</Text>
            </View>
            <View style={styles.pincodeInputRow}>
              <TextInput
                style={styles.pincodeInput}
                placeholder="Enter 6-digit Pincode"
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />
              <TouchableOpacity style={styles.pincodeCheckBtn} onPress={handleCheckPincode}>
                <Text style={styles.pincodeCheckBtnText}>Check</Text>
              </TouchableOpacity>
            </View>
            {pincodeStatus ? (
              <View style={styles.pincodeResult}>
                <Ionicons
                  name={pincodeStatus.includes('valid') ? 'alert-circle' : 'checkmark-circle'}
                  size={14}
                  color={pincodeStatus.includes('valid') ? Colors.error : Colors.success}
                />
                <Text
                  style={[
                    styles.pincodeResultText,
                    pincodeStatus.includes('valid') && { color: Colors.error },
                  ]}
                >
                  {pincodeStatus}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Product Description */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('product.description')}</Text>
            <Text style={styles.description}>{product.description || t('product.noDescription')}</Text>
          </View>

          {/* Related Products Rail */}
          {relatedProducts.length > 0 || relatedLoading ? (
            <View style={styles.relatedSection}>
              <ProductRail
                title={t('home.relatedProducts')}
                subtitle={t('home.relatedMoreIn', { category: product.category })}
                icon="layers"
                products={relatedProducts}
                loading={relatedLoading}
                emptyText={relatedLoading ? '' : t('home.noRelated')}
                showDiscount
              />
            </View>
          ) : null}

          {/* Customer Reviews & Ratings */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionTitle}>{t('product.ratingsReviews')}</Text>
              {userReview && !showReviewForm ? (
                <TouchableOpacity onPress={handleOpenReviewForm}>
                  <Text style={styles.writeReviewLink}>{t('product.editReviewLink')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {!userReview && !showReviewForm ? (
              <TouchableOpacity style={styles.reviewCtaCard} onPress={handleOpenReviewForm} activeOpacity={0.9}>
                <View style={styles.reviewCtaLeft}>
                  <Text style={styles.reviewCtaTitle}>{t('product.rateProduct')}</Text>
                  <Text style={styles.reviewCtaSub}>
                    {user ? t('product.writeReview') : t('product.loginToReview')}
                  </Text>
                  <View style={styles.starsPreview}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star-outline" size={16} color={Colors.secondary} />
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>
            ) : null}

            {showReviewForm ? (
              <View style={styles.writeReviewBox}>
                <View style={styles.writeReviewHeader}>
                  <Text style={styles.writeReviewTitle}>
                    {userReview ? t('product.editReview') : t('product.yourReview')}
                  </Text>
                  <TouchableOpacity onPress={() => setShowReviewForm(false)}>
                    <Text style={styles.cancelReview}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.ratingLabel}>{t('product.yourRating')}</Text>
                <View style={styles.starsSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewRating(star)}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    >
                      <Ionicons
                        name={star <= newRating ? 'star' : 'star-outline'}
                        size={30}
                        color={Colors.secondary}
                        style={{ marginRight: 6 }}
                      />
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.ratingHint}>{newRating}/5</Text>
                </View>

                <Text style={styles.ratingLabel}>{t('product.yourComment')}</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder={t('product.reviewPlaceholder')}
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

                <Text style={styles.photoLabel}>{t('product.addPhotos')}</Text>
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
                        <Ionicons name="images-outline" size={20} color={Colors.primary} />
                        <Text style={styles.addPhotoText}>{t('product.gallery')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.addPhotoBtn} onPress={() => pickReviewPhotos(true)}>
                        <Ionicons name="camera-outline" size={20} color={Colors.primary} />
                        <Text style={styles.addPhotoText}>{t('product.camera')}</Text>
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
                      <Text style={styles.submitReviewText}>{t('product.submitReview')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {userReview && !showReviewForm ? (
              <View style={styles.userReviewBox}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{t('product.yourReviewVerified')}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={12}
                        color={i <= userReview.rating ? Colors.secondary : Colors.border}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{userReview.comment}</Text>
                <ReviewPhotos images={userReview.images} />
              </View>
            ) : null}

            {reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>{t('product.noReviewsYet')}</Text>
            ) : (
              reviews
                .filter((r) => r._id !== userReview?._id)
                .map((rev) => (
                  <View key={rev._id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthorWrap}>
                        <Text style={styles.reviewAuthor}>{rev.userName || t('product.verifiedBuyer')}</Text>
                        <MaterialIcons name="verified" size={13} color={Colors.success} style={{ marginLeft: 4 }} />
                      </View>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={12}
                            color={i <= rev.rating ? Colors.secondary : Colors.border}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{rev.comment}</Text>
                    <ReviewPhotos images={rev.images} />
                    <Text style={styles.reviewDate}>
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Sticky Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBarWrap}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
            disabled={!inStock}
          >
            <Feather name="shopping-bag" size={18} color={Colors.primary} />
            <Text style={styles.addToCartText}>{t('product.addToCart')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyNowButtonWrap, !inStock && styles.btnDisabled]}
            onPress={handleBuyNow}
            activeOpacity={0.9}
            disabled={!inStock}
          >
            <LinearGradient
              colors={inStock ? Gradients.primary : ['#94A3B8', '#64748B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyNowGradient}
            >
              <Ionicons name="flash" size={17} color={Colors.white} />
              <Text style={styles.buyNowText}>{inStock ? t('product.buyNow') : 'Out of Stock'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
    fontWeight: '700',
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.accent,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  imageContainer: {
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  carouselImageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: 320,
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    ...Shadows.small,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  assuredPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  assuredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(21,101,192,0.2)',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
  favButton: {
    position: 'absolute',
    bottom: -18,
    right: 20,
    backgroundColor: Colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  brand: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  brandSeparator: {
    color: Colors.textLight,
    fontSize: 10,
  },
  categoryTag: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 26,
  },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 6,
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  oldPrice: {
    fontSize: 16,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    fontWeight: '500',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  savingsText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  taxesText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  ratingValue: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
    flex: 1,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockStatusLow: {
    backgroundColor: '#FFFBEB',
  },
  stockStatusOut: {
    backgroundColor: '#FEF2F2',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  stockDotLow: {
    backgroundColor: '#D97706',
  },
  stockDotOut: {
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  stockTextLow: {
    color: '#D97706',
  },
  stockTextOut: {
    color: '#EF4444',
  },
  trustGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  trustSubtitle: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  pincodeCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pincodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  pincodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  pincodeInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pincodeInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.text,
  },
  pincodeCheckBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  pincodeCheckBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  pincodeResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pincodeResultText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 21,
  },
  relatedSection: {
    marginHorizontal: -16,
    marginBottom: 4,
  },
  reviewsSection: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  writeReviewLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  reviewCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  reviewCtaLeft: {
    flex: 1,
    paddingRight: 10,
  },
  reviewCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  reviewCtaSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  starsPreview: {
    flexDirection: 'row',
    gap: 3,
  },
  writeReviewBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  writeReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  writeReviewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  cancelReview: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textLight,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  starsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingHint: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textLight,
    marginLeft: 4,
  },
  reviewInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'right',
    marginBottom: 10,
  },
  photoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  reviewPhotoPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pickedPhotoWrap: {
    position: 'relative',
  },
  pickedPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  addPhotoText: {
    fontSize: 9,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  submitReviewBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitReviewDisabled: {
    opacity: 0.7,
  },
  submitReviewText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  userReviewBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  reviewItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontWeight: '700',
    color: Colors.text,
    fontSize: 12,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    color: '#334155',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  reviewPhotosRow: {
    marginTop: 6,
    marginBottom: 4,
  },
  reviewPhoto: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: 6,
  },
  noReviewsText: {
    color: Colors.textLight,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  bottomBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Shadows.large,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  addToCartText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  buyNowButtonWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyNowGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  buyNowText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
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
