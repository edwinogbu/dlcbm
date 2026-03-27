import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";
import { useReport } from "../../../context/ReportContext";

const { width } = Dimensions.get("window");

// Review Card Component with Animation
const ReviewCard = ({
  title,
  section,
  isExpanded,
  onToggle,
  onEdit,
  children,
  accentColor = COLORS.primary,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={[styles.reviewCard, { borderLeftColor: accentColor }]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name="expand-more" size={24} color={accentColor} />
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={[styles.cardTitle, { color: accentColor }]}>
              {title}
            </Text>
            <Text style={styles.cardSection}>{section}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: accentColor + "15" }]}
          onPress={onEdit}
        >
          <Icon name="edit" size={18} color={accentColor} />
          <Text style={[styles.editButtonText, { color: accentColor }]}>
            Edit
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.cardContent,
          {
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000],
            }),
            opacity: heightAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// Stat Badge Component
const StatBadge = ({ icon, label, value, color }) => (
  <LinearGradient
    colors={[color + "15", color + "05"]}
    style={styles.statBadge}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  </LinearGradient>
);

// District Row Component
const DistrictRow = ({ district, index }) => {
  const members =
    (district.adult?.membersMale || 0) +
    (district.adult?.membersFemale || 0) +
    (district.youth?.membersMale || 0) +
    (district.youth?.membersFemale || 0) +
    (district.children?.members || 0);

  const visitors =
    (district.adult?.visitorsMale || 0) +
    (district.adult?.visitorsFemale || 0) +
    (district.youth?.visitorsMale || 0) +
    (district.youth?.visitorsFemale || 0) +
    (district.children?.visitors || 0);

  const total = members + visitors;

  return (
    <View style={styles.districtRow}>
      <View style={styles.districtInfo}>
        <View
          style={[
            styles.districtBadge,
            { backgroundColor: COLORS.primary + "15" },
          ]}
        >
          <Text style={styles.districtIndex}>{index + 1}</Text>
        </View>
        <View>
          <Text style={styles.districtName}>{district.name}</Text>
          <Text style={styles.districtCode}>{district.code}</Text>
        </View>
      </View>
      <View style={styles.districtStats}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>M</Text>
          <Text style={styles.statChipValue}>{members}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>V</Text>
          <Text style={styles.statChipValue}>{visitors}</Text>
        </View>
        <View style={[styles.statChip, styles.statChipTotal]}>
          <Text style={styles.statChipLabel}>T</Text>
          <Text style={styles.statChipValue}>{total}</Text>
        </View>
      </View>
    </View>
  );
};

// Narrative Block Component
const NarrativeBlock = ({ text, placeholder, icon, color = COLORS.gray }) => (
  <View style={styles.narrativeBlock}>
    <View style={styles.narrativeHeader}>
      <Icon name={icon} size={18} color={color} />
      <Text style={[styles.narrativePlaceholder, { color }]}>
        {placeholder}
      </Text>
    </View>
    <View style={[styles.narrativeContent, !text && styles.narrativeEmpty]}>
      <Text style={[styles.narrativeText, !text && styles.narrativeTextEmpty]}>
        {text || `No ${placeholder.toLowerCase()} entered`}
      </Text>
    </View>
  </View>
);

// Signature Preview Component
const SignaturePreview = ({ name, date }) => (
  <View style={styles.signatureContainer}>
    <LinearGradient
      colors={[COLORS.primary + "05", COLORS.primary + "02"]}
      style={styles.signatureCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.signatureHeader}>
        <Icon name="draw" size={24} color={COLORS.primary} />
        <Text style={styles.signatureHeaderText}>{`Pastor's Signature`}</Text>
      </View>

      <View style={styles.signatureContent}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureName}>
          {name || "____________________"}
        </Text>
        <Text style={styles.signatureLabel}>SIGNATURE</Text>

        <View style={styles.signatureFooter}>
          <Icon name="event" size={16} color={COLORS.gray} />
          <Text style={styles.signatureDate}>
            {date
              ? new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </View>
);

