import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiftChart } from "@/components/LiftChart";
import { Tag } from "@/components/ui/Tag";
import C from "@/constants/colors";
import {
  AppData,
  CustomProgram,
  LIFTS,
  fmtS,
  today,
  uid,
} from "@/utils/storage";
import { styles } from "./trainerStyles";

type ClientView = "overview" | "log" | "messages" | "assessments" | "programs";

interface Props {
  selId: number;
  data: AppData;
  updateData: (fn: (d: AppData) => AppData) => void;
  saveProgram: (program: CustomProgram) => void;
  deliverProgram: (programId: string) => void;
  onBack: () => void;
  onDelete: (id: number) => void;
}

const VIEW_LABELS: Record<ClientView, string> = {
  overview: "Overview",
  log: "Log Lift",
  messages: "Messages",
  assessments: "Assessments",
  programs: "Programs",
};

export const ClientDetail = React.memo(function ClientDetail({
  selId,
  data,
  updateData,
  saveProgram,
  deliverProgram,
  onBack,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<ClientView>("overview");

  // Log form
  const [logLift, setLogLift] = useState(LIFTS[0]);
  const [logWeight, setLogWeight] = useState("");
  const [logSets, setLogSets] = useState("");
  const [logReps, setLogReps] = useState("");
  const [logDate, setLogDate] = useState(today());
  const [logNote, setLogNote] = useState("");
  const [logErr, setLogErr] = useState("");
  const [logOk, setLogOk] = useState(false);

  // Note
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Message reply
  const [replyMsgId, setReplyMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [activeLift, setActiveLift] = useState(LIFTS[0]);

  // Program builder
  const [pgTitle, setPgTitle] = useState("");
  const [pgNotes, setPgNotes] = useState("");
  const [pgExName, setPgExName] = useState("");
  const [pgExSets, setPgExSets] = useState("");
  const [pgExReps, setPgExReps] = useState("");
  const [pgExWeight, setPgExWeight] = useState("");
  const [pgExRest, setPgExRest] = useState("");
  const [pgExCues, setPgExCues] = useState("");
  const [pgExercises, setPgExercises] = useState<
    Array<{
      id: string;
      name: string;
      sets: string;
      reps: string;
      weight: string;
      rest: string;
      coachingCues: string;
    }>
  >([]);
  const [pgEditId, setPgEditId] = useState<string | null>(null);
  const [pgOk, setPgOk] = useState("");

  const selClient = useMemo(
    () => data.clients.find((c) => c.id === selId),
    [data.clients, selId]
  );

  const unreadCount = useMemo(
    () => selClient?.messages.filter((m) => !m.trainerRead).length || 0,
    [selClient?.messages]
  );

  const getPR = useCallback(
    (lift: string) => {
      const entries = selClient?.entries.filter(
        (e) => e.lift === lift && e.weight
      );
      if (!entries?.length) return null;
      return Math.max(...entries.map((e) => e.weight));
    },
    [selClient?.entries]
  );

  const handleLog = useCallback(() => {
    if (!+logWeight) {
      setLogErr("Enter a weight.");
      return;
    }
    updateData((d) => {
      const c = d.clients.find((x) => x.id === selId);
      if (c) {
        c.entries.push({
          lift: logLift,
          weight: +logWeight,
          sets: logSets ? +logSets : null,
          reps: logReps ? +logReps : null,
          date: logDate || today(),
          note: logNote,
        });
      }
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogWeight("");
    setLogSets("");
    setLogReps("");
    setLogNote("");
    setLogDate(today());
    setLogErr("");
    setLogOk(true);
    setTimeout(() => setLogOk(false), 3000);
  }, [logLift, logWeight, logSets, logReps, logDate, logNote, selId, updateData]);

  const saveNote = useCallback(() => {
    updateData((d) => {
      const c = d.clients.find((x) => x.id === selId);
      if (c) c.trainerNote = noteText;
      return d;
    });
    setEditNote(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [noteText, selId, updateData]);

  const handleReply = useCallback(() => {
    if (!replyText.trim() || !replyMsgId) return;
    updateData((d) => {
      const c = d.clients.find((x) => x.id === selId);
      if (c) {
        const m = c.messages.find((x) => x.id === replyMsgId);
        if (m) {
          m.trainerReply = replyText.trim();
          m.trainerRead = true;
        }
      }
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReplyMsgId(null);
    setReplyText("");
  }, [replyText, replyMsgId, selId, updateData]);

  const pb = (Platform.OS === "web" ? 34 : insets.bottom) + 100;

  if (!selClient) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* SUB-HEADER */}
      <View style={styles.subHeader}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientDetailName}>{selClient.name}</Text>
          {!!selClient.goal && (
            <Text style={styles.clientDetailGoal}>{selClient.goal}</Text>
          )}
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onDelete(selId);
          }}
        >
          <Feather name="trash-2" size={18} color={C.red} />
        </Pressable>
      </View>

      {/* VIEW TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.viewTabs}
      >
        {(
          ["overview", "log", "messages", "assessments", "programs"] as ClientView[]
        ).map((v) => (
          <Pressable
            key={v}
            onPress={() => setView(v)}
            style={[styles.viewTab, view === v && styles.viewTabActive]}
          >
            <Text
              style={[
                styles.viewTabText,
                view === v && styles.viewTabTextActive,
              ]}
            >
              {VIEW_LABELS[v]}
              {v === "messages" && unreadCount > 0 && ` (${unreadCount})`}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* OVERVIEW */}
      {view === "overview" && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 14 }}
          >
            {LIFTS.map((l) => {
              const pr = getPR(l);
              return (
                <View key={l} style={styles.prCard}>
                  <Text style={styles.prValue}>{pr ? `${pr}` : "—"}</Text>
                  <Text style={styles.prLabel}>
                    {l === "Overhead Press" ? "OHP" : l.split(" ")[0]}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.noteCard}>
            <View style={styles.noteHeaderRow}>
              <Text style={styles.noteLabel}>Trainer Note</Text>
              <Pressable
                onPress={() => {
                  if (!editNote) setNoteText(selClient.trainerNote || "");
                  setEditNote(!editNote);
                }}
              >
                <Feather
                  name={editNote ? "x" : "edit-2"}
                  size={14}
                  color={C.dim}
                />
              </Pressable>
            </View>
            {editNote ? (
              <>
                <TextInput
                  style={styles.noteInput}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Notes for this client..."
                  placeholderTextColor={C.muted}
                  multiline
                />
                <Pressable style={styles.saveNoteBtn} onPress={saveNote}>
                  <Text style={styles.saveNoteBtnText}>Save</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.noteText}>
                {selClient.trainerNote ||
                  "No note yet. Tap the edit button to add one."}
              </Text>
            )}
          </View>

          <View style={styles.chartCard}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, marginBottom: 12 }}
            >
              {LIFTS.map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setActiveLift(l)}
                  style={[
                    styles.liftTab,
                    activeLift === l && styles.liftTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.liftTabText,
                      activeLift === l && styles.liftTabTextActive,
                    ]}
                  >
                    {l}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <LiftChart entries={selClient.entries || []} lift={activeLift} />
          </View>

          <Text style={styles.sectionLabel}>RECENT ENTRIES</Text>
          {(selClient.entries || []).length === 0 ? (
            <Text style={styles.dimText}>No entries yet.</Text>
          ) : (
            [...(selClient.entries || [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map((e, i) => (
                <View key={i} style={styles.entryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryLift}>{e.lift}</Text>
                    {!!e.note && <Text style={styles.entryNote}>{e.note}</Text>}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.entryWeight}>{e.weight} lbs</Text>
                    {(e.sets || e.reps) && (
                      <Text style={styles.entrySetsReps}>
                        {e.sets}×{e.reps}
                      </Text>
                    )}
                    <Text style={styles.entryDate}>{fmtS(e.date)}</Text>
                  </View>
                </View>
              ))
          )}
        </ScrollView>
      )}

      {/* LOG LIFT */}
      {view === "log" && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
          keyboardShouldPersistTaps="handled"
        >
          {logOk && (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={16} color={C.green} />
              <Text style={styles.successText}>Entry logged!</Text>
            </View>
          )}
          <Text style={styles.fieldLabel}>Lift</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, marginBottom: 14 }}
          >
            {LIFTS.map((l) => (
              <Pressable
                key={l}
                onPress={() => setLogLift(l)}
                style={[styles.liftTab, logLift === l && styles.liftTabActive]}
              >
                <Text
                  style={[
                    styles.liftTabText,
                    logLift === l && styles.liftTabTextActive,
                  ]}
                >
                  {l}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.fieldLabel}>Weight (lbs) *</Text>
          <TextInput
            style={styles.input}
            value={logWeight}
            onChangeText={(t) => {
              setLogWeight(t);
              setLogErr("");
            }}
            placeholder="185"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Sets</Text>
              <TextInput
                style={styles.input}
                value={logSets}
                onChangeText={setLogSets}
                placeholder="3"
                placeholderTextColor={C.muted}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.fieldLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={logReps}
                onChangeText={setLogReps}
                placeholder="5"
                placeholderTextColor={C.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Date</Text>
          <TextInput
            style={styles.input}
            value={logDate}
            onChangeText={setLogDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={C.muted}
          />
          <Text style={styles.fieldLabel}>Note (optional)</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            value={logNote}
            onChangeText={setLogNote}
            placeholder="e.g. Form looked solid"
            placeholderTextColor={C.muted}
            multiline
          />
          {!!logErr && <Text style={styles.errText}>{logErr}</Text>}
          <Pressable style={styles.logBtn} onPress={handleLog}>
            <Text style={styles.logBtnText}>Log Entry</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* MESSAGES */}
      {view === "messages" && (
        <FlatList
          data={[...(selClient.messages || [])].sort((a, b) =>
            b.timestamp.localeCompare(a.timestamp)
          )}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={28} color={C.muted} />
              <Text style={styles.emptyText}>No messages from this client.</Text>
            </View>
          }
          renderItem={({ item: m }) => (
            <View style={styles.msgCard}>
              <View style={styles.msgTop}>
                <Tag label={m.type.replace("_", " ")} color={C.dim} />
                <Text style={styles.msgDate}>
                  {fmtS(m.timestamp.split("T")[0])}
                </Text>
              </View>
              <Text style={styles.msgText}>{m.text}</Text>
              {!!m.preferredDate && (
                <Text style={styles.msgMeta}>Preferred: {m.preferredDate}</Text>
              )}
              {!!m.trainerReply && (
                <View style={styles.replyBox}>
                  <Text style={styles.replyText}>{m.trainerReply}</Text>
                </View>
              )}
              {!m.trainerReply && (
                <Pressable
                  style={styles.replyBtn}
                  onPress={() => {
                    setReplyMsgId(m.id);
                    setReplyText("");
                  }}
                >
                  <Feather name="corner-down-right" size={13} color={C.orange} />
                  <Text style={styles.replyBtnText}>Reply</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}

      {/* ASSESSMENTS */}
      {view === "assessments" && (
        <FlatList
          data={(data.assessments || [])
            .filter((a) => a.clientId === selId)
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))}
          keyExtractor={(a) => a.id}
          contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="clipboard" size={28} color={C.muted} />
              <Text style={styles.emptyText}>No assessments yet.</Text>
            </View>
          }
          renderItem={({ item: a }) => (
            <View style={styles.assessCard}>
              <View style={styles.assessTop}>
                <Tag
                  label={a.type === "video" ? "Video" : "Zoom"}
                  color={C.blue}
                />
                <Text style={styles.msgDate}>
                  {fmtS(a.submittedAt.split("T")[0])}
                </Text>
              </View>
              {a.type === "video" && !!a.videoUrl && (
                <Text style={styles.msgMeta}>Video: {a.videoUrl}</Text>
              )}
              {a.type === "zoom" && (
                <Text style={styles.msgMeta}>
                  {a.zoomDate || ""} {a.zoomTime || ""}
                </Text>
              )}
              {!!a.clientNotes && (
                <Text style={styles.msgText}>{a.clientNotes}</Text>
              )}
              {!!a.trainerNotes && (
                <View style={styles.replyBox}>
                  <Text style={styles.replyText}>{a.trainerNotes}</Text>
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* PROGRAMS */}
      {view === "programs" && (
        <ProgramsView
          selId={selId}
          data={data}
          saveProgram={saveProgram}
          deliverProgram={deliverProgram}
          pgTitle={pgTitle}
          setPgTitle={setPgTitle}
          pgNotes={pgNotes}
          setPgNotes={setPgNotes}
          pgExName={pgExName}
          setPgExName={setPgExName}
          pgExSets={pgExSets}
          setPgExSets={setPgExSets}
          pgExReps={pgExReps}
          setPgExReps={setPgExReps}
          pgExWeight={pgExWeight}
          setPgExWeight={setPgExWeight}
          pgExRest={pgExRest}
          setPgExRest={setPgExRest}
          pgExCues={pgExCues}
          setPgExCues={setPgExCues}
          pgExercises={pgExercises}
          setPgExercises={setPgExercises}
          pgEditId={pgEditId}
          setPgEditId={setPgEditId}
          pgOk={pgOk}
          setPgOk={setPgOk}
          pb={pb}
        />
      )}

      {/* REPLY MODAL */}
      <Modal
        visible={!!replyMsgId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReplyMsgId(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setReplyMsgId(null)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>Reply to Message</Text>
            <View style={{ width: 22 }} />
          </View>
          <View style={styles.modalBody}>
            <TextInput
              style={[styles.noteInput, { minHeight: 120 }]}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Your reply..."
              placeholderTextColor={C.muted}
              multiline
              autoFocus
            />
            <Pressable
              style={[
                styles.logBtn,
                { marginTop: 8 },
                !replyText.trim() && { opacity: 0.4 },
              ]}
              disabled={!replyText.trim()}
              onPress={handleReply}
            >
              <Text style={styles.logBtnText}>Send Reply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
});

// ─── Programs sub-view ────────────────────────────────────────────────────────
interface ProgramsViewProps {
  selId: number;
  data: AppData;
  saveProgram: (p: CustomProgram) => void;
  deliverProgram: (id: string) => void;
  pgTitle: string; setPgTitle: (v: string) => void;
  pgNotes: string; setPgNotes: (v: string) => void;
  pgExName: string; setPgExName: (v: string) => void;
  pgExSets: string; setPgExSets: (v: string) => void;
  pgExReps: string; setPgExReps: (v: string) => void;
  pgExWeight: string; setPgExWeight: (v: string) => void;
  pgExRest: string; setPgExRest: (v: string) => void;
  pgExCues: string; setPgExCues: (v: string) => void;
  pgExercises: Array<{ id: string; name: string; sets: string; reps: string; weight: string; rest: string; coachingCues: string }>;
  setPgExercises: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; sets: string; reps: string; weight: string; rest: string; coachingCues: string }>>>;
  pgEditId: string | null; setPgEditId: (v: string | null) => void;
  pgOk: string; setPgOk: (v: string) => void;
  pb: number;
}

const ProgramsView = React.memo(function ProgramsView({
  selId, data, saveProgram, deliverProgram,
  pgTitle, setPgTitle, pgNotes, setPgNotes,
  pgExName, setPgExName, pgExSets, setPgExSets,
  pgExReps, setPgExReps, pgExWeight, setPgExWeight,
  pgExRest, setPgExRest, pgExCues, setPgExCues,
  pgExercises, setPgExercises, pgEditId, setPgEditId,
  pgOk, setPgOk, pb,
}: ProgramsViewProps) {
  const clientPrograms = useMemo(
    () =>
      (data.customPrograms || [])
        .filter((p) => p.clientId === selId)
        .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [data.customPrograms, selId]
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
      keyboardShouldPersistTaps="handled"
    >
      {!!pgOk && (
        <View style={styles.successBanner}>
          <Feather name="check-circle" size={16} color={C.green} />
          <Text style={styles.successText}>{pgOk}</Text>
        </View>
      )}

      {clientPrograms.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>EXISTING PROGRAMS</Text>
          {clientPrograms.map((p) => (
            <View key={p.id} style={styles.pgExistingCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pgExistingTitle}>
                  {p.title || "Untitled Program"}
                </Text>
                <Text style={styles.pgExistingMeta}>
                  {p.status === "requested"
                    ? "Requested"
                    : p.status === "draft"
                    ? "Draft"
                    : "Delivered"}
                  {p.exercises.length > 0 ? ` · ${p.exercises.length} exercises` : ""}
                </Text>
              </View>
              <View style={styles.pgExistingActions}>
                {p.status !== "delivered" && (
                  <>
                    <Pressable
                      style={[
                        styles.pgDeliverBtn,
                        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
                      ]}
                      onPress={() => {
                        setPgEditId(p.id);
                        setPgTitle(p.title || "");
                        setPgNotes(p.notes || "");
                        setPgExercises(
                          p.exercises.map((ex) => ({
                            id: ex.id || uid(),
                            name: ex.name,
                            sets: ex.sets || "",
                            reps: ex.reps || "",
                            weight: ex.weight || "",
                            rest: ex.rest || "",
                            coachingCues: ex.coachingCues || "",
                          }))
                        );
                      }}
                    >
                      <Feather name="edit-2" size={12} color={C.dim} />
                      <Text style={[styles.pgDeliverBtnText, { color: C.dim }]}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.pgDeliverBtn}
                      onPress={() => {
                        if (p.exercises.length === 0) {
                          setPgOk("Add exercises before delivering.");
                          setTimeout(() => setPgOk(""), 3000);
                          return;
                        }
                        deliverProgram(p.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setPgOk("Program delivered!");
                        setTimeout(() => setPgOk(""), 3000);
                      }}
                    >
                      <Feather name="send" size={12} color={C.white} />
                      <Text style={styles.pgDeliverBtnText}>Deliver</Text>
                    </Pressable>
                  </>
                )}
                {p.status === "delivered" && (
                  <Tag label="Delivered" color={C.green} />
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>
        {pgEditId ? "EDIT PROGRAM" : "BUILD NEW PROGRAM"}
      </Text>
      <View style={styles.pgBuilder}>
        <Text style={styles.fieldLabel}>Program Title *</Text>
        <TextInput
          style={styles.input}
          value={pgTitle}
          onChangeText={setPgTitle}
          placeholder="e.g. Off-Season Strength Phase 1"
          placeholderTextColor={C.muted}
        />

        <Text style={styles.fieldLabel}>Notes for Client</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={pgNotes}
          onChangeText={setPgNotes}
          placeholder="Overall coaching notes..."
          placeholderTextColor={C.muted}
          multiline
        />

        {pgExercises.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.fieldLabel}>Exercises ({pgExercises.length})</Text>
            {pgExercises.map((ex, i) => (
              <View key={ex.id} style={styles.pgExRow}>
                <View style={styles.pgExNum}>
                  <Text style={styles.pgExNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pgExRowName}>{ex.name}</Text>
                  <Text style={styles.pgExRowDetail}>
                    {[
                      ex.sets && `${ex.sets}s`,
                      ex.reps && `${ex.reps}r`,
                      ex.weight,
                      ex.rest && `rest ${ex.rest}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                <View style={styles.pgExActions}>
                  {i > 0 && (
                    <Pressable
                      onPress={() =>
                        setPgExercises((prev) => {
                          const arr = [...prev];
                          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                          return arr;
                        })
                      }
                    >
                      <Feather name="chevron-up" size={16} color={C.dim} />
                    </Pressable>
                  )}
                  {i < pgExercises.length - 1 && (
                    <Pressable
                      onPress={() =>
                        setPgExercises((prev) => {
                          const arr = [...prev];
                          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                          return arr;
                        })
                      }
                    >
                      <Feather name="chevron-down" size={16} color={C.dim} />
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() =>
                      setPgExercises((prev) => prev.filter((x) => x.id !== ex.id))
                    }
                  >
                    <Feather name="trash-2" size={14} color={C.red} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.pgAddExCard}>
          <Text style={styles.pgAddExTitle}>Add Exercise</Text>
          <TextInput
            style={styles.input}
            value={pgExName}
            onChangeText={setPgExName}
            placeholder="Exercise name *"
            placeholderTextColor={C.muted}
          />
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={pgExSets}
                onChangeText={setPgExSets}
                placeholder="Sets"
                placeholderTextColor={C.muted}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.input}
                value={pgExReps}
                onChangeText={setPgExReps}
                placeholder="Reps"
                placeholderTextColor={C.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={pgExWeight}
                onChangeText={setPgExWeight}
                placeholder="Weight / load"
                placeholderTextColor={C.muted}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.input}
                value={pgExRest}
                onChangeText={setPgExRest}
                placeholder="Rest (e.g. 90s)"
                placeholderTextColor={C.muted}
              />
            </View>
          </View>
          <TextInput
            style={[styles.input, { minHeight: 50 }]}
            value={pgExCues}
            onChangeText={setPgExCues}
            placeholder="Coaching cues (optional)"
            placeholderTextColor={C.muted}
            multiline
          />
          <Pressable
            style={[styles.pgAddExBtn, !pgExName.trim() && { opacity: 0.4 }]}
            disabled={!pgExName.trim()}
            onPress={() => {
              setPgExercises((prev) => [
                ...prev,
                {
                  id: uid(),
                  name: pgExName.trim(),
                  sets: pgExSets,
                  reps: pgExReps,
                  weight: pgExWeight,
                  rest: pgExRest,
                  coachingCues: pgExCues,
                },
              ]);
              setPgExName("");
              setPgExSets("");
              setPgExReps("");
              setPgExWeight("");
              setPgExRest("");
              setPgExCues("");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather name="plus" size={14} color={C.white} />
            <Text style={styles.pgAddExBtnText}>Add Exercise</Text>
          </Pressable>
        </View>

        <View style={{ gap: 8, marginTop: 10 }}>
          <Pressable
            style={[
              styles.logBtn,
              (!pgTitle.trim() || pgExercises.length === 0) && { opacity: 0.4 },
            ]}
            disabled={!pgTitle.trim() || pgExercises.length === 0}
            onPress={() => {
              const prog: CustomProgram = {
                id: pgEditId || uid(),
                clientId: selId,
                title: pgTitle.trim(),
                notes: pgNotes.trim(),
                exercises: pgExercises.map((ex) => ({
                  id: ex.id, name: ex.name, sets: ex.sets, reps: ex.reps,
                  weight: ex.weight, rest: ex.rest, coachingCues: ex.coachingCues,
                })),
                status: "draft",
                requestedAt:
                  (data.customPrograms || []).find((p) => p.id === pgEditId)
                    ?.requestedAt || new Date().toISOString(),
              };
              saveProgram(prog);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setPgOk("Program saved as draft!");
              setPgTitle(""); setPgNotes(""); setPgExercises([]); setPgEditId(null);
              setTimeout(() => setPgOk(""), 3000);
            }}
          >
            <Text style={styles.logBtnText}>Save as Draft</Text>
          </Pressable>

          <Pressable
            style={[
              styles.logBtn,
              { backgroundColor: C.green },
              (!pgTitle.trim() || pgExercises.length === 0) && { opacity: 0.4 },
            ]}
            disabled={!pgTitle.trim() || pgExercises.length === 0}
            onPress={() => {
              const progId = pgEditId || uid();
              const prog: CustomProgram = {
                id: progId,
                clientId: selId,
                title: pgTitle.trim(),
                notes: pgNotes.trim(),
                exercises: pgExercises.map((ex) => ({
                  id: ex.id, name: ex.name, sets: ex.sets, reps: ex.reps,
                  weight: ex.weight, rest: ex.rest, coachingCues: ex.coachingCues,
                })),
                status: "delivered",
                requestedAt:
                  (data.customPrograms || []).find((p) => p.id === pgEditId)
                    ?.requestedAt || new Date().toISOString(),
                deliveredAt: new Date().toISOString(),
              };
              saveProgram(prog);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setPgOk("Program delivered to client!");
              setPgTitle(""); setPgNotes(""); setPgExercises([]); setPgEditId(null);
              setTimeout(() => setPgOk(""), 3000);
            }}
          >
            <Text style={styles.logBtnText}>Save & Deliver to Client</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
});
