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

const LIFTS = [
  "Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  "Romanian Deadlift",
  "Hip Thrust",
  "Row",
  "Pull-up",
  "Other",
];

export default function FormCheckScreen() {
  const { submitFormCheck } = useApp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"form" | "done">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lift, setLift] = useState(LIFTS[0]);
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!notes.trim()) e.notes = "Describe what you want Matt to look at";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    submitFormCheck({
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      lift,
      videoUrl: videoUrl.trim() || undefined,
      notes: notes.trim(),
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
        <Text style={styles.headerTitle}>Form Check</Text>
        <View style={{ width: 36 }} />
      </View>

      {step === "done" ? (
        <View style={styles.doneWrap}>
          <Feather name="check-circle" size={56} color={C.green} />
          <Text style={styles.doneTitle}>Submitted.</Text>
          <Text style={styles.doneBody}>
            Matt will review your lift and send feedback to{" "}
            <Text style={{ color: C.orange }}>{email}</Text>. Usually within 24 hours.
          </Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroTag}>REMOTE · $20 PER CHECK</Text>
            <Text style={styles.heroTitle}>Get your form reviewed.</Text>
            <Text style={styles.heroBody}>
              Submit your lift details and a video link. Matt watches it, identifies what's wrong, and sends you
              specific cues to fix it — the same feedback he gives in person.
            </Text>
          </View>

          <View style={styles.howCard}>
            {[
              { n: "1", t: "Submit this form", d: "Tell Matt the lift and paste a video link (Google Drive, YouTube, Instagram — anything works)." },
              { n: "2", t: "Matt reviews it", d: "Usually same day. He watches it like he's standing next to you." },
              { n: "3", t: "Get your cues", d: "Written or voice note feedback sent directly to your email. Fix it your next session." },
            ].map((s) => (
              <View key={s.n} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{s.t}</Text>
                  <Text style={styles.stepDesc}>{s.d}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Your submission</Text>

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
                placeholder="Where Matt sends the feedback" placeholderTextColor={C.muted}
                keyboardType="email-address" autoCapitalize="none" />
              {errors.email ? <Text style={styles.errText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Lift *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liftScroll}
                contentContainerStyle={styles.liftRow}>
                {LIFTS.map((l) => (
                  <Pressable key={l} style={[styles.liftBtn, lift === l && styles.liftBtnActive]} onPress={() => setLift(l)}>
                    <Text style={[styles.liftBtnText, lift === l && styles.liftBtnTextActive]}>{l}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Video link (optional)</Text>
              <TextInput style={styles.input} value={videoUrl} onChangeText={setVideoUrl}
                placeholder="YouTube, Drive, Instagram, iCloud — anything public" placeholderTextColor={C.muted}
                autoCapitalize="none" keyboardType="url" />
              <Text style={styles.hint}>No video? Describe the problem in detail below — Matt can still help.</Text>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>What do you want Matt to look at? *</Text>
              <TextInput style={[styles.input, styles.textarea, errors.notes && styles.inputErr]}
                value={notes} onChangeText={setNotes}
                placeholder={`Describe what's happening. "My lower back rounds at the bottom of my squat." "My left shoulder dips on bench." "Something feels off but I don't know what."`}
                placeholderTextColor={C.muted} multiline numberOfLines={5} />
              {errors.notes ? <Text style={styles.errText}>{errors.notes}</Text> : null}
            </View>
          </View>

          <Pressable style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit for Review</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>

          <Text style={styles.priceNote}>$20 · Matt will invoice you after reviewing. No payment needed now.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: C.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: C.text, fontSize: 16, fontFamily: "Inter_700Bold" },
  scroll: { padding: 16, gap: 12 },
  heroCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: `${C.orange}44`,
    borderRadius: 16, padding: 14,
  },
  heroTag: { color: C.orange, fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1.2, marginBottom: 6 },
  heroTitle: { color: C.text, fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 10 },
  heroBody: { color: C.dim, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  howCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 14, gap: 14,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${C.orange}22`, borderWidth: 1, borderColor: C.orange,
    alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
  },
  stepNumText: { color: C.orange, fontSize: 13, fontFamily: "Inter_700Bold" },
  stepTitle: { color: C.text, fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },
  stepDesc: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  sectionTitle: { color: C.text, fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 4 },
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
  textarea: { minHeight: 100, textAlignVertical: "top", paddingTop: 10 },
  errText: { color: C.red, fontSize: 13, fontFamily: "Inter_400Regular" },
  hint: { color: C.muted, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 2 },
  liftScroll: { marginHorizontal: -2 },
  liftRow: { flexDirection: "row", gap: 8, paddingHorizontal: 2 },
  liftBtn: {
    borderWidth: 1, borderColor: C.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.bg,
  },
  liftBtnActive: { borderColor: C.orange, backgroundColor: `${C.orange}18` },
  liftBtnText: { color: C.dim, fontSize: 13, fontFamily: "Inter_500Medium" },
  liftBtnTextActive: { color: C.orange, fontFamily: "Inter_700Bold" },
  submitBtn: {
    backgroundColor: C.orange, borderRadius: 14, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  priceNote: { color: C.dim, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 14, gap: 10 },
  doneTitle: { color: C.text, fontSize: 28, fontFamily: "Inter_700Bold" },
  doneBody: { color: C.dim, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, textAlign: "center" },
  doneBtn: {
    marginTop: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
  },
  doneBtnText: { color: C.text, fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
