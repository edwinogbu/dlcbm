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
    Switch,
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
interface District {
    id: string;
    name: string;
    code: string;
    offering?: number;
    adult?: {
        membersMale?: number;
        membersFemale?: number;
        visitorsMale?: number;
        visitorsFemale?: number;
    };
    youth?: {
        membersMale?: number;
        membersFemale?: number;
        visitorsMale?: number;
        visitorsFemale?: number;
    };
    children?: {
        members?: number;
        visitors?: number;
    };
}

interface Expense {
    id: string;
    description: string;
    amount: number;
}

interface OfferingsState {
    missionOffering: number;
    specialOffering: number;
    expenses: Expense[];
    membersTotal?: number;
    visitorsTotal?: number;
}

interface FinancialCardProps {
    title: string;
    children: React.ReactNode;
    accentColor?: string;
}

interface DistrictOfferingRowProps {
    district: District;
    index: number;
    onUpdate: (districtId: string, amount: number) => void;
}

interface ExpenseItemProps {
    expense: Expense;
    onUpdate: (id: string, field: keyof Expense, value: string | number) => void;
    onRemove: (id: string) => void;
}

// Financial Card Component
const FinancialCard: React.FC<FinancialCardProps> = ({ title, children, accentColor = COLORS.primary }) => (
    <LinearGradient
        colors={[COLORS.white, COLORS.background]}
        style={styles.financialCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        <Text style={[styles.cardTitle, { color: accentColor }]}>{title}</Text>
        {children}
    </LinearGradient>
);

// District Offering Row Component
const DistrictOfferingRow: React.FC<DistrictOfferingRowProps> = ({ district, index, onUpdate }) => {
    const [amount, setAmount] = useState<string>(district.offering?.toString() || "0");
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

    const handleChange = (value: string): void => {
        const numericValue = value.replace(/[^0-9]/g, "");
        setAmount(numericValue);
        onUpdate(district.id, parseInt(numericValue) || 0);
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
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
                <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>₦</Text>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={handleChange}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.gray + "80"}
                        onFocus={handlePressIn}
                        onBlur={handlePressOut}
                    />
                </View>
            </View>
        </Animated.View>
    );
};

