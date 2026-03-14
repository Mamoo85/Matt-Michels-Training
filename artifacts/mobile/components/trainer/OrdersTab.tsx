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
  markStoreOrderSent: (id: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  pending: C.orange,
  building: "#4a9eff",
  sent: C.green,
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  building: "Building",
  sent: "Sent",
};

export const OrdersTab = React.memo(function OrdersTab({ data, markStoreOrderSent }: Props) {
  const insets = useSafeAreaInsets();

  const orders = useMemo(
    () =>
      [...(data.storeOrders || [])].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
    [data.storeOrders]
  );

  if (orders.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="shopping-bag" size={36} color={C.muted} />
        <Text style={styles.emptyText}>No store orders yet.</Text>
        <Text style={styles.emptySubText}>
          When someone buys a custom workout program, their intake shows up here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
      ]}
      renderItem={({ item: order }) => (
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderName}>{order.name}</Text>
              <Pressable
                onPress={() =>
                  Linking.openURL(`mailto:${order.email}`).catch(() => {})
                }
              >
                <Text style={styles.orderEmail}>{order.email}</Text>
              </Pressable>
            </View>
            <View
              style={[
                styles.orderStatusBadge,
                {
                  borderColor: STATUS_COLOR[order.status] + "60",
                  backgroundColor: STATUS_COLOR[order.status] + "18",
                },
              ]}
            >
              <Text
                style={[
                  styles.orderStatusText,
                  { color: STATUS_COLOR[order.status] },
                ]}
              >
                {STATUS_LABEL[order.status]}
              </Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Level</Text>
              <Text style={styles.orderDetailValue}>
                {order.level.charAt(0).toUpperCase() + order.level.slice(1)}
              </Text>
            </View>
            {!!order.phone && (
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Phone</Text>
                <Text style={styles.orderDetailValue}>{order.phone}</Text>
              </View>
            )}
            {!!order.equipment && (
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Equipment</Text>
                <Text style={styles.orderDetailValue}>{order.equipment}</Text>
              </View>
            )}
          </View>

          <View style={styles.orderSection}>
            <Text style={styles.orderSectionLabel}>Goals</Text>
            <Text style={styles.orderSectionText}>{order.goals}</Text>
          </View>

          {!!order.notes && (
            <View style={styles.orderSection}>
              <Text style={styles.orderSectionLabel}>Additional notes</Text>
              <Text style={styles.orderSectionText}>{order.notes}</Text>
            </View>
          )}

          <View style={styles.orderActions}>
            <Pressable
              style={styles.orderActionEmail}
              onPress={() =>
                Linking.openURL(
                  `mailto:${order.email}?subject=Your Custom Workout Program — M² Training&body=Hi ${order.name.split(" ")[0]},\n\nHere is your custom workout program:\n\n[PROGRAM CONTENT]\n\nLet me know if you have any questions!\n\nMatt`
                ).catch(() => {})
              }
            >
              <Feather name="mail" size={14} color={C.dim} />
              <Text style={styles.orderActionEmailText}>Email Program</Text>
            </Pressable>

            {order.status !== "sent" && (
              <Pressable
                style={styles.orderActionSent}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  markStoreOrderSent(order.id);
                }}
              >
                <Feather name="check" size={14} color="#fff" />
                <Text style={styles.orderActionSentText}>Mark Sent</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.orderDate}>
            Received{" "}
            {new Date(order.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      )}
    />
  );
});
