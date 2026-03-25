import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextStyle,
  ViewStyle,
  ImageStyle
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../constants/colors";
import { BORDER_RADIUS, SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";
import { useReport } from "../../../context/ReportContext";

// Define types for Report structure
interface District {
  id: string;
  name: string;
  code: string;
  adult?: {
    membersMale?: number;
    membersFemale?: number;
    visitorsMale?: number;
    visitorsFemale?: number;
    total?: number;
  };
  youth?: {
    membersMale?: number;
    membersFemale?: number;
    visitorsMale?: number;
    visitorsFemale?: number;
    total?: number;
  };
  children?: {
    members?: number;
    visitors?: number;
    total?: number;
  };
  offering?: number;
}

interface Report {
  id: string;
  groupName?: string;
  date: string;
  districts?: District[];
  synced?: boolean;
}

// Define stats interface
interface Stats {
  totalReports: number;
  totalAttendance: number;
  totalOfferings: number;
  pendingSync: number;
}

// Define QuickActionCard props
interface QuickActionCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color: string;
}

// Define StatCard props
interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  trend?: number;
}

// Define RecentReportItem props
interface RecentReportItemProps {
  report: Report;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { savedReports, isOnline, syncReports } = useReport();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    totalAttendance: 0,
    totalOfferings: 0,
    pendingSync: 0,
  });

  useEffect(() => {
    loadUserData();
    calculateStats();
  }, [savedReports]);

  const loadUserData = async (): Promise<void> => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      const name = email ? email.split("@")[0] : "Pastor";
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const calculateStats = (): void => {
    let totalAttendance = 0;
    let totalOfferings = 0;
    let pendingSync = 0;

    savedReports.forEach((report: Report) => {
      // Calculate attendance
      report.districts?.forEach((district) => {
        const adult =
          (district.adult?.membersMale || 0) +
          (district.adult?.membersFemale || 0) +
          (district.adult?.visitorsMale || 0) +
          (district.adult?.visitorsFemale || 0);
        const youth =
          (district.youth?.membersMale || 0) +
          (district.youth?.membersFemale || 0) +
          (district.youth?.visitorsMale || 0) +
          (district.youth?.visitorsFemale || 0);
        const children =
          (district.children?.members || 0) +
          (district.children?.visitors || 0);
        totalAttendance += adult + youth + children;
        totalOfferings += district.offering || 0;
      });

      // Check sync status
      if (!report.synced) pendingSync++;
    });

    setStats({
      totalReports: savedReports.length,
      totalAttendance,
      totalOfferings,
      pendingSync,
    });
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    if (isOnline && stats.pendingSync > 0) {
      await syncReports();
      calculateStats();
    }
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color 
  }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <MaterialIcons name={icon} size={28} color={COLORS.white} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        {subtitle && <Text style={styles.quickActionSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon, 
    color, 
    trend 
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <MaterialIcons name={icon} size={24} color={color} />
        {trend !== undefined && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trend > 0 ? COLORS.success : COLORS.error },
            ]}
          >
            <MaterialIcons
              name={trend > 0 ? "trending-up" : "trending-down"}
              size={16}
              color={COLORS.white}
            />
            <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const RecentReportItem: React.FC<RecentReportItemProps> = ({ report }) => (
    <TouchableOpacity
      style={styles.recentReportItem}
      onPress={() =>
        router.push({
          pathname: "/(app)/report/review",
          params: { reportId: report.id },
        })
      }
    >
      <View style={styles.reportIconContainer}>
        <MaterialIcons name="description" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportGroupName}>
          {report.groupName || "Unnamed Group"}
        </Text>
        <Text style={styles.reportDate}>
          {new Date(report.date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <View style={styles.reportMeta}>
          <Text style={styles.reportMetaText}>
            {report.districts?.length || 0} districts
          </Text>
          <Text style={styles.reportMetaDot}>•</Text>
          <Text style={styles.reportMetaText}>
            {formatCurrency(
              report.districts?.reduce((sum, d) => sum + (d.offering || 0), 0) || 0,
            )}
          </Text>
        </View>
      </View>
      {!report.synced && (
        <View style={styles.unsyncedBadge}>
          <MaterialIcons name="cloud-upload" size={16} color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/(app)/notifications")}
          >
            <MaterialIcons
              name="notifications-none"
              size={24}
              color={COLORS.primary}
            />
            {stats.pendingSync > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats.pendingSync}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(app)/ProfileScreen")}
          >
            <MaterialIcons
              name="account-circle"
              size={32}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Network Status Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="wifi-off" size={20} color={COLORS.white} />
          <Text style={styles.offlineText}>
            You're offline. Reports will be saved locally.
          </Text>
        </View>
      )}

      {stats.pendingSync > 0 && isOnline && (
        <View style={styles.syncBanner}>
          <MaterialIcons name="sync" size={20} color={COLORS.white} />
          <Text style={styles.syncText}>
            {stats.pendingSync} report(s) pending sync
          </Text>
          <TouchableOpacity onPress={syncReports}>
            <Text style={styles.syncNowText}>Sync Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Reports"
              value={stats.totalReports}
              icon="description"
              color={COLORS.primary}
              trend={12}
            />
            <StatCard
              title="Attendance"
              value={stats.totalAttendance.toLocaleString()}
              icon="people"
              color={COLORS.success}
              trend={8}
            />
            <StatCard
              title="Offerings"
              value={formatCurrency(stats.totalOfferings)}
              icon="payments"
              color={COLORS.warning}
              trend={-3}
            />
            <StatCard
              title="Pending Sync"
              value={stats.pendingSync}
              icon="cloud-upload"
              color={COLORS.secondary}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/all-actions")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <QuickActionCard
            icon="add-circle"
            title="New Report"
            subtitle="Create a new HCF group report"
            onPress={() => router.push("/(app)/report/GroupInfoScreen")}
            color={COLORS.primary}
          />

          <QuickActionCard
            icon="history"
            title="Report History"
            subtitle={`${stats.totalReports} reports saved`}
            onPress={() => router.push("/(app)/ReportHistoryScreen")}
            color={COLORS.success}
          />

          <QuickActionCard
            icon="people"
            title="Groups"
            subtitle="Manage fellowship groups"
            onPress={() => router.push("/(app)/groups")}
            color={COLORS.warning}
          />

          <QuickActionCard
            icon="analytics"
            title="Analytics"
            subtitle="View attendance trends"
            onPress={() => router.push("/(app)/analytics")}
            color={COLORS.secondary}
          />
        </View>

        {/* Recent Reports */}
        {savedReports.length > 0 && (
          <View style={styles.recentReportsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/ReportHistoryScreen")}
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {savedReports.slice(0, 5).map((report: Report, index: number) => (
              <RecentReportItem key={report.id || `report-${index}`} report={report} />
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/report/GroupInfoScreen")}
      >
        <MaterialIcons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Define styles interface
interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerLeft: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  greeting: TextStyle;
  userName: TextStyle;
  headerRight: ViewStyle;
  notificationButton: ViewStyle;
  notificationBadge: ViewStyle;
  notificationBadgeText: TextStyle;
  profileButton: ViewStyle;
  offlineBanner: ViewStyle;
  offlineText: TextStyle;
  syncBanner: ViewStyle;
  syncText: TextStyle;
  syncNowText: TextStyle;
  statsSection: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  seeAllText: TextStyle;
  statsGrid: ViewStyle;
  statCard: ViewStyle;
  statHeader: ViewStyle;
  trendBadge: ViewStyle;
  trendText: TextStyle;
  statValue: TextStyle;
  statTitle: TextStyle;
  quickActionsSection: ViewStyle;
  quickActionCard: ViewStyle;
  quickActionIcon: ViewStyle;
  quickActionContent: ViewStyle;
  quickActionTitle: TextStyle;
  quickActionSubtitle: TextStyle;
  recentReportsSection: ViewStyle;
  recentReportItem: ViewStyle;
  reportIconContainer: ViewStyle;
  reportInfo: ViewStyle;
  reportGroupName: TextStyle;
  reportDate: TextStyle;
  reportMeta: ViewStyle;
  reportMetaText: TextStyle;
  reportMetaDot: TextStyle;
  unsyncedBadge: ViewStyle;
  bottomSpacing: ViewStyle;
  fab: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logo: {
    width: 30,
    height: 30,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
  },
  userName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    position: "relative",
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
  },
  profileButton: {
    padding: SPACING.xs,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  offlineText: {
    color: COLORS.white,
    marginLeft: SPACING.sm,
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  syncText: {
    color: COLORS.white,
    marginLeft: SPACING.sm,
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
  },
  syncNowText: {
    color: COLORS.white,
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: TYPOGRAPHY.sm,
  },
  statsSection: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  trendText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
  },
  quickActionsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  recentReportsSection: {
    paddingHorizontal: SPACING.lg,
  },
  recentReportItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportGroupName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  reportMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportMetaText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  reportMetaDot: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
    marginHorizontal: 4,
  },
  unsyncedBadge: {
    backgroundColor: COLORS.warning,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacing: {
    height: 80,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default Dashboard;