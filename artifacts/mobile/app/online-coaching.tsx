import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { uid, nowTs } from "@/utils/storage";

const WHAT_YOU_GET = [
  { icon: "clipboard" as const, t: "Monthly training program", d: "Written weekly, built around your goals and schedule. Updated every month." },
  { icon: "message-circle" as const, t: "Weekly check-ins", d: "Brief updates on how training is going. Matt adjusts the plan in real time." },
  { icon: "video" as const, t: "Form feedback", d: "Submit a video any time. Matt reviews it and sends cues back." },
  { icon: "trending-up" as const, t: "Progress tracking", d: "Lift logs reviewed monthly. Matt tracks your PRs and adjusts load." },
];

export default function OnlineCoachingScreen() {
  const { submitCoachingInquiry } = useApp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"info" | "form" | "done">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!goals.trim()) e.goals = "Tell Matt what you're working toward";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    submitCoachingInquiry({
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      goals: goals.trim(),
      frequency: frequency.trim() || undefined,
      notes: notes.trim() || undefined,
      type: "online_coaching",
      submittedAt: nowTs(),
      status: "pending",
    });
    setStep("done");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <Text style={styles.headerTitle}>Online Coaching</Text>
        <View style={{ width: 36 }} />
      </View>

      {step === "done" ? (
        <View style={styles.doneWrap}>
          <Feather name="check-circle" size={56} color={C.green} />
          <Text style={styles.doneTitle}>Inquiry received.</Text>
          <Text style={styles.doneBody}>
            Matt will reach out to <Text style={{ color: C.orange }}>{email}</Text> within 24–48 hours to talk through the details and get you started.
          </Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      ) : step === "info" ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroTag}>REMOTE · $100–200 / MONTH</Text>
            <Text style={styles.heroTitle}>Train with Matt from anywhere.</Text>
            <Text style={styles.heroBody}>
              You don't need to be local. Monthly online coaching gives you Matt's programming, his eyes on your
              form, and a direct line to adjust when life gets in the way.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>What you get</Text>
          <View style={styles.featGrid}>
            {WHAT_YOU_GET.map((f, i) => (
              <View key={i} style={styles.featCard}>
                <View style={styles.featIcon}><Feather name={f.icon} size={18} color={C.orange} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featTitle}>{f.t}</Text>
                  <Text style={styles.featDesc}>{f.d}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Pricing</Text>
            <View style={styles.pricingRow}>
              <View style={styles.pricingTier}>
                <Text style={styles.pricingAmount}>$100</Text>
                <Text style={styles.pricingLabel}>Standard</Text>
                <Text style={styles.pricingDesc}>Monthly program + check-ins</Text>
              </View>
              <View style={[styles.pricingTier, styles.pricingTierFeatured]}>
                <Text style={[styles.pricingAmount, { color: C.orange }]}>$150</Text>
                <Text style={[styles.pricingLabel, { color: C.orange }]}>Full</Text>
                <Text style={styles.pricingDesc}>Program + check-ins + form reviews</Text>
              </View>
              <View style={styles.pricingTier}>
                <Text style={styles.pricingAmount}>$200</Text>
                <Text style={styles.pricingLabel}>Elite</Text>
                <Text style={styles.pricingDesc}>Everything + priority response</Text>
              </View>
            </View>
            <Text style={styles.pricingNote}>Month-to-month. Cancel any time. No long-term contracts.</Text>
          </View>

          <Pressable style={styles.applyBtn} onPress={() => setStep("form")}>
            <Text style={styles.applyBtnText}>Apply for coaching</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formHeading}>Tell Matt about yourself</Text>
          <Text style={styles.formSub}>He reads every field. The more detail you give, the better the fit.</Text>

          <View style={styles.formCard}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={[styles.input, errors.name && styles.inputErr]} value={name} onChangeText={setName}
                placeholder="Your name" placeholderTextColor={C.muted} autoCapitalize="words" />
              {errors.name ? <Text style={styles.errText}>{errors.name}</Text> : null}
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email *</Text>
              <TextInput style={[styles.input, errors.email && styles.inputErr]} value={email} onChangeText={setEmail}
                placeholder="Your email" placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none" />
              {errors.email ? <Text style={styles.errText}>{errors.email}</Text> : null}
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Phone (optional)</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone}
                placeholder="In case Matt wants to hop on a quick call" placeholderTextColor={C.muted} keyboardType="phone-pad" />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Goals *</Text>
              <TextInput style={[styles.input, styles.textarea, errors.goals && styles.inputErr]}
                value={goals} onChangeText={setGoals}
                placeholder="What are you working toward? Be specific — strength goals, event, body comp, injury recovery..."
                placeholderTextColor={C.muted} multiline numberOfLines={4} />
              {errors.goals ? <Text style={styles.errText}>{errors.goals}</Text> : null}
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Current training frequency (optional)</Text>
              <TextInput style={styles.input} value={frequency} onChangeText={setFrequency}
                placeholder="How many days/week do you currently train?" placeholderTextColor={C.muted} />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Anything else?</Text>
              <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes}
                placeholder="Injuries, equipment available, schedule constraints..." placeholderTextColor={C.muted} multiline numberOfLines={3} />
            </View>
          </View>

          <Pressable style={styles.applyBtn} onPress={handleSubmit}>
            <Text style={styles.applyBtnText}>Send inquiry</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: C.surface, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: C.text, fontSize: 16, fontFamily: "Inter_700Bold" },
  scroll: { padding: 16, gap: 12 },
  heroCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: `${C.orange}44`, borderRadius: 16, padding: 14,
  },
  heroTag: { color: C.orange, fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1.2, marginBottom: 6 },
  heroTitle: { color: C.text, fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 10 },
  heroBody: { color: C.dim, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  sectionTitle: { color: C.text, fontSize: 16, fontFamily: "Inter_700Bold" },
  featGrid: { gap: 10 },
  featCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  featIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: `${C.orange}1a`,
    alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
  },
  featTitle: { color: C.text, fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },
  featDesc: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  pricingCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, gap: 12,
  },
  pricingTitle: { color: C.text, fontSize: 15, fontFamily: "Inter_700Bold" },
  pricingRow: { flexDirection: "row", gap: 8 },
  pricingTier: {
    flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 10, alignItems: "center", gap: 4,
  },
  pricingTierFeatured: { borderColor: C.orange, backgroundColor: `${C.orange}0e` },
  pricingAmount: { color: C.text, fontSize: 20, fontFamily: "Inter_700Bold" },
  pricingLabel: { color: C.dim, fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  pricingDesc: { color: C.dim, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16, textAlign: "center" },
  pricingNote: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  applyBtn: {
    backgroundColor: C.orange, borderRadius: 14, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  formHeading: { color: C.text, fontSize: 20, fontFamily: "Inter_700Bold" },
  formSub: { color: C.dim, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  formCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 16, gap: 12,
  },
  fieldWrap: { gap: 6 },
  label: { color: C.dim, fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    color: C.text, fontSize: 14, fontFamily: "Inter_400Regular",
  },
  inputErr: { borderColor: C.red },
  textarea: { minHeight: 88, textAlignVertical: "top", paddingTop: 10 },
  errText: { color: C.red, fontSize: 13, fontFamily: "Inter_400Regular" },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 14, gap: 10 },
  doneTitle: { color: C.text, fontSize: 28, fontFamily: "Inter_700Bold" },
  doneBody: { color: C.dim, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, textAlign: "center" },
  doneBtn: {
    marginTop: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
  },
  doneBtnText: { color: C.text, fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
