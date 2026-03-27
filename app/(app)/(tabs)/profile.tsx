import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
   Linking,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../../../constants/colors";
import { BORDER_RADIUS, SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";

// Define types
interface Profile {
  name: string;
  email: string;
  phone: string;
  church: string;
  region: string;
  group: string;
  avatar: string | null;
  role: string;
  memberSince: string;
}

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  autoSync: boolean;
  biometricLogin: boolean;
}

interface Stats {
  reportsSubmitted: number;
  totalAttendance: number;
  totalOfferings: number;
  groupsManaged: number;
}

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

interface SettingItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value?: string;
  onToggle: () => void;
  enabled: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({
    name: "Pastor James Ade",
    email: "james.ade@dlc.org",
    phone: "+234 801 234 5678",
    church: "Deeper Life Bible Church",
    region: "Ogun West",
    group: "Ikorodu Group",
    avatar: null,
    role: "Group Pastor",
    memberSince: "2020",
  });

  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    notifications: true,
    autoSync: true,
    biometricLogin: false,
  });

  const [stats, setStats] = useState<Stats>({
    reportsSubmitted: 48,
    totalAttendance: 1245,
    totalOfferings: 125000,
    groupsManaged: 3,
  });

  useEffect(() => {
    loadProfileData();
    // REMOVED: requestPermissions() - Don't request permissions on component mount
  }, []);

  const loadProfileData = async (): Promise<void> => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        setProfile((prev) => ({
          ...prev,
          email,
          name: email
            .split("@")[0]
            .replace(/\./g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
      }

      // Load saved avatar if exists
      const savedAvatar = await AsyncStorage.getItem("userAvatar");
      if (savedAvatar) {
        setProfile((prev) => ({ ...prev, avatar: savedAvatar }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogout = (): void => {
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
  };

  const checkAndRequestMediaPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to your photo library to select a profile picture.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    }
    return true;
  };

  const checkAndRequestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    
    if (status !== "granted") {
      const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to your camera to take a photo.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (): Promise<void> => {
    try {
      setLoading(true);

      // Request permissions only when user wants to pick an image
      const hasPermission = await checkAndRequestMediaPermissions();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
        exif: false,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;

        // Save to AsyncStorage
        await AsyncStorage.setItem("userAvatar", selectedImage);

        // Update state
        setProfile((prev) => ({ ...prev, avatar: selectedImage }));

        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async (): Promise<void> => {
    try {
      setLoading(true);

      // Request permissions only when user wants to take a photo
      const hasPermission = await checkAndRequestCameraPermissions();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0].uri;

        await AsyncStorage.setItem("userAvatar", capturedImage);
        setProfile((prev) => ({ ...prev, avatar: capturedImage }));

        Alert.alert("Success", "Photo captured successfully!");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = (): void => {
    Alert.alert("Profile Picture", "Choose an option", [
      { text: "Cancel", style: "cancel" },
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickImage },
      ...(profile.avatar
        ? [{ text: "Remove Photo", style: "destructive" as const, onPress: removePhoto }]
        : []),
    ]);
  };

  const removePhoto = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("userAvatar");
      setProfile((prev) => ({ ...prev, avatar: null }));
      Alert.alert("Success", "Profile picture removed.");
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  const MenuItem: React.FC<MenuItemProps> = ({ icon, title, value, onPress, danger = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
        <MaterialIcons
          name={icon}
          size={22}
          color={danger ? COLORS.error : COLORS.primary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, value, onToggle, enabled }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <MaterialIcons name={icon} size={22} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      <Switch
        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        thumbColor={COLORS.white}
        onValueChange={onToggle}
        value={enabled}
        ios_backgroundColor={COLORS.lightGray}
      />
    </View>
  );

  const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Cover */}
        <View style={styles.header}>
          <View style={styles.coverImage}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons name="settings" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={showImageOptions}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color={COLORS.white} />
              </View>
            ) : profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialIcons name="camera-alt" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons name="verified" size={16} color={COLORS.primary} />
            <Text style={styles.roleText}>{profile.role}</Text>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MaterialIcons name="email" size={16} color={COLORS.gray} />
              <Text style={styles.contactText}>{profile.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialIcons name="phone" size={16} color={COLORS.gray} />
              <Text style={styles.contactText}>{profile.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialIcons name="location-on" size={16} color={COLORS.gray} />
              <Text style={styles.contactText}>{profile.region}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Reports"
            value={stats.reportsSubmitted}
            icon="description"
            color={COLORS.primary}
          />
          <StatCard
            label="Attendance"
            value={stats.totalAttendance}
            icon="people"
            color={COLORS.success}
          />
          <StatCard
            label="Offerings"
            value={`₦${(stats.totalOfferings / 1000).toFixed(1)}k`}
            icon="payments"
            color={COLORS.warning}
          />
          <StatCard
            label="Groups"
            value={stats.groupsManaged}
            icon="groups"
            color={COLORS.secondary}
          />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="dark-mode"
              title="Dark Mode"
              enabled={settings.darkMode}
              onToggle={() =>
                setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
              }
            />
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              enabled={settings.notifications}
              onToggle={() =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: !prev.notifications,
                }))
              }
            />
            <SettingItem
              icon="sync"
              title="Auto Sync"
              value="When online"
              enabled={settings.autoSync}
              onToggle={() =>
                setSettings((prev) => ({ ...prev, autoSync: !prev.autoSync }))
              }
            />
            <SettingItem
              icon="fingerprint"
              title="Biometric Login"
              enabled={settings.biometricLogin}
              onToggle={() =>
                setSettings((prev) => ({
                  ...prev,
                  biometricLogin: !prev.biometricLogin,
                }))
              }
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <MenuItem icon="person" title="Edit Profile" onPress={() => {}} />
            <MenuItem
              icon="notifications"
              title="Notification Settings"
              onPress={() => {}}
            />
            <MenuItem
              icon="lock"
              title="Privacy & Security"
              onPress={() => {}}
            />
            <MenuItem
              icon="help"
              title="Help & Support"
              value="FAQs, Contact"
              onPress={() => {}}
            />
            <MenuItem
              icon="info"
              title="About"
              value="Version 1.0.0"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Church Info */}
        <View style={styles.churchCard}>
          <MaterialIcons name="church" size={32} color={COLORS.primary} />
          <Text style={styles.churchName}>{profile.church}</Text>
          <Text style={styles.churchDetail}>Region: {profile.region}</Text>
          <Text style={styles.churchDetail}>Group: {profile.group}</Text>
          <Text style={styles.memberSince}>
            Member since {profile.memberSince}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles interface (unchanged)
interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  coverImage: ViewStyle;
  backButton: ViewStyle;
  settingsButton: ViewStyle;
  profileInfo: ViewStyle;
  avatarContainer: ViewStyle;
  avatar: ImageStyle;
  avatarPlaceholder: ViewStyle;
  avatarText: TextStyle;
  editBadge: ViewStyle;
  profileName: TextStyle;
  roleBadge: ViewStyle;
  roleText: TextStyle;
  contactInfo: ViewStyle;
  contactItem: ViewStyle;
  contactText: TextStyle;
  statsGrid: ViewStyle;
  statCard: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  sectionContent: ViewStyle;
  menuItem: ViewStyle;
  menuIcon: ViewStyle;
  dangerIcon: ViewStyle;
  menuContent: ViewStyle;
  menuTitle: TextStyle;
  dangerText: TextStyle;
  menuValue: TextStyle;
  settingItem: ViewStyle;
  settingLeft: ViewStyle;
  settingIcon: ViewStyle;
  settingTitle: TextStyle;
  settingValue: TextStyle;
  churchCard: ViewStyle;
  churchName: TextStyle;
  churchDetail: TextStyle;
  memberSince: TextStyle;
  logoutButton: ViewStyle;
  logoutText: TextStyle;
  bottomSpacing: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 100,
    backgroundColor: COLORS.primary,
  },
  coverImage: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: -50,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.white,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileName: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.md,
  },
  roleText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  contactInfo: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  dangerIcon: {
    backgroundColor: COLORS.error + "20",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
  },
  dangerText: {
    color: COLORS.error,
  },
  menuValue: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
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
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text.primary,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  churchCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  churchName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  churchDetail: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  memberSince: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: SPACING.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + "40",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.error,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProfileScreen;


// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
//   ViewStyle,
//   TextStyle,
//   ImageStyle
// } from "react-native";
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";
// import { COLORS } from "../../../constants/colors";
// import { BORDER_RADIUS, SPACING } from "../../../constants/spacing";
// import { TYPOGRAPHY } from "../../../constants/typography";

// // Define types
// interface Profile {
//   name: string;
//   email: string;
//   phone: string;
//   church: string;
//   region: string;
//   group: string;
//   avatar: string | null;
//   role: string;
//   memberSince: string;
// }

// interface Settings {
//   darkMode: boolean;
//   notifications: boolean;
//   autoSync: boolean;
//   biometricLogin: boolean;
// }

// interface Stats {
//   reportsSubmitted: number;
//   totalAttendance: number;
//   totalOfferings: number;
//   groupsManaged: number;
// }

// interface MenuItemProps {
//   icon: keyof typeof MaterialIcons.glyphMap;
//   title: string;
//   value?: string;
//   onPress: () => void;
//   danger?: boolean;
// }

// interface SettingItemProps {
//   icon: keyof typeof MaterialIcons.glyphMap;
//   title: string;
//   value?: string;
//   onToggle: () => void;
//   enabled: boolean;
// }

// interface StatCardProps {
//   label: string;
//   value: string | number;
//   icon: keyof typeof MaterialIcons.glyphMap;
//   color: string;
// }

// const ProfileScreen: React.FC = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [profile, setProfile] = useState<Profile>({
//     name: "Pastor James Ade",
//     email: "james.ade@dlc.org",
//     phone: "+234 801 234 5678",
//     church: "Deeper Life Bible Church",
//     region: "Ogun West",
//     group: "Ikorodu Group",
//     avatar: null,
//     role: "Group Pastor",
//     memberSince: "2020",
//   });

//   const [settings, setSettings] = useState<Settings>({
//     darkMode: false,
//     notifications: true,
//     autoSync: true,
//     biometricLogin: false,
//   });

//   const [stats, setStats] = useState<Stats>({
//     reportsSubmitted: 48,
//     totalAttendance: 1245,
//     totalOfferings: 125000,
//     groupsManaged: 3,
//   });

//   useEffect(() => {
//     loadProfileData();
//     requestPermissions();
//   }, []);

//   const loadProfileData = async (): Promise<void> => {
//     try {
//       const email = await AsyncStorage.getItem("userEmail");
//       if (email) {
//         setProfile((prev) => ({
//           ...prev,
//           email,
//           name: email
//             .split("@")[0]
//             .replace(/\./g, " ")
//             .replace(/\b\w/g, (l) => l.toUpperCase()),
//         }));
//       }

//       // Load saved avatar if exists
//       const savedAvatar = await AsyncStorage.getItem("userAvatar");
//       if (savedAvatar) {
//         setProfile((prev) => ({ ...prev, avatar: savedAvatar }));
//       }
//     } catch (error) {
//       console.error("Error loading profile:", error);
//     }
//   };

//   const requestPermissions = async (): Promise<void> => {
//     // Request media library permissions on component mount
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant access to your photo library to change your profile picture.",
//       );
//     }
//   };

//   const handleLogout = (): void => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Logout",
//         style: "destructive",
//         onPress: async () => {
//           await AsyncStorage.removeItem("userToken");
//           router.replace("/(auth)/Login");
//         },
//       },
//     ]);
//   };

//   const pickImage = async (): Promise<void> => {
//     try {
//       setLoading(true);

//       // Check permissions again before launching
//       const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

//       if (status !== "granted") {
//         const { status: newStatus } =
//           await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (newStatus !== "granted") {
//           Alert.alert(
//             "Permission Denied",
//             "Cannot access photo library. Please enable permissions in settings.",
//           );
//           setLoading(false);
//           return;
//         }
//       }

//       // Launch image picker with latest SDK options
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images, 
//         aspect: [1, 1],
//         quality: 0.8,
//         base64: false,
//         exif: false,
//         allowsMultipleSelection: false,
//         selectionLimit: 1,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const selectedImage = result.assets[0].uri;

//         // Save to AsyncStorage
//         await AsyncStorage.setItem("userAvatar", selectedImage);

//         // Update state
//         setProfile((prev) => ({ ...prev, avatar: selectedImage }));

//         Alert.alert("Success", "Profile picture updated successfully!");
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//       Alert.alert("Error", "Failed to pick image. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const takePhoto = async (): Promise<void> => {
//     try {
//       setLoading(true);

//       // Check camera permissions
//       const { status } = await ImagePicker.getCameraPermissionsAsync();

//       if (status !== "granted") {
//         const { status: newStatus } =
//           await ImagePicker.requestCameraPermissionsAsync();
//         if (newStatus !== "granted") {
//           Alert.alert(
//             "Permission Denied",
//             "Cannot access camera. Please enable permissions in settings.",
//           );
//           setLoading(false);
//           return;
//         }
//       }

//       // Launch camera with latest SDK options
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ CORRECT: Use enum, not array
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//         base64: false,
//         exif: false,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const capturedImage = result.assets[0].uri;

//         await AsyncStorage.setItem("userAvatar", capturedImage);
//         setProfile((prev) => ({ ...prev, avatar: capturedImage }));

//         Alert.alert("Success", "Photo captured successfully!");
//       }
//     } catch (error) {
//       console.error("Error taking photo:", error);
//       Alert.alert("Error", "Failed to take photo. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showImageOptions = (): void => {
//     Alert.alert("Profile Picture", "Choose an option", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Take Photo", onPress: takePhoto },
//       { text: "Choose from Gallery", onPress: pickImage },
//       ...(profile.avatar
//         ? [{ text: "Remove Photo", style: "destructive" as const, onPress: removePhoto }]
//         : []),
//     ]);
//   };

//   const removePhoto = async (): Promise<void> => {
//     try {
//       await AsyncStorage.removeItem("userAvatar");
//       setProfile((prev) => ({ ...prev, avatar: null }));
//       Alert.alert("Success", "Profile picture removed.");
//     } catch (error) {
//       console.error("Error removing photo:", error);
//     }
//   };

//   const MenuItem: React.FC<MenuItemProps> = ({ icon, title, value, onPress, danger = false }) => (
//     <TouchableOpacity style={styles.menuItem} onPress={onPress}>
//       <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
//         <MaterialIcons
//           name={icon}
//           size={22}
//           color={danger ? COLORS.error : COLORS.primary}
//         />
//       </View>
//       <View style={styles.menuContent}>
//         <Text style={[styles.menuTitle, danger && styles.dangerText]}>
//           {title}
//         </Text>
//         {value && <Text style={styles.menuValue}>{value}</Text>}
//       </View>
//       <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} />
//     </TouchableOpacity>
//   );

//   const SettingItem: React.FC<SettingItemProps> = ({ icon, title, value, onToggle, enabled }) => (
//     <View style={styles.settingItem}>
//       <View style={styles.settingLeft}>
//         <View style={styles.settingIcon}>
//           <MaterialIcons name={icon} size={22} color={COLORS.primary} />
//         </View>
//         <View>
//           <Text style={styles.settingTitle}>{title}</Text>
//           {value && <Text style={styles.settingValue}>{value}</Text>}
//         </View>
//       </View>
//       <Switch
//         trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
//         thumbColor={COLORS.white}
//         onValueChange={onToggle}
//         value={enabled}
//         ios_backgroundColor={COLORS.lightGray}
//       />
//     </View>
//   );

//   const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
//     <View style={[styles.statCard, { borderLeftColor: color }]}>
//       <MaterialIcons name={icon} size={24} color={color} />
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header with Cover */}
//         <View style={styles.header}>
//           <View style={styles.coverImage}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => router.back()}
//             >
//               <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.settingsButton}>
//               <MaterialIcons name="settings" size={24} color={COLORS.white} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Profile Info */}
//         <View style={styles.profileInfo}>
//           <TouchableOpacity
//             style={styles.avatarContainer}
//             onPress={showImageOptions}
//             disabled={loading}
//           >
//             {loading ? (
//               <View style={styles.avatarPlaceholder}>
//                 <ActivityIndicator size="large" color={COLORS.white} />
//               </View>
//             ) : profile.avatar ? (
//               <Image source={{ uri: profile.avatar }} style={styles.avatar} />
//             ) : (
//               <View style={styles.avatarPlaceholder}>
//                 <Text style={styles.avatarText}>
//                   {profile.name
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.editBadge}>
//               <MaterialIcons name="camera-alt" size={14} color={COLORS.white} />
//             </View>
//           </TouchableOpacity>

