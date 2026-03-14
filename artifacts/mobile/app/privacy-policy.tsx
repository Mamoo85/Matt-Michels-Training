import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "@/components/ui/Logo";
import C from "@/constants/colors";
import { BUSINESS } from "@/constants/contact";

const EFFECTIVE_DATE = "March 14, 2026";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: `When you create an account or use the app, we may collect:\n\n\u2022 Name and email address (provided during sign-up)\n\u2022 Workout logs, lift data, and training notes you enter\n\u2022 Form check videos you upload\n\u2022 Session bookings and scheduling preferences\n\u2022 Device information and app usage analytics\n\u2022 Payment information (processed securely through Stripe; we do not store card numbers)`,
  },
  {
    title: "How We Use Your Information",
    body: `We use your information to:\n\n\u2022 Provide and personalize your training experience\n\u2022 Manage session bookings and communications\n\u2022 Process payments for programs and services\n\u2022 Track your progress and generate training insights\n\u2022 Send important updates about your account or scheduled sessions\n\u2022 Improve the app and our services`,
  },
  {
    title: "Information Sharing",
    body: `We do not sell your personal information. We may share data with:\n\n\u2022 Stripe — to process payments securely\n\u2022 Google — if you choose to sign in with Google\n\u2022 Replit — if you choose to sign in with Replit\n\u2022 Service providers who help us operate the app (hosting, analytics)\n\nYour trainer (Matt Michels) can view your training data, workout logs, and form check submissions as part of coaching services.`,
  },
  {
    title: "Data Security",
    body: `We take reasonable measures to protect your personal information, including encrypted connections (HTTPS), secure authentication, and secure payment processing through Stripe. However, no method of electronic storage is 100% secure.`,
  },
  {
    title: "Your Rights",
    body: `You may:\n\n\u2022 Access or update your personal information through the app\n\u2022 Request deletion of your account and associated data\n\u2022 Opt out of non-essential communications\n\nTo exercise these rights, contact us at ${BUSINESS.email}.`,
  },
  {
    title: "Children's Privacy",
    body: `The app is not intended for children under 13. Youth training programs (ages 14+) require parental consent. We do not knowingly collect information from children under 13.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes through the app or via email. Continued use of the app after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "Contact",
    body: `${BUSINESS.name}\n${BUSINESS.address1}\n${BUSINESS.address2}\n${BUSINESS.email}`,
  },
];

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Logo size="md" />
        </View>
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
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.effective}>
          Effective date: {EFFECTIVE_DATE}
        </Text>

        <Text style={styles.intro}>
          M\u00B2 Training ("we," "us," or "our") is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use, and
          safeguard your information when you use the M\u00B2 Training mobile
          application.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  effective: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  intro: {
    color: C.muted,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  sectionBody: {
    color: C.muted,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
