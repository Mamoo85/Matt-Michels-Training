import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import { FlatList, Linking, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";
import { AppData } from "@/utils/storage";
import { styles } from "./trainerStyles";

interface Props {
  data: AppData;
}

interface EmailEntry {
  name: string;
  email: string;
  source: "client" | "signup";
}

export const MailingTab = React.memo(function MailingTab({ data }: Props) {
  const insets = useSafeAreaInsets();

  const allEmails = useMemo((): EmailEntry[] => {
    const clientEmails: EmailEntry[] = data.clients
      .filter((c) => !!c.email)
      .map((c) => ({ name: c.name, email: c.email!, source: "client" }));
    const interestEmails: EmailEntry[] = (data.groupClassInterests || []).map(
      (g) => ({ name: g.name, email: g.email, source: "signup" })
    );
    const result = [...clientEmails];
    interestEmails.forEach((ie) => {
      if (!result.find((e) => e.email.toLowerCase() === ie.email.toLowerCase())) {
        result.push(ie);
      }
    });
    return result;
  }, [data.clients, data.groupClassInterests]);

  const mailtoAll = useMemo(
    () =>
      `mailto:?bcc=${allEmails
        .map((e) => encodeURIComponent(`${e.name} <${e.email}>`))
        .join(",")}`,
    [allEmails]
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.mailingHeader}>
        <View>
          <Text style={styles.mailingCount}>{allEmails.length} addresses</Text>
          <Text style={styles.mailingNote}>Clients + class sign-up list</Text>
        </View>
        <Pressable
          style={[styles.quickMailBtn, allEmails.length === 0 && { opacity: 0.4 }]}
          disabled={allEmails.length === 0}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(mailtoAll).catch(() => {});
          }}
        >
          <Feather name="send" size={14} color="#fff" />
          <Text style={styles.quickMailText}>Quick Email</Text>
        </Pressable>
      </View>

      {allEmails.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="mail" size={36} color={C.muted} />
          <Text style={styles.emptyText}>No emails yet.</Text>
          <Text style={styles.emptySubText}>
            Clients who sign up will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={allEmails}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
          ]}
          renderItem={({ item: e }) => (
            <Pressable
              style={styles.emailRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(`mailto:${e.email}`).catch(() => {});
              }}
            >
              <View style={styles.emailAvatar}>
                <Text style={styles.emailAvatarText}>
                  {e.name
                    .split(" ")
                    .map((x: string) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emailName}>{e.name}</Text>
                <Text style={styles.emailAddr}>{e.email}</Text>
              </View>
              <View
                style={[
                  styles.sourceTag,
                  e.source === "signup" && styles.sourceTagSignup,
                ]}
              >
                <Text
                  style={[
                    styles.sourceTagText,
                    e.source === "signup" && styles.sourceTagTextSignup,
                  ]}
                >
                  {e.source === "client" ? "client" : "signup"}
                </Text>
              </View>
              <Feather name="mail" size={16} color={C.muted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
});