//           <Text style={styles.profileName}>{profile.name}</Text>
//           <View style={styles.roleBadge}>
//             <MaterialIcons name="verified" size={16} color={COLORS.primary} />
//             <Text style={styles.roleText}>{profile.role}</Text>
//           </View>

//           <View style={styles.contactInfo}>
//             <View style={styles.contactItem}>
//               <MaterialIcons name="email" size={16} color={COLORS.gray} />
//               <Text style={styles.contactText}>{profile.email}</Text>
//             </View>
//             <View style={styles.contactItem}>
//               <MaterialIcons name="phone" size={16} color={COLORS.gray} />
//               <Text style={styles.contactText}>{profile.phone}</Text>
//             </View>
//             <View style={styles.contactItem}>
//               <MaterialIcons name="location-on" size={16} color={COLORS.gray} />
//               <Text style={styles.contactText}>{profile.region}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Stats Cards */}
//         <View style={styles.statsGrid}>
//           <StatCard
//             label="Reports"
//             value={stats.reportsSubmitted}
//             icon="description"
//             color={COLORS.primary}
//           />
//           <StatCard
//             label="Attendance"
//             value={stats.totalAttendance}
//             icon="people"
//             color={COLORS.success}
//           />
//           <StatCard
//             label="Offerings"
//             value={`₦${(stats.totalOfferings / 1000).toFixed(1)}k`}
//             icon="payments"
//             color={COLORS.warning}
//           />
//           <StatCard
//             label="Groups"
//             value={stats.groupsManaged}
//             icon="groups"
//             color={COLORS.secondary}
//           />
//         </View>

