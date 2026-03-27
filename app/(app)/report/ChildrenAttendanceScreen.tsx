import { MaterialIcons } from "@expo/vector-icons";
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

// Type definitions
interface ChildrenData {
    members: string;
    visitors: string;
}

interface District {
    id: string;
    name: string;
    code: string;
    children?: {
        members: number;
        visitors: number;
        total: number;
    };
}

interface ChildrenCardProps {
    district: District;
    index: number;
    onUpdate: (districtId: string, data: any) => void;
}

// Children Attendance Card Component
const ChildrenCard: React.FC<ChildrenCardProps> = ({ district, index, onUpdate }) => {
  if (!district) return null;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [localData, setLocalData] = useState<ChildrenData>({
    members: district.children?.members?.toString() || "0",
    visitors: district.children?.visitors?.toString() || "0",
  });

  const calculateTotal = (): number => {
    const members = parseInt(localData.members) || 0;
    const visitors = parseInt(localData.visitors) || 0;
    return members + visitors;
  };

  const total = calculateTotal();

  const handleInputChange = (field: keyof ChildrenData, value: string): void => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    setLocalData((prev) => ({ ...prev, [field]: numericValue }));

    // Update parent
    const updatedChildren = {
      members: field === "members" ? numericValue : localData.members,
      visitors: field === "visitors" ? numericValue : localData.visitors,
    };

    const total =
      parseInt(updatedChildren.members) + parseInt(updatedChildren.visitors);

    onUpdate(district.id, { ...updatedChildren, total: total.toString() });
  };

  const handlePressIn = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  // Valid MaterialIcons names
  const getChildIcon = (): keyof typeof MaterialIcons.glyphMap => {
    const icons: (keyof typeof MaterialIcons.glyphMap)[] = [
      "child-care",
      "face",
      "emoji-people",
      "group",
      "star",
    ];
    return icons[index % icons.length];
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[COLORS.white, "#FFF9E6"]}
        style={styles.districtCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.districtBadge}>
            <LinearGradient
              colors={["#FF9A8B", "#FF6B6B"]}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name={getChildIcon()} size={20} color={COLORS.white} />
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
            <Text style={styles.cardTotalLabel}>Little Ones</Text>
            <Text style={styles.cardTotalValue}>{total}</Text>
          </View>
        </View>

        <View style={styles.statsPreview}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "#FF9A8B20" },
              ]}
            >
              <MaterialIcons name="child-care" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.statLabel}>Members</Text>
            <Text style={styles.statValue}>
              {parseInt(localData.members) || 0}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "#4ECDC420" },
              ]}
            >
              <MaterialIcons name="group" size={24} color="#4ECDC4" />
            </View>
            <Text style={styles.statLabel}>Visitors</Text>
            <Text style={styles.statValue}>
              {parseInt(localData.visitors) || 0}
            </Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="child-care" size={20} color="#FF6B6B" />
              </View>
              <TextInput
                style={styles.input}
                value={localData.members}
                onChangeText={(value) => handleInputChange("members", value)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray + "80"}
                onFocus={handlePressIn}
                onBlur={handlePressOut}
              />
              <Text style={styles.inputHelper}>Members</Text>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="group" size={20} color="#4ECDC4" />
              </View>
              <TextInput
                style={styles.input}
                value={localData.visitors}
                onChangeText={(value) => handleInputChange("visitors", value)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray + "80"}
                onFocus={handlePressIn}
                onBlur={handlePressOut}
              />
              <Text style={styles.inputHelper}>Visitors</Text>
            </View>
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
    </Animated.View>
  );
};

