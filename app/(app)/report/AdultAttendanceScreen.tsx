import { MaterialIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";
import { useReport } from "../../../context/ReportContext";

const { width } = Dimensions.get("window");

export default function AdultAttendanceScreen() {
  const router = useRouter();
  const { currentReport, updateDistrict } = useReport();
  const [districts, setDistricts] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Initialize districts with existing data or default values
    const initialDistricts = currentReport.districts.map((d) => ({
      ...d,
      adult: d.adult || {
        membersMale: 0,
        membersFemale: 0,
        visitorsMale: 0,
        visitorsFemale: 0,
        total: 0,
      },
    }));
    setDistricts(initialDistricts);

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

  const calculateTotal = (district) => {
    const membersMale = parseInt(district.adult.membersMale) || 0;
    const membersFemale = parseInt(district.adult.membersFemale) || 0;
    const visitorsMale = parseInt(district.adult.visitorsMale) || 0;
    const visitorsFemale = parseInt(district.adult.visitorsFemale) || 0;
    return membersMale + membersFemale + visitorsMale + visitorsFemale;
  };

  const handleInputChange = (districtId, field, value) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    const updatedDistricts = districts.map((d) => {
      if (d.id === districtId) {
        const updatedAdult = { ...d.adult, [field]: numericValue };
        const total = calculateTotal({ adult: updatedAdult });
        return {
          ...d,
          adult: { ...updatedAdult, total },
        };
      }
      return d;
    });
    setDistricts(updatedDistricts);
  };

  const handleSaveAll = () => {
    // Validate at least one entry
    const hasEntries = districts.some((d) => d.adult.total > 0);

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
      updateDistrict(district.id, { adult: district.adult });
    });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/YouthAttendanceScreen");
    });
  };

  const calculateGrandTotal = () => {
    return districts.reduce((sum, d) => sum + (d.adult.total || 0), 0);
  };

  const calculateMembersTotal = (gender) => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.adult[`members${gender}`]) || 0),
      0,
    );
  };

  const calculateVisitorsTotal = (gender) => {
    return districts.reduce(
      (sum, d) => sum + (parseInt(d.adult[`visitors${gender}`]) || 0),
      0,
    );
  };

  const AttendanceCard = ({ district, index }) => {
    const [isFocused, setIsFocused] = useState(false);
    const scaleAnim = useState(new Animated.Value(1))[0];

    const handleFocus = () => {
      setIsFocused(true);
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.card,
          isFocused && styles.cardFocused,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={
            isFocused
              ? [COLORS.primary + "08", COLORS.primary + "15"]
              : ["transparent", "transparent"]
          }
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.districtBadge}>
              <Text style={styles.districtIndex}>#{index + 1}</Text>
              <Text style={styles.districtName}>
                {district.districtName || `District ${index + 1}`}
              </Text>
            </View>
            <View style={styles.cardTotal}>
              <Text style={styles.cardTotalLabel}>Total</Text>
              <Text style={styles.cardTotalValue}>
                {district.adult.total || 0}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="group" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>MEMBERS</Text>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Male</Text>
                <TextInput
                  style={styles.input}
                  value={district.adult.membersMale?.toString()}
                  onChangeText={(value) =>
                    handleInputChange(district.id, "membersMale", value)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray + "80"}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Female</Text>
                <TextInput
                  style={styles.input}
                  value={district.adult.membersFemale?.toString()}
                  onChangeText={(value) =>
                    handleInputChange(district.id, "membersFemale", value)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray + "80"}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="people" size={18} color={COLORS.secondary} />
              <Text style={styles.sectionTitle}>VISITORS</Text>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Male</Text>
                <TextInput
                  style={styles.input}
                  value={district.adult.visitorsMale?.toString()}
                  onChangeText={(value) =>
                    handleInputChange(district.id, "visitorsMale", value)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray + "80"}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Female</Text>
                <TextInput
                  style={styles.input}
                  value={district.adult.visitorsFemale?.toString()}
                  onChangeText={(value) =>
                    handleInputChange(district.id, "visitorsFemale", value)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray + "80"}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back-ios" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Record Adult Attendance</Text>
              <Text style={styles.headerSubtitle}>HCF Members & Visitors</Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>3/13</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: "23%",
                transform: [
                  {
                    scaleX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Step 3 of 13</Text>
      </View>

      {/* Summary Cards - WITHOUT BLUR */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="group" size={24} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Members</Text>
          <Text style={styles.summaryValue}>
            {calculateMembersTotal("Male") + calculateMembersTotal("Female")}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <Icon name="people" size={24} color={COLORS.secondary} />
          <Text style={styles.summaryLabel}>Visitors</Text>
          <Text style={styles.summaryValue}>
            {calculateVisitorsTotal("Male") + calculateVisitorsTotal("Female")}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <Icon name="person-add" size={24} color={COLORS.success} />
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{calculateGrandTotal()}</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* District Cards */}
        {districts.map((district, index) => (
          <AttendanceCard key={district.id} district={district} index={index} />
        ))}

        {/* Info Card */}
        <LinearGradient
          colors={[COLORS.primary + "10", COLORS.secondary + "10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <Icon name="info-outline" size={24} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Quick Tips</Text>
            <Text style={styles.infoText}>
              {`
              • Enter numbers only - they auto-calculate{'\n'}
              • Each district's total updates in real-time{'\n'}
              • You can edit any field anytime
            `}
            </Text>
          </View>
        </LinearGradient>
      </Animated.ScrollView>

      {/* Bottom Navigation - WITHOUT BLUR */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={20} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.totalSummary}>
            <Text style={styles.totalSummaryLabel}>Grand Total</Text>
            <Text style={styles.totalSummaryValue}>
              {calculateGrandTotal()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleSaveAll}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Icon name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 2,
    paddingBottom: 5,
    paddingHorizontal: SPACING.lg,
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
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.md,
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardFocused: {
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: SPACING.md,
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
  districtIndex: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: SPACING.xs,
    overflow: "hidden",
  },
  districtName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.text.primary,
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
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: "600",
    color: COLORS.gray,
    marginLeft: SPACING.xs,
    letterSpacing: 0.5,
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
  infoCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.sm,
    marginBottom: 80,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    lineHeight: 18,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "80",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  bottomNavContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backButtonText: {
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
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: SPACING.xs,
  },
});
