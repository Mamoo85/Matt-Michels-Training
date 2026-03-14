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

const WHO_IS_IT_FOR = [
  { t: "New trainers", d: "You're certified but your programming feels like guesswork. Matt can fix that fast." },
  { t: "Trainers stuck at the same clients", d: "You have 5–10 clients and no idea how to grow. Matt's built a business from scratch." },
  { t: "Coaches who want to compete", d: "You train others but want to step on the platform yourself. Matt helps you do both." },
];

const WHAT_YOU_LEARN = [
  { icon: "clipboard" as const, t: "How to program", d: "Periodization, progressive overload, how to write for different athletes and goals." },
  { icon: "users" as const, t: "How to coach the room", d: "Cues, corrections, reading movement, keeping clients safe and making gains." },
  { icon: "briefcase" as const, t: "How to build a business", d: "Retention, pricing, referrals, and how to stop trading time for money." },
  { icon: "mic" as const, t: "How to communicate", d: "What to say when a client isn't progressing, how to set expectations, how to handle the hard conversations." },
];

export default function TrainerMentorshipScreen() {
  const { submitCoachingInquiry } = useApp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"info" | "form" | "done">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!goals.trim()) e.goals = "Tell Matt where you're at and what you want to improve";
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
      goals: goals.trim(),
      notes: notes.trim() || undefined,
      type: "mentorship",
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
        <Text style={styles.headerTitle}>Trainer Mentorship</Text>
        <View style={{ width: 36 }} />
      </View>

      {step === "done" ? (
        <View style={styles.doneWrap}>
          <Feather name="check-circle" size={56} color={C.green} />
          <Text style={styles.doneTitle}>Inquiry received.</Text>
          <Text style={styles.doneBody}>
            Matt will reach out to <Text style={{ color: C.orange }}>{email}</Text> to talk through what you're working on and how he can help.
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
            <Text style={styles.heroTag}>FOR TRAINERS & COACHES</Text>
            <Text style={styles.heroTitle}>Learn from someone who's actually done it.</Text>
            <Text style={styles.heroBody}>
              20+ years of coaching real athletes. Thousands of clients. Zero injuries.{"\n\n"}
              If you're a trainer who wants to get better at programming, coaching, or building a sustainable business —
              Matt can compress years of trial and error into a few conversations.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>What you'll learn</Text>
          <View style={styles.featGrid}>
            {WHAT_YOU_LEARN.map((f, i) => (
              <View key={i} style={styles.featCard}>
                <View style={styles.featIcon}><Feather name={f.icon} size={18} color={C.orange} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featTitle}>{f.t}</Text>
                  <Text style={styles.featDesc}>{f.d}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Who it's for</Text>
          <View style={styles.whoGrid}>
            {WHO_IS_IT_FOR.map((w, i) => (
              <View key={i} style={styles.whoCard}>
                <Text style={styles.whoTitle}>{w.t}</Text>
                <Text style={styles.whoDesc}>{w.d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <View style={styles.pricingItem}>
                <Text style={styles.pricingAmount}>$200</Text>
                <Text style={styles.pricingLabel}>Single call</Text>
                <Text style={styles.pricingDesc}>60 min deep dive on whatever you're stuck on</Text>
              </View>
              <View style={[styles.pricingItem, styles.pricingFeatured]}>
                <Text style={[styles.pricingAmount, { color: C.orange }]}>$500</Text>
                <Text style={[styles.pricingLabel, { color: C.orange }]}>3-month track</Text>
                <Text style={styles.pricingDesc}>Weekly calls + program reviews + direct access</Text>
              </View>
            </View>
            <Text style={styles.pricingNote}>All mentorship is 1-on-1. No group coaching, no recorded courses — just Matt and you.</Text>
          </View>

          <Pressable style={styles.applyBtn} onPress={() => setStep("form")}>
            <Text style={styles.applyBtnText}>Apply for mentorship</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formHeading}>Tell Matt where you're at</Text>

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
              <Text style={styles.label}>Where are you at and what do you want to improve? *</Text>
              <TextInput style={[styles.input, styles.textarea, errors.goals && styles.inputErr]}
                value={goals} onChangeText={setGoals}
                placeholder="How long have you been training/coaching? How many clients? What's the specific problem you're trying to solve?"
                placeholderTextColor={C.muted} multiline numberOfLines={5} />
              {errors.goals ? <Text style={styles.errText}>{errors.goals}</Text> : null}
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Anything else?</Text>
              <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes}
                placeholder="Certifications, current clients, specific area you want to focus on..." placeholderTextColor={C.muted} multiline numberOfLines={3} />
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
  heroTitle: { color: C.text, fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 10, lineHeight: 30 },
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
  whoGrid: { gap: 8 },
  whoCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14,
  },
  whoTitle: { color: C.text, fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  whoDesc: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  pricingCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, gap: 10,
  },
  pricingRow: { flexDirection: "row", gap: 10 },
  pricingItem: {
    flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 12, alignItems: "center", gap: 4,
  },
  pricingFeatured: { borderColor: C.orange, backgroundColor: `${C.orange}0e` },
  pricingAmount: { color: C.text, fontSize: 22, fontFamily: "Inter_700Bold" },
  pricingLabel: { color: C.dim, fontSize: 12, fontFamily: "Inter_700Bold" },
  pricingDesc: { color: C.dim, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, textAlign: "center" },
  pricingNote: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  applyBtn: {
    backgroundColor: C.orange, borderRadius: 14, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  formHeading: { color: C.text, fontSize: 20, fontFamily: "Inter_700Bold" },
  formCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, gap: 12,
  },
  fieldWrap: { gap: 6 },
  label: { color: C.dim, fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    color: C.text, fontSize: 14, fontFamily: "Inter_400Regular",
  },
  inputErr: { borderColor: C.red },
  textarea: { minHeight: 100, textAlignVertical: "top", paddingTop: 10 },
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
