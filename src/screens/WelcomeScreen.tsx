import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Platform, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

// --- LocalStorage helper (same pattern as AppContext) ---
const storage = {
  get: (key: string): string | null => {
    try { return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null; }
    catch { return null; }
  },
  set: (key: string, val: string): void => {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, val); }
    catch { /* noop */ }
  },
};

// --- Bilingual content ---
const CONTENT = {
  hi: {
    tagline: 'आपके घर का\nस्मार्ट बजट साथी',
    subtitle: 'खर्च ट्रैक करें, बचत बढ़ाएं, आर्थिक स्वतंत्रता पाएं',
    langBtn: '🇬🇧 English',
    nextBtn: 'आगे बढ़ें →',
    nextSub: 'लॉगिन / रजिस्टर करें',
    flowHeading: 'ऐप कैसे काम करता है?',
    badge: '100% सुरक्षित · निःशुल्क',
    pills: ['📊 स्मार्ट रिपोर्ट', '🎯 लक्ष्य निर्धारण', '🔔 रिमाइंडर'],
    stats: [
      { val: '50K+', label: 'उपयोगकर्ता' },
      { val: '₹2Cr+', label: 'खर्च ट्रैक' },
      { val: '4.9★', label: 'रेटिंग' },
    ],
    footNote: 'आगे बढ़ने पर आप हमारी गोपनीयता नीति से सहमत होते हैं।',
    steps: [
      {
        icon: 'receipt-text-outline' as const,
        color: '#416656',
        bg: 'rgba(65,102,86,0.12)',
        title: 'रोज़ का खर्च ट्रैक करें',
        desc: 'हर खरीदारी तुरंत दर्ज करें — किराना, बिल, यात्रा। वॉइस से भी जोड़ें।',
        tag: 'Daily Tracking',
      },
      {
        icon: 'piggy-bank-outline' as const,
        color: '#b07d2c',
        bg: 'rgba(176,125,44,0.12)',
        title: 'बचत लक्ष्य तय करें',
        desc: 'गुल्लक में पैसे जमा करें, स्पिन व्हील से इनाम जीतें और लक्ष्य पूरे करें।',
        tag: 'Savings Goals',
      },
      {
        icon: 'chart-line' as const,
        color: '#5b4ab0',
        bg: 'rgba(91,74,176,0.12)',
        title: 'मासिक वित्तीय समीक्षा',
        desc: 'हर महीने की आमदनी, खर्च और बचत को एक नज़र में देखें।',
        tag: 'Monthly Overview',
      },
    ],
  },
  en: {
    tagline: "Your Home's\nSmart Budget Companion",
    subtitle: 'Track expenses, grow savings, achieve financial freedom',
    langBtn: '🇮🇳 हिंदी',
    nextBtn: 'Get Started →',
    nextSub: 'Login / Register',
    flowHeading: 'How the App Works',
    badge: '100% Secure · Free',
    pills: ['📊 Smart Reports', '🎯 Goal Setting', '🔔 Reminders'],
    stats: [
      { val: '50K+', label: 'Users' },
      { val: '₹2Cr+', label: 'Tracked' },
      { val: '4.9★', label: 'Rating' },
    ],
    footNote: 'By continuing you agree to our Privacy Policy.',
    steps: [
      {
        icon: 'receipt-text-outline' as const,
        color: '#416656',
        bg: 'rgba(65,102,86,0.12)',
        title: 'Daily Expense Tracking',
        desc: 'Log every purchase instantly — groceries, bills, travel. Add via voice too.',
        tag: 'Daily Tracking',
      },
      {
        icon: 'piggy-bank-outline' as const,
        color: '#b07d2c',
        bg: 'rgba(176,125,44,0.12)',
        title: 'Set Saving Goals',
        desc: 'Save in your Gullak, win rewards on the Spin Wheel and hit your targets.',
        tag: 'Savings Goals',
      },
      {
        icon: 'chart-line' as const,
        color: '#5b4ab0',
        bg: 'rgba(91,74,176,0.12)',
        title: 'Monthly Financial Overview',
        desc: 'See your income, spending and savings at a glance every month.',
        tag: 'Monthly Overview',
      },
    ],
  },
};

