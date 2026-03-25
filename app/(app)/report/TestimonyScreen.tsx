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

// Testimony Card Component
const TestimonyCard = ({
  children,
  title,
  subtitle,
  icon,
  accentColor = COLORS.warning,
}) => (
  <LinearGradient
    colors={[COLORS.white, COLORS.background]}
    style={styles.testimonyCard}
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

// Testimony Item Component
const TestimonyItem = ({ testimony, index }) => (
  <View style={styles.testimonyItem}>
    <View
      style={[
        styles.testimonyBadge,
        { backgroundColor: COLORS.warning + "20" },
      ]}
    >
      <Text style={styles.testimonyIndex}>#{index + 1}</Text>
    </View>
    <View style={styles.testimonyContent}>
      <Text style={styles.testimonyText}>{testimony}</Text>
    </View>
  </View>
);

// Praise Emoji Component
const PraiseEmoji = ({ emoji, label, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
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
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[styles.emojiContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.emojiLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function TestimonyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateReport } = useReport();
  const [testimonies, setTestimonies] = useState(
    currentReport.testimonies || "",
  );

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const inputScale = useRef(new Animated.Value(1)).current;
  const [selectedEmoji, setSelectedEmoji] = useState(null);

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
    updateReport({ testimonies });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/ProblemsScreen");
    });
  };

  const handleEmojiPress = (emoji) => {
    setSelectedEmoji(emoji);
    // Add emoji to testimony text
    setTestimonies((prev) => prev + ` ${emoji} `);
  };

  const sampleTestimonies = [
    "A member was healed of chronic back pain during prayer session",
    "Three souls gave their lives to Christ in the last outreach",
    "Financial breakthrough for a family that was trusting God",
    "Restoration of a marriage that was on the verge of collapse",
    "Young graduate got a job after months of unemployment",
  ];

  const praiseEmojis = [
    { emoji: "🙌", label: "Praise" },
    { emoji: "🎉", label: "Celebrate" },
    { emoji: "🙏", label: "Prayer" },
    { emoji: "✨", label: "Miracle" },
    { emoji: "💫", label: "Blessing" },
    { emoji: "⭐", label: "Star" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Celebration Theme */}
      <LinearGradient
        colors={[COLORS.warning, COLORS.primary]}
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
            <Text style={styles.headerTitle}>Testimonies</Text>
            <Text style={styles.headerSubtitle}>Share your celebration</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>8/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "61%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step 8 of 13 • Testimonies</Text>
        </View>

        {/* Decorative elements */}
        <View style={styles.headerDecorative1} />
        <View style={styles.headerDecorative2} />
        <View style={styles.headerDecorative3} />
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Testimony Card */}
        <TestimonyCard
          title="Spectacular Testimonies"
          subtitle="Record God's goodness in the group"
          icon="emoji-events"
          accentColor={COLORS.warning}
        >
          <View style={styles.testimonyContent}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberContainer}>
                <Text style={styles.sectionNumber}>03</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionLabel}>SPECTACULAR TESTIMONIES</Text>
                <Text style={styles.sectionDescription}>
                  Healing, salvation, miracles, breakthroughs
                </Text>
              </View>
            </View>

            {/* Quick Praise Emojis */}
            <View style={styles.emojiGrid}>
              {praiseEmojis.map((item, index) => (
                <PraiseEmoji
                  key={index}
                  emoji={item.emoji}
                  label={item.label}
                  onPress={() => handleEmojiPress(item.emoji)}
                />
              ))}
            </View>

            {/* Testimony Input Area */}
            <Animated.View style={[{ transform: [{ scale: inputScale }] }]}>
              <View style={styles.inputContainer}>
                <View style={styles.inputHeader}>
                  <Icon name="auto-awesome" size={20} color={COLORS.warning} />
                  <Text style={styles.inputHeaderText}>
                    Write your testimony
                  </Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  value={testimonies}
                  onChangeText={setTestimonies}
                  placeholder="Share healing testimonies, salvation testimonies, miracles, breakthroughs, answered prayers..."
                  placeholderTextColor={COLORS.gray + "80"}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <View style={styles.inputFooter}>
                  <Icon name="auto-awesome" size={14} color={COLORS.warning} />
                  <Text style={styles.charCount}>
                    {testimonies.length} characters • Give God praise!
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Examples Section */}
            <View style={styles.examplesContainer}>
              <View style={styles.examplesHeader}>
                <Icon name="lightbulb" size={18} color={COLORS.warning} />
                <Text style={styles.examplesTitle}>Praise Reports</Text>
              </View>

              {sampleTestimonies.map((testimony, index) => (
                <TestimonyItem
                  key={index}
                  testimony={testimony}
                  index={index}
                />
              ))}

              <TouchableOpacity
                style={styles.addExampleButton}
                onPress={() =>
                  setTestimonies(
                    (prev) =>
                      prev + (prev ? "\n\n" : "") + sampleTestimonies[0],
                  )
                }
              >
                <Icon name="add-circle" size={18} color={COLORS.warning} />
                <Text style={styles.addExampleText}>Use as template</Text>
              </TouchableOpacity>
            </View>

            {/* Praise Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="healing" size={24} color={COLORS.success} />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Healings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="church" size={24} color={COLORS.warning} />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Salvations</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="paid" size={24} color={COLORS.success} />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Breakthroughs</Text>
              </View>
            </View>
          </View>
        </TestimonyCard>

        {/* Inspiration Card */}
        <LinearGradient
          colors={[COLORS.warning + "10", COLORS.primary + "10"]}
          style={styles.inspirationCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="auto-awesome" size={32} color={COLORS.warning} />
          <View style={styles.inspirationContent}>
            <Text style={styles.inspirationTitle}>
              Remember His Faithfulness
            </Text>
            <Text style={styles.inspirationText}>
              {`"Give thanks to the Lord, for He is good; His love endures forever."{'\n'}
              — Psalm 118:1`}
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
            <Icon name="arrow-back" size={20} color={COLORS.warning} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.praiseContainer}>
            <Icon name="auto-awesome" size={16} color={COLORS.warning} />
            <Text style={styles.praiseText}>
              {testimonies ? "Praise God!" : "Share a testimony"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextNavButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.warning, COLORS.primary]}
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
  headerDecorative3: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
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
  testimonyCard: {
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
  testimonyContent: {
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
    backgroundColor: COLORS.warning + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionNumber: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.warning,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.warning,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  emojiContainer: {
    alignItems: "center",
    padding: SPACING.xs,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 2,
  },
  emojiLabel: {
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
    backgroundColor: COLORS.warning + "08",
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputHeaderText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.warning,
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
    backgroundColor: COLORS.warning + "08",
    padding: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  examplesContainer: {
    backgroundColor: COLORS.warning + "08",
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
  testimonyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testimonyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  testimonyIndex: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.warning,
  },
  testimonyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
  },
  addExampleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning + "30",
  },
  addExampleText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.warning,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.warning + "08",
    borderRadius: 16,
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: COLORS.warning,
    marginTop: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  inspirationCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  inspirationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  inspirationTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.warning,
    marginBottom: 2,
  },
  inspirationText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
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
    color: COLORS.warning,
    marginLeft: 4,
    fontWeight: "500",
  },
  praiseContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  praiseText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.warning,
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