//         {/* Settings Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Preferences</Text>
//           <View style={styles.sectionContent}>
//             <SettingItem
//               icon="dark-mode"
//               title="Dark Mode"
//               enabled={settings.darkMode}
//               onToggle={() =>
//                 setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
//               }
//             />
//             <SettingItem
//               icon="notifications"
//               title="Push Notifications"
//               enabled={settings.notifications}
//               onToggle={() =>
//                 setSettings((prev) => ({
//                   ...prev,
//                   notifications: !prev.notifications,
//                 }))
//               }
//             />
//             <SettingItem
//               icon="sync"
//               title="Auto Sync"
//               value="When online"
//               enabled={settings.autoSync}
//               onToggle={() =>
//                 setSettings((prev) => ({ ...prev, autoSync: !prev.autoSync }))
//               }
//             />
//             <SettingItem
//               icon="fingerprint"
//               title="Biometric Login"
//               enabled={settings.biometricLogin}
//               onToggle={() =>
//                 setSettings((prev) => ({
//                   ...prev,
//                   biometricLogin: !prev.biometricLogin,
//                 }))
//               }
//             />
//           </View>
//         </View>

//         {/* Account Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Account</Text>
//           <View style={styles.sectionContent}>
//             <MenuItem icon="person" title="Edit Profile" onPress={() => {}} />
//             <MenuItem
//               icon="notifications"
//               title="Notification Settings"
//               onPress={() => {}}
//             />
//             <MenuItem
//               icon="lock"
//               title="Privacy & Security"
//               onPress={() => {}}
//             />
//             <MenuItem
//               icon="help"
//               title="Help & Support"
//               value="FAQs, Contact"
//               onPress={() => {}}
//             />
//             <MenuItem
//               icon="info"
//               title="About"
//               value="Version 1.0.0"
//               onPress={() => {}}
//             />
//           </View>
//         </View>