export default function ChildrenAttendanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateDistrict } = useReport();
  const [districts, setDistricts] = useState<District[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (currentReport?.districts) {
      const initialDistricts = currentReport.districts.map((d: District) => ({
        ...d,
        children: d.children || {
          members: 0,
          visitors: 0,
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

  const handleUpdateDistrict = (districtId: string, childrenData: any): void => {
    const updatedDistricts = districts.map((d) =>
      d.id === districtId ? { ...d, children: childrenData } : d,
    );
    setDistricts(updatedDistricts);
  };

  const handleSaveAll = (): void => {
    // Validate at least one entry
    const hasEntries = districts.some((d) => {
      const total = parseInt(d.children?.total?.toString() || "0") || 0;
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
      updateDistrict(district.id, { children: district.children });
    });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/OfferingScreen");
    });
  };

  const calculateGrandTotal = (): number => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.children?.total?.toString() || "0") || 0),
      0,
    );
  };

  const calculateMembersTotal = (): number => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.children?.members?.toString() || "0") || 0),
      0,
    );
  };

  const calculateVisitorsTotal = (): number => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.children?.visitors?.toString() || "0") || 0),
      0,
    );
  };

  return (
    <View style={[styles.container, { paddingTop:1 }]}>
      {/* Playful Header */}
      <LinearGradient
        colors={["#FF9A8B", "#FF6B6B"]}
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
            <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{`Children's Ministry`}</Text>
            <Text style={styles.headerSubtitle}>Little ones attendance</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>5/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "38%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text
            style={styles.progressText}
          >{`Step 5 of 13 • Children's Attendance`}</Text>
        </View>

        {/* Decorative elements */}
        <View style={styles.headerDecorative1} />
        <View style={styles.headerDecorative2} />
      </LinearGradient>

      {/* Summary Cards - Child-friendly */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "#FF9A8B20" },
            ]}
          >
            <MaterialIcons name="child-care" size={24} color="#FF6B6B" />
          </View>
          <Text style={styles.summaryLabel}>Members</Text>
          <Text style={styles.summaryValue}>{calculateMembersTotal()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "#4ECDC420" },
            ]}
          >
            <MaterialIcons name="group" size={24} color="#4ECDC4" />
          </View>
          <Text style={styles.summaryLabel}>Visitors</Text>
          <Text style={styles.summaryValue}>{calculateVisitorsTotal()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "#FFD93D20" },
            ]}
          >
            <MaterialIcons name="emoji-people" size={24} color="#FFD93D" />
          </View>
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
            <MaterialIcons name="child-care" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>No Little Ones Yet</Text>
            <Text style={styles.emptyStateText}>
              {`Add districts first to record children's attendance.`}
            </Text>
            <TouchableOpacity
              style={styles.goBackButton}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={["#FF9A8B", "#FF6B6B"]}
                style={styles.goBackButtonGradient}
              >
                <Text style={styles.goBackButtonText}>
                  Go Back to Districts
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{`Children's Attendance`}</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionCount}>
                  {districts.length} districts
                </Text>
              </View>
            </View>
            {districts.map((district, index) => (
              <ChildrenCard
                key={district.id}
                district={district}
                index={index}
                onUpdate={handleUpdateDistrict}
              />
            ))}
          </>
        )}

        {/* Fun Tips Card */}
        <LinearGradient
          colors={["#FFE5E5", "#FFF9E6"]}
          style={styles.tipsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="emoji-people" size={32} color="#FF6B6B" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>{`Children's Ministry Tips`}</Text>
            <Text style={styles.tipsText}>
              {`
              • Count all children present (0-12 years){'\n'}
              • Include workers' children in members{'\n'}
              • First-time visitors go in visitors count`}
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
            <MaterialIcons name="arrow-back" size={20} color="#FF6B6B" />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.totalSummary}>
            <Text style={styles.totalSummaryLabel}>Total Children</Text>
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
                  ? ["#FF9A8B", "#FF6B6B"]
                  : [COLORS.gray, COLORS.lightGray]
              }
              style={styles.nextNavGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextNavText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
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
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  headerDecorative1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerDecorative2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
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
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: "#FF6B6B",
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
    color: "#FF6B6B",
  },
  sectionBadge: {
    backgroundColor: "#FF9A8B20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCount: {
    fontSize: TYPOGRAPHY.sm,
    color: "#FF6B6B",
    fontWeight: "500",
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
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF9A8B10",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ECDC410",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  districtBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
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
    color: "#FF6B6B",
  },
  statsPreview: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    borderRadius: 15,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  inputSection: {
    marginTop: SPACING.xs,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    height: 44,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    textAlign: "center",
    fontSize: TYPOGRAPHY.md,
    backgroundColor: COLORS.white,
    color: COLORS.text.primary,
  },
  inputHelper: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginTop: 2,
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
    borderRadius: 25,
    overflow: "hidden",
  },
  goBackButtonGradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  goBackButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  tipsCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.md,
    alignItems: "center",
  },
  tipsContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: "#FF6B6B",
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
    color: "#FF6B6B",
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
    color: "#FF6B6B",
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



