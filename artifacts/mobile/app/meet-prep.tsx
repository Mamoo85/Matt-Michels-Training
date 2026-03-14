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

const SPORTS = ["Powerlifting", "Olympic Weightlifting", "Strongman", "Highland Games", "CrossFit", "Other"];

export default function MeetPrepScreen() {
  const { submitCoachingInquiry } = useApp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"info" | "form" | "done">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sport, setSport] = useState(SPORTS[0]);
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!goals.trim()) e.goals = "Tell Matt about your competition";
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
      goals: `${sport}: ${goals.trim()}`,
      notes: notes.trim() || undefined,
      type: "meet_prep",
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
        <Text style={styles.headerTitle}>Meet Prep</Text>
        <View style={{ width: 36 }} />
      </View>

      {step === "done" ? (
        <View style={styles.doneWrap}>
          <Feather name="check-circle" size={56} color={C.green} />
          <Text style={styles.doneTitle}>You're on deck.</Text>
          <Text style={styles.doneBody}>
            Matt will reach out to <Text style={{ color: C.orange }}>{email}</Text> to talk through your prep timeline and get things started.
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
            <Text style={styles.heroTag}>COMPETITION PREP · $150–300</Text>
            <Text style={styles.heroTitle}>Compete at your best.</Text>
            <Text style={styles.heroBody}>
              12–16 week structured blocks built specifically for your meet, event, or competition. Periodized loading,
              peak week protocol, and opener selection — everything you need to walk in prepared.
            </Text>
          </View>

          {[
            { icon: "calendar" as const, t: "12–16 week blocks", d: "Structured periodization from first training day through peak week and meet day." },
            { icon: "target" as const, t: "Opener selection", d: "Matt picks your openers based on your training maxes and how you respond to heavy singles." },
            { icon: "activity" as const, t: "Peak week protocol", d: "Built to have you hitting the platform feeling sharp — not smashed and not undertrained." },
            { icon: "video" as const, t: "Remote form checks", d: "Submit videos throughout the block. Matt watches and adjusts technique in real time." },
            { icon: "phone" as const, t: "Pre-meet call", d: "Talk through strategy, warm-up timing, attempts, and mental approach before you compete." },
          ].map((f, i) => (
            <View key={i} style={styles.featCard}>
              <View style={styles.featIcon}><Feather name={f.icon} size={18} color={C.orange} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featTitle}>{f.t}</Text>
                <Text style={styles.featDesc}>{f.d}</Text>
              </View>
            </View>
          ))}

          <View style={styles.credCard}>
            <Text style={styles.credTitle}>Why Matt</Text>
            <Text style={styles.credBody}>
              20+ years coaching strength athletes. He's built programs for high school athletes going to college, college athletes going pro,
              and competitors stepping on a platform for the first time. He knows what it takes to peak at the right time.
            </Text>
          </View>

          <Pressable style={styles.applyBtn} onPress={() => setStep("form")}>
            <Text style={styles.applyBtnText}>Start meet prep</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formHeading}>Tell Matt about your prep</Text>

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
              <Text style={styles.label}>Sport / federation</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -2 }}
                contentContainerStyle={styles.sportRow}>
                {SPORTS.map((s) => (
                  <Pressable key={s} style={[styles.sportBtn, sport === s && styles.sportBtnActive]} onPress={() => setSport(s)}>
                    <Text style={[styles.sportBtnText, sport === s && styles.sportBtnTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Competition details *</Text>
              <TextInput style={[styles.input, styles.textarea, errors.goals && styles.inputErr]}
                value={goals} onChangeText={setGoals}
                placeholder="When is your meet/event? What are your current training maxes or best lifts? What's your goal total or performance target?"
                placeholderTextColor={C.muted} multiline numberOfLines={5} />
              {errors.goals ? <Text style={styles.errText}>{errors.goals}</Text> : null}
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Anything else Matt should know?</Text>
              <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes}
                placeholder="Injuries, equipment limitations, previous comp experience..." placeholderTextColor={C.muted} multiline numberOfLines={3} />
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
  credCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14,
  },
  credTitle: { color: C.text, fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 6 },
  credBody: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
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
  sportRow: { flexDirection: "row", gap: 8, paddingHorizontal: 2 },
  sportBtn: {
    borderWidth: 1, borderColor: C.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.bg,
  },
  sportBtnActive: { borderColor: C.orange, backgroundColor: `${C.orange}18` },
  sportBtnText: { color: C.dim, fontSize: 13, fontFamily: "Inter_500Medium" },
  sportBtnTextActive: { color: C.orange, fontFamily: "Inter_700Bold" },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 14, gap: 10 },
  doneTitle: { color: C.text, fontSize: 28, fontFamily: "Inter_700Bold" },
  doneBody: { color: C.dim, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, textAlign: "center" },
  doneBtn: {
    marginTop: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
  },
  doneBtnText: { color: C.text, fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
