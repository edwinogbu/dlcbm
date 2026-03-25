import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/colors";
import { BORDER_RADIUS, SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";
import { useReport } from "../../../context/ReportContext";

export default function GroupInfoScreen() {
  const router = useRouter();
  const { currentReport, updateReport } = useReport();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groupModal, setGroupModal] = useState(false);
  const [pastorModal, setPastorModal] = useState(false);

  const [formData, setFormData] = useState({
    groupName: currentReport.groupName || "",
    groupPastor: currentReport.groupPastor || "",
    date: currentReport.date ? new Date(currentReport.date) : new Date(),
  });

  // Sample data - will be replaced with API later
  const groups = [
    { id: "1", name: "Ikorodu Group" },
    { id: "2", name: "Surulere Group" },
    { id: "3", name: "Yaba Group" },
    { id: "4", name: "Victoria Island Group" },
    { id: "5", name: "Lekki Group" },
    { id: "6", name: "Maryland Group" },
    { id: "7", name: "Ikeja Group" },
    { id: "8", name: "Ogba Group" },
  ];

  const pastors = [
    { id: "1", name: "Pastor James Ade" },
    { id: "2", name: "Pastor Mary Ojo" },
    { id: "3", name: "Pastor John Okoro" },
    { id: "4", name: "Pastor Sarah Adebayo" },
    { id: "5", name: "Pastor David Ogunleye" },
  ];

  const handleNext = () => {
    if (!formData.groupName) {
      Alert.alert("Selection Required", "Please select a fellowship group");
      return;
    }
    if (!formData.groupPastor) {
      Alert.alert("Selection Required", "Please select a group pastor");
      return;
    }

    // Save to context and storage
    updateReport({
      groupName: formData.groupName,
      groupPastor: formData.groupPastor,
      date: formData.date.toISOString(),
    });

    // Save to AsyncStorage for persistence
    AsyncStorage.setItem("lastGroup", formData.groupName);
    AsyncStorage.setItem("lastPastor", formData.groupPastor);

    router.push("/(app)/report/DistrictListScreen");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const SelectorModal = ({ visible, onClose, data, onSelect, title }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item.name);
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
                <Icon name="chevron-right" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.success]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>New Group Report</Text>
        <Text style={styles.headerSubtitle}>Step 1 of 13</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "7.7%" }]} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Group Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>
            GROUP <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setGroupModal(true)}
          >
            <Text
              style={
                formData.groupName
                  ? styles.selectorText
                  : styles.selectorPlaceholder
              }
            >
              {formData.groupName || "Select Group"}
            </Text>
            <Icon name="arrow-drop-down" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Pastor Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>
            GROUP PASTOR <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setPastorModal(true)}
          >
            <Text
              style={
                formData.groupPastor
                  ? styles.selectorText
                  : styles.selectorPlaceholder
              }
            >
              {formData.groupPastor || "Select Group Pastor"}
            </Text>
            <Icon name="arrow-drop-down" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>
            DATE <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectorText}>{formatDate(formData.date)}</Text>
            <Icon name="calendar-today" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, date: selectedDate });
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="info-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {`You'll add districts and attendance in the next steps`}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Icon name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <SelectorModal
        visible={groupModal}
        onClose={() => setGroupModal(false)}
        data={groups}
        onSelect={(value) => setFormData({ ...formData, groupName: value })}
        title="Select Group"
      />

      <SelectorModal
        visible={pastorModal}
        onClose={() => setPastorModal(false)}
        data={pastors}
        onSelect={(value) => setFormData({ ...formData, groupPastor: value })}
        title="Select Pastor"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white + "CC",
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: SPACING.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  selectorText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
  },
  selectorPlaceholder: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.gray,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  nextButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalItemText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
  },
});