// import { MaterialIcons as Icon } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//     Alert,
//     Animated,
//     Dimensions,
//     KeyboardAvoidingView,
//     Platform,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { COLORS } from "../../../constants/colors";
// import { SPACING } from "../../../constants/spacing";
// import { TYPOGRAPHY } from "../../../constants/typography";
// import { useReport } from "../../../context/ReportContext";

// const { width } = Dimensions.get("window");

// // Children Attendance Card Component
// const ChildrenCard = ({ district, index, onUpdate }) => {
//   if (!district) return null;

//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const [localData, setLocalData] = useState({
//     members: district.children?.members?.toString() || "0",
//     visitors: district.children?.visitors?.toString() || "0",
//   });

//   const calculateTotal = () => {
//     const members = parseInt(localData.members) || 0;
//     const visitors = parseInt(localData.visitors) || 0;
//     return members + visitors;
//   };

//   const total = calculateTotal();

//   const handleInputChange = (field, value) => {
//     // Allow only numbers
//     const numericValue = value.replace(/[^0-9]/g, "");
//     setLocalData((prev) => ({ ...prev, [field]: numericValue }));

//     // Update parent
//     const updatedChildren = {
//       members: field === "members" ? numericValue : localData.members,
//       visitors: field === "visitors" ? numericValue : localData.visitors,
//     };

//     const total =
//       parseInt(updatedChildren.members) + parseInt(updatedChildren.visitors);

//     onUpdate(district.id, { ...updatedChildren, total: total.toString() });
//   };

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.98,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   // Child-friendly icons and colors
//   const getChildIcon = () => {
//     const icons = [
//       "child-care",
//       "child-friendly",
//       "toys",
//       "face",
//       "emoji-people",
//     ];
//     return icons[index % icons.length];
//   };

//   return (
//     <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
//       <LinearGradient
//         colors={[COLORS.white, "#FFF9E6"]}
//         style={styles.districtCard}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.cardHeader}>
//           <View style={styles.districtBadge}>
//             <LinearGradient
//               colors={["#FF9A8B", "#FF6B6B"]}
//               style={styles.badgeGradient}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//             >
//               <Icon name={getChildIcon()} size={20} color={COLORS.white} />
//             </LinearGradient>
//             <View>
//               <Text style={styles.districtName}>
//                 {district.name || "Unnamed District"}
//               </Text>
//               <Text style={styles.districtCode}>
//                 {district.code || "No Code"}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.cardTotal}>
//             <Text style={styles.cardTotalLabel}>Little Ones</Text>
//             <Text style={styles.cardTotalValue}>{total}</Text>
//           </View>
//         </View>

