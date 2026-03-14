import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Linking, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";
import { AppData } from "@/utils/storage";
import { styles } from "./trainerStyles";

interface Props {
  data: AppData;
}

const CLASS_LABELS: Record<string, string> = {
  weekend_rolling: "Weekend Rolling Classes",
  youth_14_16: "Youth 14–16",
  youth_17_18: "Youth 17–18",
};

const CLASS_TYPES = ["weekend_rolling", "youth_14_16", "youth_17_18"] as const;

export const SignupsTab = React.memo(function SignupsTab({ data }: Props) {
  const insets = useSafeAreaInsets();
  const interests = useMemo(
    () => data.groupClassInterests || [],
    [data.groupClassInterests]
  );

  if (interests.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="calendar" size={36} color={C.muted} />
        <Text style={styles.emptyText}>No sign-ups yet.</Text>
        <Text style={styles.emptySubText}>
          When people express interest in group classes, they appear here.
        </Text>
      </View>
    );
  }

  const groups = CLASS_TYPES.map((cls) => ({
    cls,
    items: interests.filter((i) => i.classType === cls),
  })).filter((g) => g.items.length > 0);

  return (
    <FlatList
      data={groups}
      keyExtractor={(g) => g.cls}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
      ]}
      renderItem={({ item: { cls, items } }) => (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.signupGroupLabel}>
            {CLASS_LABELS[cls]} ({items.length})
          </Text>
          {items.map((sg) => (
            <Pressable
              key={sg.id}
              style={styles.signupCard}
              onPress={() =>
                Linking.openURL(`mailto:${sg.email}`).catch(() => {})
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.signupName}>{sg.name}</Text>
                <Text style={styles.signupEmail}>{sg.email}</Text>
                {!!sg.phone && (
                  <Text style={styles.signupMeta}>{sg.phone}</Text>
                )}
                {!!sg.athleteName && (
                  <Text style={styles.signupMeta}>
                    Athlete: {sg.athleteName}
                  </Text>
                )}
                {!!sg.sport && (
                  <Text style={styles.signupMeta}>Sport: {sg.sport}</Text>
                )}
                {!!sg.notes && (
                  <Text style={styles.signupNote} numberOfLines={2}>
                    {sg.notes}
                  </Text>
                )}
              </View>
              <Feather name="mail" size={16} color={C.muted} />
            </Pressable>
          ))}
        </View>
      )}
    />
  );
});
