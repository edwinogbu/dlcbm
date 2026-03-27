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
interface ActionItem {
    id: number;
    text: string;
    completed: boolean;
}

interface FollowUpItem {
    id: number;
    date: string;
    task: string;
    status: string;
}

interface Category {
    id: number;
    name: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
}

interface SolutionCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    accentColor?: string;
}

interface SolutionCategoryProps {
    category: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    onPress: () => void;
    isSelected: boolean;
}

interface SolutionActionItemProps {
    action: ActionItem;
    index: number;
    onUpdate: (index: number, text: string) => void;
    onComplete: (index: number) => void;
    onDelete: (index: number) => void;
}

interface FollowUpItemProps {
    item: FollowUpItem;
    index: number;
}

// Solution Card Component
const SolutionCard: React.FC<SolutionCardProps> = ({
    children,
    title,
    subtitle,
    icon,
    accentColor = COLORS.success,
}) => (
    <LinearGradient
        colors={[COLORS.white, COLORS.background]}
        style={styles.solutionCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

        <View style={styles.cardHeader}>
            <View
                style={[styles.iconContainer, { backgroundColor: accentColor + "15" }]}
            >
                <MaterialIcons name={icon} size={28} color={accentColor} />
            </View>
            <View style={styles.headerTextContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            </View>
        </View>

        {children}
    </LinearGradient>
);

// Solution Category Component
const SolutionCategory: React.FC<SolutionCategoryProps> = ({
    category,
    icon,
    color,
    onPress,
    isSelected
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = (): void => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
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
                    <MaterialIcons name={icon} size={24} color={color} />
                </View>
                <Text style={styles.categoryText}>{category}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// Solution Action Item Component
const SolutionActionItem: React.FC<SolutionActionItemProps> = ({
    action,
    index,
    onUpdate,
    onComplete,
    onDelete,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

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

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <View
                style={[
                    styles.actionItem,
                    action.completed && styles.actionItemCompleted,
                ]}
            >
                <View style={styles.actionNumberContainer}>
                    <LinearGradient
                        colors={
                            action.completed
                                ? [COLORS.success, COLORS.success]
                                : [COLORS.primary, COLORS.success]
                        }
                        style={styles.actionNumber}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.actionNumberText}>{index + 1}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.actionContent}>
                    <TextInput
                        style={[
                            styles.actionInput,
                            action.completed && styles.actionInputCompleted,
                        ]}
                        value={action.text}
                        onChangeText={(text: string) => onUpdate(index, text)}
                        placeholder="Describe the solution or action taken..."
                        placeholderTextColor={COLORS.gray + "80"}
                        multiline
                        editable={!action.completed}
                    />

                    <View style={styles.actionMeta}>
                        <TouchableOpacity
                            style={styles.actionTag}
                            onPress={() => onComplete(index)}
                        >
                            <MaterialIcons
                                name={
                                    action.completed ? "check-circle" : "radio-button-unchecked"
                                }
                                size={18}
                                color={action.completed ? COLORS.success : COLORS.gray}
                            />
                            <Text
                                style={[
                                    styles.actionTagText,
                                    action.completed && styles.actionTagTextCompleted,
                                ]}
                            >
                                {action.completed ? "Resolved" : "Mark Resolved"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionDelete}
                            onPress={() => onDelete(index)}
                        >
                            <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

// Follow-up Timeline Component
const FollowUpItem: React.FC<FollowUpItemProps> = ({ item, index }) => (
    <View style={styles.timelineItem}>
        <View style={styles.timelineDot} />
        {index < 2 && <View style={styles.timelineLine} />}
        <View style={styles.timelineContent}>
            <Text style={styles.timelineDate}>{item.date}</Text>
            <Text style={styles.timelineTask}>{item.task}</Text>
            <View style={styles.timelineStatus}>
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                item.status === "Completed"
                                    ? COLORS.success + "20"
                                    : COLORS.warning + "20",
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color:
                                    item.status === "Completed" ? COLORS.success : COLORS.warning,
                            },
                        ]}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
        </View>
    </View>
);

export default function SolutionsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { currentReport, updateReport } = useReport();

    // State management
    const [solutions, setSolutions] = useState<string>("");
    const [actionItems, setActionItems] = useState<ActionItem[]>([
        { id: 1, text: "", completed: false },
        { id: 2, text: "", completed: false },
        { id: 3, text: "", completed: false },
        { id: 4, text: "", completed: false },
    ]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [followUps, setFollowUps] = useState<FollowUpItem[]>([
        {
            id: 1,
            date: "Tomorrow",
            task: "Follow up with member",
            status: "Pending",
        },
        {
            id: 2,
            date: "Next Week",
            task: "Check progress on solution",
            status: "Scheduled",
        },
        {
            id: 3,
            date: "Next Month",
            task: "Review effectiveness",
            status: "Planned",
        },
    ]);

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const inputScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Load existing solutions from context if available
        if (currentReport?.solutions) {
            setSolutions(currentReport.solutions);
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

    const handleFocus = (): void => {
        Animated.spring(inputScale, {
            toValue: 1.02,
            useNativeDriver: true,
            tension: 150,
            friction: 3,
        }).start();
    };

    const handleBlur = (): void => {
        Animated.spring(inputScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 3,
        }).start();
    };

    const handleNext = (): void => {
        // Compile all solutions
        const actionTexts = actionItems
            .filter((item) => item.text.trim() !== "")
            .map((item) => `✓ ${item.text}${item.completed ? " [COMPLETED]" : ""}`)
            .join("\n");

        const finalSolutions =
            solutions + (solutions && actionTexts ? "\n\n" : "") + actionTexts;

        updateReport({ solutions: finalSolutions });

        // Animate out before navigation
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            router.push("/(app)/report/FinalRemarksScreen");
        });
    };

    const handleCategorySelect = (category: string): void => {
        setSelectedCategory(category);
        // Add category prefix to solutions
        const prefix = `[${category} Solution] `;
        setSolutions((prev) => prev + (prev ? "\n" : "") + prefix);
    };

    const handleActionUpdate = (index: number, text: string): void => {
        const newActions = [...actionItems];
        newActions[index].text = text;
        setActionItems(newActions);
    };

    const handleActionComplete = (index: number): void => {
        const newActions = [...actionItems];
        newActions[index].completed = !newActions[index].completed;
        setActionItems(newActions);
    };

    const handleActionDelete = (index: number): void => {
        Alert.alert(
            "Remove Action",
            "Are you sure you want to remove this solution?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        const newActions = [...actionItems];
                        newActions[index].text = "";
                        newActions[index].completed = false;
                        setActionItems(newActions);
                    },
                },
            ],
        );
    };

    const categories: Category[] = [
        { id: 1, name: "Counseling", icon: "psychology", color: COLORS.success },
        { id: 2, name: "Prayer", icon: "church", color: COLORS.info },
        { id: 3, name: "Practical", icon: "build", color: COLORS.warning },
        { id: 4, name: "Follow-up", icon: "update", color: COLORS.purple || "#6B4EFF" },
        { id: 5, name: "Referral", icon: "share", color: COLORS.secondary },
        { id: 6, name: "Other", icon: "more-horiz", color: COLORS.gray },
    ];

    const completedCount = actionItems.filter((item) => item.completed).length;
    const totalActions = actionItems.filter(
        (item) => item.text.trim() !== "",
    ).length;

    return (
        <View style={[styles.container, { paddingTop:1 }]}>
            {/* Header with Solution Theme */}
            <LinearGradient
                colors={[COLORS.success, COLORS.primary]}
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
                        <Text style={styles.headerTitle}>Solutions Offered</Text>
                        <Text style={styles.headerSubtitle}>
                            Action plans and resolutions
                        </Text>
                    </View>

                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>10/13</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: "77%",
                                    opacity: fadeAnim,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Step 10 of 13 • Solutions & Actions
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
                {/* Main Solution Card */}
                <SolutionCard
                    title="Action Plan"
                    subtitle="Document solutions and follow-up actions"
                    icon="lightbulb"
                    accentColor={COLORS.success}
                >
                    <View style={styles.solutionContent}>
                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionNumberContainer}>
                                <Text style={styles.sectionNumber}>05</Text>
                            </View>
                            <View style={styles.sectionTitleContainer}>
                                <Text style={styles.sectionLabel}>SOLUTIONS OFFERED</Text>
                                <Text style={styles.sectionDescription}>
                                    Counseling, prayers, practical help, follow-up plans
                                </Text>
                            </View>
                        </View>

                        {/* Progress Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{totalActions}</Text>
                                <Text style={styles.statLabel}>Total Actions</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{completedCount}</Text>
                                <Text style={styles.statLabel}>Completed</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {totalActions - completedCount}
                                </Text>
                                <Text style={styles.statLabel}>Pending</Text>
                            </View>
                        </View>

                        {/* Quick Categories */}
                        <Text style={styles.categoriesTitle}>Solution Categories</Text>
                        <View style={styles.categoriesGrid}>
                            {categories.map((category) => (
                                <SolutionCategory
                                    key={category.id}
                                    category={category.name}
                                    icon={category.icon}
                                    color={category.color}
                                    isSelected={selectedCategory === category.name}
                                    onPress={() => handleCategorySelect(category.name)}
                                />
                            ))}
                        </View>

                        {/* Detailed Solutions Input */}
                        <Animated.View style={[{ transform: [{ scale: inputScale }] }]}>
                            <View style={styles.inputContainer}>
                                <View style={styles.inputHeader}>
                                    <MaterialIcons name="edit-note" size={20} color={COLORS.success} />
                                    <Text style={styles.inputHeaderText}>
                                        Overall solutions summary
                                    </Text>
                                </View>
                                <TextInput
                                    style={styles.textArea}
                                    value={solutions}
                                    onChangeText={setSolutions}
                                    placeholder="Enter counseling given, prayers offered, actions taken, follow-up plans..."
                                    placeholderTextColor={COLORS.gray + "80"}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                <View style={styles.inputFooter}>
                                    <MaterialIcons name="check-circle" size={14} color={COLORS.success} />
                                    <Text style={styles.charCount}>
                                        {solutions.length} characters • Be specific
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Action Items */}
                        <View style={styles.actionsContainer}>
                            <View style={styles.actionsHeader}>
                                <MaterialIcons name="checklist" size={20} color={COLORS.success} />
                                <Text style={styles.actionsTitle}>Action Items</Text>
                                <Text style={styles.actionsSubtitle}>
                                    Track resolution progress
                                </Text>
                            </View>

                            {actionItems.map((item, index) => (
                                <SolutionActionItem
                                    key={item.id}
                                    action={item}
                                    index={index}
                                    onUpdate={handleActionUpdate}
                                    onComplete={handleActionComplete}
                                    onDelete={handleActionDelete}
                                />
                            ))}
                        </View>

                        {/* Follow-up Timeline */}
                        <View style={styles.timelineContainer}>
                            <View style={styles.timelineHeader}>
                                <MaterialIcons name="timeline" size={20} color={COLORS.success} />
                                <Text style={styles.timelineTitle}>Follow-up Schedule</Text>
                            </View>

                            {followUps.map((item, index) => (
                                <FollowUpItem key={item.id} item={item} index={index} />
                            ))}

                            <TouchableOpacity style={styles.addFollowUpButton}>
                                <MaterialIcons name="add-circle" size={18} color={COLORS.success} />
                                <Text style={styles.addFollowUpText}>Schedule Follow-up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SolutionCard>

                {/* Success Tips Card */}
                <LinearGradient
                    colors={[COLORS.success + "10", COLORS.primary + "10"]}
                    style={styles.tipsCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialIcons name="emoji-objects" size={32} color={COLORS.success} />
                    <View style={styles.tipsContent}>
                        <Text style={styles.tipsTitle}>Effective Solutions Framework</Text>
                        <Text style={styles.tipsText}>
                            • Be specific and actionable in your solutions{"\n"}• Include both
                            spiritual and practical help{"\n"}• Set clear follow-up timelines
                            {"\n"}• Track progress and celebrate resolutions
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
                        <MaterialIcons name="arrow-back" size={20} color={COLORS.success} />
                        <Text style={styles.backNavText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.resolutionIndicator}>
                        <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.resolutionText}>
                            {completedCount}/{totalActions || 0} resolved
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.nextNavButton}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.success, COLORS.primary]}
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
    solutionCard: {
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
    headerTextContainer: {
        flex: 1,
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
    solutionContent: {
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
        backgroundColor: COLORS.success + "10",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md,
    },
    sectionNumber: {
        fontSize: TYPOGRAPHY.xxl,
        fontWeight: "bold",
        color: COLORS.success,
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: "600",
        color: COLORS.success,
        letterSpacing: 1,
        marginBottom: 2,
    },
    sectionDescription: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray,
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: COLORS.success + "08",
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
        color: COLORS.success,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
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
        backgroundColor: COLORS.success + "08",
        padding: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    inputHeaderText: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.success,
        fontWeight: "500",
        marginLeft: SPACING.xs,
    },
    textArea: {
        padding: SPACING.md,
        fontSize: TYPOGRAPHY.md,
        minHeight: 100,
        textAlignVertical: "top",
        color: COLORS.text.primary,
    },
    inputFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: COLORS.success + "08",
        padding: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    charCount: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray,
        marginLeft: SPACING.xs,
    },
    actionsContainer: {
        backgroundColor: COLORS.success + "08",
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    actionsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    actionsTitle: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: "600",
        color: COLORS.success,
        marginLeft: SPACING.xs,
        flex: 1,
    },
    actionsSubtitle: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray,
    },
    actionItem: {
        flexDirection: "row",
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionItemCompleted: {
        backgroundColor: COLORS.success + "05",
        borderColor: COLORS.success + "30",
    },
    actionNumberContainer: {
        marginRight: SPACING.sm,
    },
    actionNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    actionNumberText: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: "600",
        color: COLORS.white,
    },
    actionContent: {
        flex: 1,
    },
    actionInput: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.primary,
        paddingVertical: SPACING.xs,
        minHeight: 40,
    },
    actionInputCompleted: {
        textDecorationLine: "line-through",
        color: COLORS.gray,
    },
    actionMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    actionTag: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: SPACING.md,
    },
    actionTagText: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray,
        marginLeft: 4,
    },
    actionTagTextCompleted: {
        color: COLORS.success,
    },
    actionDelete: {
        padding: 2,
    },
    timelineContainer: {
        marginTop: SPACING.sm,
    },
    timelineHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    timelineTitle: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: "600",
        color: COLORS.success,
        marginLeft: SPACING.xs,
    },
    timelineItem: {
        flexDirection: "row",
        marginBottom: SPACING.md,
        position: "relative",
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.success,
        marginRight: SPACING.md,
        marginTop: 4,
    },
    timelineLine: {
        position: "absolute",
        left: 5,
        top: 16,
        width: 2,
        height: 40,
        backgroundColor: COLORS.success + "30",
    },
    timelineContent: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    timelineDate: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: "600",
        color: COLORS.success,
        marginBottom: 2,
    },
    timelineTask: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    timelineStatus: {
        alignItems: "flex-start",
    },
    statusBadge: {
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: "500",
    },
    addFollowUpButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.success,
        borderRadius: 12,
        borderStyle: "dashed",
        marginTop: SPACING.sm,
    },
    addFollowUpText: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.success,
        fontWeight: "500",
        marginLeft: SPACING.xs,
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
        color: COLORS.success,
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
        color: COLORS.success,
        marginLeft: 4,
        fontWeight: "500",
    },
    resolutionIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.success + "10",
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
    },
    resolutionText: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.success,
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