//         {/* Church Info */}
//         <View style={styles.churchCard}>
//           <MaterialIcons name="church" size={32} color={COLORS.primary} />
//           <Text style={styles.churchName}>{profile.church}</Text>
//           <Text style={styles.churchDetail}>Region: {profile.region}</Text>
//           <Text style={styles.churchDetail}>Group: {profile.group}</Text>
//           <Text style={styles.memberSince}>
//             Member since {profile.memberSince}
//           </Text>
//         </View>

//         {/* Logout Button */}
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <MaterialIcons name="logout" size={20} color={COLORS.error} />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>

//         <View style={styles.bottomSpacing} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // Styles interface
// interface Styles {
//   container: ViewStyle;
//   header: ViewStyle;
//   coverImage: ViewStyle;
//   backButton: ViewStyle;
//   settingsButton: ViewStyle;
//   profileInfo: ViewStyle;
//   avatarContainer: ViewStyle;
//   avatar: ImageStyle;
//   avatarPlaceholder: ViewStyle;
//   avatarText: TextStyle;
//   editBadge: ViewStyle;
//   profileName: TextStyle;
//   roleBadge: ViewStyle;
//   roleText: TextStyle;
//   contactInfo: ViewStyle;
//   contactItem: ViewStyle;
//   contactText: TextStyle;
//   statsGrid: ViewStyle;
//   statCard: ViewStyle;
//   statValue: TextStyle;
//   statLabel: TextStyle;
//   section: ViewStyle;
//   sectionTitle: TextStyle;
//   sectionContent: ViewStyle;
//   menuItem: ViewStyle;
//   menuIcon: ViewStyle;
//   dangerIcon: ViewStyle;
//   menuContent: ViewStyle;
//   menuTitle: TextStyle;
//   dangerText: TextStyle;
//   menuValue: TextStyle;
//   settingItem: ViewStyle;
//   settingLeft: ViewStyle;
//   settingIcon: ViewStyle;
//   settingTitle: TextStyle;
//   settingValue: TextStyle;
//   churchCard: ViewStyle;
//   churchName: TextStyle;
//   churchDetail: TextStyle;
//   memberSince: TextStyle;
//   logoutButton: ViewStyle;
//   logoutText: TextStyle;
//   bottomSpacing: ViewStyle;
// }

