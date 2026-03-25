import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";

const { width } = Dimensions.get("window");

export default function Onboarding4() {
  const router = useRouter();

  // const handleGetStarted = async () => {
  //   try {
  //     console.log("Getting started...");
      
  //     // Set the flag first
  //     await AsyncStorage.setItem("hasLaunched", "true");
  //     console.log("hasLaunched set to true");

  //     // Verify it was set
  //     const check = await AsyncStorage.getItem("hasLaunched");
  //     console.log("Verified hasLaunched:", check);

  //     // Navigate directly without setTimeout
  //     // Use replace to prevent going back to onboarding
  //     console.log("Navigating to login...");
  //     router.replace("/(auth)/Login");
      
  //   } catch (error) {
  //     console.error("Error in handleGetStarted:", error);
  //     Alert.alert(
  //       "Error",
  //       "Could not save your preference. Please try again.",
  //       [
  //         { text: "Try Again", onPress: () => handleGetStarted() },
  //         { text: "Cancel", style: "cancel" },
  //       ],
  //     );
  //   }
  // };


  const handleGetStarted = async () => {
  try {
    console.log("Getting started...");
    
    // Set the flag
    await AsyncStorage.setItem("hasLaunched", "true");
    console.log("hasLaunched set to true");

    // Verify it was set
    const check = await AsyncStorage.getItem("hasLaunched");
    console.log("Verified hasLaunched:", check);

    // Small delay to ensure the main layout can read the updated value
    // This is a fallback in case the layout checks too quickly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("Navigating to login...");
    router.replace("/(auth)/Login");
    
  } catch (error) {
    console.error("Error in handleGetStarted:", error);
    Alert.alert(
      "Error",
      "Could not save your preference. Please try again.",
      [
        { text: "Try Again", onPress: () => handleGetStarted() },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }
};

  const handleSkip = async () => {
    try {
      console.log("Skipping onboarding...");
      
      // Set the flag
      await AsyncStorage.setItem("hasLaunched", "true");
      console.log("hasLaunched set to true (skip)");

      // Verify it was set
      const check = await AsyncStorage.getItem("hasLaunched");
      console.log("Verified hasLaunched (skip):", check);

      // Navigate directly
      console.log("Navigating to login...");
      router.replace("/(auth)/Login");
      
    } catch (error) {
      console.error("Error in handleSkip:", error);
      Alert.alert("Error", "Unable to skip. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Icon Section */}
        <View style={styles.iconWrapper}>
          <Icon name="description" size={80} color={colors.white} />
        </View>

        {/* Text Section */}
        <Text style={styles.title}>Generate Reports</Text>
        <Text style={styles.description}>
          Create comprehensive reports with{"\n"}
          digital signatures and offline support
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Icon name="check-circle" size={20} color={colors.white} />
            <Text style={styles.featureText}>Digital Signature Capture</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="check-circle" size={20} color={colors.white} />
            <Text style={styles.featureText}>Offline Support & Auto-Sync</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="check-circle" size={20} color={colors.white} />
            <Text style={styles.featureText}>Export to PDF/CSV</Text>
          </View>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Icon name="arrow-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.6}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  logoContainer: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: colors.white,
    borderRadius: width * 0.2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logo: {
    height: "100%",
    width: "100%",
    borderRadius: width * 0.2,
  },
  iconWrapper: {
    marginBottom: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 60,
    padding: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: spacing.lg,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  featureText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "500",
    marginLeft: spacing.sm,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: spacing.md,
    width: "100%",
  },
  getStartedText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
    textDecorationLine: "underline",
  },
});