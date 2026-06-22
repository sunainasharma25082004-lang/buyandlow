const footerPages = {
  'about-us': {
    title: 'About Us',
    subtitle: 'Crafting quality experiences since day one.',
    sections: [
      {
        heading: 'Who We Are',
        body: 'buylowindia is a premium online marketplace dedicated to handcrafted products, artisanal goods, and trusted brands from around the world. We believe every purchase should feel special — from browsing to unboxing.',
      },
      {
        heading: 'Our Mission',
        body: 'To make premium quality accessible to everyone while supporting skilled artisans and ethical suppliers. We curate every product with care so you receive only the best.',
      },
      {
        heading: 'What Sets Us Apart',
        list: [
          'Handpicked products from verified sellers',
          'Secure Razorpay payments & buyer protection',
          'Transparent shipping & order tracking',
          'Dedicated customer support team',
        ],
      },
    ],
  },
  'our-story': {
    title: 'Our Story',
    subtitle: 'From a small idea to a trusted shopping destination.',
    sections: [
      {
        heading: 'The Beginning',
        body: 'buylowindia started with a simple vision: connect discerning shoppers with authentic, high-quality products that tell a story. What began as a curated collection of handcrafted items has grown into a full-scale e-commerce platform.',
      },
      {
        heading: 'Growing Together',
        body: 'Today we partner with artisans, local makers, and premium brands across Electronics, Fashion, Beauty, Home, and Food categories. Every product on our shelves is chosen for its craftsmanship, value, and trustworthiness.',
      },
      {
        heading: 'Looking Ahead',
        body: 'We continue to expand our collection, improve our technology, and deepen our commitment to customer satisfaction — because your trust is the foundation of everything we do.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    subtitle: 'Join the buylowindia team and help shape the future of premium e-commerce.',
    sections: [
      {
        heading: 'Why Work With Us',
        list: [
          'Collaborative, growth-focused culture',
          'Remote-friendly roles across departments',
          'Competitive compensation & learning budget',
          'Employee discounts on all buylowindia products',
        ],
      },
      {
        heading: 'Open Positions',
        body: 'We are always looking for passionate people in technology, operations, marketing, customer support, and merchandising. Send your resume to careers@buylowindia.com with the role title in the subject line.',
      },
      {
        heading: 'Internships',
        body: 'Students and fresh graduates are welcome to apply for 3–6 month internships in web development, digital marketing, and product management.',
      },
    ],
    cta: { label: 'Apply Now', to: '/page/contact-us', mail: 'careers@buylowindia.com' },
  },
  press: {
    title: 'Press',
    subtitle: 'Media resources and brand information for journalists.',
    sections: [
      {
        heading: 'Media Inquiries',
        body: 'For press releases, interview requests, and partnership announcements, contact our media team at press@buylowindia.com. We typically respond within 2 business days.',
      },
      {
        heading: 'Brand Assets',
        body: 'Reporters may request our official logo, brand guidelines, and high-resolution product imagery. Please include your publication name and deadline in your request.',
      },
      {
        heading: 'Recent Highlights',
        list: [
          'Launched premium handcrafted marketplace',
          'Expanded to 5 major product categories',
          'Integrated secure Razorpay checkout',
          'Reached thousands of happy customers nationwide',
        ],
      },
    ],
  },
  blog: {
    title: 'Blog',
    subtitle: 'Tips, trends, and stories from the buylowindia team.',
    sections: [
      {
        heading: 'Latest Articles',
        body: 'Our blog covers product guides, styling tips, artisan spotlights, and shopping advice. New articles are published regularly — check back soon for fresh content.',
      },
      {
        heading: 'Popular Topics',
        list: [
          'How to choose premium handcrafted gifts',
          'Home décor trends for 2026',
          'Sustainable shopping made simple',
          'Behind the scenes with our artisans',
        ],
      },
      {
        heading: 'Subscribe',
        body: 'Sign up for our newsletter on the homepage to get blog updates and exclusive offers delivered to your inbox.',
      },
    ],
    cta: { label: 'Back to Home', to: '/' },
  },
  'help-center': {
    title: 'Help Center',
    subtitle: 'Quick answers to common questions.',
    sections: [
      {
        heading: 'Account & Orders',
        list: [
          'Create an account to track orders and save your cart',
          'View order history under My Orders after signing in',
          'Update your cart and wishlist anytime when logged in',
        ],
      },
      {
        heading: 'Payments',
        body: 'We accept all major payment methods through Razorpay — cards, UPI, net banking, and wallets. All transactions are encrypted and secure.',
      },
      {
        heading: 'Still Need Help?',
        body: 'Browse our other support pages or reach out to our team directly. We are here Monday–Saturday, 9 AM – 6 PM IST.',
      },
    ],
    cta: { label: 'Contact Support', to: '/page/contact-us' },
  },
  'returns-refunds': {
    title: 'Returns & Refunds',
    subtitle: 'Hassle-free returns within 7 days of delivery.',
    sections: [
      {
        heading: 'Return Policy',
        body: 'If you receive a damaged, defective, or wrong item, you may request a return within 7 days of delivery. Products must be unused and in original packaging with tags attached.',
      },
      {
        heading: 'How to Return',
        list: [
          'Go to My Orders and select the order',
          'Contact support with your order ID and reason',
          'Our team will arrange pickup or provide return instructions',
          'Refund is processed within 5–7 business days after inspection',
        ],
      },
      {
        heading: 'Non-Returnable Items',
        body: 'Personal care products, perishable food items, and custom-made goods cannot be returned unless damaged on arrival.',
      },
    ],
    cta: { label: 'Start a Return', to: '/page/contact-us' },
  },
  'contact-us': {
    title: 'Contact Us',
    subtitle: 'We would love to hear from you.',
    sections: [
      {
        heading: 'Customer Support',
        body: 'Email: support@buylowindia.com\nPhone: +91 98765 43210\nHours: Mon–Sat, 9 AM – 6 PM IST',
      },
      {
        heading: 'Office Address',
        body: 'buylowindia HQ\n42 Artisan Lane, Connaught Place\nNew Delhi, 110001\nIndia',
      },
      {
        heading: 'Response Time',
        body: 'We aim to reply to all emails within 24 hours. For urgent order issues, mention your order ID in the subject line for faster assistance.',
      },
    ],
    showContactForm: true,
  },
  'shipping-info': {
    title: 'Shipping Info',
    subtitle: 'Fast, reliable delivery across India.',
    sections: [
      {
        heading: 'Delivery Times',
        list: [
          'Metro cities: 3–5 business days',
          'Other locations: 5–8 business days',
          'Remote areas: up to 10 business days',
        ],
      },
      {
        heading: 'Shipping Costs',
        body: 'Standard shipping is ₹49 on orders under ₹999. Orders of ₹999 and above qualify for FREE shipping. Exact shipping is calculated at checkout.',
      },
      {
        heading: 'Order Tracking',
        body: 'Once your order ships, track its status in My Orders. You will also receive expected delivery dates set by our fulfillment team.',
      },
      {
        heading: 'Packaging',
        body: 'Fragile and handcrafted items are packed with protective materials to ensure safe delivery to your doorstep.',
      },
    ],
    cta: { label: 'Track My Order', to: '/orders' },
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'Last updated: June 2026',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide when creating an account, placing orders, or contacting support — including name, email, shipping address, and phone number.',
      },
      {
        heading: 'How We Use Your Data',
        list: [
          'Process and deliver your orders',
          'Send order confirmations and shipping updates',
          'Improve our website and customer experience',
          'Prevent fraud and ensure platform security',
        ],
      },
      {
        heading: 'Data Security',
        body: 'We use industry-standard encryption and secure payment gateways. We never store your full card details on our servers.',
      },
      {
        heading: 'Your Rights',
        body: 'You may request access, correction, or deletion of your personal data by emailing privacy@buylowindia.com.',
      },
    ],
  },
  'terms-of-service': {
    title: 'Terms of Service',
    subtitle: 'Please read these terms carefully before using buylowindia.',
    sections: [
      {
        heading: 'Using Our Platform',
        body: 'By accessing buylowindia, you agree to use our services lawfully and not misuse the platform, attempt unauthorized access, or interfere with other users.',
      },
      {
        heading: 'Orders & Payments',
        body: 'All prices are listed at checkout. An order is confirmed only after successful payment. We reserve the right to cancel orders in case of pricing errors or stock unavailability.',
      },
      {
        heading: 'Product Information',
        body: 'We strive for accurate descriptions and images. Minor variations in handcrafted products are natural and not considered defects.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'buylowindia is not liable for indirect damages arising from use of our platform beyond the value of the purchased product, as permitted by applicable law.',
      },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    subtitle: 'How we use cookies on buylowindia.com',
    sections: [
      {
        heading: 'What Are Cookies',
        body: 'Cookies are small text files stored on your device that help us remember your preferences and improve your browsing experience.',
      },
      {
        heading: 'Cookies We Use',
        list: [
          'Essential cookies — required for login and cart functionality',
          'Preference cookies — remember your settings',
          'Analytics cookies — help us understand site usage',
        ],
      },
      {
        heading: 'Managing Cookies',
        body: 'You can disable cookies in your browser settings. Note that some features like cart persistence and login may not work correctly without essential cookies.',
      },
    ],
  },
};

export default footerPages;