// const styles = StyleSheet.create<Styles>({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     height: 100,
//     backgroundColor: COLORS.primary,
//   },
//   coverImage: {
//     flex: 1,
//     backgroundColor: COLORS.primaryDark,
//     paddingHorizontal: SPACING.md,
//     paddingTop: SPACING.lg,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   settingsButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   profileInfo: {
//     alignItems: "center",
//     marginTop: -50,
//     paddingHorizontal: SPACING.lg,
//   },
//   avatarContainer: {
//     position: "relative",
//     marginBottom: SPACING.md,
//   },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 4,
//     borderColor: COLORS.white,
//   },
//   avatarPlaceholder: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 4,
//     borderColor: COLORS.white,
//   },
//   avatarText: {
//     fontSize: 32,
//     fontWeight: "600",
//     color: COLORS.white,
//   },
//   editBadge: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },
//   profileName: {
//     fontSize: TYPOGRAPHY.xxl,
//     fontWeight: "bold",
//     color: COLORS.text.primary,
//     marginBottom: SPACING.xs,
//   },
//   roleBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: COLORS.primary + "20",
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.xs,
//     borderRadius: BORDER_RADIUS.round,
//     marginBottom: SPACING.md,
//   },
//   roleText: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.primary,
//     fontWeight: "500",
//     marginLeft: SPACING.xs,
//   },
//   contactInfo: {
//     width: "100%",
//     backgroundColor: COLORS.white,
//     borderRadius: BORDER_RADIUS.lg,
//     padding: SPACING.md,
//     marginBottom: SPACING.lg,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   contactItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   contactText: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.text.primary,
//     marginLeft: SPACING.md,
//   },
//   statsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     paddingHorizontal: SPACING.lg,
//     marginBottom: SPACING.lg,
//   },
//   statCard: {
//     width: "48%",
//     backgroundColor: COLORS.white,
//     borderRadius: BORDER_RADIUS.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.sm,
//     borderLeftWidth: 4,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     alignItems: "center",
//   },
//   statValue: {
//     fontSize: TYPOGRAPHY.xl,
//     fontWeight: "bold",
//     color: COLORS.text.primary,
//     marginTop: SPACING.xs,
//   },
//   statLabel: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.secondary,
//   },
//   section: {
//     paddingHorizontal: SPACING.lg,
//     marginBottom: SPACING.lg,
//   },
//   sectionTitle: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "600",
//     color: COLORS.primary,
//     marginBottom: SPACING.sm,
//   },
//   sectionContent: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDER_RADIUS.lg,
//     overflow: "hidden",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: SPACING.md,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   menuIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.primary + "20",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: SPACING.md,
//   },
//   dangerIcon: {
//     backgroundColor: COLORS.error + "20",
//   },
//   menuContent: {
//     flex: 1,
//   },
//   menuTitle: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.text.primary,
//   },
//   dangerText: {
//     color: COLORS.error,
//   },
//   menuValue: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.secondary,
//     marginTop: 2,
//   },
//   settingItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: SPACING.md,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   settingLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   settingIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.primary + "20",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: SPACING.md,
//   },
//   settingTitle: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.text.primary,
//   },
//   settingValue: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.secondary,
//     marginTop: 2,
//   },
//   churchCard: {
//     backgroundColor: COLORS.primary,
//     marginHorizontal: SPACING.lg,
//     marginBottom: SPACING.lg,
//     borderRadius: BORDER_RADIUS.lg,
//     padding: SPACING.xl,
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   churchName: {
//     fontSize: TYPOGRAPHY.xl,
//     fontWeight: "bold",
//     color: COLORS.white,
//     marginTop: SPACING.sm,
//     marginBottom: SPACING.xs,
//   },
//   churchDetail: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.white,
//     opacity: 0.9,
//     marginBottom: 2,
//   },
//   memberSince: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.white,
//     opacity: 0.7,
//     marginTop: SPACING.sm,
//   },
//   logoutButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: COLORS.white,
//     marginHorizontal: SPACING.lg,
//     marginBottom: SPACING.lg,
//     padding: SPACING.md,
//     borderRadius: BORDER_RADIUS.md,
//     borderWidth: 1,
//     borderColor: COLORS.error + "40",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   logoutText: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.error,
//     fontWeight: "600",
//     marginLeft: SPACING.sm,
//   },
//   bottomSpacing: {
//     height: SPACING.xl,
//   },
// });

// export default ProfileScreen;