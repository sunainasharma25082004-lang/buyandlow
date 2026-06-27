export const PLACEHOLDER_PRODUCT =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

export const PLACEHOLDER_CATEGORY =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80';

export const BANNER_SLIDES = [
  {
    id: '1',
    label: 'LOWEST PRICES',
    title: 'Buy More,\nPay Less!',
    subtitle: 'Quality products at unbeatable prices',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80',
    route: '/(tabs)/categories' as const,
  },
  {
    id: '2',
    label: 'NEW ARRIVALS',
    title: 'Fresh\nCollections',
    subtitle: 'Discover trending picks this season',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80',
    route: '/(tabs)/search' as const,
  },
  {
    id: '3',
    label: 'MEGA SALE',
    title: 'Up to 50%\nOff',
    subtitle: 'Limited time deals on top brands',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=900&q=80',
    route: '/(tabs)/categories' as const,
  },
];

export const FEATURE_IMAGES = {
  delivery: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&q=80',
  secure: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&q=80',
  returns: 'https://images.unsplash.com/photo-1580674285054-bed3ef703c55?w=200&q=80',
  support: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200&q=80',
};