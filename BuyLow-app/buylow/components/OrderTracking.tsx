import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { Order } from '../types/api';
import { getOrderStatus } from '../services/api';
import { ORDER_TRACKING_STEPS, getActiveStepIndex } from '../utils/orderTracking';

type Props = {
  order: Order;
};

const STEP_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  placed: 'clipboard',
  confirmed: 'check-circle',
  packed: 'box',
  shipped: 'send',
  out_for_delivery: 'truck',
  delivered: 'package',
};

export default function OrderTracking({ order }: Props) {
  const status = getOrderStatus(order);

  if (status === 'cancelled') {
    return (
      <View style={styles.cancelledBox}>
        <Feather name="x-circle" size={18} color={Colors.error} />
        <Text style={styles.cancelledText}>Order cancelled</Text>
      </View>
    );
  }

  const activeIndex = getActiveStepIndex(order);

  return (
    <View style={styles.timeline}>
      {ORDER_TRACKING_STEPS.map((step, index) => {
        const done = index <= activeIndex;
        const current = index === activeIndex;
        const icon = STEP_ICONS[step.key] || 'circle';

        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  current && styles.stepDotCurrent,
                ]}
              >
                <Feather
                  name={icon}
                  size={14}
                  color={done ? Colors.white : Colors.textLight}
                />
              </View>
              {index < ORDER_TRACKING_STEPS.length - 1 ? (
                <View style={[styles.stepLine, done && index < activeIndex && styles.stepLineDone]} />
              ) : null}
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone, current && styles.stepLabelCurrent]}>
                {step.label}
              </Text>
              <Text style={styles.stepHint}>{step.hint}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: {
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepLeft: {
    width: 36,
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: Colors.accent,
    borderColor: Colors.primary,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: Colors.primary,
  },
  stepBody: {
    flex: 1,
    paddingBottom: 12,
    paddingLeft: 8,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
  },
  stepLabelDone: {
    color: Colors.text,
  },
  stepLabelCurrent: {
    color: Colors.primary,
    fontWeight: '800',
  },
  stepHint: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cancelledText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
});