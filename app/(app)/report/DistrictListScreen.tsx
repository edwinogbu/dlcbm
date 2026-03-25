import { MaterialIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";
import { useReport } from "../../../context/ReportContext";

const { width } = Dimensions.get("window");

// District Card Component
const DistrictCard = ({ district, index, onEdit, onDelete, onPress }) => {
  if (!district) return null;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const calculateDistrictTotals = (district) => {
    if (!district) return 0;

    const adultTotal =
      (district.adult?.membersMale || 0) +
      (district.adult?.membersFemale || 0) +
      (district.adult?.visitorsMale || 0) +
      (district.adult?.visitorsFemale || 0);
    const youthTotal =
      (district.youth?.membersMale || 0) +
      (district.youth?.membersFemale || 0) +
      (district.youth?.visitorsMale || 0) +
      (district.youth?.visitorsFemale || 0);
    const childrenTotal =
      (district.children?.members || 0) + (district.children?.visitors || 0);
    return adultTotal + youthTotal + childrenTotal;
  };

  const totalAttendance = calculateDistrictTotals(district);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[COLORS.white, COLORS.background]}
        style={styles.districtCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.districtBadge}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.badgeText}>{index + 1}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.districtName}>
                {district.name || "Unnamed District"}
              </Text>
              <Text style={styles.districtCode}>
                {district.code || "No Code"}
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(district)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Icon name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(district.id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Icon name="delete" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBlock}>
            <Icon name="people" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{totalAttendance}</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Icon name="payments" size={20} color={COLORS.success} />
            <Text style={styles.statValue}>
              ₦{(district.offering || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Offering</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.attendanceButton}
          onPress={() => onPress(district.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.attendanceButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.attendanceButtonText}>Enter Attendance</Text>
            <Icon name="arrow-forward" size={18} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// District Modal Component
const DistrictModal = ({
  visible,
  onClose,
  onSave,
  title,
  isEdit = false,
  districtName,
  setDistrictName,
  districtCode,
  setDistrictCode,
  slideAnim,
  nameInputRef,
  codeInputRef,
  districtsLength,
  onSavePress,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <LinearGradient
                colors={[COLORS.white, COLORS.background]}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{title}</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.modalCloseButton}
                  >
                    <Icon name="close" size={24} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>District Name *</Text>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="location-city"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        ref={nameInputRef}
                        style={styles.input}
                        value={districtName}
                        onChangeText={setDistrictName}
                        placeholder="e.g., Ikorodu District"
                        placeholderTextColor={COLORS.gray + "80"}
                        returnKeyType="next"
                        onSubmitEditing={() => codeInputRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      District Code (Optional)
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="qr-code"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        ref={codeInputRef}
                        style={styles.input}
                        value={districtCode}
                        onChangeText={setDistrictCode}
                        placeholder={`DLC-${String(districtsLength + 1).padStart(3, "0")}`}
                        placeholderTextColor={COLORS.gray + "80"}
                        returnKeyType="done"
                        onSubmitEditing={onSavePress}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={onSave}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryLight]}
                      style={styles.modalSaveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.modalSaveText}>
                        {isEdit ? "Update District" : "Add District"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function DistrictListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, addDistrict, updateDistrict, removeDistrict } =
    useReport();

  // Local state for districts
  const [districts, setDistricts] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [districtName, setDistrictName] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [editingDistrict, setEditingDistrict] = useState(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Input refs
  const nameInputRef = useRef(null);
  const codeInputRef = useRef(null);

  // Load districts from context
  useEffect(() => {
    if (currentReport?.districts) {
      setDistricts(currentReport.districts);
    }
  }, [currentReport?.districts]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (modalVisible || editModalVisible) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);
    }
  }, [modalVisible, editModalVisible]);

  const handleAddDistrict = () => {
    // Validate input
    const trimmedName = districtName?.trim();
    const trimmedCode = districtCode?.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter district name");
      return;
    }

    // Create new district
    const newDistrict = {
      id: `district_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      code:
        trimmedCode || `DLC-${String(districts.length + 1).padStart(3, "0")}`,
      adult: {
        membersMale: 0,
        membersFemale: 0,
        visitorsMale: 0,
        visitorsFemale: 0,
        total: 0,
      },
      youth: {
        membersMale: 0,
        membersFemale: 0,
        visitorsMale: 0,
        visitorsFemale: 0,
        total: 0,
      },
      children: {
        members: 0,
        visitors: 0,
        total: 0,
      },
      offering: 0,
      createdAt: new Date().toISOString(),
    };

    // Add to context
    addDistrict(newDistrict);

    // Clear form and close modal
    setDistrictName("");
    setDistrictCode("");
    setModalVisible(false);

    Alert.alert("Success", "District added successfully");
  };

  const handleEditDistrict = () => {
    // Validate
    if (!editingDistrict) {
      Alert.alert("Error", "No district selected for editing");
      return;
    }

    const trimmedName = districtName?.trim();
    const trimmedCode = districtCode?.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter district name");
      return;
    }

    // Create updated district object
    const updatedDistrict = {
      ...editingDistrict,
      name: trimmedName,
      code: trimmedCode || editingDistrict.code,
      updatedAt: new Date().toISOString(),
    };

    // Update in context
    updateDistrict(editingDistrict.id, updatedDistrict);

    // Clear form and close modal
    setDistrictName("");
    setDistrictCode("");
    setEditingDistrict(null);
    setEditModalVisible(false);

    Alert.alert("Success", "District updated successfully");
  };

  const openEditModal = (district) => {
    if (district) {
      setEditingDistrict(district);
      setDistrictName(district.name || "");
      setDistrictCode(district.code || "");
      setEditModalVisible(true);
    }
  };

  const handleDeleteDistrict = (districtId) => {
    Alert.alert(
      "Delete District",
      "Are you sure you want to delete this district? All attendance data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeDistrict(districtId);
            Alert.alert("Success", "District deleted successfully");
          },
        },
      ],
    );
  };

  const handleNext = () => {
    if (districts.length === 0) {
      Alert.alert(
        "No Districts",
        "Please add at least one district before proceeding",
      );
      return;
    }
    router.push("/(app)/report/AdultAttendanceScreen");
  };

  const handleAttendancePress = (districtId) => {
    router.push({
      pathname: "/(app)/report/AdultAttendanceScreen",
      params: { districtId },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back-ios" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Districts</Text>
            <Text style={styles.headerSubtitle}>Manage your HCF districts</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>2/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((districts.length / 10) * 100, 100)}%`,
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {districts.length} of 10 districts added
          </Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add District Card */}
        <TouchableOpacity
          style={styles.addCard}
          onPress={() => {
            setDistrictName("");
            setDistrictCode("");
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary + "10", COLORS.primary + "05"]}
            style={styles.addCardGradient}
          >
            <View style={styles.addIconContainer}>
              <Icon name="add" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.addCardTitle}>Add New District</Text>
            <Text style={styles.addCardSubtitle}>
              Tap to create a new district
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Districts List */}
        {districts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="map" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>No Districts Yet</Text>
            <Text style={styles.emptyStateText}>
              {`Tap "Add New District" to start adding districts for your HCF report.`}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Districts</Text>
              <Text style={styles.sectionCount}>{districts.length} total</Text>
            </View>
            {districts.map((district, index) => (
              <DistrictCard
                key={district.id}
                district={district}
                index={index}
                onEdit={openEditModal}
                onDelete={handleDeleteDistrict}
                onPress={handleAttendancePress}
              />
            ))}
          </>
        )}

        {/* Tips Card */}
        <LinearGradient
          colors={[COLORS.info + "10", COLORS.primary + "05"]}
          style={styles.tipsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="lightbulb" size={24} color={COLORS.info} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Quick Tips</Text>
            <Text style={styles.tipsText}>
              • Add all districts in your HCF{"\n"}• Each district needs
              attendance records{"\n"}• You can edit or delete districts anytime
            </Text>
          </View>
        </LinearGradient>
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <TouchableOpacity
          style={styles.backNavButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backNavText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.summaryBadge}>
          <Text style={styles.summaryText}>
            {districts.length} District{districts.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.nextNavButton,
            districts.length === 0 && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={districts.length === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              districts.length > 0
                ? [COLORS.primary, COLORS.primaryLight]
                : [COLORS.gray, COLORS.lightGray]
            }
            style={styles.nextNavGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextNavText}>Next</Text>
            <Icon name="arrow-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add District Modal */}
      <DistrictModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddDistrict}
        title="Add New District"
        isEdit={false}
        districtName={districtName}
        setDistrictName={setDistrictName}
        districtCode={districtCode}
        setDistrictCode={setDistrictCode}
        slideAnim={slideAnim}
        nameInputRef={nameInputRef}
        codeInputRef={codeInputRef}
        districtsLength={districts.length}
        onSavePress={handleAddDistrict}
      />

      {/* Edit District Modal */}
      <DistrictModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEditDistrict}
        title="Edit District"
        isEdit={true}
        districtName={districtName}
        setDistrictName={setDistrictName}
        districtCode={districtCode}
        setDistrictCode={setDistrictCode}
        slideAnim={slideAnim}
        nameInputRef={nameInputRef}
        codeInputRef={codeInputRef}
        districtsLength={districts.length}
        onSavePress={handleEditDistrict}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white + "CC",
    marginTop: 2,
  },
  stepBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.white,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.white + "CC",
    marginTop: 4,
    textAlign: "right",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  addCard: {
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addCardGradient: {
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary + "30",
    borderStyle: "dashed",
    borderRadius: 20,
  },
  addIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  addCardTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  addCardSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
  },
  sectionCount: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  districtCard: {
    marginBottom: SPACING.md,
    borderRadius: 20,
    padding: SPACING.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  districtBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "bold",
    color: COLORS.white,
  },
  districtName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  districtCode: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  cardActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.xs,
  },
  deleteButton: {
    backgroundColor: COLORS.error + "10",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  attendanceButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  attendanceButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
  },
  attendanceButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    fontWeight: "500",
    marginRight: SPACING.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  tipsCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.md,
  },
  tipsContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.info,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    lineHeight: 18,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "80",
  },
  backNavButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backNavText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  summaryBadge: {
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: "500",
  },
  nextNavButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  nextNavGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  nextNavText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: SPACING.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalGradient: {
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  modalSaveButton: {
    flex: 2,
    marginLeft: SPACING.sm,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalSaveGradient: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.white,
    fontWeight: "600",
  },
});
