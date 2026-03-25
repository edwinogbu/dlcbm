import { DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageStyle,
  ViewStyle,
  TextStyle,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface DrawerItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}

interface CustomHeaderProps {
  title: string;
}

interface Styles {
  drawerContainer: ViewStyle;
  drawerHeader: ViewStyle;
  drawerHeaderGlow: ViewStyle;
  drawerLogoContainer: ViewStyle;
  drawerLogo: ImageStyle;
  drawerAppName: TextStyle;
  drawerAppSubtitle: TextStyle;
  drawerItemsContainer: ViewStyle;
  drawerItem: ViewStyle;
  drawerItemIcon: ViewStyle;
  drawerItemLabel: TextStyle;
  itemArrow: TextStyle;
  drawerDivider: ViewStyle;
  drawerFooter: ViewStyle;
  footerGradient: ViewStyle;
  footerText: TextStyle;
  headerContainer: ViewStyle;
  headerContent: ViewStyle;
  headerLeft: ViewStyle;
  headerCenter: ViewStyle;
  headerRight: ViewStyle;
  menuButton: ViewStyle;
  headerLogo: ImageStyle;
  headerTitle: TextStyle;
  notificationButton: ViewStyle;
  notificationBadge: ViewStyle;
  notificationBadgeText: TextStyle;
  logoutItem: ViewStyle;
  logoutIcon: ViewStyle;
  logoutText: TextStyle;
}

export default function AppLayout() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const toggleDrawer = (): void => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const handleLogout = async (): Promise<void> => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all auth-related data
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userEmail");
              await AsyncStorage.removeItem("userName");
              await AsyncStorage.removeItem("userPhone");
              
              // Close drawer first
              navigation.dispatch(DrawerActions.closeDrawer());
              
              // Small delay to ensure drawer closes
              setTimeout(() => {
                router.replace("/(auth)/Login");
              }, 100);
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };


  const isHomeScreen: boolean = segments.length === 2 && segments[1] === "(tabs)";
  
  const currentRoute: string | undefined = segments[1];
  const isDrawerScreen: boolean = !currentRoute?.includes('report') && 
                         !currentRoute?.includes('drawer/settings') &&
                         !currentRoute?.includes('drawer/help') &&
                         !currentRoute?.includes('drawer/about') &&
                         currentRoute !== 'ReportHistoryScreen';

  const CustomHeader = ({ title }: CustomHeaderProps): JSX.Element | null => {
    if (isHomeScreen || !isDrawerScreen) return null;

    return (
      <LinearGradient
        colors={[colors.primary, colors.secondary] as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.headerLogo}
              resizeMode="cover"
            />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialIcons name="notifications-none" size={22} color={colors.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const DrawerContent = (): JSX.Element => (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.warning, colors.secondary] as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.drawerHeader}
      >
        <View style={styles.drawerLogoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.drawerLogo}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.drawerAppName}>DLC HCF</Text>
        <Text style={styles.drawerAppSubtitle}>House Caring Fellowship</Text>
        <View style={styles.drawerHeaderGlow} />
      </LinearGradient>

      <View style={styles.drawerItemsContainer}>
        <DrawerItem
          icon="dashboard"
          label="Dashboard"
          onPress={() => {
            router.push("/(app)/(tabs)");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.primary}
        />

        <DrawerItem
          icon="add-circle"
          label="New Report"
          onPress={() => {
            router.push("/(app)/report/GroupInfoScreen");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.success}
        />

        <DrawerItem
          icon="history"
          label="Report History"
          onPress={() => {
            router.push("/(app)/ReportHistoryScreen");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.warning}
        />

        <DrawerItem
          icon="bar-chart"
          label="Analytics"
          onPress={() => {
            router.push("/(app)/(tabs)/analytics");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.info}
        />

        <View style={styles.drawerDivider} />

        <DrawerItem
          icon="person"
          label="Profile"
          onPress={() => {
            router.push("/(app)/(tabs)/profile");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.purple || "#6B4EFF"}
        />

        <DrawerItem
          icon="settings"
          label="Settings"
          onPress={() => {
            router.push("/(app)/drawer/settings");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.gray}
        />

        <DrawerItem
          icon="help"
          label="Help & Support"
          onPress={() => {
            router.push("/(app)/drawer/help");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.info}
        />

        <DrawerItem
          icon="info"
          label="About"
          onPress={() => {
            router.push("/(app)/drawer/about");
            navigation.dispatch(DrawerActions.closeDrawer());
          }}
          color={colors.secondary}
        />

          <View style={styles.drawerDivider} />

        {/* Logout Item */}
        <TouchableOpacity 
          style={styles.logoutItem} 
          onPress={handleLogout} 
          activeOpacity={0.7}
        >
          <View style={styles.logoutIcon}>
            <MaterialIcons name="logout" size={22} color={colors.error} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <MaterialIcons name="chevron-right" size={18} color={colors.gray} style={styles.itemArrow} />
        </TouchableOpacity>        
      </View>
        

      <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + spacing.md }]}>
        <LinearGradient 
          colors={[colors.primary + "10", "transparent"] as readonly [string, string]} 
          style={styles.footerGradient}
        >
          <MaterialIcons name="cloud-done" size={16} color={colors.primary} />
          <Text style={styles.footerText}>Synced • v1.0.0</Text>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <Drawer
      drawerContent={DrawerContent}
      screenOptions={({ route }: { route: { name: string } }) => ({
        header: (): JSX.Element | null => {
          let title = "";
          if (route.name === "(tabs)") return null;
          if (route.name === "ReportHistoryScreen") title = "Report History";
          else if (route.name === "drawer/settings") title = "Settings";
          else if (route.name === "drawer/help") title = "Help & Support";
          else if (route.name === "drawer/about") title = "About";
          else if (route.name === "report") return null;

          return title ? <CustomHeader title={title} /> : null;
        },
        drawerStyle: {
          backgroundColor: "transparent",
          width: width * 0.75,
        },
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.5)",
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
      })}
    >
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Dashboard" }} />
      <Drawer.Screen name="report" options={{ drawerLabel: "Reports", headerShown: false }} />
      <Drawer.Screen name="ReportHistoryScreen" options={{ drawerLabel: "Report History" }} />
      <Drawer.Screen name="drawer/settings" options={{ drawerLabel: "Settings" }} />
      <Drawer.Screen name="drawer/help" options={{ drawerLabel: "Help & Support" }} />
      <Drawer.Screen name="drawer/about" options={{ drawerLabel: "About" }} />
    </Drawer>
  );
}

const DrawerItem = ({ icon, label, onPress, color }: DrawerItemProps): JSX.Element => (
  <TouchableOpacity style={styles.drawerItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.drawerItemIcon, { backgroundColor: color + "15" }]}>
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.drawerItemLabel}>{label}</Text>
    <MaterialIcons name="chevron-right" size={18} color={colors.gray} style={styles.itemArrow} />
  </TouchableOpacity>
);

