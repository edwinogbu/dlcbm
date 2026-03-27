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

// Problem Card Component
const ProblemCard = ({
  children,
  title,
  subtitle,
  icon,
  accentColor = COLORS.error,
}) => (
  <LinearGradient
    colors={[COLORS.white, COLORS.background]}
    style={styles.problemCard}
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

// Problem Category Component
const ProblemCategory = ({ category, icon, color, onPress, isSelected }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.categoryItem,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: isSelected ? color + "15" : COLORS.white,
            borderColor: isSelected ? color : COLORS.border,
          },
        ]}
      >
        <View style={[styles.categoryIcon, { backgroundColor: color + "20" }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text style={styles.categoryText}>{category}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Problem Checklist Item
const ProblemChecklistItem = ({ item, index, onToggle, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      <View style={styles.checklistItem}>
        <TouchableOpacity
          onPress={() => onToggle(index)}
          style={styles.checkbox}
        >
          {item.checked ? (
            <Icon name="check-box" size={24} color={COLORS.error} />
          ) : (
            <Icon
              name="check-box-outline-blank"
              size={24}
              color={COLORS.gray}
            />
          )}
        </TouchableOpacity>
        <TextInput
          style={[styles.checklistInput, item.checked && styles.checkedText]}
          value={item.text}
          onChangeText={(text) => onToggle(index, text)}
          placeholder="Describe the problem..."
          placeholderTextColor={COLORS.gray + "80"}
          multiline
        />
        <TouchableOpacity
          onPress={() => onDelete(index)}
          style={styles.deleteButton}
        >
          <Icon name="close" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function ProblemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateReport } = useReport();

  // State management
  const [problems, setProblems] = useState("");
  const [checklist, setChecklist] = useState([
    { id: 1, text: "", checked: false },
    { id: 2, text: "", checked: false },
    { id: 3, text: "", checked: false },
    { id: 4, text: "", checked: false },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const inputScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Load existing problems from context if available
    if (currentReport.problems) {
      setProblems(currentReport.problems);
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
    // Filter out empty problems
    const filledProblems = checklist
      .filter((item) => item.text.trim() !== "")
      .map((item) => item.text)
      .join("\n");

    const finalProblems =
      problems + (problems && filledProblems ? "\n\n" : "") + filledProblems;

    updateReport({ problems: finalProblems });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/SolutionsScreen");
    });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Add category prefix to problems
    const prefix = `[${category}] `;
    setProblems((prev) => prev + (prev ? "\n" : "") + prefix);
  };

  const handleChecklistToggle = (index, text = null) => {
    const newChecklist = [...checklist];
    if (text !== null) {
      newChecklist[index].text = text;
    } else {
      newChecklist[index].checked = !newChecklist[index].checked;
    }
    setChecklist(newChecklist);
  };

  const handleChecklistDelete = (index) => {
    Alert.alert(
      "Remove Problem",
      "Are you sure you want to remove this problem?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const newChecklist = [...checklist];
            newChecklist[index].text = "";
            newChecklist[index].checked = false;
            setChecklist(newChecklist);
          },
        },
      ],
    );
  };

  const categories = [
    { id: 1, name: "Leadership", icon: "people", color: COLORS.error },
    { id: 2, name: "Attendance", icon: "event-busy", color: COLORS.warning },
    { id: 3, name: "Spiritual", icon: "church", color: COLORS.info },
    {
      id: 4,
      name: "Financial",
      icon: "account-balance",
      color: COLORS.success,
    },
    { id: 5, name: "Logistics", icon: "local-shipping", color: COLORS.purple },
    { id: 6, name: "Other", icon: "more-horiz", color: COLORS.gray },
  ];

  return (
    <View style={[styles.container, { paddingTop:1 }]}>
      {/* Header with Problem-Solving Theme */}
      <LinearGradient
        colors={[COLORS.error, COLORS.primary]}
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
            <Text style={styles.headerTitle}>Problems Encountered</Text>
            <Text style={styles.headerSubtitle}>
              Identify challenges and issues
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>9/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "69%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step 9 of 13 • Problem Analysis
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
        {/* Main Problem Card */}
        <ProblemCard
          title="Problem Analysis"
          subtitle="Document challenges and obstacles"
          icon="warning"
          accentColor={COLORS.error}
        >
          <View style={styles.problemContent}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberContainer}>
                <Text style={styles.sectionNumber}>04</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionLabel}>PROBLEMS ENCOUNTERED</Text>
                <Text style={styles.sectionDescription}>
                  Leadership, attendance, spiritual, financial issues
                </Text>
              </View>
            </View>

            {/* Quick Categories */}
            <Text style={styles.categoriesTitle}>Quick Categories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <ProblemCategory
                  key={category.id}
                  category={category.name}
                  icon={category.icon}
                  color={category.color}
                  isSelected={selectedCategory === category.name}
                  onPress={() => handleCategorySelect(category.name)}
                />
              ))}
            </View>

            {/* Detailed Problem Input */}
            <Animated.View style={[{ transform: [{ scale: inputScale }] }]}>
              <View style={styles.inputContainer}>
                <View style={styles.inputHeader}>
                  <Icon name="edit-note" size={20} color={COLORS.error} />
                  <Text style={styles.inputHeaderText}>
                    Describe the problems in detail
                  </Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  value={problems}
                  onChangeText={setProblems}
                  placeholder="Enter challenges faced in the fellowship, member issues, leadership concerns, attendance problems..."
                  placeholderTextColor={COLORS.gray + "80"}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <View style={styles.inputFooter}>
                  <Icon name="info" size={14} color={COLORS.error} />
                  <Text style={styles.charCount}>
                    {problems.length} characters • Be specific
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Problem Checklist */}
            <View style={styles.checklistContainer}>
              <View style={styles.checklistHeader}>
                <Icon name="checklist" size={20} color={COLORS.error} />
                <Text style={styles.checklistTitle}>Problem Checklist</Text>
                <Text style={styles.checklistSubtitle}>
                  Mark resolved issues
                </Text>
              </View>

              {checklist.map((item, index) => (
                <ProblemChecklistItem
                  key={item.id}
                  item={item}
                  index={index}
                  onToggle={handleChecklistToggle}
                  onDelete={handleChecklistDelete}
                />
              ))}
            </View>

            {/* Impact Analysis */}
            <View style={styles.impactContainer}>
              <Text style={styles.impactTitle}>Impact Assessment</Text>
              <View style={styles.impactBar}>
                <View style={[styles.impactFill, { width: "65%" }]} />
              </View>
              <View style={styles.impactLabels}>
                <Text style={styles.impactLabel}>Low</Text>
                <Text style={styles.impactLabel}>Medium</Text>
                <Text style={styles.impactLabel}>High</Text>
                <Text style={styles.impactLabel}>Critical</Text>
              </View>
            </View>
          </View>
        </ProblemCard>

        {/* Analysis Tips Card */}
        <LinearGradient
          colors={[COLORS.error + "10", COLORS.primary + "10"]}
          style={styles.tipsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="analytics" size={32} color={COLORS.error} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Problem-Solving Framework</Text>
            <Text style={styles.tipsText}>
              • Identify root causes, not just symptoms{"\n"}• Prioritize issues
              by impact and urgency{"\n"}• Document who is affected and how
              {"\n"}• Note any recurring patterns
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
            <Icon name="arrow-back" size={20} color={COLORS.error} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.progressIndicator}>
            <Icon name="warning" size={16} color={COLORS.error} />
            <Text style={styles.progressIndicatorText}>
              {checklist.filter((i) => i.text).length} problems identified
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextNavButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.error, COLORS.primary]}
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
  problemCard: {
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
  problemContent: {
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
    backgroundColor: COLORS.error + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionNumber: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.error,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.error,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  categoriesTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  categoryItem: {
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.primary,
    textAlign: "center",
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
    backgroundColor: COLORS.error + "08",
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputHeaderText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.error,
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
    backgroundColor: COLORS.error + "08",
    padding: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  checklistContainer: {
    backgroundColor: COLORS.error + "08",
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  checklistTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.error,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  checklistSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    marginRight: SPACING.sm,
  },
  checklistInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.primary,
    paddingVertical: SPACING.xs,
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: COLORS.gray,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  impactContainer: {
    marginTop: SPACING.sm,
  },
  impactTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  impactBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SPACING.xs,
  },
  impactFill: {
    height: "100%",
    backgroundColor: COLORS.error,
    borderRadius: 4,
  },
  impactLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  impactLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  tipsCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  tipsContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.error,
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
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: "500",
  },
  progressIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  progressIndicatorText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.error,
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
