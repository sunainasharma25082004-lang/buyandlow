const getPublicBaseUrl = (req) => {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL.replace(/\/$/, '');
  }

  if (req) {
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('x-forwarded-host') || req.get('host');
    if (host) return `${proto}://${host}`;
  }

  return `http://localhost:${process.env.PORT || 5000}`;
};

export { getPublicBaseUrl };