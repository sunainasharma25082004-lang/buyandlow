export const DEFAULT_APP_BANNERS = [
  {
    label: 'LOWEST PRICES',
    title: 'Buy More,\nPay Less!',
    subtitle: 'Quality products at unbeatable prices',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80',
    route: '/(tabs)/categories',
    sortOrder: 0,
    isActive: true,
  },
  {
    label: 'NEW ARRIVALS',
    title: 'Fresh\nCollections',
    subtitle: 'Discover trending picks this season',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80',
    route: '/(tabs)/search',
    sortOrder: 1,
    isActive: true,
  },
  {
    label: 'MEGA SALE',
    title: 'Up to 50%\nOff',
    subtitle: 'Limited time deals on top brands',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=900&q=80',
    route: '/(tabs)/categories',
    sortOrder: 2,
    isActive: true,
  },
];

export const formatBanner = (banner) => ({
  _id: String(banner._id),
  label: banner.label,
  title: banner.title,
  subtitle: banner.subtitle || '',
  image: banner.image,
  route: banner.route || '/(tabs)/categories',
  sortOrder: banner.sortOrder ?? 0,
  isActive: banner.isActive !== false,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt,
});

export const normalizeBannerBody = (body) => ({
  label: body.label?.trim(),
  title: body.title?.trim(),
  subtitle: body.subtitle?.trim() || '',
  image: body.image?.trim(),
  route: body.route?.trim() || '/(tabs)/categories',
  sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 0,
  isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
});