//         <View style={styles.statsPreview}>
//           <View style={styles.statItem}>
//             <View
//               style={[
//                 styles.statIconContainer,
//                 { backgroundColor: "#FF9A8B20" },
//               ]}
//             >
//               <Icon name="child-care" size={24} color="#FF6B6B" />
//             </View>
//             <Text style={styles.statLabel}>Members</Text>
//             <Text style={styles.statValue}>
//               {parseInt(localData.members) || 0}
//             </Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <View
//               style={[
//                 styles.statIconContainer,
//                 { backgroundColor: "#4ECDC420" },
//               ]}
//             >
//               <Icon name="child-friendly" size={24} color="#4ECDC4" />
//             </View>
//             <Text style={styles.statLabel}>Visitors</Text>
//             <Text style={styles.statValue}>
//               {parseInt(localData.visitors) || 0}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.inputSection}>
//           <View style={styles.inputRow}>
//             <View style={styles.inputWrapper}>
//               <View style={styles.inputIconContainer}>
//                 <Icon name="child-care" size={20} color="#FF6B6B" />
//               </View>
//               <TextInput
//                 style={styles.input}
//                 value={localData.members}
//                 onChangeText={(value) => handleInputChange("members", value)}
//                 keyboardType="numeric"
//                 placeholder="0"
//                 placeholderTextColor={COLORS.gray + "80"}
//                 onFocus={handlePressIn}
//                 onBlur={handlePressOut}
//               />
//               <Text style={styles.inputHelper}>Members</Text>
//             </View>

//             <View style={styles.inputWrapper}>
//               <View style={styles.inputIconContainer}>
//                 <Icon name="child-friendly" size={20} color="#4ECDC4" />
//               </View>
//               <TextInput
//                 style={styles.input}
//                 value={localData.visitors}
//                 onChangeText={(value) => handleInputChange("visitors", value)}
//                 keyboardType="numeric"
//                 placeholder="0"
//                 placeholderTextColor={COLORS.gray + "80"}
//                 onFocus={handlePressIn}
//                 onBlur={handlePressOut}
//               />
//               <Text style={styles.inputHelper}>Visitors</Text>
//             </View>
//           </View>
//         </View>

//         {/* Decorative elements */}
//         <View style={styles.decorativeCircle1} />
//         <View style={styles.decorativeCircle2} />
//       </LinearGradient>
//     </Animated.View>
//   );
// };

// export default function ChildrenAttendanceScreen() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { currentReport, updateDistrict } = useReport();
//   const [districts, setDistricts] = useState([]);
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const [slideAnim] = useState(new Animated.Value(50));

//   useEffect(() => {
//     if (currentReport?.districts) {
//       const initialDistricts = currentReport.districts.map((d) => ({
//         ...d,
//         children: d.children || {
//           members: 0,
//           visitors: 0,
//           total: 0,
//         },
//       }));
//       setDistricts(initialDistricts);
//     }

//     // Entrance animations
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, [currentReport]);

//   const handleUpdateDistrict = (districtId, childrenData) => {
//     const updatedDistricts = districts.map((d) =>
//       d.id === districtId ? { ...d, children: childrenData } : d,
//     );
//     setDistricts(updatedDistricts);
//   };

//   const handleSaveAll = () => {
//     // Validate at least one entry
//     const hasEntries = districts.some((d) => {
//       const total = parseInt(d.children?.total) || 0;
//       return total > 0;
//     });

//     if (!hasEntries) {
//       Alert.alert(
//         "No Data",
//         "Please enter attendance for at least one district before proceeding.",
//         [{ text: "OK" }],
//       );
//       return;
//     }

//     // Save all districts to context
//     districts.forEach((district) => {
//       updateDistrict(district.id, { children: district.children });
//     });

//     // Animate out before navigation
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: true,
//     }).start(() => {
//       router.push("/(app)/report/OfferingScreen");
//     });
//   };

//   const calculateGrandTotal = () => {
//     return districts.reduce(
//       (sum, d) => sum + (parseInt(d.children?.total) || 0),
//       0,
//     );
//   };

//   const calculateMembersTotal = () => {
//     return districts.reduce(
//       (sum, d) => sum + (parseInt(d.children?.members) || 0),
//       0,
//     );
//   };

