import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import spacing, { BORDER_RADIUS } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    biometricLogin: false,
    offlineMode: true,
  });

  const [cacheSize, setCacheSize] = useState("2.4 MB");

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache? This will not delete your saved reports.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Simulate clearing cache
            setCacheSize("0 MB");
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ],
    );
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Choose export format", [
      { text: "Cancel", style: "cancel" },
      {
        text: "CSV",
        onPress: () => Alert.alert("Success", "Data exported as CSV"),
      },
      {
        text: "PDF",
        onPress: () => Alert.alert("Success", "Data exported as PDF"),
      },
    ]);
  };

  interface SettingItemProps {
    icon: string;
    title: string;
    description?: string;
    type?: "switch" | "link";
    value?: string;
    onPress?: () => void;
    danger?: boolean;
  }

  const SettingItem = ({
    icon,
    title,
    description,
    type = "switch",
    value,
    onPress,
    danger = false,
  }: SettingItemProps) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === "switch"}
      activeOpacity={type === "link" ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
          <MaterialIcons
            name={icon as any}
            size={22}
            color={danger ? colors.error : colors.primary}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      {type === "switch" ? (
        <Switch
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor={colors.white}
          onValueChange={() => toggleSetting(value!)}
          value={settings[value as keyof typeof settings]}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={22} color={colors.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaViewRN style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              description="Receive alerts about reports and sync"
              type="switch"
              value="notifications"
            />
            <SettingItem
              icon="dark-mode"
              title="Dark Mode"
              description="Switch to dark theme"
              type="switch"
              value="darkMode"
            />
            <SettingItem
              icon="sync"
              title="Auto Sync"
              description="Automatically sync when online"
              type="switch"
              value="autoSync"
            />
            <SettingItem
              icon="fingerprint"
              title="Biometric Login"
              description="Use fingerprint or face ID"
              type="switch"
              value="biometricLogin"
            />
            <SettingItem
              icon="cloud-off"
              title="Offline Mode"
              description="Work without internet connection"
              type="switch"
              value="offlineMode"
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="storage"
              title="Cache Size"
              description={`${cacheSize} used`}
              type="link"
              onPress={handleClearCache}
            />
            <SettingItem
              icon="backup"
              title="Backup Data"
              description="Backup your reports to cloud"
              type="link"
              onPress={() => Alert.alert("Backup", "Starting backup...")}
            />
            <SettingItem
              icon="restore"
              title="Restore Data"
              description="Restore from backup"
              type="link"
              onPress={() => Alert.alert("Restore", "Select backup to restore")}
            />
            <SettingItem
              icon="download"
              title="Export Data"
              description="Export as CSV or PDF"
              type="link"
              onPress={handleExportData}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person"
              title="Edit Profile"
              description="Update your personal information"
              type="link"
              onPress={() => router.push("/(app)/ProfileScreen")}
            />
            <SettingItem
              icon="lock"
              title="Change Password"
              description="Update your password"
              type="link"
              onPress={() =>
                Alert.alert("Change Password", "Redirect to change password")
              }
            />
            <SettingItem
              icon="language"
              title="Language"
              description="English (Default)"
              type="link"
              onPress={() => Alert.alert("Language", "Select language")}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="delete"
              title="Clear All Data"
              description="Delete all reports and settings"
              type="link"
              danger
              onPress={() => {
                Alert.alert(
                  "Clear All Data",
                  "Are you sure? This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear All",
                      style: "destructive",
                      onPress: async () => {
                        await AsyncStorage.clear();
                        Alert.alert("Success", "All data cleared");
                      },
                    },
                  ],
                );
              }}
            />
            <SettingItem
              icon="logout"
              title="Logout"
              description="Sign out of your account"
              type="link"
              danger
              onPress={() => {
                Alert.alert("Logout", "Are you sure you want to logout?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                      await AsyncStorage.removeItem("userToken");
                      router.replace("/(auth)/Login");
                    },
                  },
                ]);
              }}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray + "40",
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  dangerIcon: {
    backgroundColor: colors.error + "20",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.md,
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.error,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
