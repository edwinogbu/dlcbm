import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
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

export default function Onboarding1() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/(onboarding)/Onboarding2");
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasLaunched", "true");
    router.replace("/(auth)/Login");
  };

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.title}>Welcome to DLC</Text>
        <Text style={styles.subtitle}>
          Deeper Life Bible Church{"\n"}House Caring Fellowship
        </Text>
        <Text style={styles.description}>
          Efficiently manage your group reports, attendance, and offerings
        </Text>

        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
            <Icon name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
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
    borderRadius: width * 0.6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.md,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    color: colors.white,
    fontSize: 16,
    opacity: 0.9,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.white,
  },
  nextText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginRight: spacing.xs,
  },
});
