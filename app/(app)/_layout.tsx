import { DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
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
  ScrollView,
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

interface Styles {
  drawerContainer: ViewStyle;
  drawerHeader: ViewStyle;
  drawerHeaderGlow: ViewStyle;
  drawerLogoContainer: ViewStyle;
  drawerLogo: ImageStyle;
  drawerAppName: TextStyle;
  drawerAppSubtitle: TextStyle;
  drawerScrollView: ViewStyle;
  drawerItemsContainer: ViewStyle;
  drawerItem: ViewStyle;
  drawerItemIcon: ViewStyle;
  drawerItemLabel: TextStyle;
  itemArrow: TextStyle;
  drawerDivider: ViewStyle;
  drawerFooter: ViewStyle;
  footerGradient: ViewStyle;
  footerText: TextStyle;
  logoutItem: ViewStyle;
  logoutIcon: ViewStyle;
  logoutText: TextStyle;
}

export default function AppLayout() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userEmail");
              await AsyncStorage.removeItem("userName");
              await AsyncStorage.removeItem("userPhone");
              
              navigation.dispatch(DrawerActions.closeDrawer());
              
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

      <ScrollView 
        style={styles.drawerScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.md,
        }}
      >
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
      </ScrollView>

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
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "transparent",
          width: width * 0.75,
        },
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.5)",
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
      }}
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
  drawerContainer: { 
    flex: 1, 
    backgroundColor: colors.white 
  },
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
  drawerScrollView: {
    flex: 1,
  },
  drawerItemsContainer: { 
    paddingVertical: spacing.md,
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
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border || "#E5E7EB",
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
