import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as api from '../../services/api';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../constants/colors';
import { CALLBACK_TIME_SLOTS } from '../../constants/help';
import { useAuth } from '../../context/AuthContext';
import HelpHeader from '../../components/HelpHeader';

export default function CallbackScreen() {
  const params = useLocalSearchParams<{ note?: string; source?: string }>();
  const fromChat = params.source === 'chat';
  const { user, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [timeSlot, setTimeSlot] = useState(CALLBACK_TIME_SLOTS[0]);
  const [note, setNote] = useState(typeof params.note === 'string' ? params.note : '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedPhone = phone.replace(/\D/g, '');
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    if (trimmedPhone.length < 10) {
      Alert.alert('Invalid phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitCallbackRequest(
        {
          name: name.trim(),
          email: email.trim(),
          phone: trimmedPhone,
          preferredTime: timeSlot,
          note: note.trim(),
          chatSummary: fromChat ? note.trim() : undefined,
          source: fromChat ? 'chat' : undefined,
        },
        token,
      );
      setSubmitted(true);
      Alert.alert(
        'Request Received',
        `Thanks ${name.trim()}! Our team will call you back ${timeSlot.toLowerCase()} on +91 ${trimmedPhone}.`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not submit request. Try again.';
      Alert.alert('Submission Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <HelpHeader title="Call Me Back" />
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>We&apos;ll call you back!</Text>
          <Text style={styles.successText}>
            Our support team has received your request. You will get a call {timeSlot.toLowerCase()}.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <HelpHeader title="Call Me Back" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Ionicons name="call" size={32} color={Colors.primary} />
            <Text style={styles.introTitle}>Request a callback</Text>
            <Text style={styles.introText}>
              {fromChat
                ? 'Chat ke baad call chahiye? Number dalen — team aapko phone karegi.'
                : 'Share your number and we will call you at your preferred time.'}
            </Text>
          </View>

          <Text style={styles.label}>Your Name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={styles.label}>Preferred Time</Text>
          <View style={styles.slotsRow}>
            {CALLBACK_TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotChip, timeSlot === slot && styles.slotChipActive]}
                onPress={() => setTimeSlot(slot)}
              >
                <Text style={[styles.slotText, timeSlot === slot && styles.slotTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Note (optional)</Text>
          <View style={[styles.inputWrap, styles.textAreaWrap]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Order ID or issue details..."
              placeholderTextColor={Colors.textLight}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="call" size={20} color={Colors.white} />
            <Text style={styles.submitText}>
              {submitting ? 'Submitting...' : 'Request Call Back'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  intro: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  introText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 14,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  textAreaWrap: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 88,
    paddingTop: 14,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  slotTextActive: {
    color: Colors.white,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 28,
    ...Shadows.medium,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});