// Expense Item Component
const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onUpdate, onRemove }) => {
    const [description, setDescription] = useState<string>(expense.description || "");
    const [amount, setAmount] = useState<string>(expense.amount?.toString() || "0");
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

    const handleDescriptionChange = (value: string): void => {
        setDescription(value);
        onUpdate(expense.id, "description", value);
    };

    const handleAmountChange = (value: string): void => {
        const numericValue = value.replace(/[^0-9]/g, "");
        setAmount(numericValue);
        onUpdate(expense.id, "amount", parseInt(numericValue) || 0);
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.expenseItem}>
                <View style={styles.expenseIconContainer}>
                    <MaterialIcons name="receipt" size={20} color={COLORS.error} />
                </View>
                <TextInput
                    style={styles.expenseDescription}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    placeholder="Expense description (e.g., Transportation)"
                    placeholderTextColor={COLORS.gray + "80"}
                    onFocus={handlePressIn}
                    onBlur={handlePressOut}
                />
                <View style={styles.expenseAmountContainer}>
                    <Text style={styles.currencySymbolSmall}>₦</Text>
                    <TextInput
                        style={styles.expenseAmount}
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.gray + "80"}
                        onFocus={handlePressIn}
                        onBlur={handlePressOut}
                    />
                </View>
                <TouchableOpacity
                    style={styles.removeExpenseButton}
                    onPress={() => onRemove(expense.id)}
                >
                    <MaterialIcons name="close" size={18} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default function OfferingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { currentReport, updateDistrict } = useReport();

    const [districts, setDistricts] = useState<District[]>([]);
    const [hasExpenses, setHasExpenses] = useState<boolean>(false);
    const [offerings, setOfferings] = useState<OfferingsState>({
        missionOffering: 0,
        specialOffering: 0,
        expenses: [],
        membersTotal: 0,
        visitorsTotal: 0,
    });
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        if (currentReport?.districts) {
            setDistricts(currentReport.districts);
        }

        // Calculate attendance totals
        const membersTotal = currentReport?.districts?.reduce((sum: number, d: District) => {
            return (
                sum +
                (parseInt((d.adult?.membersMale as any)?.toString() || "0") || 0) +
                (parseInt((d.adult?.membersFemale as any)?.toString() || "0") || 0) +
                (parseInt((d.youth?.membersMale as any)?.toString() || "0") || 0) +
                (parseInt((d.youth?.membersFemale as any)?.toString() || "0") || 0) +
                (parseInt((d.children?.members as any)?.toString() || "0") || 0)
            );
        }, 0) || 0;

        const visitorsTotal = currentReport?.districts?.reduce((sum: number, d: District) => {
            return (
                sum +
                (parseInt((d.adult?.visitorsMale as any)?.toString() || "0") || 0) +
                (parseInt((d.adult?.visitorsFemale as any)?.toString() || "0") || 0) +
                (parseInt((d.youth?.visitorsMale as any)?.toString() || "0") || 0) +
                (parseInt((d.youth?.visitorsFemale as any)?.toString() || "0") || 0) +
                (parseInt((d.children?.visitors as any)?.toString() || "0") || 0)
            );
        }, 0) || 0;

        setOfferings((prev) => ({
            ...prev,
            membersTotal,
            visitorsTotal,
        }));

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

    const handleDistrictOfferingUpdate = (districtId: string, amount: number): void => {
        const updatedDistricts = districts.map((d) => {
            if (d.id === districtId) {
                return { ...d, offering: amount };
            }
            return d;
        });
        setDistricts(updatedDistricts);
        updateDistrict(districtId, { offering: amount });
    };

    const handleMissionOfferingChange = (value: string): void => {
        const numericValue = value.replace(/[^0-9]/g, "");
        setOfferings((prev) => ({
            ...prev,
            missionOffering: parseInt(numericValue) || 0,
        }));
    };

    const handleSpecialOfferingChange = (value: string): void => {
        const numericValue = value.replace(/[^0-9]/g, "");
        setOfferings((prev) => ({
            ...prev,
            specialOffering: parseInt(numericValue) || 0,
        }));
    };

    const addExpense = (): void => {
        const newExpense: Expense = {
            id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: "",
            amount: 0,
        };
        setOfferings((prev) => ({
            ...prev,
            expenses: [...prev.expenses, newExpense],
        }));
    };

    const updateExpense = (id: string, field: keyof Expense, value: string | number): void => {
        setOfferings((prev) => ({
            ...prev,
            expenses: prev.expenses.map((e) =>
                e.id === id
                    ? { ...e, [field]: field === "amount" ? (typeof value === "string" ? parseInt(value) || 0 : value) : value }
                    : e
            ),
        }));
    };

    const removeExpense = (id: string): void => {
        Alert.alert(
            "Remove Expense",
            "Are you sure you want to remove this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        setOfferings((prev) => ({
                            ...prev,
                            expenses: prev.expenses.filter((e) => e.id !== id),
                        }));
                    },
                },
            ],
        );
    };

    const calculateDistrictOfferings = (): number => {
        return districts.reduce((sum, d) => sum + (d.offering || 0), 0);
    };

    const calculateTotalOfferings = (): number => {
        return (
            calculateDistrictOfferings() +
            (offerings.missionOffering || 0) +
            (offerings.specialOffering || 0)
        );
    };

    const calculateTotalExpenses = (): number => {
        return offerings.expenses.reduce(
            (sum, e) => sum + (e.amount || 0),
            0,
        );
    };

    const calculateNetOffering = (): number => {
        return calculateTotalOfferings() - calculateTotalExpenses();
    };

    const handleNext = (): void => {
        if (calculateTotalOfferings() === 0) {
            Alert.alert(
                "No Offerings",
                "Please enter at least one offering amount before proceeding.",
                [{ text: "OK" }],
            );
            return;
        }

        // Animate out before navigation
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            router.push("/(app)/report/VisitationReportScreen");
        });
    };

    const formatCurrency = (amount: number): string => {
        return `₦${amount.toLocaleString()}`;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header with Financial Theme */}
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
                        <Text style={styles.headerTitle}>Offerings & Expenses</Text>
                        <Text style={styles.headerSubtitle}>Financial summary</Text>
                    </View>

                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>6/13</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: "46%",
                                    opacity: fadeAnim,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Step 6 of 13 • Financial Summary
                    </Text>
                </View>
            </LinearGradient>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <MaterialIcons name="people" size={24} color={COLORS.primary} />
                    <Text style={styles.statLabel}>Members</Text>
                    <Text style={styles.statValue}>{offerings.membersTotal || 0}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                    <MaterialIcons name="person-add" size={24} color={COLORS.success} />
                    <Text style={styles.statLabel}>Visitors</Text>
                    <Text style={styles.statValue}>{offerings.visitorsTotal || 0}</Text>
                </View>
            </View>

            <Animated.ScrollView
                style={[styles.content, { opacity: fadeAnim }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* District Offerings */}
                <FinancialCard title="District Offerings" accentColor={COLORS.primary}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerDistrict}>District</Text>
                        <Text style={styles.headerAmount}>Amount (₦)</Text>
                    </View>
                    {districts.map((district, index) => (
                        <DistrictOfferingRow
                            key={district.id}
                            district={district}
                            index={index}
                            onUpdate={handleDistrictOfferingUpdate}
                        />
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalAmount}>
                            {formatCurrency(calculateDistrictOfferings())}
                        </Text>
                    </View>
                </FinancialCard>

                {/* Additional Offerings */}
                <FinancialCard
                    title="Additional Offerings"
                    accentColor={COLORS.success}
                >
                    <View style={styles.additionalRow}>
                        <View style={styles.additionalLabelContainer}>
                            <MaterialIcons name="church" size={20} color={COLORS.success} />
                            <Text style={styles.additionalLabel}>Mission Offering</Text>
                        </View>
                        <View style={styles.additionalInputContainer}>
                            <Text style={styles.currencySymbol}>₦</Text>
                            <TextInput
                                style={styles.additionalInput}
                                value={offerings.missionOffering?.toString()}
                                onChangeText={handleMissionOfferingChange}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.gray + "80"}
                            />
                        </View>
                    </View>

                    <View style={styles.additionalRow}>
                        <View style={styles.additionalLabelContainer}>
                            <MaterialIcons name="star" size={20} color={COLORS.warning} />
                            <Text style={styles.additionalLabel}>Special Offering</Text>
                        </View>
                        <View style={styles.additionalInputContainer}>
                            <Text style={styles.currencySymbol}>₦</Text>
                            <TextInput
                                style={styles.additionalInput}
                                value={offerings.specialOffering?.toString()}
                                onChangeText={handleSpecialOfferingChange}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.gray + "80"}
                            />
                        </View>
                    </View>
                </FinancialCard>

                {/* Expenses Section */}
                <FinancialCard title="Expenses" accentColor={COLORS.error}>
                    <View style={styles.expenseHeader}>
                        <Text style={styles.expenseHeaderText}>Record church expenses</Text>
                        <Switch
                            value={hasExpenses}
                            onValueChange={setHasExpenses}
                            trackColor={{ false: COLORS.lightGray, true: COLORS.error }}
                            thumbColor={hasExpenses ? COLORS.white : COLORS.white}
                        />
                    </View>

                    {hasExpenses && (
                        <>
                            {offerings.expenses.map((expense) => (
                                <ExpenseItem
                                    key={expense.id}
                                    expense={expense}
                                    onUpdate={updateExpense}
                                    onRemove={removeExpense}
                                />
                            ))}

                            <TouchableOpacity
                                style={styles.addExpenseButton}
                                onPress={addExpense}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="add-circle" size={20} color={COLORS.error} />
                                <Text style={[styles.addExpenseText, { color: COLORS.error }]}>
                                    Add Expense
                                </Text>
                            </TouchableOpacity>

                            {offerings.expenses.length > 0 && (
                                <View style={styles.totalExpenseRow}>
                                    <Text style={styles.totalExpenseLabel}>Total Expenses</Text>
                                    <Text style={styles.totalExpenseAmount}>
                                        -{formatCurrency(calculateTotalExpenses())}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {!hasExpenses && (
                        <View style={styles.noExpensesContainer}>
                            <MaterialIcons name="info-outline" size={20} color={COLORS.gray} />
                            <Text style={styles.noExpensesText}>
                                Toggle switch to add expenses (transport, refreshments, etc.)
                            </Text>
                        </View>
                    )}
                </FinancialCard>

                {/* Grand Total Card */}
                <LinearGradient
                    colors={[COLORS.success + "20", COLORS.primary + "20"]}
                    style={styles.grandTotalCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total Offerings</Text>
                        <Text style={styles.grandTotalValue}>
                            {formatCurrency(calculateTotalOfferings())}
                        </Text>
                    </View>

                    {hasExpenses && offerings.expenses.length > 0 && (
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Total Expenses</Text>
                            <Text style={[styles.grandTotalValue, { color: COLORS.error }]}>
                                -{formatCurrency(calculateTotalExpenses())}
                            </Text>
                        </View>
                    )}

                    <View style={styles.netTotalRow}>
                        <Text style={styles.netTotalLabel}>NET TOTAL</Text>
                        <Text style={styles.netTotalValue}>
                            {formatCurrency(calculateNetOffering())}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Info Card */}
                <LinearGradient
                    colors={[COLORS.info + "10", COLORS.primary + "10"]}
                    style={styles.infoCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialIcons name="info-outline" size={24} color={COLORS.info} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Offering Guidelines</Text>
                        <Text style={styles.infoText}>
                            • District offerings: per group contributions{"\n"}• Mission
                            offerings: outreach and missions{"\n"}• Special offerings:
                            projects and events{"\n"}• Expenses: transport, refreshments,
                            supplies
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
                        <MaterialIcons name="arrow-back" size={20} color={COLORS.primary} />
                        <Text style={styles.backNavText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.totalSummary}>
                        <Text style={styles.totalSummaryLabel}>Net Total</Text>
                        <Text style={styles.totalSummaryValue}>
                            {formatCurrency(calculateNetOffering())}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.nextNavButton,
                            calculateTotalOfferings() === 0 && styles.disabledButton,
                        ]}
                        onPress={handleNext}
                        disabled={calculateTotalOfferings() === 0}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={
                                calculateTotalOfferings() > 0
                                    ? [COLORS.success, COLORS.primary]
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
    statsContainer: {
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
    statCard: {
        flex: 1,
        alignItems: "center",
        paddingVertical: SPACING.sm,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray,
        marginTop: 2,
    },
    statValue: {
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
    financialCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.lg,
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
    cardTitle: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: "600",
        marginBottom: SPACING.md,
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerDistrict: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: "600",
        color: COLORS.gray,
    },
    headerAmount: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: "600",
        color: COLORS.gray,
    },
    districtRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + "50",
    },
    districtInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    districtBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
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
    amountContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        width: 120,
    },
    currencySymbol: {
        fontSize: TYPOGRAPHY.md,
        color: COLORS.primary,
        fontWeight: "600",
        marginLeft: SPACING.sm,
    },
    amountInput: {
        flex: 1,
        paddingVertical: SPACING.sm,
        paddingRight: SPACING.sm,
        fontSize: TYPOGRAPHY.md,
        color: COLORS.text.primary,
        textAlign: "right",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 2,
        borderTopColor: COLORS.primary,
    },
    totalLabel: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: "600",
        color: COLORS.primary,
    },
    totalAmount: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    additionalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm,
    },
    additionalLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    additionalLabel: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.primary,
        marginLeft: SPACING.xs,
    },
    additionalInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        width: 120,
    },
    additionalInput: {
        flex: 1,
        paddingVertical: SPACING.sm,
        paddingRight: SPACING.sm,
        fontSize: TYPOGRAPHY.md,
        color: COLORS.text.primary,
        textAlign: "right",
    },
    expenseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    expenseHeaderText: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.gray,
    },
    expenseItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.xs,
    },
    expenseIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.error + "10",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.xs,
    },
    expenseDescription: {
        flex: 2,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.primary,
    },
    expenseAmountContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.xs,
    },
    currencySymbolSmall: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.error,
        fontWeight: "600",
        marginLeft: SPACING.xs,
    },
    expenseAmount: {
        flex: 1,
        paddingVertical: SPACING.sm,
        paddingRight: SPACING.xs,
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.primary,
        textAlign: "right",
    },
    removeExpenseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.error + "10",
        justifyContent: "center",
        alignItems: "center",
    },
    addExpenseButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.error,
        borderRadius: 12,
        borderStyle: "dashed",
        marginTop: SPACING.sm,
    },
    addExpenseText: {
        fontSize: TYPOGRAPHY.sm,
        marginLeft: SPACING.xs,
        fontWeight: "500",
    },
    totalExpenseRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalExpenseLabel: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: "600",
        color: COLORS.text.primary,
    },
    totalExpenseAmount: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: "600",
        color: COLORS.error,
    },
    noExpensesContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.lightGray + "30",
        padding: SPACING.md,
        borderRadius: 12,
    },
    noExpensesText: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.gray,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    grandTotalCard: {
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    grandTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.xs,
    },
    grandTotalLabel: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.gray,
    },
    grandTotalValue: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: "600",
        color: COLORS.primary,
    },
    netTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 2,
        borderTopColor: COLORS.success,
    },
    netTotalLabel: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: "bold",
        color: COLORS.success,
    },
    netTotalValue: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: "bold",
        color: COLORS.success,
    },
    infoCard: {
        flexDirection: "row",
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.md,
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
        color: COLORS.primary,
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
        fontSize: TYPOGRAPHY.md,
        fontWeight: "bold",
        color: COLORS.success,
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