//   const calculateVisitorsTotal = () => {
//     return districts.reduce(
//       (sum, d) => sum + (parseInt(d.children?.visitors) || 0),
//       0,
//     );
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       {/* Playful Header */}
//       <LinearGradient
//         colors={["#FF9A8B", "#FF6B6B"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.header}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => router.back()}
//             activeOpacity={0.7}
//           >
//             <Icon name="arrow-back-ios" size={20} color={COLORS.white} />
//           </TouchableOpacity>

//           <View style={styles.headerTextContainer}>
//             <Text style={styles.headerTitle}>{`Children's Ministry`}</Text>
//             <Text style={styles.headerSubtitle}>Little ones attendance</Text>
//           </View>

//           <View style={styles.stepBadge}>
//             <Text style={styles.stepText}>5/13</Text>
//           </View>
//         </View>

//         {/* Progress Bar */}
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <Animated.View
//               style={[
//                 styles.progressFill,
//                 {
//                   width: "38%",
//                   opacity: fadeAnim,
//                 },
//               ]}
//             />
//           </View>
//           <Text
//             style={styles.progressText}
//           >{`Step 5 of 13 • Children's Attendance`}</Text>
//         </View>

//         {/* Decorative elements */}
//         <View style={styles.headerDecorative1} />
//         <View style={styles.headerDecorative2} />
//       </LinearGradient>

//       {/* Summary Cards - Child-friendly */}
//       <View style={styles.summaryContainer}>
//         <View style={styles.summaryCard}>
//           <View
//             style={[
//               styles.summaryIconContainer,
//               { backgroundColor: "#FF9A8B20" },
//             ]}
//           >
//             <Icon name="child-care" size={24} color="#FF6B6B" />
//           </View>
//           <Text style={styles.summaryLabel}>Members</Text>
//           <Text style={styles.summaryValue}>{calculateMembersTotal()}</Text>
//         </View>
//         <View style={styles.summaryDivider} />
//         <View style={styles.summaryCard}>
//           <View
//             style={[
//               styles.summaryIconContainer,
//               { backgroundColor: "#4ECDC420" },
//             ]}
//           >
//             <Icon name="child-friendly" size={24} color="#4ECDC4" />
//           </View>
//           <Text style={styles.summaryLabel}>Visitors</Text>
//           <Text style={styles.summaryValue}>{calculateVisitorsTotal()}</Text>
//         </View>
//         <View style={styles.summaryDivider} />
//         <View style={styles.summaryCard}>
//           <View
//             style={[
//               styles.summaryIconContainer,
//               { backgroundColor: "#FFD93D20" },
//             ]}
//           >
//             <Icon name="emoji-people" size={24} color="#FFD93D" />
//           </View>
//           <Text style={styles.summaryLabel}>Total</Text>
//           <Text style={styles.summaryValue}>{calculateGrandTotal()}</Text>
//         </View>
//       </View>

//       <Animated.ScrollView
//         style={[styles.content, { opacity: fadeAnim }]}
//         contentContainerStyle={styles.contentContainer}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* District Cards */}
//         {districts.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Icon name="child-care" size={80} color={COLORS.lightGray} />
//             <Text style={styles.emptyStateTitle}>No Little Ones Yet</Text>
//             <Text style={styles.emptyStateText}>
//               {`Add districts first to record children's attendance.`}
//             </Text>
//             <TouchableOpacity
//               style={styles.goBackButton}
//               onPress={() => router.back()}
//             >
//               <LinearGradient
//                 colors={["#FF9A8B", "#FF6B6B"]}
//                 style={styles.goBackButtonGradient}
//               >
//                 <Text style={styles.goBackButtonText}>
//                   Go Back to Districts
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>{`Children's Attendance`}</Text>
//               <View style={styles.sectionBadge}>
//                 <Text style={styles.sectionCount}>
//                   {districts.length} districts
//                 </Text>
//               </View>
//             </View>
//             {districts.map((district, index) => (
//               <ChildrenCard
//                 key={district.id}
//                 district={district}
//                 index={index}
//                 onUpdate={handleUpdateDistrict}
//               />
//             ))}
//           </>
//         )}