type Lang = 'hi' | 'en';

interface WelcomeScreenProps {
  navigation?: any;
  onDone?: () => void;
}

export default function WelcomeScreen({ navigation, onDone }: WelcomeScreenProps) {
  const context = useContext(AppContext);
  const C = context?.C;
  const isDark = C ? C.surface !== '#fbf9fa' : false;

  const [lang, setLang] = useState<Lang>('hi');
  const [activeStep, setActiveStep] = useState(0);

  // Fade-in animation on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Card fade animation on step change
  const cardFade = useRef(new Animated.Value(1)).current;
  const handleStepChange = (idx: number) => {
    Animated.sequence([
      Animated.timing(cardFade, { toValue: 0.4, duration: 100, useNativeDriver: true }),
      Animated.timing(cardFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveStep(idx);
  };

  const content = CONTENT[lang];

  const handleNext = () => {
    storage.set('hb_welcome_seen', 'true');
    if (onDone) {
      onDone();
    } else if (navigation) {
      navigation.replace('Login');
    }
  };

  const toggleLang = () => setLang(prev => (prev === 'hi' ? 'en' : 'hi'));

  // Theme colors with safe fallbacks for pre-context render
  const colors = {
    surface: C?.surface ?? '#fbf9fa',
    primary: C?.primary ?? '#0a1422',
    secondary: C?.secondary ?? '#416656',
    cardBg: C?.cardBg ?? 'rgba(255,255,255,0.85)',
    borderColor: C?.borderColor ?? 'rgba(228,226,227,0.6)',
    outline: C?.outline ?? '#75777c',
    outlineVariant: C?.outlineVariant ?? '#c5c6cc',
    onSurfaceVariant: C?.onSurfaceVariant ?? '#44474c',
    surfaceContainer: C?.surfaceContainer ?? '#f0edee',
  };

  const s = getStyles(colors, isDark);

  return (
    <View style={s.root}>
      {/* Ambient glows */}
      <View style={s.glow1} pointerEvents="none" />
      <View style={s.glow2} pointerEvents="none" />
      <View style={s.glow3} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[s.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* ── Top Row: Logo + Lang Toggle ── */}
          <View style={s.topRow}>
            <View style={s.logoRow}>
              <View style={s.logoBox}>
                <MaterialCommunityIcons name="home-heart" size={20} color="#fff" />
              </View>
              <Text style={s.logoText}>HomeBudget</Text>
            </View>

            <TouchableOpacity
              id="welcome-lang-toggle"
              style={s.langToggle}
              onPress={toggleLang}
              activeOpacity={0.75}
            >
              <Text style={s.langToggleText}>{content.langBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Hero Section ── */}
          <View style={s.heroSection}>
            <View style={s.badgePill}>
              <MaterialCommunityIcons name="shield-check" size={12} color={colors.secondary} />
              <Text style={s.badgeText}>{content.badge}</Text>
            </View>

            <Text style={s.tagline}>{content.tagline}</Text>
            <Text style={s.subtitle}>{content.subtitle}</Text>

            {/* Feature Pills */}
            <View style={s.pillsRow}>
              {content.pills.map(pill => (
                <View key={pill} style={s.pill}>
                  <Text style={s.pillText}>{pill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── App Flow Section ── */}
          <View style={s.flowSection}>
            <Text style={s.flowHeading}>{content.flowHeading}</Text>

            {/* Step Tabs (1, 2, 3) */}
            <View style={s.tabRow}>
              {content.steps.map((step, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    s.tab,
                    activeStep === idx && {
                      borderBottomColor: step.color,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => handleStepChange(idx)}
                  activeOpacity={0.75}
                >
                  <View style={[s.tabNumBox, activeStep === idx && { backgroundColor: step.bg }]}>
                    <Text style={[s.tabNum, activeStep === idx && { color: step.color }]}>
                      {idx + 1}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Active Step Card */}
            <Animated.View
              style={[
                s.stepCard,
                { opacity: cardFade, borderLeftColor: content.steps[activeStep].color },
              ]}
            >
              <View style={[s.stepIconBox, { backgroundColor: content.steps[activeStep].bg }]}>
                <MaterialCommunityIcons
                  name={content.steps[activeStep].icon}
                  size={28}
                  color={content.steps[activeStep].color}
                />
              </View>
              <View style={s.stepCardText}>
                <View style={s.stepTagRow}>
                  <View style={[s.stepTag, { backgroundColor: content.steps[activeStep].bg }]}>
                    <Text style={[s.stepTagText, { color: content.steps[activeStep].color }]}>
                      {content.steps[activeStep].tag}
                    </Text>
                  </View>
                </View>
                <Text style={s.stepTitle}>{content.steps[activeStep].title}</Text>
                <Text style={s.stepDesc}>{content.steps[activeStep].desc}</Text>
              </View>
            </Animated.View>

            {/* Mini step picker row */}
            <View style={s.miniStepsRow}>
              {content.steps.map((step, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    s.miniStep,
                    activeStep === idx && { borderColor: step.color, backgroundColor: step.bg },
                  ]}
                  onPress={() => handleStepChange(idx)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      s.miniStepIcon,
                      { backgroundColor: activeStep === idx ? step.bg : colors.surfaceContainer },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={step.icon}
                      size={15}
                      color={activeStep === idx ? step.color : colors.outline}
                    />
                  </View>
                  <Text
                    style={[
                      s.miniStepTitle,
                      activeStep === idx && { color: step.color, fontWeight: '600' },
                    ]}
                    numberOfLines={2}
                  >
                    {step.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Stats Row ── */}
          <View style={s.statsRow}>
            {content.stats.map(stat => (
              <View key={stat.val} style={s.statBox}>
                <Text style={s.statVal}>{stat.val}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Next / Get Started Button ── */}
          <View style={s.bottomArea}>
            <TouchableOpacity
              id="welcome-next-btn"
              style={s.nextBtn}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <View style={s.nextBtnInner}>
                <Text style={s.nextBtnText}>{content.nextBtn}</Text>
                <Text style={s.nextBtnSub}>{content.nextSub}</Text>
              </View>
              <View style={s.nextArrowBox}>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={s.footNote}>{content.footNote}</Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const getStyles = (C: Record<string, string>, isDark: boolean) => {
  const glass = Platform.select({
    web: {
      boxShadow: `0 8px 32px ${isDark ? 'rgba(0,0,0,0.28)' : 'rgba(10,20,34,0.06)'}`,
      backdropFilter: 'blur(16px)',
    },
    ios: {},
    android: { elevation: 3 },
  });

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.surface },
    glow1: {
      position: 'absolute', top: -80, right: -80,
      width: 260, height: 260, borderRadius: 130,
      backgroundColor: 'rgba(65,102,86,0.13)', zIndex: 0,
    },
    glow2: {
      position: 'absolute', bottom: -60, left: -60,
      width: 220, height: 220, borderRadius: 110,
      backgroundColor: 'rgba(176,125,44,0.10)', zIndex: 0,
    },
    glow3: {
      position: 'absolute', top: '42%', left: '25%',
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(91,74,176,0.06)', zIndex: 0,
    },
    scroll: { flexGrow: 1 },
    inner: { flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30 },

    // Top Row
    topRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 26,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoBox: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    },
    logoText: { fontSize: 16, fontWeight: '700', color: C.primary },
    langToggle: {
      paddingVertical: 7, paddingHorizontal: 14,
      borderRadius: 20, borderWidth: 1,
      borderColor: C.outlineVariant,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(65,102,86,0.08)',
    },
    langToggleText: { fontSize: 12, fontWeight: '600', color: C.secondary },

    // Hero
    heroSection: { marginBottom: 24 },
    badgePill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      alignSelf: 'flex-start', marginBottom: 14,
      paddingVertical: 5, paddingHorizontal: 10,
      borderRadius: 20, borderWidth: 1,
      borderColor: 'rgba(65,102,86,0.25)',
      backgroundColor: 'rgba(65,102,86,0.08)',
    },
    badgeText: { fontSize: 11, fontWeight: '600', color: C.secondary },
    tagline: {
      fontSize: 28, fontWeight: '800', color: C.primary,
      lineHeight: 36, marginBottom: 10, letterSpacing: -0.4,
    },
    subtitle: { fontSize: 14, color: C.outline, lineHeight: 22, marginBottom: 16 },
    pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: {
      paddingVertical: 5, paddingHorizontal: 12,
      borderRadius: 20, borderWidth: 1, borderColor: C.outlineVariant,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    },
    pillText: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },

    // App Flow Section
    flowSection: {
      backgroundColor: C.cardBg, borderRadius: 22,
      borderWidth: 1, borderColor: C.borderColor,
      padding: 18, marginBottom: 14, ...glass,
    },
    flowHeading: {
      fontSize: 12, fontWeight: '700', color: C.primary,
      marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.6,
    },
    tabRow: {
      flexDirection: 'row', marginBottom: 14,
      borderBottomWidth: 1, borderBottomColor: C.outlineVariant + '44',
    },
    tab: {
      flex: 1, alignItems: 'center', paddingBottom: 10,
      borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    tabNumBox: {
      width: 28, height: 28, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    tabNum: { fontSize: 14, fontWeight: '700', color: C.outline },
    stepCard: {
      flexDirection: 'row', gap: 14, padding: 16,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
      borderLeftWidth: 3, marginBottom: 14,
    },
    stepIconBox: {
      width: 52, height: 52, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    stepCardText: { flex: 1 },
    stepTagRow: { marginBottom: 5 },
    stepTag: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
    stepTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    stepTitle: { fontSize: 15, fontWeight: '700', color: C.primary, marginBottom: 4 },
    stepDesc: { fontSize: 12, color: C.outline, lineHeight: 18 },

    // Mini Steps
    miniStepsRow: { flexDirection: 'row', gap: 8 },
    miniStep: {
      flex: 1, alignItems: 'center', padding: 10,
      borderRadius: 14, borderWidth: 1,
      borderColor: C.outlineVariant + '55',
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    },
    miniStepIcon: {
      width: 32, height: 32, borderRadius: 9,
      alignItems: 'center', justifyContent: 'center', marginBottom: 5,
    },
    miniStepTitle: { fontSize: 10, color: C.outline, textAlign: 'center', lineHeight: 13 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    statBox: {
      flex: 1, alignItems: 'center', paddingVertical: 14,
      borderRadius: 16, borderWidth: 1,
      borderColor: C.borderColor, backgroundColor: C.cardBg, ...glass,
    },
    statVal: { fontSize: 17, fontWeight: '800', color: C.primary },
    statLabel: { fontSize: 10, color: C.outline, marginTop: 2 },

    // Next Button
    bottomArea: { marginTop: 2 },
    nextBtn: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.primary, borderRadius: 18,
      paddingVertical: 14, paddingLeft: 20, paddingRight: 14,
      marginBottom: 14,
      ...Platform.select({
        web: { boxShadow: '0 6px 20px rgba(10,20,34,0.22)' },
        ios: {},
        android: { elevation: 6 },
      }),
    },
    nextBtnInner: { flex: 1 },
    nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
    nextBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
    nextArrowBox: {
      width: 38, height: 38, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center', justifyContent: 'center',
    },
    footNote: { fontSize: 10, color: C.outline, textAlign: 'center', lineHeight: 15 },
  });
};