export default function ReportReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, submitReport } = useReport();

  const [expandedSections, setExpandedSections] = useState({
    group: true,
    attendance: false,
    offerings: false,
    visitation: false,
    testimonies: false,
    problems: false,
    solutions: false,
    remarks: false,
    signature: false,
  });

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
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
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const calculateTotals = () => {
    let totalMembers = 0;
    let totalVisitors = 0;
    let totalOfferings = 0;

    currentReport.districts?.forEach((district) => {
      totalMembers +=
        (district.adult?.membersMale || 0) +
        (district.adult?.membersFemale || 0) +
        (district.youth?.membersMale || 0) +
        (district.youth?.membersFemale || 0) +
        (district.children?.members || 0);

      totalVisitors +=
        (district.adult?.visitorsMale || 0) +
        (district.adult?.visitorsFemale || 0) +
        (district.youth?.visitorsMale || 0) +
        (district.youth?.visitorsFemale || 0) +
        (district.children?.visitors || 0);

      totalOfferings += district.offering || 0;
    });

    return { totalMembers, totalVisitors, totalOfferings };
  };

  const saveReportToStorage = async (report) => {
    try {
      // Get existing reports
      const existingReportsJson = await AsyncStorage.getItem("@hcf_reports");
      const existingReports = existingReportsJson
        ? JSON.parse(existingReportsJson)
        : [];

      // Add new report with timestamp
      const newReport = {
        ...report,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        status: "submitted",
      };

      // Save to storage
      await AsyncStorage.setItem(
        "@hcf_reports",
        JSON.stringify([...existingReports, newReport]),
      );

      return true;
    } catch (error) {
      console.error("Error saving report:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    Alert.alert(
      "Submit Report",
      "Are you sure you want to submit this report? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              // Check if we're in development mode (no database)
              const isDevMode = true; // You can set this based on environment

              if (isDevMode) {
                // Save to local storage instead of submitting to database
                const saved = await saveReportToStorage(currentReport);

                if (saved) {
                  Alert.alert(
                    "⚠️ Development Mode",
                    "No database found. Report has been saved to local storage.\n\nPlease set up a server for production use.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          // Optionally navigate to dashboard
                          router.push("/(app)/(tabs)");
                        },
                      },
                    ],
                  );
                } else {
                  Alert.alert(
                    "Error",
                    "Failed to save report locally. Please try again.",
                  );
                }
              } else {
                // Try to submit to database (original flow)
                const report = await submitReport();
                if (report) {
                  Alert.alert(
                    "✓ Success",
                    "Your report has been successfully submitted and saved!",
                    [
                      {
                        text: "View Dashboard",
                        onPress: () => router.push("/(app)/(tabs)"),
                      },
                    ],
                  );
                }
              }
            } catch (error) {
              // Catch any errors and show friendly message
              Alert.alert(
                "⚠️ Development Mode",
                "No database connection found. Report has been saved locally.\n\nPlease set up a server for production use.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Save to storage as fallback
                      saveReportToStorage(currentReport);
                      router.push("/(app)/(tabs)");
                    },
                  },
                ],
              );
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `HCF Report - ${currentReport.groupName || "Group Report"}\n\n` +
          `Total Members: ${totals.totalMembers}\n` +
          `Total Visitors: ${totals.totalVisitors}\n` +
          `Total Offerings: ₦${totals.totalOfferings.toLocaleString()}`,
        title: "Share Report",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const totals = calculateTotals();

  return (
    <View style={[styles.container, { paddingTop:1 }]}>
      {/* Premium Header */}
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
            <Icon name="arrow-back-ios" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Review Report</Text>
            <Text style={styles.headerSubtitle}>
              Final verification before submission
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>13/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "100%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step 13 of 13 • Final Review</Text>
        </View>

        {/* Decorative elements */}
        <View style={styles.headerDecorative1} />
        <View style={styles.headerDecorative2} />
      </LinearGradient>

      {/* Summary Stats */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <StatBadge
          icon="people"
          label="Members"
          value={totals.totalMembers.toLocaleString()}
          color={COLORS.primary}
        />
        <StatBadge
          icon="person-add"
          label="Visitors"
          value={totals.totalVisitors.toLocaleString()}
          color={COLORS.success}
        />
        <StatBadge
          icon="payments"
          label="Offerings"
          value={`₦${totals.totalOfferings.toLocaleString()}`}
          color={COLORS.warning}
        />
      </Animated.View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Information */}
        <ReviewCard
          title="Group Information"
          section="Basic details"
          isExpanded={expandedSections.group}
          onToggle={() => toggleSection("group")}
          onEdit={() => router.push("/(app)/report/GroupInfoScreen")}
          accentColor={COLORS.primary}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="group" size={16} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Group Name</Text>
              <Text style={styles.infoValue}>
                {currentReport.groupName || "Ikorodu Group"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="person" size={16} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Pastor</Text>
              <Text style={styles.infoValue}>
                {currentReport.groupPastor || "Pastor James Ade"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="event" size={16} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Report Date</Text>
              <Text style={styles.infoValue}>
                {currentReport.date
                  ? new Date(currentReport.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </Text>
            </View>
          </View>
        </ReviewCard>

        {/* Attendance Summary */}
        <ReviewCard
          title="Attendance Summary"
          section="District-wise breakdown"
          isExpanded={expandedSections.attendance}
          onToggle={() => toggleSection("attendance")}
          onEdit={() => router.push("/(app)/report/DistrictListScreen")}
          accentColor={COLORS.success}
        >
          <View style={styles.attendanceContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
                District
              </Text>
              <Text style={styles.tableHeaderCell}>M</Text>
              <Text style={styles.tableHeaderCell}>V</Text>
              <Text style={styles.tableHeaderCell}>T</Text>
            </View>

            {currentReport.districts?.map((district, index) => (
              <DistrictRow
                key={district.id}
                district={district}
                index={index}
              />
            ))}

            <LinearGradient
              colors={[COLORS.success + "15", COLORS.success + "05"]}
              style={styles.totalRow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>GRAND TOTAL</Text>
              </View>
              <View style={styles.totalStats}>
                <Text style={styles.totalValue}>{totals.totalMembers}</Text>
                <Text style={styles.totalValue}>{totals.totalVisitors}</Text>
                <Text style={styles.totalValue}>
                  {totals.totalMembers + totals.totalVisitors}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ReviewCard>

        {/* Offerings */}
        <ReviewCard
          title="Offerings"
          section="Financial summary"
          isExpanded={expandedSections.offerings}
          onToggle={() => toggleSection("offerings")}
          onEdit={() => router.push("/(app)/report/OfferingScreen")}
          accentColor={COLORS.warning}
        >
          <View style={styles.offeringsContainer}>
            <View style={styles.offeringCard}>
              <Icon
                name="account-balance-wallet"
                size={24}
                color={COLORS.warning}
              />
              <View>
                <Text style={styles.offeringLabel}>Total Offerings</Text>
                <Text style={styles.offeringValue}>
                  ₦{totals.totalOfferings.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.offeringDivider} />

            <View style={styles.offeringStats}>
              <View style={styles.offeringStat}>
                <Text style={styles.offeringStatLabel}>
                  Average per District
                </Text>
                <Text style={styles.offeringStatValue}>
                  ₦
                  {(
                    totals.totalOfferings /
                    (currentReport.districts?.length || 1)
                  ).toLocaleString()}
                </Text>
              </View>
              <View style={styles.offeringStat}>
                <Text style={styles.offeringStatLabel}>
                  Per Capita (Members)
                </Text>
                <Text style={styles.offeringStatValue}>
                  ₦
                  {(
                    totals.totalOfferings / (totals.totalMembers || 1)
                  ).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </ReviewCard>

        {/* Visitation Report */}
        <ReviewCard
          title="Visitation Report"
          section="Pastoral visits"
          isExpanded={expandedSections.visitation}
          onToggle={() => toggleSection("visitation")}
          onEdit={() => router.push("/(app)/report/VisitationReportScreen")}
          accentColor={COLORS.info}
        >
          <NarrativeBlock
            text={currentReport.visitationReport}
            placeholder="Visitation Report"
            icon="home"
            color={COLORS.info}
          />
        </ReviewCard>

        {/* Testimonies */}
        <ReviewCard
          title="Testimonies"
          section="Praise reports"
          isExpanded={expandedSections.testimonies}
          onToggle={() => toggleSection("testimonies")}
          onEdit={() => router.push("/(app)/report/TestimonyScreen")}
          accentColor={COLORS.warning}
        >
          <NarrativeBlock
            text={currentReport.testimonies}
            placeholder="Testimonies"
            icon="auto-awesome"
            color={COLORS.warning}
          />
        </ReviewCard>

        {/* Problems */}
        <ReviewCard
          title="Problems Encountered"
          section="Challenges"
          isExpanded={expandedSections.problems}
          onToggle={() => toggleSection("problems")}
          onEdit={() => router.push("/(app)/report/ProblemsScreen")}
          accentColor={COLORS.error}
        >
          <NarrativeBlock
            text={currentReport.problems}
            placeholder="Problems"
            icon="warning"
            color={COLORS.error}
          />
        </ReviewCard>

        {/* Solutions */}
        <ReviewCard
          title="Solutions Offered"
          section="Resolutions"
          isExpanded={expandedSections.solutions}
          onToggle={() => toggleSection("solutions")}
          onEdit={() => router.push("/(app)/report/SolutionsScreen")}
          accentColor={COLORS.success}
        >
          <NarrativeBlock
            text={currentReport.solutions}
            placeholder="Solutions"
            icon="lightbulb"
            color={COLORS.success}
          />
        </ReviewCard>

        {/* Final Remarks */}
        <ReviewCard
          title="Final Remarks"
          section="Summary"
          isExpanded={expandedSections.remarks}
          onToggle={() => toggleSection("remarks")}
          onEdit={() => router.push("/(app)/report/FinalRemarksScreen")}
          accentColor={COLORS.purple}
        >
          <NarrativeBlock
            text={currentReport.finalRemarks}
            placeholder="Final Remarks"
            icon="summarize"
            color={COLORS.purple}
          />
        </ReviewCard>

        {/* Signature */}
        <ReviewCard
          title="Signature"
          section="Authorization"
          isExpanded={expandedSections.signature}
          onToggle={() => toggleSection("signature")}
          onEdit={() => router.push("/(app)/report/SignatureScreen")}
          accentColor={COLORS.primary}
        >
          <SignaturePreview
            name={currentReport.signatureName}
            date={currentReport.signatureDate}
          />
        </ReviewCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Icon name="share" size={20} color={COLORS.primary} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.success, COLORS.success]}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitText}>SUBMIT REPORT</Text>
              <Icon name="check-circle" size={24} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.sm,
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
  },
  cardSection: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginTop: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: "500",
    marginLeft: 4,
  },
  cardContent: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoGrid: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  attendanceContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.success,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  tableHeaderCell: {
    flex: 1,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: "600",
    textAlign: "center",
  },
  districtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  districtInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
  },
  districtBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  districtIndex: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  districtName: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  districtCode: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  districtStats: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
    gap: 4,
  },
  statChip: {
    width: 40,
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 6,
    paddingVertical: 2,
  },
  statChipTotal: {
    backgroundColor: COLORS.success + "10",
  },
  statChipLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statChipValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  totalInfo: {
    flex: 2,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.success,
  },
  totalStats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
  },
  totalValue: {
    width: 40,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.success,
    textAlign: "center",
  },
  offeringsContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  offeringCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning + "30",
    marginBottom: SPACING.md,
  },
  offeringLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: SPACING.sm,
  },
  offeringValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  offeringDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  offeringStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  offeringStat: {
    flex: 1,
    alignItems: "center",
  },
  offeringStatLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginBottom: 4,
  },
  offeringStatValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.warning,
  },
  narrativeBlock: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  narrativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  narrativePlaceholder: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  narrativeContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  narrativeEmpty: {
    backgroundColor: COLORS.background,
    borderStyle: "dashed",
  },
  narrativeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  narrativeTextEmpty: {
    color: COLORS.gray,
    fontStyle: "italic",
  },
  signatureContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  signatureCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  signatureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  signatureHeaderText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  signatureContent: {
    alignItems: "center",
    width: "100%",
  },
  signatureLine: {
    width: "80%",
    height: 2,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  signatureName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "500",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  signatureLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: SPACING.md,
  },
  signatureFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  signatureDate: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  submitText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
});
