import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/colors";
import { BORDER_RADIUS, SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>Deeper Life Bible Church</Text>
          <Text style={styles.appSubtitle}>House Caring Fellowship</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>Version 1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="update" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>Last updated: March 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="code" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>Build: 2024.03.09</Text>
            </View>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>About This App</Text>
            <Text style={styles.descriptionText}>
              The Deeper Life Bible Church House Caring Fellowship (HCF) app helps
              pastors and group leaders efficiently manage attendance records, track
              offerings, and generate comprehensive reports for their fellowship
              groups.
            </Text>
            <Text style={styles.descriptionText}>
              Features include offline support, automatic sync, detailed analytics,
              and secure data storage.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.copyright}>© 2024 Deeper Life Bible Church</Text>
            <Text style={styles.rights}>All rights reserved</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray + "40",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: SPACING.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    width: 80,
    height: 80,
    tintColor: COLORS.primary,
  },
  appName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: "100%",
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: "100%",
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descriptionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: SPACING.md,
  },
  copyright: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
  },
  rights: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});