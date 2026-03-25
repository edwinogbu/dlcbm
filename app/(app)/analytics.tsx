import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { BORDER_RADIUS, SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { useReport } from "../../context/ReportContext";

const { width } = Dimensions.get("window");

const AnalyticsScreen = () => {
  const router = useRouter();
  const { savedReports } = useReport();
  const [timeRange, setTimeRange] = useState("month"); // week, month, year, all

  const analytics = useMemo(() => {
    const now = new Date();
    let filteredReports = savedReports;

    // Filter by time range
    if (timeRange !== "all") {
      const cutoff = new Date();
      if (timeRange === "week") cutoff.setDate(now.getDate() - 7);
      if (timeRange === "month") cutoff.setMonth(now.getMonth() - 1);
      if (timeRange === "year") cutoff.setFullYear(now.getFullYear() - 1);

      filteredReports = savedReports.filter((r) => new Date(r.date) >= cutoff);
    }

    // Calculate metrics
    let totalReports = filteredReports.length;
    let totalAttendance = 0;
    let totalOfferings = 0;
    let totalDistricts = 0;
    let totalVisitors = 0;
    let totalMembers = 0;

    // Group metrics
    const groupStats = {};
    const monthlyTrend = {};

    filteredReports.forEach((report) => {
      const reportDate = new Date(report.date);
      const monthKey = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, "0")}`;

      // Initialize monthly trend
      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = {
          attendance: 0,
          offerings: 0,
          reports: 0,
        };
      }
      monthlyTrend[monthKey].reports += 1;

      // Group stats
      const groupName = report.groupName || "Unnamed";
      if (!groupStats[groupName]) {
        groupStats[groupName] = {
          reports: 0,
          attendance: 0,
          offerings: 0,
        };
      }
      groupStats[groupName].reports += 1;

      report.districts?.forEach((district) => {
        totalDistricts += 1;

        const adultMembers =
          (district.adult?.membersMale || 0) +
          (district.adult?.membersFemale || 0);
        const adultVisitors =
          (district.adult?.visitorsMale || 0) +
          (district.adult?.visitorsFemale || 0);
        const youthMembers =
          (district.youth?.membersMale || 0) +
          (district.youth?.membersFemale || 0);
        const youthVisitors =
          (district.youth?.visitorsMale || 0) +
          (district.youth?.visitorsFemale || 0);
        const childrenMembers = district.children?.members || 0;
        const childrenVisitors = district.children?.visitors || 0;

        const districtAttendance =
          adultMembers +
          adultVisitors +
          youthMembers +
          youthVisitors +
          childrenMembers +
          childrenVisitors;
        const districtOffering = district.offering || 0;

        totalAttendance += districtAttendance;
        totalOfferings += districtOffering;
        totalMembers += adultMembers + youthMembers + childrenMembers;
        totalVisitors += adultVisitors + youthVisitors + childrenVisitors;

        groupStats[groupName].attendance += districtAttendance;
        groupStats[groupName].offerings += districtOffering;

        monthlyTrend[monthKey].attendance += districtAttendance;
        monthlyTrend[monthKey].offerings += districtOffering;
      });
    });

    // Calculate averages
    const avgAttendancePerReport =
      totalReports > 0 ? Math.round(totalAttendance / totalReports) : 0;
    const avgOfferingPerReport =
      totalReports > 0 ? Math.round(totalOfferings / totalReports) : 0;
    const avgDistrictsPerReport =
      totalReports > 0 ? (totalDistricts / totalReports).toFixed(1) : 0;

    // Get top groups
    const topGroups = Object.entries(groupStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5);

    // Calculate growth rates
    const months = Object.keys(monthlyTrend).sort();
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];

    let attendanceGrowth = 0;
    let offeringsGrowth = 0;

    if (lastMonth && prevMonth && monthlyTrend[prevMonth].attendance > 0) {
      attendanceGrowth =
        ((monthlyTrend[lastMonth].attendance -
          monthlyTrend[prevMonth].attendance) /
          monthlyTrend[prevMonth].attendance) *
        100;
      offeringsGrowth =
        ((monthlyTrend[lastMonth].offerings -
          monthlyTrend[prevMonth].offerings) /
          monthlyTrend[prevMonth].offerings) *
        100;
    }

    // Calculate visitors ratio for insights
    const visitorsRatio =
      totalAttendance > 0 ? totalVisitors / totalAttendance : 0;

    return {
      totalReports,
      totalAttendance,
      totalOfferings,
      totalDistricts,
      totalMembers,
      totalVisitors,
      avgAttendancePerReport,
      avgOfferingPerReport,
      avgDistrictsPerReport,
      attendanceGrowth,
      offeringsGrowth,
      visitorsRatio,
      topGroups,
      monthlyTrend: Object.entries(monthlyTrend).map(([month, data]) => ({
        month,
        ...data,
      })),
    };
  }, [savedReports, timeRange]);

  const TimeRangeButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.timeRangeButton,
        timeRange === value && styles.timeRangeActive,
      ]}
      onPress={() => setTimeRange(value)}
    >
      <Text
        style={[
          styles.timeRangeText,
          timeRange === value && styles.timeRangeTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <MaterialIcons name={icon} size={24} color={color} />
        {trend !== undefined && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trend >= 0 ? COLORS.success : COLORS.error },
            ]}
          >
            <MaterialIcons
              name={trend >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={COLORS.white}
            />
            <Text style={styles.trendText}>{Math.abs(trend).toFixed(1)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ProgressBar = ({ value, max, color, label }) => {
    const percentage = (value / max) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.exportButton}>
          <MaterialIcons name="download" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <TimeRangeButton label="Week" value="week" />
          <TimeRangeButton label="Month" value="month" />
          <TimeRangeButton label="Year" value="year" />
          <TimeRangeButton label="All" value="all" />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Reports"
            value={analytics.totalReports}
            icon="description"
            color={COLORS.primary}
          />
          <StatCard
            title="Total Attendance"
            value={analytics.totalAttendance.toLocaleString()}
            subtitle={`${analytics.totalMembers} members, ${analytics.totalVisitors} visitors`}
            icon="people"
            color={COLORS.success}
            trend={analytics.attendanceGrowth}
          />
          <StatCard
            title="Total Offerings"
            value={`₦${(analytics.totalOfferings / 1000).toFixed(1)}k`}
            subtitle={`Avg ₦${(analytics.avgOfferingPerReport / 1000).toFixed(1)}k per report`}
            icon="payments"
            color={COLORS.warning}
            trend={analytics.offeringsGrowth}
          />
          <StatCard
            title="Avg Attendance"
            value={analytics.avgAttendancePerReport}
            subtitle={`${analytics.avgDistrictsPerReport} districts per report`}
            icon="analytics"
            color={COLORS.secondary}
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="church" size={32} color={COLORS.primary} />
            <Text style={styles.summaryNumber}>{analytics.totalDistricts}</Text>
            <Text style={styles.summaryLabel}>Total Districts</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="group" size={32} color={COLORS.success} />
            <Text style={styles.summaryNumber}>{analytics.totalMembers}</Text>
            <Text style={styles.summaryLabel}>Total Members</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="person-add" size={32} color={COLORS.warning} />
            <Text style={styles.summaryNumber}>{analytics.totalVisitors}</Text>
            <Text style={styles.summaryLabel}>Total Visitors</Text>
          </View>
        </View>

        {/* Top Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Groups</Text>
          <View style={styles.sectionContent}>
            {analytics.topGroups.map((group, index) => (
              <View key={index} style={styles.groupRow}>
                <View style={styles.groupRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupStats}>
                    {group.reports} reports • {group.attendance} attendance
                  </Text>
                </View>
                <Text style={styles.groupOffering}>
                  ₦{(group.offerings / 1000).toFixed(1)}k
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          <View style={styles.sectionContent}>
            {analytics.monthlyTrend.slice(-6).map((month, index) => (
              <View key={index}>
                <View style={styles.trendHeader}>
                  <Text style={styles.monthText}>{month.month}</Text>
                  <Text style={styles.monthStats}>
                    {month.reports} reports • ₦
                    {(month.offerings / 1000).toFixed(1)}k
                  </Text>
                </View>
                <ProgressBar
                  label="Attendance"
                  value={month.attendance}
                  max={Math.max(
                    ...analytics.monthlyTrend.map((m) => m.attendance),
                  )}
                  color={COLORS.primary}
                />
                <View style={styles.spacing} />
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Key Insights</Text>
          <View style={styles.insightCard}>
            <MaterialIcons name="lightbulb" size={24} color={COLORS.warning} />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {analytics.visitorsRatio > 0.2
                  ? "Great visitor engagement! Consider starting a follow-up program."
                  : "Visitor numbers are healthy. Keep up the outreach!"}
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color={COLORS.success}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {analytics.attendanceGrowth > 0
                  ? `Attendance is up ${analytics.attendanceGrowth.toFixed(1)}% from last month. Excellent growth!`
                  : "Consider organizing special events to boost attendance."}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
  },
  exportButton: {
    padding: SPACING.xs,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  timeRangeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
  },
  timeRangeActive: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.primary,
  },
  timeRangeTextActive: {
    color: COLORS.white,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
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
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.secondary,
  },
  statSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    flex: 0.3,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryNumber: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
    textAlign: "center",
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
    padding: SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  groupRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  rankText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  groupStats: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  groupOffering: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: COLORS.success,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  monthText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "500",
    color: COLORS.primary,
  },
  monthStats: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text.secondary,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
  },
  spacing: {
    height: SPACING.sm,
  },
  insightsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  insightsTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  insightText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default AnalyticsScreen;

