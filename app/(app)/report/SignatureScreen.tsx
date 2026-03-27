import { MaterialIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

// Document Card Component
const DocumentCard = ({
  children,
  title,
  subtitle,
  icon,
  accentColor = COLORS.primary,
}) => (
  <LinearGradient
    colors={[COLORS.white, COLORS.background]}
    style={styles.documentCard}
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

// Signature Line Component
const SignatureLine = ({ value, onChange, placeholder, onFocus, onBlur }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
    onBlur?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.signatureContainer}>
        <View style={styles.signatureLineContainer}>
          <TextInput
            style={styles.signatureInput}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray + "60"}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <View style={styles.signatureUnderline} />
        </View>
        <Icon
          name="draw"
          size={24}
          color={COLORS.primary}
          style={styles.signatureIcon}
        />
      </View>
    </Animated.View>
  );
};

// Date Picker Component
const DatePickerButton = ({ date, onPress }) => {
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

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[styles.datePickerButton, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.dateIconContainer}>
          <Icon name="event" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateLabel}>Signature Date</Text>
          <Text style={styles.dateValue}>{formatDate(date)}</Text>
        </View>
        <Icon name="arrow-drop-down" size={24} color={COLORS.primary} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Seal Component
const Seal = ({ isSigned }) => (
  <View style={[styles.sealContainer, isSigned && styles.sealActive]}>
    <LinearGradient
      colors={
        isSigned
          ? [COLORS.success, COLORS.primary]
          : [COLORS.gray + "30", COLORS.lightGray]
      }
      style={styles.seal}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Icon
        name="verified"
        size={32}
        color={isSigned ? COLORS.white : COLORS.gray}
      />
      <Text style={[styles.sealText, isSigned && styles.sealTextActive]}>
        {isSigned ? "SIGNED" : "PENDING"}
      </Text>
    </LinearGradient>
  </View>
);

