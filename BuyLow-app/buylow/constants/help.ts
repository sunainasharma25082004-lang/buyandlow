import type { TranslateFn } from '../i18n';

export type HelpQuestion = {
  id: string;
  question: string;
  answer: string;
};

export const getFaqItems = (t: TranslateFn): HelpQuestion[] => [
  {
    id: 'track-order',
    question: t('help.faq.trackOrderQ'),
    answer: t('help.faq.trackOrderA'),
  },
  {
    id: 'delivery-time',
    question: t('help.faq.deliveryTimeQ'),
    answer: t('help.faq.deliveryTimeA'),
  },
  {
    id: 'return-policy',
    question: t('help.faq.returnPolicyQ'),
    answer: t('help.faq.returnPolicyA'),
  },
  {
    id: 'payment-methods',
    question: t('help.faq.paymentMethodsQ'),
    answer: t('help.faq.paymentMethodsA'),
  },
  {
    id: 'cancel-order',
    question: t('help.faq.cancelOrderQ'),
    answer: t('help.faq.cancelOrderA'),
  },
  {
    id: 'refund-status',
    question: t('help.faq.refundStatusQ'),
    answer: t('help.faq.refundStatusA'),
  },
];

export const getCallbackSlots = (t: TranslateFn): string[] => [
  t('help.slots.withinHour'),
  t('help.slots.afternoon'),
  t('help.slots.evening'),
  t('help.slots.tomorrow'),
];