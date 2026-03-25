import { MaterialIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";

const { width } = Dimensions.get("window");

interface TabBarIconProps {
  color: string;
  focused: boolean;
}

interface Styles {
  headerContainer: ViewStyle;
  headerGlow1: ViewStyle;
  headerGlow2: ViewStyle;
  headerContent: ViewStyle;
  menuButton: ViewStyle;
  headerCenter: ViewStyle;
  headerLogo: ViewStyle;
  greeting: TextStyle;
  userName: TextStyle;
  notificationButton: ViewStyle;
  notificationBadge: ViewStyle;
  notificationBadgeText: TextStyle;
  headerFooter: ViewStyle;
  churchName: TextStyle;
  region: TextStyle;
  statsPreview: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  statDivider: ViewStyle;
  tabIconContainer: ViewStyle;
  tabLabel: TextStyle;
  analyticsTabActive: ViewStyle;
  analyticsIconGradient: ViewStyle;
}

export default function TabsLayout() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const tabBarPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(tabBarPosition, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const PremiumHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.headerGlow1} />
      <View style={styles.headerGlow2} />

      <View style={styles.headerContent}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton} activeOpacity={0.7}>
          <MaterialIcons name="menu" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>Pastor Eddy</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
          <MaterialIcons name="notifications-none" size={24} color={colors.white} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.headerFooter}>
        <Text style={styles.churchName}>Deeper Life Bible Church</Text>
        <Text style={styles.region}>Ogun West • HCF</Text>
      </View>

      <View style={styles.statsPreview}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₦45k</Text>
          <Text style={styles.statLabel}>Offerings</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const screenOptions: BottomTabNavigationOptions = {
    header: () => <PremiumHeader />,
    tabBarStyle: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: colors.white,
      borderRadius: 30,
      height: 70,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      paddingBottom: 0,
      paddingTop: 0,
      transform: [
        {
          translateY: tabBarPosition.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          }),
        },
      ],
    } as any, // Transform interpolation requires any type
    tabBarShowLabel: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.gray,
    tabBarItemStyle: { height: 70, paddingVertical: 8 },
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={styles.tabIconContainer}>
              <MaterialIcons name="dashboard" size={focused ? 28 : 24} color={color} />
              {focused && <Text style={[styles.tabLabel, { color }]}>Home</Text>}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={styles.tabIconContainer}>
              <MaterialIcons name={focused ? "list-alt" : "list"} size={focused ? 28 : 24} color={color} />
              {focused && <Text style={[styles.tabLabel, { color }]}>Reports</Text>}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={[styles.tabIconContainer, focused && styles.analyticsTabActive]}>
              <LinearGradient
                colors={focused ? [colors.primary, colors.secondary] : [colors.gray, colors.lightGray || "#E0E0E0"]}
                style={styles.analyticsIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="bar-chart" size={focused ? 26 : 22} color={colors.white} />
              </LinearGradient>
              {focused && <Text style={[styles.tabLabel, { color: colors.primary }]}>Analytics</Text>}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={styles.tabIconContainer}>
              <MaterialIcons name={focused ? "account-circle" : "person"} size={focused ? 28 : 24} color={color} />
              {focused && <Text style={[styles.tabLabel, { color }]}>Profile</Text>}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles: Styles = {
  headerContainer: {
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
  },
  headerGlow1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerGlow2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
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
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  greeting: { 
    fontSize: TYPOGRAPHY.sm, 
    color: colors.white + "CC", 
    marginBottom: 2 
  },
  userName: { 
    fontSize: TYPOGRAPHY.lg, 
    fontWeight: "bold", 
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
  headerFooter: { 
    alignItems: "center", 
    marginBottom: 15 
  },
  churchName: { 
    fontSize: TYPOGRAPHY.md, 
    color: colors.white, 
    fontWeight: "600", 
    marginBottom: 2 
  },
  region: { 
    fontSize: TYPOGRAPHY.sm, 
    color: colors.white + "CC" 
  },
  statsPreview: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statItem: { 
    flex: 1, 
    alignItems: "center" 
  },
  statValue: { 
    fontSize: TYPOGRAPHY.lg, 
    fontWeight: "bold", 
    color: colors.white 
  },
  statLabel: { 
    fontSize: TYPOGRAPHY.xs, 
    color: colors.white + "CC" 
  },
  statDivider: { 
    width: 1, 
    backgroundColor: "rgba(255,255,255,0.2)" 
  },
  tabIconContainer: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  tabLabel: { 
    fontSize: TYPOGRAPHY.xs, 
    marginTop: 2, 
    fontWeight: "500" 
  },
  analyticsTabActive: { 
    transform: [{ scale: 1.1 }] 
  },
  analyticsIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
};
