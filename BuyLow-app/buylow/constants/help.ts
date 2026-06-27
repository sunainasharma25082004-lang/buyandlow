export type HelpQuestion = {
  id: string;
  question: string;
  answer: string;
};

export const COMMON_QUESTIONS: HelpQuestion[] = [
  {
    id: 'track-order',
    question: 'How do I track my order?',
    answer:
      'Go to My Orders in your account. Tap any order to see live status — Placed, Confirmed, Packed, Shipped and Delivered.',
  },
  {
    id: 'delivery-time',
    question: 'How long does delivery take?',
    answer:
      'Most orders arrive in 3–7 business days. You will see the expected delivery date on your order details page.',
  },
  {
    id: 'return-policy',
    question: 'What is your return policy?',
    answer:
      'You can request a return within 7 days of delivery for unused items in original packaging. Contact support with your order ID.',
  },
  {
    id: 'payment-methods',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept UPI, debit/credit cards, net banking and wallets through Razorpay. Cash on delivery is available on select orders.',
  },
  {
    id: 'cancel-order',
    question: 'Can I cancel my order?',
    answer:
      'Yes, before your order is shipped. Open My Orders, select the order and tap Cancel if the option is available.',
  },
  {
    id: 'refund-status',
    question: 'When will I get my refund?',
    answer:
      'Refunds are processed within 5–7 business days after return approval. The amount is credited to your original payment method.',
  },
];

export const CALLBACK_TIME_SLOTS = [
  'Within 1 hour',
  'Today afternoon',
  'Today evening',
  'Tomorrow morning',
];