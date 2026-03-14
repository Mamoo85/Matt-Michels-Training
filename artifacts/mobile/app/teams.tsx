import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import C from "@/constants/colors";

const OFFERINGS = [
  {
    title: "Program Only",
    desc: "Matt builds a complete custom program for your team. Your coach delivers it on their schedule. Includes exercise breakdowns, progressions, and coaching notes.",
    icon: "clipboard" as const,
  },
  {
    title: "Coach-Delivered with Training",
    desc: "Matt builds the program and trains your coaching staff on how to run it. Hands-on instruction so your coaches own the system.",
    icon: "users" as const,
  },
  {
    title: "On-Site Training",
    desc: "Matt comes to your team and runs the program directly. A day, a week, a month — whatever your team needs. He trains the athletes himself.",
    icon: "map-pin" as const,
  },
  {
    title: "Remote / Online Programs",
    desc: "Custom programming delivered digitally. Perfect for teams that need expert guidance but can't be local. Full support from Matt throughout.",
    icon: "globe" as const,
  },
];

export default function TeamsScreen() {
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
        <Text style={styles.logo}>Team & Youth Programs</Text>
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
        {/* HERO */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTag}>I CAN DO THAT</Text>
          <Text style={styles.heroTitle}>
            Any team. Any sport.{"\n"}Any age. Guaranteed.
          </Text>
          <Text style={styles.heroBody}>
            Matt has spent over two decades training athletes from middle school
            through college. He has personally developed 50+ college-level
            athletes and trained thousands of clients with zero injuries — zero.
            That track record isn't an accident.
          </Text>
          <Text style={styles.heroBody}>
            Whether your team needs a one-time custom program, a week of
            hands-on training, or a full season of support — Matt will build
            exactly what your athletes need and deliver it however works best
            for you.
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          {[
            { v: "20+", l: "Years Experience" },
            { v: "50+", l: "College Athletes" },
            { v: "0", l: "Injuries" },
          ].map((s) => (
            <View key={s.l} style={styles.statCard}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* OFFERINGS */}
        <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
        {OFFERINGS.map((o) => (
          <View key={o.title} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.offerIcon}>
                <Feather name={o.icon} size={18} color={C.orange} />
              </View>
              <Text style={styles.offerTitle}>{o.title}</Text>
            </View>
            <Text style={styles.offerDesc}>{o.desc}</Text>
          </View>
        ))}

        {/* WHO IT'S FOR */}
        <View style={styles.forCard}>
          <Text style={styles.forLabel}>WHO THIS IS FOR</Text>
          <View style={styles.forList}>
            {[
              "Middle school teams building a foundation",
              "High school programs preparing athletes for college",
              "Travel and club teams in any sport",
              "College programs looking for an edge",
              "Coaches who want expert programming they can trust",
              "Athletic directors who need results, not excuses",
            ].map((item) => (
              <View key={item} style={styles.forRow}>
                <Feather name="check" size={14} color={C.green} />
                <Text style={styles.forText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* GUARANTEE */}
        <View style={styles.guaranteeCard}>
          <View style={styles.guaranteeTop}>
            <Feather name="shield" size={16} color={C.orange} />
            <Text style={styles.guaranteeTitle}>The Guarantee</Text>
          </View>
          <Text style={styles.guaranteeText}>
            Guaranteed success. 20+ years and zero injuries isn't luck — it's
            the standard. Matt stands behind every program he builds.
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaBody}>
            Tell Matt about your team, your sport, and what you need. He'll
            take it from there.
          </Text>
          <Pressable
            style={styles.ctaBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/team-inquiry");
            }}
          >
            <Text style={styles.ctaBtnText}>Get in touch</Text>
            <Feather name="arrow-right" size={16} color={C.white} />
          </Pressable>
        </View>
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
  logo: {
    color: C.green,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  scroll: {
    padding: 14,
  },
  heroSection: {
    marginBottom: 12,
  },
  heroTag: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    marginBottom: 12,
  },
  heroTitle: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 36,
    marginBottom: 16,
  },
  heroBody: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: {
    color: C.orange,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
    textAlign: "center",
  },
  sectionLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  offerCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  offerIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${C.orange}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  offerTitle: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  offerDesc: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  forCard: {
    marginTop: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.green}33`,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  forLabel: {
    color: C.green,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  forList: {
    gap: 8,
  },
  forRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  forText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
  guaranteeCard: {
    backgroundColor: `${C.orange}10`,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  guaranteeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  guaranteeTitle: {
    color: C.orange,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  guaranteeText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  ctaSection: {
    alignItems: "center",
    paddingTop: 10,
  },
  ctaTitle: {
    color: C.text,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  ctaBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 10,
  },
  ctaBtnText: {
    color: C.white,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