const styles = StyleSheet.create<Styles>({
  drawerContainer: { flex: 1, backgroundColor: colors.white },
  drawerHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
  },
  drawerHeaderGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  drawerLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  drawerLogo: { 
    width: 45, 
    height: 45 
  },
  drawerAppName: { 
    fontSize: typography.xl, 
    fontWeight: "bold", 
    color: colors.white, 
    marginBottom: 2 
  },
  drawerAppSubtitle: { 
    fontSize: typography.sm, 
    color: colors.white + "CC" 
  },
  drawerItemsContainer: { 
    flex: 1, 
    paddingVertical: spacing.md 
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: 12,
  },
  drawerItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  drawerItemLabel: { 
    flex: 1, 
    fontSize: typography.md, 
    color: colors.text?.primary || "#212121", 
    fontWeight: "500" 
  },
  itemArrow: { 
    opacity: 0.5 
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.border || "#E5E7EB",
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
  },
  drawerFooter: { 
    paddingHorizontal: spacing.lg 
  },
  footerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  footerText: { 
    fontSize: typography.xs, 
    color: colors.primary, 
    marginLeft: spacing.xs, 
    fontWeight: "500" 
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between" 
  },
  headerLeft: { 
    width: 44 
  },
  headerCenter: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerRight: { 
    width: 44, 
    alignItems: "flex-end" 
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerLogo: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    marginRight: spacing.xs, 
    backgroundColor: colors.white 
  },
  headerTitle: { 
    fontSize: typography.md, 
    fontWeight: "600", 
    color: colors.white 
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error || "#FF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationBadgeText: { 
    fontSize: 10, 
    color: colors.white, 
    fontWeight: "bold" 
  },
   logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    backgroundColor: colors.error + "15",
  },
  logoutText: { 
    flex: 1, 
    fontSize: typography.md, 
    color: colors.error, 
    fontWeight: "500" 
  },
});

