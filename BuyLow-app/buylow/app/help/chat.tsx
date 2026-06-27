import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { COMMON_QUESTIONS } from '../../constants/help';
import HelpHeader from '../../components/HelpHeader';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';

type ChatMessage = {
  id: string;
  text: string;
  sender: 'bot' | 'user' | 'system';
};

const WELCOME_MESSAGE =
  'Hi! Welcome to BuyLow Support 👋\nPick a common question below or type your message.';

const ESCALATION_MESSAGE =
  'Thank you for your patience. We are connecting you with our team manager. They will assist you shortly.';

const OTHER_ISSUE_MESSAGE =
  'In common questions ke alawa koi aur issue hai? Neeche "Request Call Back" dabayein — hum aapko phone par contact karenge.';

const buildChatSummary = (messages: ChatMessage[]) =>
  messages
    .filter((m) => m.sender !== 'system')
    .map((m) => `${m.sender === 'user' ? 'Customer' : 'Support'}: ${m.text}`)
    .join('\n');

export default function HelpChatScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const listRef = useRef<FlatList>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', text: WELCOME_MESSAGE, sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [interactionCount, setInteractionCount] = useState(0);
  const [escalated, setEscalated] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (user?.name) setContactName(user.name);
    if (user?.email) setContactEmail(user.email);
  }, [user?.name, user?.email]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, botTyping, escalated, scrollToEnd]);

  const submitChatToAdmin = useCallback(async (chatMessages: ChatMessage[]) => {
    const summary = buildChatSummary(chatMessages);
    if (!summary.trim()) {
      Alert.alert('Support', 'Please send a message or pick a question first.');
      return false;
    }

    const name = contactName.trim() || user?.name?.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter your name so our team can contact you.');
      return false;
    }

    setSubmittingRequest(true);
    try {
      await api.submitChatSupportRequest(
        {
          name,
          email: contactEmail.trim() || user?.email || '',
          phone: contactPhone.replace(/\D/g, ''),
          chatSummary: summary,
          note: 'Customer wants to talk with team manager via chat',
        },
        token,
      );
      setRequestSent(true);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not send to admin. Check internet & backend.';
      Alert.alert('Support Request Failed', message);
      return false;
    } finally {
      setSubmittingRequest(false);
    }
  }, [contactEmail, contactName, contactPhone, token, user?.email, user?.name]);

  const escalateToManager = useCallback(async () => {
    if (escalated) return;

    const name = contactName.trim() || user?.name?.trim();
    if (!name) {
      Alert.alert('Name required', 'Apna naam likhein taaki team aap se contact kar sake.');
      return;
    }

    setEscalated(true);
    setBotTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sent = await submitChatToAdmin(messagesRef.current);
    setBotTyping(false);

    if (sent) {
      setMessages((prev) => [
        ...prev,
        { id: `system-${Date.now()}`, text: ESCALATION_MESSAGE, sender: 'system' },
        { id: `bot-other-${Date.now()}`, text: OTHER_ISSUE_MESSAGE, sender: 'bot' },
        {
          id: `system-sent-${Date.now()}`,
          text: '✅ Aapki request admin panel par bhej di gayi hai. Hamari team jald contact karegi.',
          sender: 'system',
        },
      ]);
    } else {
      setEscalated(false);
    }
  }, [contactName, escalated, submitChatToAdmin, user?.name]);

  const addBotReply = useCallback(
    (text: string, onDone?: () => void) => {
      setBotTyping(true);
      setTimeout(() => {
        setBotTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}`, text, sender: 'bot' },
        ]);
        onDone?.();
      }, 900);
    },
    [],
  );

  const handleQuestionPress = (questionId: string, question: string, answer: string) => {
    if (escalated || answeredIds.has(questionId)) return;

    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, text: question, sender: 'user' }]);
    setAnsweredIds((prev) => new Set(prev).add(questionId));

    const nextCount = interactionCount + 1;
    setInteractionCount(nextCount);

    addBotReply(answer, () => {
      addBotReply(
        'Kisi aur issue ke liye neeche apna naam/email likhein, phir "Connect with Team Manager" dabayein.',
      );
    });
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || escalated) return;

    setInput('');
    setInteractionCount((c) => c + 1);
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, text: trimmed, sender: 'user' }]);

    addBotReply(
      'Thanks! Apna naam & email neeche confirm karein, phir "Connect with Team Manager" par tap karein.',
    );
  };

  const goToCallBack = () => {
    const summary = buildChatSummary(messages);
    router.push({
      pathname: '/help/callback',
      params: {
        note: summary ? `From chat support:\n${summary.slice(0, 400)}` : 'Requested from chat support',
        source: 'chat',
      },
    } as any);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemBubble}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser ? (
          <View style={styles.avatarBot}>
            <Ionicons name="headset" size={16} color={Colors.white} />
          </View>
        ) : null}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const availableQuestions = COMMON_QUESTIONS.filter((q) => !answeredIds.has(q.id));
  const showContactForm = interactionCount >= 1 && !requestSent;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HelpHeader title="Chat with Us" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <>
              {botTyping || submittingRequest ? (
                <View style={styles.typingRow}>
                  <View style={styles.avatarBot}>
                    <Ionicons name="headset" size={16} color={Colors.white} />
                  </View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.typingText}>
                      {submittingRequest ? 'Admin ko bhej rahe hain...' : 'Typing...'}
                    </Text>
                  </View>
                </View>
              ) : null}

              {showContactForm ? (
                <View style={styles.contactCard}>
                  <Text style={styles.contactTitle}>Aapki details (team contact karegi)</Text>
                  <TextInput
                    style={styles.contactInput}
                    placeholder="Your name *"
                    placeholderTextColor={Colors.textLight}
                    value={contactName}
                    onChangeText={setContactName}
                  />
                  <TextInput
                    style={styles.contactInput}
                    placeholder="Email"
                    placeholderTextColor={Colors.textLight}
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.contactInput}
                    placeholder="Phone (optional)"
                    placeholderTextColor={Colors.textLight}
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              ) : null}

              {!escalated && availableQuestions.length > 0 ? (
                <View style={styles.questionsBlock}>
                  <Text style={styles.questionsLabel}>Common questions</Text>
                  {availableQuestions.map((q) => (
                    <TouchableOpacity
                      key={q.id}
                      style={styles.questionChip}
                      onPress={() => handleQuestionPress(q.id, q.question, q.answer)}
                    >
                      <Text style={styles.questionChipText}>{q.question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {!escalated && interactionCount >= 1 ? (
                <TouchableOpacity style={styles.managerBtn} onPress={escalateToManager}>
                  <Ionicons name="person-circle-outline" size={20} color={Colors.white} />
                  <Text style={styles.managerBtnText}>Connect with Team Manager</Text>
                </TouchableOpacity>
              ) : null}

              {escalated ? (
                <TouchableOpacity style={styles.callbackBtn} onPress={goToCallBack}>
                  <Ionicons name="call" size={20} color={Colors.primary} />
                  <Text style={styles.callbackBtnText}>Request Call Back</Text>
                </TouchableOpacity>
              ) : null}
            </>
          }
        />

        <SafeAreaView edges={['bottom']} style={styles.inputSafe}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder={escalated ? 'Use Request Call Back for other issues' : 'Type your message...'}
              placeholderTextColor={Colors.textLight}
              value={input}
              onChangeText={setInput}
              editable={!escalated}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || escalated) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || escalated}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  avatarBot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    ...Shadows.small,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: Colors.white,
  },
  systemBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.lightBlue,
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  systemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
  },
  contactInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadows.small,
  },
  typingText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  questionsBlock: {
    marginTop: 8,
    marginBottom: 8,
  },
  questionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  questionChip: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionChipText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  managerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    ...Shadows.small,
  },
  managerBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  callbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.small,
  },
  callbackBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  inputSafe: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});