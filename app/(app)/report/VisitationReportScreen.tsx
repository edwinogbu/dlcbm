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

// Journal Card Component
const JournalCard = ({
  children,
  title,
  subtitle,
  icon,
  accentColor = COLORS.info,
}) => (
  <LinearGradient
    colors={[COLORS.white, COLORS.background]}
    style={styles.journalCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

    <View style={styles.cardHeader}>
      <View
        style={[styles.iconContainer, { backgroundColor: accentColor + "15" }]}
      >
        <Icon name={icon} size={24} color={accentColor} />
      </View>
      <View style={styles.headerTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </View>

    {children}
  </LinearGradient>
);

// Example Item Component
const ExampleItem = ({ example }) => (
  <View style={styles.exampleItem}>
    <View style={styles.exampleBullet} />
    <Text style={styles.exampleText}>{example}</Text>
  </View>
);

export default function VisitationReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateReport } = useReport();
  const [visitationReport, setVisitationReport] = useState(
    currentReport.visitationReport || "",
  );

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const inputScale = useRef(new Animated.Value(1)).current;

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
    updateReport({ visitationReport });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/TestimonyScreen");
    });
  };

  const examples = [
    "Pastor James Ade - Visited 16 members in Ikorodu district. Prayed with families facing challenges.",
    "Sister Angela shared school struggles. Encouraged her with scriptures on perseverance.",
    "Brother Michael's family welcomed us warmly. Discussed upcoming youth program.",
    "Visited 3 new families in Ogun West district. They expressed interest in joining HCF.",
  ];

  return (
    <View style={[styles.container]}>
      {/* Header with Journal Theme */}
      <LinearGradient
        colors={[COLORS.info, COLORS.primary]}
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
            <Text style={styles.headerTitle}>Visitation Report</Text>
            <Text style={styles.headerSubtitle}>
              Document your pastoral visits
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>7/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "54%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step 7 of 13 • Visitation Records
          </Text>
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
        {/* Main Journal Card */}
        <JournalCard
          title="Visitation Journal"
          subtitle="Record your home visits and pastoral care"
          icon="menu-book"
          accentColor={COLORS.info}
        >
          <View style={styles.journalContent}>
            {/* Section Number with decorative elements */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberContainer}>
                <Text style={styles.sectionNumber}>02</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionLabel}>VISITATION REPORT</Text>
                <Text style={styles.sectionDescription}>
                  Document every home visit, follow-up, and pastoral care
                </Text>
              </View>
            </View>

            {/* Journal Entry Area */}
            <Animated.View style={[{ transform: [{ scale: inputScale }] }]}>
              <View style={styles.inputContainer}>
                <View style={styles.inputHeader}>
                  <Icon name="edit-note" size={20} color={COLORS.info} />
                  <Text style={styles.inputHeaderText}>Write your report</Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  value={visitationReport}
                  onChangeText={setVisitationReport}
                  placeholder="Start typing your visitation report here..."
                  placeholderTextColor={COLORS.gray + "80"}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.charCount}>
                    {visitationReport.length} characters
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="people" size={20} color={COLORS.info} />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Visits recorded</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="home" size={20} color={COLORS.info} />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Households</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="favorite" size={20} color={COLORS.info} />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Prayers</Text>
              </View>
            </View>

            {/* Examples Section */}
            <View style={styles.examplesContainer}>
              <View style={styles.examplesHeader}>
                <Icon name="lightbulb" size={18} color={COLORS.warning} />
                <Text style={styles.examplesTitle}>Examples from field</Text>
              </View>

              {examples.map((example, index) => (
                <ExampleItem key={index} example={example} />
              ))}

              <View style={styles.tipContainer}>
                <Icon name="info-outline" size={16} color={COLORS.info} />
                <Text style={styles.tipText}>
                  Include names, dates, and specific prayer points for better
                  follow-up
                </Text>
              </View>
            </View>
          </View>
        </JournalCard>

        {/* Writing Tips Card */}
        <LinearGradient
          colors={[COLORS.warning + "10", COLORS.info + "10"]}
          style={styles.tipsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="tips-and-updates" size={24} color={COLORS.warning} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Writing Tips</Text>
            <Text style={styles.tipsText}>
              • Include names of those visited{"\n"}• Note specific prayer
              requests{"\n"}• Record follow-up commitments{"\n"}• Mention any
              decisions made
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
            <Icon name="arrow-back" size={20} color={COLORS.info} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                visitationReport ? styles.statusActive : null,
              ]}
            />
            <Text style={styles.statusText}>
              {visitationReport ? "Report written" : "Not started"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextNavButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.info, COLORS.primary]}
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
  },
  journalCard: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  // headerTextContainer: {
  //   flex: 1,
  // },
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
  journalContent: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.info + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionNumber: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.info,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.info,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
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
    backgroundColor: COLORS.info + "08",
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputHeaderText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.info,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  textArea: {
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.md,
    minHeight: 180,
    textAlignVertical: "top",
    color: COLORS.text.primary,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: COLORS.info + "08",
    padding: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.info + "08",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: COLORS.info,
    marginTop: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  examplesContainer: {
    backgroundColor: COLORS.warning + "08",
    borderRadius: 12,
    padding: SPACING.md,
  },
  examplesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  examplesTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  exampleBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.warning,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  exampleText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning + "20",
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.info,
    marginLeft: SPACING.xs,
    fontStyle: "italic",
  },
  tipsCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  tipsContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.warning,
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
    color: COLORS.info,
    marginLeft: 4,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray + "30",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginRight: SPACING.xs,
  },
  statusActive: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
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
