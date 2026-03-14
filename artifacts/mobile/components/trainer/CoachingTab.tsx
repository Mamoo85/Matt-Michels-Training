import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";
import {
  AppData,
  DeliveryFrequency,
  FREQ_LABELS,
  SUBSCRIPTION_TEMPLATES,
  SubscriptionInfo,
  fmt,
  getMonday,
  nowTs,
} from "@/utils/storage";
import { styles } from "./trainerStyles";

interface Props {
  data: AppData;
  replyToCheckIn: (checkInId: string, reply: string) => void;
  setClientSubscription: (clientId: number, info: SubscriptionInfo | null) => void;
}

type PkgDraft = {
  packageName: string;
  includeWorkouts: boolean;
  workoutFrequency: DeliveryFrequency;
  includeCheckins: boolean;
  checkinFrequency: DeliveryFrequency;
  monthlyPrice: string;
  notes: string;
};

const EMPTY_PKG: PkgDraft = {
  packageName: "",
  includeWorkouts: false,
  workoutFrequency: "monthly",
  includeCheckins: false,
  checkinFrequency: "monthly",
  monthlyPrice: "",
  notes: "",
};

export const CoachingTab = React.memo(function CoachingTab({ data, replyToCheckIn, setClientSubscription }: Props) {
  const insets = useSafeAreaInsets();
  const thisMonday = useMemo(() => getMonday(), []);

  const [expanded, setExpanded] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [planModal, setPlanModal] = useState<number | null>(null);
  const [tmplGroup, setTmplGroup] = useState<"Online Programs" | "In-Person Check-Ins" | "Combined">("Online Programs");
  const [pkgDraft, setPkgDraft] = useState<PkgDraft>(EMPTY_PKG);

  const coachingClients = useMemo(
    () => data.clients.filter((c) => !!c.subscription),
    [data.clients]
  );
  const unsubscribedClients = useMemo(
    () => data.clients.filter((c) => !c.subscription),
    [data.clients]
  );

  const handleCheckInReply = useCallback(
    (checkInId: string) => {
      if (!replyText.trim()) return;
      replyToCheckIn(checkInId, replyText.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReplyText("");
    },
    [replyText, replyToCheckIn]
  );

  const openPkgBuilder = useCallback(
    (clientId: number) => {
      const existing = data.clients.find((c) => c.id === clientId)?.subscription;
      setPkgDraft(
        existing
          ? {
              packageName: existing.packageName ?? "",
              includeWorkouts: !!existing.workoutFrequency,
              workoutFrequency: existing.workoutFrequency ?? "monthly",
              includeCheckins: !!existing.checkinFrequency,
              checkinFrequency: existing.checkinFrequency ?? "monthly",
              monthlyPrice: String(existing.monthlyPrice ?? ""),
              notes: existing.notes ?? "",
            }
          : EMPTY_PKG
      );
      setPlanModal(clientId);
    },
    [data.clients]
  );

  const savePkg = useCallback(() => {
    if (planModal === null) return;
    const price = parseFloat(pkgDraft.monthlyPrice);
    if (isNaN(price) || price < 0) return;
    const info: SubscriptionInfo = {
      status: "active",
      startedAt:
        data.clients.find((c) => c.id === planModal)?.subscription?.startedAt ??
        nowTs(),
      packageName: pkgDraft.packageName.trim() || "Custom Coaching Package",
      workoutFrequency: pkgDraft.includeWorkouts ? pkgDraft.workoutFrequency : null,
      checkinFrequency: pkgDraft.includeCheckins ? pkgDraft.checkinFrequency : null,
      monthlyPrice: price,
      notes: pkgDraft.notes.trim() || undefined,
    };
    setClientSubscription(planModal, info);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPlanModal(null);
  }, [planModal, pkgDraft, data.clients, setClientSubscription]);

  const pb = (Platform.OS === "web" ? 34 : insets.bottom) + 100;

  if (coachingClients.length === 0 && unsubscribedClients.length === 0) {
    return (
      <View style={[styles.emptyState, { paddingTop: 40 }]}>
        <Feather name="users" size={36} color={C.muted} />
        <Text style={styles.emptyText}>No coaching clients yet.</Text>
        <Text style={styles.emptySubText}>
          When you assign a subscription plan to a client, they appear here.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={coachingClients}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
        ListHeaderComponent={
          coachingClients.length > 0 ? (
            <Text style={styles.inqSectionLabel}>ONLINE COACHING CLIENTS</Text>
          ) : null
        }
        ListFooterComponent={
          unsubscribedClients.length > 0 ? (
            <>
              <Text style={[styles.inqSectionLabel, { marginTop: 16 }]}>
                ASSIGN A SUBSCRIPTION
              </Text>
              {unsubscribedClients.map((client) => (
                <View key={client.id} style={styles.coachNoPlanCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coachNoPlanName}>{client.name}</Text>
                    {!!client.email && (
                      <Text style={styles.coachNoPlanEmail}>
                        {client.email}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.coachConfigureBtn}
                    onPress={() => openPkgBuilder(client.id)}
                  >
                    <Feather name="plus" size={13} color="#fff" />
                    <Text style={styles.coachConfigureBtnText}>Configure</Text>
                  </Pressable>
                </View>
              ))}
            </>
          ) : null
        }
        renderItem={({ item: client }) => {
          const sub = client.subscription!;
          const thisWeekCheckIn = (data.weeklyCheckIns || []).find(
            (ci) => ci.clientId === client.id && ci.weekOf === thisMonday
          );
          const isExpanded = expanded === client.id;
          const prevCheckIns = [...(data.weeklyCheckIns || [])]
            .filter((ci) => ci.clientId === client.id && ci.weekOf !== thisMonday)
            .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
            .slice(0, 3);

          return (
            <View style={styles.coachCard}>
              <Pressable
                style={styles.coachHeader}
                onPress={() => {
                  setExpanded(isExpanded ? null : client.id);
                  setReplyText("");
                  Haptics.selectionAsync();
                }}
              >
                <View style={styles.coachHeaderLeft}>
                  <Text style={styles.coachName}>{client.name}</Text>
                  <View style={styles.coachMeta}>
                    <View style={styles.coachPlanBadge}>
                      <Text style={styles.coachPlanText}>
                        {sub.packageName || "Custom Package"} · ${sub.monthlyPrice}/mo
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.coachStatusDot,
                        {
                          backgroundColor:
                            sub.status === "active"
                              ? C.green
                              : sub.status === "paused"
                              ? C.orange
                              : "#e84040",
                        },
                      ]}
                    />
                    <Text style={styles.coachStatusLabel}>{sub.status}</Text>
                  </View>
                </View>
                <View style={styles.coachHeaderRight}>
                  {thisWeekCheckIn ? (
                    <View style={styles.checkInDone}>
                      <Feather name="check-circle" size={14} color={C.green} />
                      <Text style={[styles.checkInStatusText, { color: C.green }]}>
                        Checked in
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.checkInMissing}>
                      <Feather name="alert-circle" size={14} color="#e84040" />
                      <Text
                        style={[styles.checkInStatusText, { color: "#e84040" }]}
                      >
                        No check-in
                      </Text>
                    </View>
                  )}
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={C.dim}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.coachDetail}>
                  <Text style={styles.coachSectionLabel}>THIS WEEK</Text>
                  {thisWeekCheckIn ? (
                    <View style={styles.coachCheckInCard}>
                      <View style={styles.coachRatingRow}>
                        <View style={styles.coachRatingItem}>
                          <Text style={styles.coachRatingLabel}>Training</Text>
                          <Text
                            style={[
                              styles.coachRatingVal,
                              {
                                color:
                                  thisWeekCheckIn.trainingQuality >= 7
                                    ? C.green
                                    : thisWeekCheckIn.trainingQuality >= 5
                                    ? C.orange
                                    : "#e84040",
                              },
                            ]}
                          >
                            {thisWeekCheckIn.trainingQuality}/10
                          </Text>
                        </View>
                        <View style={styles.coachRatingItem}>
                          <Text style={styles.coachRatingLabel}>Energy</Text>
                          <Text
                            style={[
                              styles.coachRatingVal,
                              {
                                color:
                                  thisWeekCheckIn.energyRecovery >= 7
                                    ? C.green
                                    : thisWeekCheckIn.energyRecovery >= 5
                                    ? C.orange
                                    : "#e84040",
                              },
                            ]}
                          >
                            {thisWeekCheckIn.energyRecovery}/10
                          </Text>
                        </View>
                        {!!thisWeekCheckIn.bodyWeight && (
                          <View style={styles.coachRatingItem}>
                            <Text style={styles.coachRatingLabel}>Weight</Text>
                            <Text style={styles.coachRatingVal}>
                              {thisWeekCheckIn.bodyWeight} lbs
                            </Text>
                          </View>
                        )}
                      </View>
                      {!!thisWeekCheckIn.wins && (
                        <View style={styles.coachFieldRow}>
                          <Text style={styles.coachFieldLabel}>WINS</Text>
                          <Text style={styles.coachFieldValue}>
                            {thisWeekCheckIn.wins}
                          </Text>
                        </View>
                      )}
                      {!!thisWeekCheckIn.struggles && (
                        <View style={styles.coachFieldRow}>
                          <Text style={styles.coachFieldLabel}>STRUGGLES</Text>
                          <Text style={styles.coachFieldValue}>
                            {thisWeekCheckIn.struggles}
                          </Text>
                        </View>
                      )}
                      {!!thisWeekCheckIn.questionsForMatt && (
                        <View style={styles.coachFieldRow}>
                          <Text style={[styles.coachFieldLabel, { color: C.orange }]}>
                            QUESTION
                          </Text>
                          <Text style={styles.coachFieldValue}>
                            {thisWeekCheckIn.questionsForMatt}
                          </Text>
                        </View>
                      )}

                      {thisWeekCheckIn.trainerReply ? (
                        <View style={styles.coachReplyDone}>
                          <Feather name="check-circle" size={13} color={C.green} />
                          <Text style={styles.coachReplyDoneText}>
                            Replied: {thisWeekCheckIn.trainerReply}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.coachReplyBox}>
                          <TextInput
                            style={styles.coachReplyInput}
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholder="Reply to check-in..."
                            placeholderTextColor={C.muted}
                            multiline
                          />
                          <Pressable
                            style={[
                              styles.coachReplyBtn,
                              !replyText.trim() && { opacity: 0.4 },
                            ]}
                            disabled={!replyText.trim()}
                            onPress={() => handleCheckInReply(thisWeekCheckIn.id)}
                          >
                            <Feather name="send" size={14} color="#fff" />
                            <Text style={styles.coachReplyBtnText}>Send Reply</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.coachNoCheckIn}>
                      <Feather name="alert-circle" size={16} color="#e84040" />
                      <Text style={styles.coachNoCheckInText}>
                        {client.name.split(" ")[0]} hasn't submitted a check-in this
                        week.
                      </Text>
                    </View>
                  )}

                  {prevCheckIns.length > 0 && (
                    <>
                      <Text style={[styles.coachSectionLabel, { marginTop: 14 }]}>
                        PREVIOUS
                      </Text>
                      {prevCheckIns.map((ci) => (
                        <View key={ci.id} style={styles.coachPrevCard}>
                          <View style={styles.coachPrevTop}>
                            <Text style={styles.coachPrevWeek}>
                              Week of {fmt(ci.weekOf)}
                            </Text>
                            <View style={styles.coachPrevRatings}>
                              <Text style={styles.coachPrevRating}>
                                T: {ci.trainingQuality}/10
                              </Text>
                              <Text style={styles.coachPrevRating}>
                                E: {ci.energyRecovery}/10
                              </Text>
                            </View>
                          </View>
                          {!!ci.questionsForMatt && (
                            <Text style={styles.coachPrevQ} numberOfLines={2}>
                              Q: {ci.questionsForMatt}
                            </Text>
                          )}
                        </View>
                      ))}
                    </>
                  )}

                  <Text style={[styles.coachSectionLabel, { marginTop: 14 }]}>
                    PACKAGE
                  </Text>
                  <View style={styles.coachPkgCard}>
                    <View style={styles.coachPkgRow}>
                      <Text style={styles.coachPkgLabel}>Name</Text>
                      <Text style={styles.coachPkgVal}>
                        {sub.packageName || "Custom Package"}
                      </Text>
                    </View>
                    <View style={styles.coachPkgRow}>
                      <Text style={styles.coachPkgLabel}>Price</Text>
                      <Text style={[styles.coachPkgVal, { color: C.orange }]}>
                        ${sub.monthlyPrice}/mo
                      </Text>
                    </View>
                    <View style={styles.coachPkgRow}>
                      <Text style={styles.coachPkgLabel}>Workouts</Text>
                      <Text style={styles.coachPkgVal}>
                        {sub.workoutFrequency
                          ? FREQ_LABELS[sub.workoutFrequency]
                          : "Not included"}
                      </Text>
                    </View>
                    <View style={styles.coachPkgRow}>
                      <Text style={styles.coachPkgLabel}>In-Person</Text>
                      <Text style={styles.coachPkgVal}>
                        {sub.checkinFrequency
                          ? FREQ_LABELS[sub.checkinFrequency]
                          : "Not included"}
                      </Text>
                    </View>
                    {!!sub.notes && (
                      <View style={[styles.coachPkgRow, { alignItems: "flex-start" }]}>
                        <Text style={styles.coachPkgLabel}>Notes</Text>
                        <Text style={[styles.coachPkgVal, { flex: 1 }]}>
                          {sub.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Pressable
                    style={styles.coachEditPkgBtn}
                    onPress={() => openPkgBuilder(client.id)}
                  >
                    <Feather name="edit-2" size={13} color={C.orange} />
                    <Text style={styles.coachEditPkgText}>Edit Package</Text>
                  </Pressable>
                  <View style={styles.coachSubActions}>
                    <Pressable
                      style={[
                        styles.coachSubStatusBtn,
                        sub.status === "active" && {
                          borderColor: C.green,
                          backgroundColor: `${C.green}15`,
                        },
                      ]}
                      onPress={() => {
                        setClientSubscription(client.id, {
                          ...sub,
                          status: sub.status === "active" ? "paused" : "active",
                        });
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                    >
                      <Text
                        style={[
                          styles.coachSubStatusText,
                          sub.status === "active" && { color: C.green },
                        ]}
                      >
                        {sub.status === "active"
                          ? "Active — tap to pause"
                          : "Paused — tap to reactivate"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.coachSubRemoveBtn}
                      onPress={() => {
                        setClientSubscription(client.id, null);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                    >
                      <Text style={styles.coachSubRemoveText}>
                        Remove subscription
                      </Text>
                    </Pressable>
                  </View>

                  {!!client.email && (
                    <Pressable
                      style={styles.coachEmailBtn}
                      onPress={() =>
                        Linking.openURL(
                          `mailto:${client.email}?subject=M² Coaching — Weekly Update&body=Hi ${client.name.split(" ")[0]},\n\n`
                        ).catch(() => {})
                      }
                    >
                      <Feather name="mail" size={14} color={C.dim} />
                      <Text style={styles.coachEmailBtnText}>
                        Email {client.name.split(" ")[0]}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />

      {/* PACKAGE BUILDER MODAL */}
      <Modal
        visible={planModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlanModal(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setPlanModal(null)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {data.clients.find((c) => c.id === planModal)?.subscription
                ? "Edit Package"
                : "Configure Package"}
            </Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.pkgBuilderLabel}>START FROM A TEMPLATE</Text>
            <View style={styles.tmplGroupRow}>
              {(
                ["Online Programs", "In-Person Check-Ins", "Combined"] as const
              ).map((g) => (
                <Pressable
                  key={g}
                  style={[
                    styles.tmplGroupTab,
                    tmplGroup === g && styles.tmplGroupTabActive,
                  ]}
                  onPress={() => setTmplGroup(g)}
                >
                  <Text
                    style={[
                      styles.tmplGroupText,
                      tmplGroup === g && styles.tmplGroupTextActive,
                    ]}
                  >
                    {g === "Online Programs"
                      ? "Online"
                      : g === "In-Person Check-Ins"
                      ? "In-Person"
                      : "Combined"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tmplScroll}
              contentContainerStyle={styles.tmplScrollContent}
            >
              {SUBSCRIPTION_TEMPLATES.filter((t) => t.group === tmplGroup).map(
                (tmpl) => {
                  const isActive =
                    pkgDraft.packageName === tmpl.packageName &&
                    pkgDraft.includeWorkouts === tmpl.includeWorkouts &&
                    pkgDraft.workoutFrequency === tmpl.workoutFrequency &&
                    pkgDraft.includeCheckins === tmpl.includeCheckins &&
                    pkgDraft.checkinFrequency === tmpl.checkinFrequency &&
                    pkgDraft.monthlyPrice === String(tmpl.monthlyPrice);
                  return (
                    <Pressable
                      key={tmpl.name}
                      style={[styles.tmplCard, isActive && styles.tmplCardActive]}
                      onPress={() => {
                        setPkgDraft({
                          packageName: tmpl.packageName,
                          includeWorkouts: tmpl.includeWorkouts,
                          workoutFrequency: tmpl.workoutFrequency,
                          includeCheckins: tmpl.includeCheckins,
                          checkinFrequency: tmpl.checkinFrequency,
                          monthlyPrice: String(tmpl.monthlyPrice),
                          notes: "",
                        });
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text
                        style={[
                          styles.tmplCardName,
                          isActive && { color: C.orange },
                        ]}
                      >
                        {tmpl.name}
                      </Text>
                      <Text style={styles.tmplCardTagline}>{tmpl.tagline}</Text>
                      <View style={styles.tmplCardDetails}>
                        {tmpl.includeWorkouts && (
                          <View style={styles.tmplChip}>
                            <Feather name="file-text" size={10} color={C.dim} />
                            <Text style={styles.tmplChipText}>
                              {FREQ_LABELS[tmpl.workoutFrequency]}
                            </Text>
                          </View>
                        )}
                        {tmpl.includeCheckins && (
                          <View style={styles.tmplChip}>
                            <Feather name="users" size={10} color={C.dim} />
                            <Text style={styles.tmplChipText}>
                              {FREQ_LABELS[tmpl.checkinFrequency]}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.tmplCardPrice,
                          isActive && { color: C.orange },
                        ]}
                      >
                        ${tmpl.monthlyPrice}/mo
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>

            <Text style={[styles.pkgBuilderLabel, { marginTop: 8 }]}>
              PACKAGE NAME
            </Text>
            <TextInput
              style={styles.pkgBuilderInput}
              value={pkgDraft.packageName}
              onChangeText={(v) => setPkgDraft((d) => ({ ...d, packageName: v }))}
              placeholder="e.g. Competition Prep, Online Strength..."
              placeholderTextColor={C.muted}
            />

            <View style={styles.pkgToggleRow}>
              <View>
                <Text style={styles.pkgBuilderSectionTitle}>
                  Workout Programs
                </Text>
                <Text style={styles.pkgBuilderSectionSub}>
                  Custom programs delivered on a schedule
                </Text>
              </View>
              <Pressable
                style={[
                  styles.pkgToggle,
                  pkgDraft.includeWorkouts && styles.pkgToggleOn,
                ]}
                onPress={() => {
                  setPkgDraft((d) => ({ ...d, includeWorkouts: !d.includeWorkouts }));
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.pkgToggleThumb,
                    pkgDraft.includeWorkouts && styles.pkgToggleThumbOn,
                  ]}
                />
              </Pressable>
            </View>
            {pkgDraft.includeWorkouts && (
              <View style={styles.pkgFreqRow}>
                {(
                  ["weekly", "biweekly", "monthly", "bimonthly"] as DeliveryFrequency[]
                ).map((f) => (
                  <Pressable
                    key={f}
                    style={[
                      styles.pkgFreqChip,
                      pkgDraft.workoutFrequency === f && styles.pkgFreqChipActive,
                    ]}
                    onPress={() => {
                      setPkgDraft((d) => ({ ...d, workoutFrequency: f }));
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text
                      style={[
                        styles.pkgFreqChipText,
                        pkgDraft.workoutFrequency === f &&
                          styles.pkgFreqChipTextActive,
                      ]}
                    >
                      {FREQ_LABELS[f]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={[styles.pkgToggleRow, { marginTop: 16 }]}>
              <View>
                <Text style={styles.pkgBuilderSectionTitle}>
                  In-Person Check-Ins
                </Text>
                <Text style={styles.pkgBuilderSectionSub}>
                  Scheduled sessions at the studio
                </Text>
              </View>
              <Pressable
                style={[
                  styles.pkgToggle,
                  pkgDraft.includeCheckins && styles.pkgToggleOn,
                ]}
                onPress={() => {
                  setPkgDraft((d) => ({ ...d, includeCheckins: !d.includeCheckins }));
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.pkgToggleThumb,
                    pkgDraft.includeCheckins && styles.pkgToggleThumbOn,
                  ]}
                />
              </Pressable>
            </View>
            {pkgDraft.includeCheckins && (
              <View style={styles.pkgFreqRow}>
                {(
                  ["weekly", "biweekly", "monthly", "bimonthly"] as DeliveryFrequency[]
                ).map((f) => (
                  <Pressable
                    key={f}
                    style={[
                      styles.pkgFreqChip,
                      pkgDraft.checkinFrequency === f && styles.pkgFreqChipActive,
                    ]}
                    onPress={() => {
                      setPkgDraft((d) => ({ ...d, checkinFrequency: f }));
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text
                      style={[
                        styles.pkgFreqChipText,
                        pkgDraft.checkinFrequency === f &&
                          styles.pkgFreqChipTextActive,
                      ]}
                    >
                      {FREQ_LABELS[f]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={[styles.pkgBuilderLabel, { marginTop: 20 }]}>
              MONTHLY PRICE ($)
            </Text>
            <TextInput
              style={styles.pkgBuilderInput}
              value={pkgDraft.monthlyPrice}
              onChangeText={(v) =>
                setPkgDraft((d) => ({
                  ...d,
                  monthlyPrice: v.replace(/[^0-9.]/g, ""),
                }))
              }
              placeholder="e.g. 150"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.pkgBuilderLabel, { marginTop: 16 }]}>
              NOTES (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.pkgBuilderInput,
                { minHeight: 80, textAlignVertical: "top" },
              ]}
              value={pkgDraft.notes}
              onChangeText={(v) => setPkgDraft((d) => ({ ...d, notes: v }))}
              placeholder="Any additional details about this package..."
              placeholderTextColor={C.muted}
              multiline
            />

            <Pressable
              style={[
                styles.pkgSaveBtn,
                (!pkgDraft.monthlyPrice.trim() ||
                  isNaN(parseFloat(pkgDraft.monthlyPrice))) && { opacity: 0.4 },
              ]}
              disabled={
                !pkgDraft.monthlyPrice.trim() ||
                isNaN(parseFloat(pkgDraft.monthlyPrice))
              }
              onPress={savePkg}
            >
              <Text style={styles.pkgSaveBtnText}>
                {data.clients.find((c) => c.id === planModal)?.subscription
                  ? "Save Changes"
                  : "Assign Package"}
              </Text>
            </Pressable>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
});
