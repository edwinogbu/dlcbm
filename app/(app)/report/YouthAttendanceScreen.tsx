import { MaterialIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
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

// Youth Attendance Card Component
const YouthCard = ({ district, index, onUpdate }) => {
  if (!district) return null;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [localData, setLocalData] = useState({
    membersMale: district.youth?.membersMale?.toString() || "0",
    membersFemale: district.youth?.membersFemale?.toString() || "0",
    visitorsMale: district.youth?.visitorsMale?.toString() || "0",
    visitorsFemale: district.youth?.visitorsFemale?.toString() || "0",
  });

  const calculateTotal = () => {
    const membersMale = parseInt(localData.membersMale) || 0;
    const membersFemale = parseInt(localData.membersFemale) || 0;
    const visitorsMale = parseInt(localData.visitorsMale) || 0;
    const visitorsFemale = parseInt(localData.visitorsFemale) || 0;
    return membersMale + membersFemale + visitorsMale + visitorsFemale;
  };

  const total = calculateTotal();

  const handleInputChange = (field, value) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    setLocalData((prev) => ({ ...prev, [field]: numericValue }));

    // Update parent
    const updatedYouth = {
      membersMale:
        field === "membersMale" ? numericValue : localData.membersMale,
      membersFemale:
        field === "membersFemale" ? numericValue : localData.membersFemale,
      visitorsMale:
        field === "visitorsMale" ? numericValue : localData.visitorsMale,
      visitorsFemale:
        field === "visitorsFemale" ? numericValue : localData.visitorsFemale,
    };

    const total =
      parseInt(updatedYouth.membersMale) +
      parseInt(updatedYouth.membersFemale) +
      parseInt(updatedYouth.visitorsMale) +
      parseInt(updatedYouth.visitorsFemale);

    onUpdate(district.id, { ...updatedYouth, total: total.toString() });
  };

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
              colors={[COLORS.secondary, COLORS.primary]}
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
          <View style={styles.cardTotal}>
            <Text style={styles.cardTotalLabel}>Total</Text>
            <Text style={styles.cardTotalValue}>{total}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="group" size={18} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>MEMBERS</Text>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Male</Text>
              <TextInput
                style={styles.input}
                value={localData.membersMale}
                onChangeText={(value) =>
                  handleInputChange("membersMale", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray + "80"}
                onFocus={handlePressIn}
                onBlur={handlePressOut}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Female</Text>
              <TextInput
                style={styles.input}
                value={localData.membersFemale}
                onChangeText={(value) =>
                  handleInputChange("membersFemale", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray + "80"}
                onFocus={handlePressIn}
                onBlur={handlePressOut}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={18} color={COLORS.success} />
            <Text style={styles.sectionTitle}>VISITORS</Text>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Male</Text>
              <TextInput
                style={styles.input}
                value={localData.visitorsMale}
                onChangeText={(value) =>
                  handleInputChange("visitorsMale", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray + "80"}
                onFocus={handlePressIn}
                onBlur={handlePressOut}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Female</Text>
              <TextInput
                style={styles.input}
                value={localData.visitorsFemale}
                onChangeText={(value) =>
                  handleInputChange("visitorsFemale", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray + "80"}
                onFocus={handlePressIn}
                onBlur={handlePressOut}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function YouthAttendanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateDistrict } = useReport();
  const [districts, setDistricts] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (currentReport?.districts) {
      const initialDistricts = currentReport.districts.map((d) => ({
        ...d,
        youth: d.youth || {
          membersMale: 0,
          membersFemale: 0,
          visitorsMale: 0,
          visitorsFemale: 0,
          total: 0,
        },
      }));
      setDistricts(initialDistricts);
    }

    // Entrance animations
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
  }, [currentReport]);

  const handleUpdateDistrict = (districtId, youthData) => {
    const updatedDistricts = districts.map((d) =>
      d.id === districtId ? { ...d, youth: youthData } : d,
    );
    setDistricts(updatedDistricts);
  };

  const handleSaveAll = () => {
    // Validate at least one entry
    const hasEntries = districts.some((d) => {
      const total = parseInt(d.youth?.total) || 0;
      return total > 0;
    });

    if (!hasEntries) {
      Alert.alert(
        "No Data",
        "Please enter attendance for at least one district before proceeding.",
        [{ text: "OK" }],
      );
      return;
    }

    // Save all districts to context
    districts.forEach((district) => {
      updateDistrict(district.id, { youth: district.youth });
    });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/ChildrenAttendanceScreen");
    });
  };

  const calculateGrandTotal = () => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.youth?.total) || 0),
      0,
    );
  };

  const calculateMembersTotal = (gender) => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.youth?.[`members${gender}`]) || 0),
      0,
    );
  };

  const calculateVisitorsTotal = (gender) => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.youth?.[`visitors${gender}`]) || 0),
      0,
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
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
            <Icon name="arrow-back-ios" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Youth Attendance</Text>
            <Text style={styles.headerSubtitle}>
              HCF Youth Members & Visitors
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>4/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "30%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step 4 of 13 • Youth Attendance
          </Text>
        </View>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="group" size={24} color={COLORS.secondary} />
          <Text style={styles.summaryLabel}>Members</Text>
          <Text style={styles.summaryValue}>
            {calculateMembersTotal("Male") + calculateMembersTotal("Female")}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <Icon name="people" size={24} color={COLORS.success} />
          <Text style={styles.summaryLabel}>Visitors</Text>
          <Text style={styles.summaryValue}>
            {calculateVisitorsTotal("Male") + calculateVisitorsTotal("Female")}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <Icon name="person-add" size={24} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{calculateGrandTotal()}</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* District Cards */}
        {districts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>No Districts Available</Text>
            <Text style={styles.emptyStateText}>
              Please add districts first to record youth attendance.
            </Text>
            <TouchableOpacity
              style={styles.goBackButton}
              onPress={() => router.back()}
            >
              <Text style={styles.goBackButtonText}>Go Back to Districts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Youth Attendance</Text>
              <Text style={styles.sectionCount}>
                {districts.length} districts
              </Text>
            </View>
            {districts.map((district, index) => (
              <YouthCard
                key={district.id}
                district={district}
                index={index}
                onUpdate={handleUpdateDistrict}
              />
            ))}
          </>
        )}

        {/* Info Card */}
        <LinearGradient
          colors={[COLORS.info + "10", COLORS.secondary + "10"]}
          style={styles.infoCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="info-outline" size={24} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Youth Attendance Tips</Text>
            <Text style={styles.infoText}>
              • Enter youth attendance for each district{"\n"}• Members and
              visitors are counted separately{"\n"}• Totals update automatically
              as you type
            </Text>
          </View>
        </LinearGradient>
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
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
            <Icon name="arrow-back" size={20} color={COLORS.secondary} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.totalSummary}>
            <Text style={styles.totalSummaryLabel}>Grand Total</Text>
            <Text style={styles.totalSummaryValue}>
              {calculateGrandTotal()}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.nextNavButton,
              districts.length === 0 && styles.disabledButton,
            ]}
            onPress={handleSaveAll}
            disabled={districts.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                districts.length > 0
                  ? [COLORS.secondary, COLORS.primary]
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
      </KeyboardAvoidingView>
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
  summaryContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginTop: 2,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
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
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
    letterSpacing: 0.5,
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
  cardTotal: {
    alignItems: "center",
  },
  cardTotalLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  cardTotalValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  section: {
    marginBottom: SPACING.md,
  },

  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    textAlign: "center",
    fontSize: TYPOGRAPHY.md,
    backgroundColor: COLORS.white,
    color: COLORS.text.primary,
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
  goBackButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
  },
  goBackButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.info,
    marginBottom: 4,
  },
  infoText: {
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
    color: COLORS.secondary,
    marginLeft: 4,
    fontWeight: "500",
  },
  totalSummary: {
    alignItems: "center",
  },
  totalSummaryLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  totalSummaryValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.secondary,
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
});
