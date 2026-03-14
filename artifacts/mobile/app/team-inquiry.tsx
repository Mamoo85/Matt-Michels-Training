import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";

const DELIVERY_OPTIONS = [
  { id: "online", label: "Online training" },
  { id: "inperson_site", label: "In-person at my site (15121 Kercheval, Grosse Pointe Park, MI)" },
  { id: "onsite", label: "On-site at your location" },
];

export default function TeamInquiryScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("");
  const [age, setAge] = useState("");
  const [delivery, setDelivery] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !sport.trim() || !age.trim() || !delivery) {
      setErr("All fields are required.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <Text style={styles.logo}>Get in Touch</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {submitted ? (
          <View style={styles.successContainer}>
            <Feather name="check-circle" size={48} color={C.green} />
            <Text style={styles.successTitle}>Got it!</Text>
            <Text style={styles.successText}>
              Thanks for reaching out. Matt will call you ASAP.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.intro}>
              Tell us about your team and what you're looking for. Matt will be in touch right away.
            </Text>

            {!!err && (
              <View style={styles.errBanner}>
                <Text style={styles.errText}>{err}</Text>
              </View>
            )}

            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Coach Smith"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="coach@example.com"
              placeholderTextColor={C.muted}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Sport *</Text>
            <TextInput
              style={styles.input}
              value={sport}
              onChangeText={setSport}
              placeholder="e.g. Football, Soccer, Volleyball"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.label}>Age Group *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. Middle School, High School, College"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.label}>How would you like training? *</Text>
            {DELIVERY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[
                  styles.optionCard,
                  delivery === opt.id && styles.optionCardSelected,
                ]}
                onPress={() => setDelivery(opt.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    delivery === opt.id && styles.checkboxSelected,
                  ]}
                >
                  {delivery === opt.id && (
                    <Feather name="check" size={14} color={C.white} />
                  )}
                </View>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>Send Inquiry</Text>
              <Feather name="arrow-right" size={16} color={C.white} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0a0a09",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    color: C.orange,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  scroll: {
    padding: 20,
  },
  intro: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  errBanner: {
    backgroundColor: `${C.red}18`,
    borderWidth: 1,
    borderColor: `${C.red}44`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  errText: {
    color: C.red,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  label: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  optionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: `${C.orange}12`,
    borderColor: C.orange,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: C.orange,
    borderColor: C.orange,
  },
  optionLabel: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  submitBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  successTitle: {
    color: C.text,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  successText: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
