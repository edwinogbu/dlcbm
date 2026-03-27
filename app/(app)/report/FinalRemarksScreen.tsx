import { MaterialIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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

// Summary Card Component
const SummaryCard = ({
  children,
  title,
  subtitle,
  icon,
  accentColor = COLORS.purple,
}) => (
  <LinearGradient
    colors={[COLORS.white, COLORS.background]}
    style={styles.summaryCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

    <View style={styles.cardHeader}>
      <View
        style={[styles.iconContainer, { backgroundColor: accentColor + "15" }]}
      >
        <Icon name={icon} size={28} color={accentColor} />
      </View>
      <View style={styles.headerTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </View>

    {children}
  </LinearGradient>
);

// Report Stats Component
const ReportStat = ({ icon, label, value, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconContainer, { backgroundColor: color + "15" }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <View style={styles.statTextContainer}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  </View>
);

// Highlight Box Component
const HighlightBox = ({ children, title, icon, color }) => (
  <View style={[styles.highlightBox, { borderLeftColor: color }]}>
    <View style={styles.highlightHeader}>
      <Icon name={icon} size={18} color={color} />
      <Text style={[styles.highlightTitle, { color }]}>{title}</Text>
    </View>
    <Text style={styles.highlightText}>{children}</Text>
  </View>
);

export default function FinalRemarksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateReport } = useReport();
  const [finalRemarks, setFinalRemarks] = useState(
    currentReport.finalRemarks || "",
  );
  const [wordCount, setWordCount] = useState(0);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const inputScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Calculate word count
    const words = finalRemarks
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    setWordCount(words.length);

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
  }, [finalRemarks]);

  const handleFocus = () => {
    Animated.spring(inputScale, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(inputScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handleNext = () => {
    updateReport({ finalRemarks });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/SignatureScreen");
    });
  };

  // Calculate report summary stats
  const reportStats = [
    {
      icon: "people",
      label: "Total Districts",
      value: currentReport?.districts?.length || 0,
      color: COLORS.primary,
    },
    {
      icon: "payments",
      label: "Total Offerings",
      value: `₦${currentReport?.districts?.reduce((sum, d) => sum + (d.offering || 0), 0).toLocaleString() || 0}`,
      color: COLORS.success,
    },
    {
      icon: "warning",
      label: "Problems",
      value:
        currentReport?.problems?.split("\n").filter((p) => p.trim()).length ||
        0,
      color: COLORS.error,
    },
    {
      icon: "lightbulb",
      label: "Solutions",
      value:
        currentReport?.solutions?.split("\n").filter((s) => s.trim()).length ||
        0,
      color: COLORS.warning,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop:1 }]}>
      {/* Header with Summary Theme */}
      <LinearGradient
        colors={[COLORS.purple, COLORS.primary]}
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
            <Text style={styles.headerTitle}>Final Remarks</Text>
            <Text style={styles.headerSubtitle}>Summary and conclusions</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>11/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "85%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step 11 of 13 • Final Summary</Text>
        </View>

        {/* Decorative elements */}
        <View style={styles.headerDecorative1} />
        <View style={styles.headerDecorative2} />
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Summary Card */}
        <SummaryCard
          title="Report Summary"
          subtitle="Overall assessment and key takeaways"
          icon="summarize"
          accentColor={COLORS.purple}
        >
          <View style={styles.summaryContent}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberContainer}>
                <Text style={styles.sectionNumber}>06</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionLabel}>FINAL REMARKS</Text>
                <Text style={styles.sectionDescription}>
                  Overall group assessment and leadership comments
                </Text>
              </View>
            </View>

            {/* Report Stats Grid */}
            <View style={styles.statsGrid}>
              {reportStats.map((stat, index) => (
                <ReportStat key={index} {...stat} />
              ))}
            </View>

            {/* Final Remarks Input */}
            <Animated.View style={[{ transform: [{ scale: inputScale }] }]}>
              <View style={styles.inputContainer}>
                <View style={styles.inputHeader}>
                  <Icon name="edit-note" size={20} color={COLORS.purple} />
                  <Text style={styles.inputHeaderText}>
                    Write your final remarks
                  </Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  value={finalRemarks}
                  onChangeText={setFinalRemarks}
                  placeholder="Enter overall group summary, leadership comments, important notes, recommendations..."
                  placeholderTextColor={COLORS.gray + "80"}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <View style={styles.inputFooter}>
                  <Icon name="text-fields" size={14} color={COLORS.purple} />
                  <Text style={styles.wordCount}>
                    {wordCount} words • {finalRemarks.length} characters
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Example Remarks */}
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Example Remarks</Text>

              <HighlightBox
                title="Positive Summary"
                icon="thumb-up"
                color={COLORS.success}
              >
                The group showed great growth this month. All districts are
                actively participating. Encourage continued visitation and
                follow-up with new members.
              </HighlightBox>

              <HighlightBox
                title="Areas for Improvement"
                icon="trending-up"
                color={COLORS.warning}
              >
                Youth attendance needs attention. Consider organizing special
                youth programs and assigning youth coordinators in each
                district.
              </HighlightBox>

              <HighlightBox
                title="Leadership Notes"
                icon="people"
                color={COLORS.info}
              >
                District leaders are doing well. Recommend additional training
                for new leaders and monthly leadership meetings.
              </HighlightBox>
            </View>

            {/* Key Takeaways */}
            <View style={styles.takeawaysContainer}>
              <Text style={styles.takeawaysTitle}>Key Takeaways</Text>

              <View style={styles.takeawayItem}>
                <Icon name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.takeawayText}>
                  Overall group health:{" "}
                  {currentReport?.districts?.length > 0
                    ? "Good"
                    : "Needs attention"}
                </Text>
              </View>

              <View style={styles.takeawayItem}>
                <Icon name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.takeawayText}>
                  Main challenges:{" "}
                  {currentReport?.problems?.split("\n").filter((p) => p.trim())
                    .length || 0}{" "}
                  identified
                </Text>
              </View>

              <View style={styles.takeawayItem}>
                <Icon name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.takeawayText}>
                  Solutions proposed:{" "}
                  {currentReport?.solutions?.split("\n").filter((s) => s.trim())
                    .length || 0}{" "}
                  actions
                </Text>
              </View>
            </View>
          </View>
        </SummaryCard>

        {/* Reflection Card */}
        <LinearGradient
          colors={[COLORS.purple + "10", COLORS.primary + "10"]}
          style={styles.reflectionCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="psychology" size={32} color={COLORS.purple} />
          <View style={styles.reflectionContent}>
            <Text style={styles.reflectionTitle}>Leadership Reflection</Text>
            <Text style={styles.reflectionText}>
              {`"Take a moment to reflect on the overall health and growth of your group. 
              What worked well? What needs improvement? Your final remarks will guide 
              future planning and development."`}
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
            <Icon name="arrow-back" size={20} color={COLORS.purple} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.summaryIndicator}>
            <Icon name="checklist" size={16} color={COLORS.purple} />
            <Text style={styles.summaryText}>
              {wordCount > 0 ? "Remarks added" : "Add remarks"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextNavButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.purple, COLORS.primary]}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "50",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  summaryContent: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionNumberContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.purple + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionNumber: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.purple,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.purple,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  statItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: SPACING.lg,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purple + "08",
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputHeaderText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.purple,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  textArea: {
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.md,
    minHeight: 150,
    textAlignVertical: "top",
    color: COLORS.text.primary,
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: COLORS.purple + "08",
    padding: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  wordCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  examplesContainer: {
    marginBottom: SPACING.lg,
  },
  examplesTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  highlightBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  highlightTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
  highlightText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  takeawaysContainer: {
    backgroundColor: COLORS.purple + "08",
    borderRadius: 16,
    padding: SPACING.md,
  },
  takeawaysTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.purple,
    marginBottom: SPACING.sm,
  },
  takeawayItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  takeawayText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  reflectionCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  reflectionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  reflectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.purple,
    marginBottom: 4,
  },
  reflectionText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    lineHeight: 18,
    fontStyle: "italic",
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
    color: COLORS.purple,
    marginLeft: 4,
    fontWeight: "500",
  },
  summaryIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purple + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.purple,
    fontWeight: "500",
    marginLeft: SPACING.xs,
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
});