export default function SignatureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentReport, updateReport } = useReport();

  const [name, setName] = useState(currentReport.signatureName || "");
  const [date, setDate] = useState(
    currentReport.signatureDate
      ? new Date(currentReport.signatureDate)
      : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert(
        "Signature Required",
        "Please enter your name to sign the report.",
        [{ text: "OK" }],
      );
      return;
    }

    updateReport({
      signatureName: name,
      signatureDate: date.toISOString(),
    });

    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/report/ReportReviewScreen");
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const isSigned = name.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop:1 }]}>
      {/* Header with Document Theme */}
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
            <Text style={styles.headerTitle}>Official Signature</Text>
            <Text style={styles.headerSubtitle}>Authorize the report</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>12/13</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: "92%",
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step 12 of 13 • Final Signature
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
        {/* Main Document Card */}
        <DocumentCard
          title="Signature & Authorization"
          subtitle="Pastor's official confirmation"
          icon="draw"
          accentColor={COLORS.primary}
        >
          <View style={styles.documentContent}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberContainer}>
                <Text style={styles.sectionNumber}>07</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionLabel}>OFFICIAL SIGNATURE</Text>
                <Text style={styles.sectionDescription}>
                  Authorize with your name and date
                </Text>
              </View>
            </View>

            {/* Seal Status */}
            <View style={styles.sealWrapper}>
              <Seal isSigned={isSigned} />
            </View>

            {/* Signature Area */}
            <View style={styles.signatureArea}>
              <Text
                style={styles.signatureAreaTitle}
              >{`Pastor's Signature`}</Text>

              <SignatureLine
                value={name}
                onChange={setName}
                placeholder="Enter your full name"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              <View style={styles.signatureHint}>
                <Icon name="info-outline" size={14} color={COLORS.gray} />
                <Text style={styles.signatureHintText}>
                  Type your name as your legal signature
                </Text>
              </View>
            </View>

            {/* Date Picker */}
            <View style={styles.dateArea}>
              <Text style={styles.dateAreaTitle}>Date of Signing</Text>
              <DatePickerButton
                date={date}
                onPress={() => setShowDatePicker(true)}
              />
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Preview Card */}
            <LinearGradient
              colors={[COLORS.primary + "08", COLORS.primary + "02"]}
              style={styles.previewCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.previewHeader}>
                <Icon name="visibility" size={20} color={COLORS.primary} />
                <Text style={styles.previewTitle}>Signature Preview</Text>
              </View>

              <View style={styles.previewContent}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Name:</Text>
                  <Text
                    style={[
                      styles.previewValue,
                      name ? styles.previewValueActive : null,
                    ]}
                  >
                    {name || "[Your Name]"}
                  </Text>
                </View>

                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Date:</Text>
                  <Text style={styles.previewValue}>
                    {date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>

                <View style={styles.previewSeal}>
                  <Icon
                    name="verified"
                    size={16}
                    color={isSigned ? COLORS.success : COLORS.gray}
                  />
                  <Text
                    style={[
                      styles.previewSealText,
                      isSigned && styles.previewSealTextActive,
                    ]}
                  >
                    {isSigned ? "Document will be signed" : "Signature pending"}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Legal Notice */}
            <View style={styles.legalNotice}>
              <View style={styles.legalIconContainer}>
                <Icon name="gavel" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.legalTextContainer}>
                <Text style={styles.legalTitle}>Legal Acknowledgment</Text>
                <Text style={styles.legalText}>
                  By signing this document, I confirm that all information
                  provided in this report is true, accurate, and complete to the
                  best of my knowledge. I understand that this serves as an
                  official record of the HCF group activities.
                </Text>
              </View>
            </View>
          </View>
        </DocumentCard>

        {/* Information Card */}
        <LinearGradient
          colors={[COLORS.info + "10", COLORS.primary + "10"]}
          style={styles.infoCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="info-outline" size={24} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why Your Signature Matters</Text>
            <Text style={styles.infoText}>
              Your signature validates the accuracy of this report and serves as
              a permanent record of your leadership and accountability. This
              document may be referenced for future planning and reporting.
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
            <Icon name="arrow-back" size={20} color={COLORS.primary} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.signatureStatus}>
            <View
              style={[styles.statusDot, isSigned && styles.statusDotActive]}
            />
            <Text style={styles.statusText}>
              {isSigned ? "Signed" : "Not signed"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.nextNavButton, !isSigned && styles.disabledButton]}
            onPress={handleNext}
            disabled={!isSigned}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isSigned
                  ? [COLORS.primary, COLORS.primaryLight]
                  : [COLORS.gray, COLORS.lightGray]
              }
              style={styles.nextNavGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextNavText}>Review Report</Text>
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
  documentCard: {
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
  documentContent: {
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
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionNumber: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  sealWrapper: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sealContainer: {
    opacity: 0.5,
  },
  sealActive: {
    opacity: 1,
  },
  seal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sealText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: "600",
    color: COLORS.gray,
    marginTop: 2,
  },
  sealTextActive: {
    color: COLORS.white,
  },
  signatureArea: {
    marginBottom: SPACING.lg,
  },
  signatureAreaTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  signatureContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signatureLineContainer: {
    flex: 1,
  },
  signatureInput: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
    fontWeight: "500",
    paddingVertical: SPACING.sm,
  },
  signatureUnderline: {
    height: 2,
    backgroundColor: COLORS.primary,
    width: "100%",
    marginTop: 4,
  },
  signatureIcon: {
    marginLeft: SPACING.md,
  },
  signatureHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  signatureHintText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: 4,
  },
  dateArea: {
    marginBottom: SPACING.lg,
  },
  dateAreaTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
  },
  dateValue: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  previewCard: {
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  previewTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  previewContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray,
  },
  previewValue: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.gray,
    fontWeight: "500",
  },
  previewValueActive: {
    color: COLORS.primary,
  },
  previewSeal: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previewSealText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  previewSealTextActive: {
    color: COLORS.success,
  },
  legalNotice: {
    flexDirection: "row",
    backgroundColor: COLORS.primary + "05",
    borderRadius: 12,
    padding: SPACING.md,
  },
  legalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  legalTextContainer: {
    flex: 1,
  },
  legalTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  legalText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: "center",
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
  signatureStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
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
  statusDotActive: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: "500",
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