//         {/* Fun Tips Card */}
//         <LinearGradient
//           colors={["#FFE5E5", "#FFF9E6"]}
//           style={styles.tipsCard}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <Icon name="emoji-people" size={32} color="#FF6B6B" />
//           <View style={styles.tipsContent}>
//             <Text style={styles.tipsTitle}>{`Children's Ministry Tips`}</Text>
//             <Text style={styles.tipsText}>
//               {`
//               • Count all children present (0-12 years){'\n'}
//               • Include workers' children in members{'\n'}
//               • First-time visitors go in visitors count`}
//             </Text>
//           </View>
//         </LinearGradient>
//       </Animated.ScrollView>

//       {/* Bottom Navigation */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={100}
//       >
//         <View
//           style={[
//             styles.bottomNav,
//             { paddingBottom: insets.bottom + SPACING.md },
//           ]}
//         >
//           <TouchableOpacity
//             style={styles.backNavButton}
//             onPress={() => router.back()}
//             activeOpacity={0.7}
//           >
//             <Icon name="arrow-back" size={20} color="#FF6B6B" />
//             <Text style={styles.backNavText}>Back</Text>
//           </TouchableOpacity>

//           <View style={styles.totalSummary}>
//             <Text style={styles.totalSummaryLabel}>Total Children</Text>
//             <Text style={styles.totalSummaryValue}>
//               {calculateGrandTotal()}
//             </Text>
//           </View>

//           <TouchableOpacity
//             style={[
//               styles.nextNavButton,
//               districts.length === 0 && styles.disabledButton,
//             ]}
//             onPress={handleSaveAll}
//             disabled={districts.length === 0}
//             activeOpacity={0.8}
//           >
//             <LinearGradient
//               colors={
//                 districts.length > 0
//                   ? ["#FF9A8B", "#FF6B6B"]
//                   : [COLORS.gray, COLORS.lightGray]
//               }
//               style={styles.nextNavGradient}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//             >
//               <Text style={styles.nextNavText}>Next</Text>
//               <Icon name="arrow-forward" size={20} color={COLORS.white} />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.lg,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     position: "relative",
//     overflow: "hidden",
//   },
//   headerDecorative1: {
//     position: "absolute",
//     top: -20,
//     right: -20,
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: "rgba(255,255,255,0.1)",
//   },
//   headerDecorative2: {
//     position: "absolute",
//     bottom: -30,
//     left: -30,
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     backgroundColor: "rgba(255,255,255,0.05)",
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: SPACING.md,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: SPACING.md,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: TYPOGRAPHY.xl,
//     fontWeight: "bold",
//     color: COLORS.white,
//   },
//   headerSubtitle: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.white + "CC",
//     marginTop: 2,
//   },
//   stepBadge: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   stepText: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.white,
//     fontWeight: "600",
//   },
//   progressContainer: {
//     marginTop: SPACING.xs,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     borderRadius: 3,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: COLORS.white,
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.white + "CC",
//     marginTop: 4,
//     textAlign: "right",
//   },
//   summaryContainer: {
//     flexDirection: "row",
//     marginHorizontal: SPACING.lg,
//     marginVertical: SPACING.md,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     overflow: "hidden",
//   },
//   summaryCard: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: SPACING.sm,
//   },
//   summaryIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   summaryDivider: {
//     width: 1,
//     backgroundColor: COLORS.border,
//   },
//   summaryLabel: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   summaryValue: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "bold",
//     color: "#FF6B6B",
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: SPACING.lg,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: SPACING.md,
//   },
//   sectionTitle: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "600",
//     color: "#FF6B6B",
//   },
//   sectionBadge: {
//     backgroundColor: "#FF9A8B20",
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   sectionCount: {
//     fontSize: TYPOGRAPHY.sm,
//     color: "#FF6B6B",
//     fontWeight: "500",
//   },
//   districtCard: {
//     marginBottom: SPACING.md,
//     borderRadius: 20,
//     padding: SPACING.md,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     position: "relative",
//     overflow: "hidden",
//   },
//   decorativeCircle1: {
//     position: "absolute",
//     top: -10,
//     right: -10,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#FF9A8B10",
//   },
//   decorativeCircle2: {
//     position: "absolute",
//     bottom: -10,
//     left: -10,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#4ECDC410",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: SPACING.sm,
//   },
//   districtBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   badgeGradient: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: SPACING.sm,
//   },
//   districtName: {
//     fontSize: TYPOGRAPHY.md,
//     fontWeight: "600",
//     color: COLORS.text.primary,
//   },
//   districtCode: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.text.secondary,
//   },
//   cardTotal: {
//     alignItems: "center",
//   },
//   cardTotalLabel: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   cardTotalValue: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "bold",
//     color: "#FF6B6B",
//   },
//   statsPreview: {
//     flexDirection: "row",
//     backgroundColor: "#FFF9E6",
//     borderRadius: 15,
//     padding: SPACING.sm,
//     marginBottom: SPACING.md,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: "center",
//   },
//   statIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   statValue: {
//     fontSize: TYPOGRAPHY.md,
//     fontWeight: "bold",
//     color: COLORS.text.primary,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: COLORS.border,
//   },
//   inputSection: {
//     marginTop: SPACING.xs,
//   },
//   inputRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   inputWrapper: {
//     flex: 1,
//     marginHorizontal: 4,
//     alignItems: "center",
//   },
//   inputIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.white,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 4,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   input: {
//     height: 44,
//     width: "100%",
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 10,
//     textAlign: "center",
//     fontSize: TYPOGRAPHY.md,
//     backgroundColor: COLORS.white,
//     color: COLORS.text.primary,
//   },
//   inputHelper: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: SPACING.xxl,
//   },
//   emptyStateTitle: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "600",
//     color: COLORS.text.primary,
//     marginTop: SPACING.md,
//     marginBottom: SPACING.xs,
//   },
//   emptyStateText: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.secondary,
//     textAlign: "center",
//     paddingHorizontal: SPACING.xl,
//   },
//   goBackButton: {
//     marginTop: SPACING.lg,
//     borderRadius: 25,
//     overflow: "hidden",
//   },
//   goBackButtonGradient: {
//     paddingVertical: SPACING.sm,
//     paddingHorizontal: SPACING.xl,
//   },
//   goBackButtonText: {
//     color: COLORS.white,
//     fontWeight: "600",
//   },
//   tipsCard: {
//     flexDirection: "row",
//     padding: SPACING.md,
//     borderRadius: 16,
//     marginTop: SPACING.md,
//     alignItems: "center",
//   },
//   tipsContent: {
//     flex: 1,
//     marginLeft: SPACING.md,
//   },
//   tipsTitle: {
//     fontSize: TYPOGRAPHY.sm,
//     fontWeight: "600",
//     color: "#FF6B6B",
//     marginBottom: 4,
//   },
//   tipsText: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//     lineHeight: 18,
//   },
//   bottomNav: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.md,
//     backgroundColor: COLORS.white,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border + "80",
//   },
//   backNavButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: SPACING.sm,
//     paddingHorizontal: SPACING.md,
//   },
//   backNavText: {
//     fontSize: TYPOGRAPHY.md,
//     color: "#FF6B6B",
//     marginLeft: 4,
//     fontWeight: "500",
//   },
//   totalSummary: {
//     alignItems: "center",
//   },
//   totalSummaryLabel: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   totalSummaryValue: {
//     fontSize: TYPOGRAPHY.xl,
//     fontWeight: "bold",
//     color: "#FF6B6B",
//   },
//   nextNavButton: {
//     borderRadius: 25,
//     overflow: "hidden",
//   },
//   nextNavGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: SPACING.sm,
//     paddingHorizontal: SPACING.lg,
//   },
//   nextNavText: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.white,
//     fontWeight: "600",
//     marginRight: SPACING.xs,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
// });
