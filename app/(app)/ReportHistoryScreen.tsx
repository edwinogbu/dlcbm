import { MaterialIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { useReport } from "../../context/ReportContext";

const { width } = Dimensions.get("window");

// Types that match the ReportContext
interface Problem {
  id: string;
  text: string;
  completed: boolean;
}

interface Solution {
  id: string;
  text: string;
  completed: boolean;
}

interface Attendance {
  membersMale?: number;
  membersFemale?: number;
  visitorsMale?: number;
  visitorsFemale?: number;
  members?: number;
  visitors?: number;
  total?: number;
}

interface District {
  id: string;
  name: string;
  code: string;
  adult: Attendance;
  youth: Attendance;
  children: Attendance;
  offering: number;
}

// Updated Report interface matching the context
interface Report {
  id: string;
  groupName?: string;
  groupPastor?: string;
  date: string;
  districts?: District[];
  visitationReport?: string;
  testimonies?: string;
  problems?: Problem[];
  solutions?: Solution[];
  finalRemarks?: string;
  signature?: string;
  signatureName?: string;
  signatureDate?: string;
  synced?: boolean;
  lastModified?: string;
  createdAt?: string;
  submittedAt?: string;
  totalAttendance?: number;
  totalOfferings?: number;
  isSubmitted?: boolean;
}

interface ReportSummary {
  totalAttendance: number;
  totalOffering: number;
  totalMembers: number;
  totalVisitors: number;
}

interface StatCardProps {
  icon: keyof typeof Icon.glyphMap;
  label: string;
  value: number | string;
  color: string;
  trend?: number;
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}

interface SortOptionProps {
  label: string;
  icon: keyof typeof Icon.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

interface ReportCardProps {
  report: Report;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExportPress: (report: Report) => void;
}

interface PDFPreviewModalProps {
  visible: boolean;
  report: Report | null;
  onClose: () => void;
  onExport: (report: Report) => Promise<void>;
}

interface Stats {
  total: number;
  synced: number;
  pending: number;
  growth: number;
}

// Helper function to format problems/solutions arrays to string
const formatArrayToString = (items?: Problem[] | Solution[]): string => {
  if (!items || items.length === 0) return "No items recorded";
  return items.map(item => `• ${item.text}`).join('\n');
};

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, trend }) => (
  <LinearGradient
    colors={[color + "15", color + "05"]}
    style={styles.statCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.statHeader}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      {trend !== undefined && (
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: trend >= 0 ? COLORS.success : COLORS.error },
          ]}
        >
          <Icon name={trend >= 0 ? "trending-up" : "trending-down"} size={14} color={COLORS.white} />
          <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
        </View>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </LinearGradient>
);

// Filter Chip Component
const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress, color = COLORS.primary }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, tension: 150, friction: 3 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 3 }).start();
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.7}>
      <Animated.View style={[styles.filterChip, { transform: [{ scale: scaleAnim }] }, isActive && { backgroundColor: color, borderColor: color }]}>
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Sort Option Component
const SortOption: React.FC<SortOptionProps> = ({ label, icon, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, tension: 150, friction: 3 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 3 }).start();
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.7} style={{ flex: 1 }}>
      <Animated.View style={[styles.sortOption, { transform: [{ scale: scaleAnim }] }, isActive && styles.sortOptionActive]}>
        <Icon name={icon} size={18} color={isActive ? COLORS.white : COLORS.gray} />
        <Text style={[styles.sortOptionText, isActive && styles.sortOptionTextActive]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Report Card Component
const ReportCard: React.FC<ReportCardProps> = ({ report, onPress, onEdit, onDelete, onExportPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = useState<boolean>(false);

  const calculateSummary = (report: Report): ReportSummary => {
    let totalAttendance = 0;
    let totalOffering = 0;
    let totalMembers = 0;
    let totalVisitors = 0;

    report.districts?.forEach((district) => {
      const members =
        (district.adult?.membersMale || 0) +
        (district.adult?.membersFemale || 0) +
        (district.youth?.membersMale || 0) +
        (district.youth?.membersFemale || 0) +
        (district.children?.members || 0);
      const visitors =
        (district.adult?.visitorsMale || 0) +
        (district.adult?.visitorsFemale || 0) +
        (district.youth?.visitorsMale || 0) +
        (district.youth?.visitorsFemale || 0) +
        (district.children?.visitors || 0);

      totalMembers += members;
      totalVisitors += visitors;
      totalAttendance += members + visitors;
      totalOffering += district.offering || 0;
    });

    return { totalAttendance, totalOffering, totalMembers, totalVisitors };
  };

  const { totalAttendance, totalOffering, totalMembers, totalVisitors } = calculateSummary(report);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, tension: 150, friction: 3 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 3 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={[COLORS.white, COLORS.background]} style={styles.reportCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[styles.cardAccent, { backgroundColor: report.synced ? COLORS.success : COLORS.warning }]} />

        <TouchableOpacity onPress={() => setExpanded(!expanded)} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.7}>
          <View style={styles.reportHeader}>
            <View style={styles.reportIconContainer}>
              <LinearGradient colors={[COLORS.primary + "20", COLORS.primary + "10"]} style={styles.reportIcon}>
                <Icon name="description" size={28} color={COLORS.primary} />
              </LinearGradient>
              <View style={styles.reportTitleContainer}>
                <Text style={styles.reportGroup}>{report.groupName || "Unnamed Group"}</Text>
                <Text style={styles.reportPastor}>{report.groupPastor || "No pastor assigned"}</Text>
                <Text style={styles.reportDate}>{formatDate(report.date)}</Text>
              </View>
            </View>
            {!report.synced && (
              <View style={styles.pendingBadge}>
                <Icon name="cloud-upload" size={12} color={COLORS.white} />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
          </View>

          <View style={styles.reportStats}>
            <View style={styles.statRow}>
              <Icon name="people" size={14} color={COLORS.primary} />
              <Text style={styles.statLabel}>Members</Text>
              <Text style={styles.statValue}>{totalMembers}</Text>
            </View>
            <View style={styles.statRow}>
              <Icon name="person-add" size={14} color={COLORS.success} />
              <Text style={styles.statLabel}>Visitors</Text>
              <Text style={styles.statValue}>{totalVisitors}</Text>
            </View>
            <View style={styles.statRow}>
              <Icon name="payments" size={14} color={COLORS.warning} />
              <Text style={styles.statLabel}>Offerings</Text>
              <Text style={styles.statValue}>₦{totalOffering.toLocaleString()}</Text>
            </View>
            <View style={styles.statRow}>
              <Icon name="layers" size={14} color={COLORS.info} />
              <Text style={styles.statLabel}>Districts</Text>
              <Text style={styles.statValue}>{report.districts?.length || 0}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            {report.districts?.slice(0, 2).map((district) => {
              const members =
                (district.adult?.membersMale || 0) +
                (district.adult?.membersFemale || 0) +
                (district.youth?.membersMale || 0) +
                (district.youth?.membersFemale || 0) +
                (district.children?.members || 0);
              const visitors =
                (district.adult?.visitorsMale || 0) +
                (district.adult?.visitorsFemale || 0) +
                (district.youth?.visitorsMale || 0) +
                (district.youth?.visitorsFemale || 0) +
                (district.children?.visitors || 0);

              return (
                <View key={district.id} style={styles.districtPreview}>
                  <Text style={styles.districtPreviewName}>{district.name}</Text>
                  <Text style={styles.districtPreviewStats}>M: {members} | V: {visitors} | ₦{district.offering || 0}</Text>
                </View>
              );
            })}
            {report.districts && report.districts.length > 2 && (
              <Text style={styles.moreText}>+{report.districts.length - 2} more districts</Text>
            )}
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Icon name="visibility" size={18} color={COLORS.primary} />
            <Text style={[styles.actionText, { color: COLORS.primary }]}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Icon name="edit" size={18} color={COLORS.warning} />
            <Text style={[styles.actionText, { color: COLORS.warning }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onExportPress(report)}>
            <Icon name="picture-as-pdf" size={18} color={COLORS.info} />
            <Text style={[styles.actionText, { color: COLORS.info }]}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Icon name="delete" size={18} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// PDF Preview Modal Component
const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ visible, report, onClose, onExport }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    }
  }, [visible]);

  const calculateTotals = (report: Report) => {
    let totalMembers = 0;
    let totalVisitors = 0;
    let totalOfferings = 0;

    report.districts?.forEach((district) => {
      totalMembers +=
        (district.adult?.membersMale || 0) +
        (district.adult?.membersFemale || 0) +
        (district.youth?.membersMale || 0) +
        (district.youth?.membersFemale || 0) +
        (district.children?.members || 0);
      totalVisitors +=
        (district.adult?.visitorsMale || 0) +
        (district.adult?.visitorsFemale || 0) +
        (district.youth?.visitorsMale || 0) +
        (district.youth?.visitorsFemale || 0) +
        (district.children?.visitors || 0);
      totalOfferings += district.offering || 0;
    });

    return { totalMembers, totalVisitors, totalOfferings };
  };

  if (!report) return null;
  const totals = calculateTotals(report);

  const handleExport = async () => {
    setExporting(true);
    await onExport(report);
    setExporting(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={[COLORS.white, COLORS.background]} style={styles.modalGradient}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIcon, { backgroundColor: COLORS.info + "15" }]}>
                  <Icon name="picture-as-pdf" size={24} color={COLORS.info} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>PDF Preview</Text>
                  <Text style={styles.modalSubtitle}>{report.groupName || "Unnamed Group"}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Icon name="close" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
              <View style={styles.previewStatsGrid}>
                <View style={styles.previewStatItem}>
                  <Icon name="people" size={16} color={COLORS.primary} />
                  <Text style={styles.previewStatLabel}>Members</Text>
                  <Text style={styles.previewStatValue}>{totals.totalMembers}</Text>
                </View>
                <View style={styles.previewStatDivider} />
                <View style={styles.previewStatItem}>
                  <Icon name="person-add" size={16} color={COLORS.success} />
                  <Text style={styles.previewStatLabel}>Visitors</Text>
                  <Text style={styles.previewStatValue}>{totals.totalVisitors}</Text>
                </View>
                <View style={styles.previewStatDivider} />
                <View style={styles.previewStatItem}>
                  <Icon name="payments" size={16} color={COLORS.warning} />
                  <Text style={styles.previewStatLabel}>Offerings</Text>
                  <Text style={styles.previewStatValue}>₦{totals.totalOfferings.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Group Information</Text>
                <View style={styles.previewInfoRow}>
                  <Text style={styles.previewInfoLabel}>Group Name:</Text>
                  <Text style={styles.previewInfoValue}>{report.groupName || "____________________"}</Text>
                </View>
                <View style={styles.previewInfoRow}>
                  <Text style={styles.previewInfoLabel}>Pastor:</Text>
                  <Text style={styles.previewInfoValue}>{report.groupPastor || "____________________"}</Text>
                </View>
                <View style={styles.previewInfoRow}>
                  <Text style={styles.previewInfoLabel}>Date:</Text>
                  <Text style={styles.previewInfoValue}>{report.date ? new Date(report.date).toLocaleDateString() : "____________________"}</Text>
                </View>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Districts ({report.districts?.length || 0})</Text>
                {report.districts?.map((district) => {
                  const members =
                    (district.adult?.membersMale || 0) +
                    (district.adult?.membersFemale || 0) +
                    (district.youth?.membersMale || 0) +
                    (district.youth?.membersFemale || 0) +
                    (district.children?.members || 0);
                  const visitors =
                    (district.adult?.visitorsMale || 0) +
                    (district.adult?.visitorsFemale || 0) +
                    (district.youth?.visitorsMale || 0) +
                    (district.youth?.visitorsFemale || 0) +
                    (district.children?.visitors || 0);

                  return (
                    <View key={district.id} style={styles.previewDistrictRow}>
                      <Text style={styles.previewDistrictName}>{district.name}</Text>
                      <Text style={styles.previewDistrictStats}>M: {members} | V: {visitors} | ₦{district.offering || 0}</Text>
                    </View>
                  );
                })}
              </View>

              {report.visitationReport && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Visitation Report</Text>
                  <Text style={styles.previewNarrative}>{report.visitationReport}</Text>
                </View>
              )}

              {report.testimonies && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Testimonies</Text>
                  <Text style={styles.previewNarrative}>{report.testimonies}</Text>
                </View>
              )}

              {report.problems && report.problems.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Problems Encountered</Text>
                  {report.problems.map((problem) => (
                    <View key={problem.id} style={styles.previewProblemRow}>
                      <Icon name="error-outline" size={16} color={COLORS.error} />
                      <Text style={styles.previewNarrative}>{problem.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              {report.solutions && report.solutions.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Solutions Offered</Text>
                  {report.solutions.map((solution) => (
                    <View key={solution.id} style={styles.previewSolutionRow}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={styles.previewNarrative}>{solution.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              {report.finalRemarks && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Final Remarks</Text>
                  <Text style={styles.previewNarrative}>{report.finalRemarks}</Text>
                </View>
              )}

              <View style={styles.previewSignature}>
                <Text style={styles.previewSignatureName}>{report.signatureName || "Pastor's Name"}</Text>
                <View style={styles.previewSignatureLine} />
                <Text style={styles.previewSignatureDate}>
                  {report.signatureDate ? new Date(report.signatureDate).toLocaleDateString() : "Date"}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalExportButton} onPress={handleExport} disabled={exporting}>
                <LinearGradient colors={[COLORS.info, COLORS.primary]} style={styles.modalExportGradient}>
                  {exporting ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Icon name="picture-as-pdf" size={18} color={COLORS.white} />
                      <Text style={styles.modalExportText}>Generate PDF</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Complete PDF Generator Function
const generatePDF = async (report: Report): Promise<string> => {
  try {
    const calculateTotals = (report: Report) => {
      let totalMembers = 0;
      let totalVisitors = 0;
      let totalOfferings = 0;

      report.districts?.forEach((district) => {
        totalMembers +=
          (district.adult?.membersMale || 0) +
          (district.adult?.membersFemale || 0) +
          (district.youth?.membersMale || 0) +
          (district.youth?.membersFemale || 0) +
          (district.children?.members || 0);
        totalVisitors +=
          (district.adult?.visitorsMale || 0) +
          (district.adult?.visitorsFemale || 0) +
          (district.youth?.visitorsMale || 0) +
          (district.youth?.visitorsFemale || 0) +
          (district.children?.visitors || 0);
        totalOfferings += district.offering || 0;
      });

      return { totalMembers, totalVisitors, totalOfferings };
    };

    const totals = calculateTotals(report);
    const date = new Date(report.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const problemsText = formatArrayToString(report.problems);
    const solutionsText = formatArrayToString(report.solutions);

    const districtRows = report.districts
      ?.map((district, index) => {
        const adultMembers = (district.adult?.membersMale || 0) + (district.adult?.membersFemale || 0);
        const adultVisitors = (district.adult?.visitorsMale || 0) + (district.adult?.visitorsFemale || 0);
        const youthMembers = (district.youth?.membersMale || 0) + (district.youth?.membersFemale || 0);
        const youthVisitors = (district.youth?.visitorsMale || 0) + (district.youth?.visitorsFemale || 0);
        const childrenMembers = district.children?.members || 0;
        const childrenVisitors = district.children?.visitors || 0;

        return `
          <tr style="border-bottom: 1px solid #E0E0E0;">
            <td style="padding: 12px;">${district.name || `District ${index + 1}`}</td>
            <td style="padding: 12px; text-align: center;">${adultMembers}</td>
            <td style="padding: 12px; text-align: center;">${adultVisitors}</td>
            <td style="padding: 12px; text-align: center;">${adultMembers + adultVisitors}</td>
            <td style="padding: 12px; text-align: center;">${youthMembers}</td>
            <td style="padding: 12px; text-align: center;">${youthVisitors}</td>
            <td style="padding: 12px; text-align: center;">${youthMembers + youthVisitors}</td>
            <td style="padding: 12px; text-align: center;">${childrenMembers}</td>
            <td style="padding: 12px; text-align: center;">${childrenVisitors}</td>
            <td style="padding: 12px; text-align: center;">${childrenMembers + childrenVisitors}</td>
            <td style="padding: 12px; text-align: right;">₦${(district.offering || 0).toLocaleString()}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1E3A8A; }
          .church-name { color: #1E3A8A; font-size: 28px; font-weight: bold; margin-bottom: 5px; }
          .region { color: #666; font-size: 16px; }
          .fellowship { color: #1E3A8A; font-size: 18px; font-weight: 600; margin-top: 10px; }
          .info-grid { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #1E3A8A; }
          .info-row { display: flex; margin-bottom: 10px; }
          .info-label { width: 120px; font-weight: 600; color: #666; }
          .info-value { flex: 1; color: #333; font-weight: 500; }
          .section-title { color: #1E3A8A; font-size: 18px; font-weight: bold; margin: 25px 0 15px 0; padding-bottom: 5px; border-bottom: 2px solid #1E3A8A; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th { background: linear-gradient(135deg, #1E3A8A 0%, #2A4A9A 100%); color: white; padding: 12px; text-align: center; font-weight: 600; }
          td { padding: 10px; border-bottom: 1px solid #E0E0E0; }
          .total-row { background: linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 100%); font-weight: bold; }
          .narrative { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1E3A8A; margin-bottom: 20px; white-space: pre-line; }
          .signature { margin-top: 50px; text-align: center; padding-top: 20px; border-top: 2px dashed #1E3A8A; }
          .signature-name { font-size: 18px; font-weight: bold; color: #1E3A8A; }
          .signature-line { width: 200px; height: 1px; background: #333; margin: 10px auto; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="church-name">DEEPER LIFE BIBLE CHURCH</div>
          <div class="region">OGUN WEST</div>
          <div class="fellowship">HOUSE CARING FELLOWSHIP REPORT</div>
        </div>

        <div class="info-grid">
          <div class="info-row"><span class="info-label">Group:</span><span class="info-value">${report.groupName || "____________________"}</span></div>
          <div class="info-row"><span class="info-label">Pastor:</span><span class="info-value">${report.groupPastor || "____________________"}</span></div>
          <div class="info-row"><span class="info-label">Date:</span><span class="info-value">${date}</span></div>
        </div>

        <div class="section-title">ATTENDANCE & OFFERINGS SUMMARY</div>
        <table>
          <thead><tr><th rowspan="2">District</th><th colspan="3">Adult</th><th colspan="3">Youth</th><th colspan="3">Children</th><th rowspan="2">Offering</th></tr>
          <tr><th>M</th><th>V</th><th>Tot</th><th>M</th><th>V</th><th>Tot</th><th>M</th><th>V</th><th>Tot</th></tr></thead>
          <tbody>
            ${districtRows}
            <tr class="total-row"><td><strong>TOTAL</strong></td>
            <td colspan="3" style="text-align: center;"><strong>${totals.totalMembers + totals.totalVisitors}</strong></td>
            <td colspan="3" style="text-align: center;"><strong>${totals.totalMembers + totals.totalVisitors}</strong></td>
            <td colspan="3" style="text-align: center;"><strong>${totals.totalMembers + totals.totalVisitors}</strong></td>
            <td style="text-align: right;"><strong>₦${totals.totalOfferings.toLocaleString()}</strong></td></tr>
          </tbody>
        </table>

        <div class="section-title">VISITATION REPORT</div>
        <div class="narrative">${report.visitationReport || "No visitation report entered"}</div>

        <div class="section-title">TESTIMONIES</div>
        <div class="narrative">${report.testimonies || "No testimonies entered"}</div>

        <div class="section-title">PROBLEMS ENCOUNTERED</div>
        <div class="narrative">${problemsText}</div>

        <div class="section-title">SOLUTIONS OFFERED</div>
        <div class="narrative">${solutionsText}</div>

        <div class="section-title">FINAL REMARKS</div>
        <div class="narrative">${report.finalRemarks || "No final remarks"}</div>

        <div class="signature">
          <div class="signature-name">${report.signatureName || "____________________"}</div>
          <div class="signature-line"></div>
          <div style="color: #666;">Pastor's Signature</div>
          <div style="margin-top: 10px; color: #999;">${report.signatureDate ? new Date(report.signatureDate).toLocaleDateString() : new Date().toLocaleDateString()}</div>
        </div>

        <div class="footer">Generated on ${new Date().toLocaleString()} • DLC HCF Report System</div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    return uri;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

export default function ReportHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { savedReports, deleteReport, syncReports, isOnline, isLoading } = useReport();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [exporting, setExporting] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const filteredReports = useMemo((): Report[] => {
    let reports = [...savedReports] as Report[];

    if (searchQuery) {
      reports = reports.filter(
        (report) =>
          report.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.groupPastor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType === "synced") {
      reports = reports.filter((r) => r.synced);
    } else if (filterType === "pending") {
      reports = reports.filter((r) => !r.synced);
    }

    reports.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "group") {
        return (a.groupName || "").localeCompare(b.groupName || "");
      } else if (sortBy === "attendance") {
        const aTotal = a.districts?.reduce((sum, d) => {
          return sum +
            (d.adult?.membersMale || 0) + (d.adult?.membersFemale || 0) +
            (d.adult?.visitorsMale || 0) + (d.adult?.visitorsFemale || 0) +
            (d.youth?.membersMale || 0) + (d.youth?.membersFemale || 0) +
            (d.youth?.visitorsMale || 0) + (d.youth?.visitorsFemale || 0) +
            (d.children?.members || 0) + (d.children?.visitors || 0);
        }, 0) || 0;
        const bTotal = b.districts?.reduce((sum, d) => {
          return sum +
            (d.adult?.membersMale || 0) + (d.adult?.membersFemale || 0) +
            (d.adult?.visitorsMale || 0) + (d.adult?.visitorsFemale || 0) +
            (d.youth?.membersMale || 0) + (d.youth?.membersFemale || 0) +
            (d.youth?.visitorsMale || 0) + (d.youth?.visitorsFemale || 0) +
            (d.children?.members || 0) + (d.children?.visitors || 0);
        }, 0) || 0;
        return bTotal - aTotal;
      }
      return 0;
    });

    return reports;
  }, [savedReports, searchQuery, filterType, sortBy]);

  const handleDeleteReport = (reportId: string): void => {
    Alert.alert("Delete Report", "Are you sure you want to delete this report? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteReport(reportId) },
    ]);
  };

  const handleSyncAll = async (): Promise<void> => {
    if (!isOnline) {
      Alert.alert("Offline", "Please connect to the internet to sync reports.");
      return;
    }
    const result = await syncReports();
    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  const handleExportPDF = async (report: Report): Promise<void> => {
    setExporting(true);
    try {
      const uri = await generatePDF(report);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Export Report", UTI: "com.adobe.pdf" });
      } else {
        Alert.alert("Success", `PDF saved to: ${uri}`);
      }
    } catch (error) {
      console.error("Export Error:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPress = (report: Report): void => {
    setSelectedReport(report);
    setPreviewVisible(true);
  };

  const stats: Stats = {
    total: savedReports.length,
    synced: savedReports.filter((r) => r.synced).length,
    pending: savedReports.filter((r) => !r.synced).length,
    growth: savedReports.length > 0 ? 12 : 0,
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md, color: COLORS.gray }}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Icon name="arrow-back-ios" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Report History</Text>
            <Text style={styles.headerSubtitle}>View all your past reports</Text>
          </View>
          <TouchableOpacity style={styles.syncButton} onPress={handleSyncAll} disabled={!isOnline || stats.pending === 0}>
            <Icon name="sync" size={22} color={stats.pending > 0 ? COLORS.white : COLORS.white + "80"} />
            {stats.pending > 0 && (
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>{stats.pending}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.statsRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingTop: SPACING.md }]}>
        <StatCard icon="description" label="Total Reports" value={stats.total} color={COLORS.primary} trend={stats.growth} />
        <StatCard icon="cloud-done" label="Synced" value={stats.synced} color={COLORS.success} />
        <StatCard icon="cloud-upload" label="Pending" value={stats.pending} color={COLORS.warning} />
      </Animated.View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <FilterChip label="All" isActive={filterType === "all"} onPress={() => setFilterType("all")} color={COLORS.primary} />
          <FilterChip label="Synced" isActive={filterType === "synced"} onPress={() => setFilterType("synced")} color={COLORS.success} />
          <FilterChip label="Pending" isActive={filterType === "pending"} onPress={() => setFilterType("pending")} color={COLORS.warning} />
        </View>
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortOptions}>
            <SortOption label="Date" icon="calendar-today" isActive={sortBy === "date"} onPress={() => setSortBy("date")} />
            <SortOption label="Group" icon="group" isActive={sortBy === "group"} onPress={() => setSortBy("group")} />
            <SortOption label="Attendance" icon="people" isActive={sortBy === "attendance"} onPress={() => setSortBy("attendance")} />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onPress={() => router.push({ pathname: "/(app)/report/review", params: { reportId: item.id } })}
            onEdit={() => router.push({ pathname: "/(app)/report/GroupInfoScreen", params: { reportId: item.id, edit:"true" } })}
            onDelete={() => handleDeleteReport(item.id)}
            onExportPress={handleExportPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "Try adjusting your search or filters" : "Create your first report to get started"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.createButton} onPress={() => router.push("/(app)/report/GroupInfoScreen")}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.createButtonGradient}>
                  <Text style={styles.createButtonText}>Create New Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {selectedReport && (
        <PDFPreviewModal visible={previewVisible} report={selectedReport} onClose={() => { setPreviewVisible(false); setSelectedReport(null); }} onExport={handleExportPDF} />
      )}
    </View>
  );
}

// Styles (same as your existing styles, plus new ones for problem/solution rows)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitleContainer: { flex: 1, marginLeft: SPACING.md },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: "bold", color: COLORS.white },
  headerSubtitle: { fontSize: TYPOGRAPHY.xs, color: COLORS.white + "CC", marginTop: 2 },
  syncButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", position: "relative" },
  syncBadge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.warning, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: COLORS.white },
  syncBadgeText: { fontSize: 8, color: COLORS.white, fontWeight: "bold" },
  statsRow: { flexDirection: "row", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, padding: SPACING.sm, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  statHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.xs },
  statIconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  trendBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: 8 },
  trendText: { fontSize: 8, color: COLORS.white, marginLeft: 2 },
  statValue: { fontSize: TYPOGRAPHY.lg, fontWeight: "bold", color: COLORS.text.primary },
  statLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray },
  filtersContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  filterRow: { flexDirection: "row", marginBottom: SPACING.sm, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  filterChipText: { fontSize: TYPOGRAPHY.sm, color: COLORS.text.primary },
  filterChipTextActive: { color: COLORS.white },
  sortRow: { flexDirection: "row", alignItems: "center" },
  sortLabel: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray, marginRight: SPACING.sm },
  sortOptions: { flex: 1, flexDirection: "row", gap: SPACING.xs },
  sortOption: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.xs, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  sortOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortOptionText: { fontSize: TYPOGRAPHY.sm, color: COLORS.text.primary, marginLeft: 4 },
  sortOptionTextActive: { color: COLORS.white },
  listContent: { padding: SPACING.lg, paddingTop: 0 },
  reportCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, position: "relative", overflow: "hidden" },
  cardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  reportIconContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  reportIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  reportTitleContainer: { flex: 1 },
  reportGroup: { fontSize: TYPOGRAPHY.md, fontWeight: "600", color: COLORS.text.primary },
  reportPastor: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray },
  reportDate: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray, marginTop: 2 },
  pendingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.warning, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 12 },
  pendingText: { fontSize: TYPOGRAPHY.xs, color: COLORS.white, marginLeft: 4 },
  reportStats: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, marginBottom: SPACING.sm },
  statRow: { flexDirection: "row", alignItems: "center", minWidth: "45%" },
  expandedContent: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  districtPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SPACING.xs },
  districtPreviewName: { fontSize: TYPOGRAPHY.sm, color: COLORS.text.primary, fontWeight: "500" },
  districtPreviewStats: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray },
  moreText: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray, fontStyle: "italic", marginTop: SPACING.xs },
  cardActions: { flexDirection: "row", justifyContent: "space-around", marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionButton: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, borderRadius: 8 },
  actionText: { fontSize: TYPOGRAPHY.sm, marginLeft: SPACING.xs },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: SPACING.xxl },
  emptyTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: "600", color: COLORS.text.primary, marginTop: SPACING.md, marginBottom: SPACING.xs },
  emptyText: { fontSize: TYPOGRAPHY.md, color: COLORS.gray, textAlign: "center", marginBottom: SPACING.lg, paddingHorizontal: SPACING.xl },
  createButton: { borderRadius: 25, overflow: "hidden" },
  createButtonGradient: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  createButtonText: { color: COLORS.white, fontSize: TYPOGRAPHY.md, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: width * 0.9, maxHeight: "80%", borderRadius: 20, overflow: "hidden", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modalGradient: { padding: SPACING.lg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  modalHeaderLeft: { flexDirection: "row", alignItems: "center" },
  modalIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  modalTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: "600", color: COLORS.text.primary },
  modalSubtitle: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray },
  modalCloseButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.lightGray, justifyContent: "center", alignItems: "center" },
  previewContent: { maxHeight: 400 },
  previewStatsGrid: { flexDirection: "row", backgroundColor: COLORS.background, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg },
  previewStatItem: { flex: 1, alignItems: "center" },
  previewStatDivider: { width: 1, backgroundColor: COLORS.border },
  previewStatLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray, marginTop: 2 },
  previewStatValue: { fontSize: TYPOGRAPHY.md, fontWeight: "600", color: COLORS.primary },
  previewSection: { marginBottom: SPACING.lg },
  previewSectionTitle: { fontSize: TYPOGRAPHY.md, fontWeight: "600", color: COLORS.primary, marginBottom: SPACING.sm },
  previewInfoRow: { flexDirection: "row", marginBottom: SPACING.xs },
  previewInfoLabel: { width: 80, fontSize: TYPOGRAPHY.sm, color: COLORS.gray },
  previewInfoValue: { flex: 1, fontSize: TYPOGRAPHY.sm, color: COLORS.text.primary, fontWeight: "500" },
  previewDistrictRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  previewDistrictName: { fontSize: TYPOGRAPHY.sm, color: COLORS.text.primary, fontWeight: "500" },
  previewDistrictStats: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray },
  previewNarrative: { fontSize: TYPOGRAPHY.sm, color: COLORS.text.secondary, lineHeight: 20, backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: 8 },
  previewProblemRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: SPACING.sm, padding: SPACING.xs, backgroundColor: COLORS.error + "10", borderRadius: 8 },
  previewSolutionRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: SPACING.sm, padding: SPACING.xs, backgroundColor: COLORS.success + "10", borderRadius: 8 },
  previewSignature: { alignItems: "center", marginTop: SPACING.lg, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  previewSignatureName: { fontSize: TYPOGRAPHY.lg, fontWeight: "600", color: COLORS.primary },
  previewSignatureLine: { width: 200, height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  previewSignatureDate: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray },
  modalFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.lg, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  modalCancelButton: { flex: 1, paddingVertical: SPACING.md, marginRight: SPACING.sm, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  modalCancelText: { fontSize: TYPOGRAPHY.md, color: COLORS.gray, fontWeight: "500" },
  modalExportButton: { flex: 2, borderRadius: 12, overflow: "hidden" },
  modalExportGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.md },
  modalExportText: { fontSize: TYPOGRAPHY.md, color: COLORS.white, fontWeight: "600", marginLeft: SPACING.xs },
});

// import { MaterialIcons as Icon } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as Print from "expo-print";
// import { useRouter } from "expo-router";
// import * as Sharing from "expo-sharing";
// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Dimensions,
//   FlatList,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ViewStyle,
//   TextStyle,
//   ImageStyle
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { COLORS } from "../../constants/colors";
// import { SPACING } from "../../constants/spacing";
// import { TYPOGRAPHY } from "../../constants/typography";
// import { useReport } from "../../context/ReportContext";

// const { width } = Dimensions.get("window");

// // Define types for data structures
// interface Attendance {
//   membersMale?: number;
//   membersFemale?: number;
//   visitorsMale?: number;
//   visitorsFemale?: number;
//   members?: number;
//   visitors?: number;
//   total?: number;
// }

// interface District {
//   id: string;
//   name: string;
//   code: string;
//   adult: Attendance;
//   youth: Attendance;
//   children: Attendance;
//   offering: number;
// }

// interface Report {
//   id: string;
//   groupName?: string;
//   groupPastor?: string;
//   date: string;
//   districts?: District[];
//   visitationReport?: string;
//   testimonies?: string;
//   problems?: string;
//   solutions?: string;
//   finalRemarks?: string;
//   signatureName?: string;
//   signatureDate?: string;
//   synced?: boolean;
//   lastModified?: string;
//   createdAt?: string;
//   submittedAt?: string;
//   totalAttendance?: number;
//   totalOfferings?: number;
// }

// interface ReportSummary {
//   totalAttendance: number;
//   totalOffering: number;
//   totalMembers: number;
//   totalVisitors: number;
// }

// interface StatCardProps {
//   icon: keyof typeof Icon.glyphMap;
//   label: string;
//   value: number | string;
//   color: string;
//   trend?: number;
// }

// interface FilterChipProps {
//   label: string;
//   isActive: boolean;
//   onPress: () => void;
//   color?: string;
// }

// interface SortOptionProps {
//   label: string;
//   icon: keyof typeof Icon.glyphMap;
//   isActive: boolean;
//   onPress: () => void;
// }

// interface ReportCardProps {
//   report: Report;
//   onPress: () => void;
//   onEdit: () => void;
//   onDelete: () => void;
//   onExportPress: (report: Report) => void;
// }

// interface PDFPreviewModalProps {
//   visible: boolean;
//   report: Report | null;
//   onClose: () => void;
//   onExport: (report: Report) => Promise<void>;
// }

// interface Stats {
//   total: number;
//   synced: number;
//   pending: number;
//   growth: number;
// }

// // Stat Card Component
// const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, trend }) => (
//   <LinearGradient
//     colors={[color + "15", color + "05"]}
//     style={styles.statCard}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 1, y: 1 }}
//   >
//     <View style={styles.statHeader}>
//       <View
//         style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
//       >
//         <Icon name={icon} size={24} color={color} />
//       </View>
//       {trend !== undefined && (
//         <View
//           style={[
//             styles.trendBadge,
//             { backgroundColor: trend >= 0 ? COLORS.success : COLORS.error },
//           ]}
//         >
//           <Icon
//             name={trend >= 0 ? "trending-up" : "trending-down"}
//             size={14}
//             color={COLORS.white}
//           />
//           <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
//         </View>
//       )}
//     </View>
//     <Text style={styles.statValue}>{value}</Text>
//     <Text style={styles.statLabel}>{label}</Text>
//   </LinearGradient>
// );

// // Filter Chip Component
// const FilterChip: React.FC<FilterChipProps> = ({ 
//   label, 
//   isActive, 
//   onPress, 
//   color = COLORS.primary 
// }) => {
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.95,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//       activeOpacity={0.7}
//     >
//       <Animated.View
//         style={[
//           styles.filterChip,
//           { transform: [{ scale: scaleAnim }] },
//           isActive && { backgroundColor: color, borderColor: color },
//         ]}
//       >
//         <Text
//           style={[
//             styles.filterChipText,
//             isActive && styles.filterChipTextActive,
//           ]}
//         >
//           {label}
//         </Text>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// // Sort Option Component
// const SortOption: React.FC<SortOptionProps> = ({ label, icon, isActive, onPress }) => {
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.95,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//       activeOpacity={0.7}
//       style={{ flex: 1 }}
//     >
//       <Animated.View
//         style={[
//           styles.sortOption,
//           { transform: [{ scale: scaleAnim }] },
//           isActive && styles.sortOptionActive,
//         ]}
//       >
//         <Icon
//           name={icon}
//           size={18}
//           color={isActive ? COLORS.white : COLORS.gray}
//         />
//         <Text
//           style={[
//             styles.sortOptionText,
//             isActive && styles.sortOptionTextActive,
//           ]}
//         >
//           {label}
//         </Text>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// // Report Card Component
// const ReportCard: React.FC<ReportCardProps> = ({ 
//   report, 
//   onPress, 
//   onEdit, 
//   onDelete, 
//   onExportPress 
// }) => {
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const [expanded, setExpanded] = useState<boolean>(false);

//   const calculateSummary = (report: Report): ReportSummary => {
//     let totalAttendance = 0;
//     let totalOffering = 0;
//     let totalMembers = 0;
//     let totalVisitors = 0;

//     report.districts?.forEach((district) => {
//       const members =
//         (district.adult?.membersMale || 0) +
//         (district.adult?.membersFemale || 0) +
//         (district.youth?.membersMale || 0) +
//         (district.youth?.membersFemale || 0) +
//         (district.children?.members || 0);
//       const visitors =
//         (district.adult?.visitorsMale || 0) +
//         (district.adult?.visitorsFemale || 0) +
//         (district.youth?.visitorsMale || 0) +
//         (district.youth?.visitorsFemale || 0) +
//         (district.children?.visitors || 0);

//       totalMembers += members;
//       totalVisitors += visitors;
//       totalAttendance += members + visitors;
//       totalOffering += district.offering || 0;
//     });

//     return { totalAttendance, totalOffering, totalMembers, totalVisitors };
//   };

//   const { totalAttendance, totalOffering, totalMembers, totalVisitors } =
//     calculateSummary(report);

//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) {
//       return "Today";
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return "Yesterday";
//     } else {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     }
//   };

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.98,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 3,
//     }).start();
//   };

//   return (
//     <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
//       <LinearGradient
//         colors={[COLORS.white, COLORS.background]}
//         style={styles.reportCard}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View
//           style={[
//             styles.cardAccent,
//             {
//               backgroundColor: report.synced ? COLORS.success : COLORS.warning,
//             },
//           ]}
//         />

//         <TouchableOpacity
//           onPress={() => setExpanded(!expanded)}
//           onPressIn={handlePressIn}
//           onPressOut={handlePressOut}
//           activeOpacity={0.7}
//         >
//           <View style={styles.reportHeader}>
//             <View style={styles.reportIconContainer}>
//               <LinearGradient
//                 colors={[COLORS.primary + "20", COLORS.primary + "10"]}
//                 style={styles.reportIcon}
//               >
//                 <Icon name="description" size={28} color={COLORS.primary} />
//               </LinearGradient>
//               <View style={styles.reportTitleContainer}>
//                 <Text style={styles.reportGroup}>
//                   {report.groupName || "Unnamed Group"}
//                 </Text>
//                 <Text style={styles.reportPastor}>
//                   {report.groupPastor || "No pastor assigned"}
//                 </Text>
//                 <Text style={styles.reportDate}>{formatDate(report.date)}</Text>
//               </View>
//             </View>
//             {!report.synced && (
//               <View style={styles.pendingBadge}>
//                 <Icon name="cloud-upload" size={12} color={COLORS.white} />
//                 <Text style={styles.pendingText}>Pending</Text>
//               </View>
//             )}
//           </View>

//           <View style={styles.reportStats}>
//             <View style={styles.statRow}>
//               <Icon name="people" size={14} color={COLORS.primary} />
//               <Text style={styles.statLabel}>Members</Text>
//               <Text style={styles.statValue}>{totalMembers}</Text>
//             </View>
//             <View style={styles.statRow}>
//               <Icon name="person-add" size={14} color={COLORS.success} />
//               <Text style={styles.statLabel}>Visitors</Text>
//               <Text style={styles.statValue}>{totalVisitors}</Text>
//             </View>
//             <View style={styles.statRow}>
//               <Icon name="payments" size={14} color={COLORS.warning} />
//               <Text style={styles.statLabel}>Offerings</Text>
//               <Text style={styles.statValue}>
//                 ₦{totalOffering.toLocaleString()}
//               </Text>
//             </View>
//             <View style={styles.statRow}>
//               <Icon name="layers" size={14} color={COLORS.info} />
//               <Text style={styles.statLabel}>Districts</Text>
//               <Text style={styles.statValue}>
//                 {report.districts?.length || 0}
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>

//         {expanded && (
//           <View style={styles.expandedContent}>
//             <View style={styles.divider} />

//             {/* District Preview */}
//             {report.districts?.slice(0, 2).map((district, idx) => {
//               const members =
//                 (district.adult?.membersMale || 0) +
//                 (district.adult?.membersFemale || 0) +
//                 (district.youth?.membersMale || 0) +
//                 (district.youth?.membersFemale || 0) +
//                 (district.children?.members || 0);
//               const visitors =
//                 (district.adult?.visitorsMale || 0) +
//                 (district.adult?.visitorsFemale || 0) +
//                 (district.youth?.visitorsMale || 0) +
//                 (district.youth?.visitorsFemale || 0) +
//                 (district.children?.visitors || 0);

//               return (
//                 <View key={district.id} style={styles.districtPreview}>
//                   <Text style={styles.districtPreviewName}>
//                     {district.name}
//                   </Text>
//                   <Text style={styles.districtPreviewStats}>
//                     M: {members} | V: {visitors} | ₦{district.offering || 0}
//                   </Text>
//                 </View>
//               );
//             })}
//             {report.districts && report.districts.length > 2 && (
//               <Text style={styles.moreText}>
//                 +{report.districts.length - 2} more districts
//               </Text>
//             )}
//           </View>
//         )}

//         <View style={styles.cardActions}>
//           <TouchableOpacity style={styles.actionButton} onPress={onPress}>
//             <Icon name="visibility" size={18} color={COLORS.primary} />
//             <Text style={[styles.actionText, { color: COLORS.primary }]}>
//               View
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
//             <Icon name="edit" size={18} color={COLORS.warning} />
//             <Text style={[styles.actionText, { color: COLORS.warning }]}>
//               Edit
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => onExportPress(report)}
//           >
//             <Icon name="picture-as-pdf" size={18} color={COLORS.info} />
//             <Text style={[styles.actionText, { color: COLORS.info }]}>PDF</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
//             <Icon name="delete" size={18} color={COLORS.error} />
//             <Text style={[styles.actionText, { color: COLORS.error }]}>
//               Delete
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//     </Animated.View>
//   );
// };

// // PDF Preview Modal Component
// const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ 
//   visible, 
//   report, 
//   onClose, 
//   onExport 
// }) => {
//   const scaleAnim = useRef(new Animated.Value(0)).current;
//   const [exporting, setExporting] = useState<boolean>(false);

//   useEffect(() => {
//     if (visible) {
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 50,
//         friction: 7,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible]);

//   const calculateTotals = (report: Report) => {
//     let totalMembers = 0;
//     let totalVisitors = 0;
//     let totalOfferings = 0;

//     report.districts?.forEach((district) => {
//       totalMembers +=
//         (district.adult?.membersMale || 0) +
//         (district.adult?.membersFemale || 0) +
//         (district.youth?.membersMale || 0) +
//         (district.youth?.membersFemale || 0) +
//         (district.children?.members || 0);

//       totalVisitors +=
//         (district.adult?.visitorsMale || 0) +
//         (district.adult?.visitorsFemale || 0) +
//         (district.youth?.visitorsMale || 0) +
//         (district.youth?.visitorsFemale || 0) +
//         (district.children?.visitors || 0);

//       totalOfferings += district.offering || 0;
//     });

//     return { totalMembers, totalVisitors, totalOfferings };
//   };

//   if (!report) return null;

//   const totals = calculateTotals(report);

//   const handleExport = async () => {
//     setExporting(true);
//     await onExport(report);
//     setExporting(false);
//     onClose();
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <Animated.View
//           style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
//         >
//           <LinearGradient
//             colors={[COLORS.white, COLORS.background]}
//             style={styles.modalGradient}
//           >
//             <View style={styles.modalHeader}>
//               <View style={styles.modalHeaderLeft}>
//                 <View
//                   style={[
//                     styles.modalIcon,
//                     { backgroundColor: COLORS.info + "15" },
//                   ]}
//                 >
//                   <Icon name="picture-as-pdf" size={24} color={COLORS.info} />
//                 </View>
//                 <View>
//                   <Text style={styles.modalTitle}>PDF Preview</Text>
//                   <Text style={styles.modalSubtitle}>
//                     {report.groupName || "Unnamed Group"}
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity
//                 onPress={onClose}
//                 style={styles.modalCloseButton}
//               >
//                 <Icon name="close" size={20} color={COLORS.gray} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               style={styles.previewContent}
//               showsVerticalScrollIndicator={false}
//             >
//               {/* Summary Stats */}
//               <View style={styles.previewStatsGrid}>
//                 <View style={styles.previewStatItem}>
//                   <Icon name="people" size={16} color={COLORS.primary} />
//                   <Text style={styles.previewStatLabel}>Members</Text>
//                   <Text style={styles.previewStatValue}>
//                     {totals.totalMembers}
//                   </Text>
//                 </View>
//                 <View style={styles.previewStatDivider} />
//                 <View style={styles.previewStatItem}>
//                   <Icon name="person-add" size={16} color={COLORS.success} />
//                   <Text style={styles.previewStatLabel}>Visitors</Text>
//                   <Text style={styles.previewStatValue}>
//                     {totals.totalVisitors}
//                   </Text>
//                 </View>
//                 <View style={styles.previewStatDivider} />
//                 <View style={styles.previewStatItem}>
//                   <Icon name="payments" size={16} color={COLORS.warning} />
//                   <Text style={styles.previewStatLabel}>Offerings</Text>
//                   <Text style={styles.previewStatValue}>
//                     ₦{totals.totalOfferings.toLocaleString()}
//                   </Text>
//                 </View>
//               </View>

//               {/* Group Info */}
//               <View style={styles.previewSection}>
//                 <Text style={styles.previewSectionTitle}>
//                   Group Information
//                 </Text>
//                 <View style={styles.previewInfoRow}>
//                   <Text style={styles.previewInfoLabel}>Group Name:</Text>
//                   <Text style={styles.previewInfoValue}>
//                     {report.groupName || "____________________"}
//                   </Text>
//                 </View>
//                 <View style={styles.previewInfoRow}>
//                   <Text style={styles.previewInfoLabel}>Pastor:</Text>
//                   <Text style={styles.previewInfoValue}>
//                     {report.groupPastor || "____________________"}
//                   </Text>
//                 </View>
//                 <View style={styles.previewInfoRow}>
//                   <Text style={styles.previewInfoLabel}>Date:</Text>
//                   <Text style={styles.previewInfoValue}>
//                     {report.date
//                       ? new Date(report.date).toLocaleDateString()
//                       : "____________________"}
//                   </Text>
//                 </View>
//               </View>

//               {/* District Summary */}
//               <View style={styles.previewSection}>
//                 <Text style={styles.previewSectionTitle}>
//                   Districts ({report.districts?.length || 0})
//                 </Text>
//                 {report.districts?.map((district, index) => {
//                   const members =
//                     (district.adult?.membersMale || 0) +
//                     (district.adult?.membersFemale || 0) +
//                     (district.youth?.membersMale || 0) +
//                     (district.youth?.membersFemale || 0) +
//                     (district.children?.members || 0);
//                   const visitors =
//                     (district.adult?.visitorsMale || 0) +
//                     (district.adult?.visitorsFemale || 0) +
//                     (district.youth?.visitorsMale || 0) +
//                     (district.youth?.visitorsFemale || 0) +
//                     (district.children?.visitors || 0);

//                   return (
//                     <View key={district.id} style={styles.previewDistrictRow}>
//                       <Text style={styles.previewDistrictName}>
//                         {district.name}
//                       </Text>
//                       <Text style={styles.previewDistrictStats}>
//                         M: {members} | V: {visitors} | ₦{district.offering || 0}
//                       </Text>
//                     </View>
//                   );
//                 })}
//               </View>

//               {/* Narrative Sections */}
//               {report.visitationReport && (
//                 <View style={styles.previewSection}>
//                   <Text style={styles.previewSectionTitle}>
//                     Visitation Report
//                   </Text>
//                   <Text style={styles.previewNarrative} numberOfLines={3}>
//                     {report.visitationReport}
//                   </Text>
//                 </View>
//               )}

//               {report.testimonies && (
//                 <View style={styles.previewSection}>
//                   <Text style={styles.previewSectionTitle}>Testimonies</Text>
//                   <Text style={styles.previewNarrative} numberOfLines={3}>
//                     {report.testimonies}
//                   </Text>
//                 </View>
//               )}

//               {/* Signature */}
//               <View style={styles.previewSignature}>
//                 <Text style={styles.previewSignatureName}>
//                   {report.signatureName || "Pastor's Name"}
//                 </Text>
//                 <View style={styles.previewSignatureLine} />
//                 <Text style={styles.previewSignatureDate}>
//                   {report.signatureDate
//                     ? new Date(report.signatureDate).toLocaleDateString()
//                     : "Date"}
//                 </Text>
//               </View>
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.modalCancelButton}
//                 onPress={onClose}
//               >
//                 <Text style={styles.modalCancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalExportButton}
//                 onPress={handleExport}
//                 disabled={exporting}
//               >
//                 <LinearGradient
//                   colors={[COLORS.info, COLORS.primary]}
//                   style={styles.modalExportGradient}
//                 >
//                   {exporting ? (
//                     <ActivityIndicator size="small" color={COLORS.white} />
//                   ) : (
//                     <>
//                       <Icon
//                         name="picture-as-pdf"
//                         size={18}
//                         color={COLORS.white}
//                       />
//                       <Text style={styles.modalExportText}>Generate PDF</Text>
//                     </>
//                   )}
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// };

// // Complete PDF Generator Function
// const generatePDF = async (report: Report): Promise<string> => {
//   try {
//     const calculateTotals = (report: Report) => {
//       let totalMembers = 0;
//       let totalVisitors = 0;
//       let totalOfferings = 0;

//       report.districts?.forEach((district) => {
//         totalMembers +=
//           (district.adult?.membersMale || 0) +
//           (district.adult?.membersFemale || 0) +
//           (district.youth?.membersMale || 0) +
//           (district.youth?.membersFemale || 0) +
//           (district.children?.members || 0);

//         totalVisitors +=
//           (district.adult?.visitorsMale || 0) +
//           (district.adult?.visitorsFemale || 0) +
//           (district.youth?.visitorsMale || 0) +
//           (district.youth?.visitorsFemale || 0) +
//           (district.children?.visitors || 0);

//         totalOfferings += district.offering || 0;
//       });

//       return { totalMembers, totalVisitors, totalOfferings };
//     };

//     const totals = calculateTotals(report);
//     const date = new Date(report.date).toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//     // Generate district rows HTML
//     const districtRows = report.districts
//       ?.map((district, index) => {
//         const adultMembers =
//           (district.adult?.membersMale || 0) +
//           (district.adult?.membersFemale || 0);
//         const adultVisitors =
//           (district.adult?.visitorsMale || 0) +
//           (district.adult?.visitorsFemale || 0);
//         const youthMembers =
//           (district.youth?.membersMale || 0) +
//           (district.youth?.membersFemale || 0);
//         const youthVisitors =
//           (district.youth?.visitorsMale || 0) +
//           (district.youth?.visitorsFemale || 0);
//         const childrenMembers = district.children?.members || 0;
//         const childrenVisitors = district.children?.visitors || 0;

//         return `
//         <tr style="border-bottom: 1px solid #E0E0E0;">
//           <td style="padding: 12px;">${district.name || `District ${index + 1}`}</td>
//           <td style="padding: 12px; text-align: center;">${adultMembers}</td>
//           <td style="padding: 12px; text-align: center;">${adultVisitors}</td>
//           <td style="padding: 12px; text-align: center;">${adultMembers + adultVisitors}</td>
//           <td style="padding: 12px; text-align: center;">${youthMembers}</td>
//           <td style="padding: 12px; text-align: center;">${youthVisitors}</td>
//           <td style="padding: 12px; text-align: center;">${youthMembers + youthVisitors}</td>
//           <td style="padding: 12px; text-align: center;">${childrenMembers}</td>
//           <td style="padding: 12px; text-align: center;">${childrenVisitors}</td>
//           <td style="padding: 12px; text-align: center;">${childrenMembers + childrenVisitors}</td>
//           <td style="padding: 12px; text-align: right;">₦${(district.offering || 0).toLocaleString()}</td>
//         </tr>
//       `;
//       })
//       .join("");

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body {
//             font-family: 'Helvetica', 'Arial', sans-serif;
//             padding: 40px;
//             color: #333;
//             line-height: 1.6;
//           }
//           .header {
//             text-align: center;
//             margin-bottom: 30px;
//             padding-bottom: 20px;
//             border-bottom: 2px solid #1E3A8A;
//           }
//           .church-name {
//             color: #1E3A8A;
//             font-size: 28px;
//             font-weight: bold;
//             margin-bottom: 5px;
//           }
//           .region {
//             color: #666;
//             font-size: 16px;
//           }
//           .fellowship {
//             color: #1E3A8A;
//             font-size: 18px;
//             font-weight: 600;
//             margin-top: 10px;
//           }
//           .info-grid {
//             background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
//             padding: 20px;
//             border-radius: 12px;
//             margin-bottom: 30px;
//             border-left: 4px solid #1E3A8A;
//           }
//           .info-row {
//             display: flex;
//             margin-bottom: 10px;
//           }
//           .info-label {
//             width: 120px;
//             font-weight: 600;
//             color: #666;
//           }
//           .info-value {
//             flex: 1;
//             color: #333;
//             font-weight: 500;
//           }
//           .section-title {
//             color: #1E3A8A;
//             font-size: 18px;
//             font-weight: bold;
//             margin: 25px 0 15px 0;
//             padding-bottom: 5px;
//             border-bottom: 2px solid #1E3A8A;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-bottom: 20px;
//             font-size: 12px;
//           }
//           th {
//             background: linear-gradient(135deg, #1E3A8A 0%, #2A4A9A 100%);
//             color: white;
//             padding: 12px;
//             text-align: center;
//             font-weight: 600;
//           }
//           td {
//             padding: 10px;
//             border-bottom: 1px solid #E0E0E0;
//           }
//           .total-row {
//             background: linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 100%);
//             font-weight: bold;
//           }
//           .narrative {
//             background: #f9f9f9;
//             padding: 15px;
//             border-radius: 8px;
//             border-left: 4px solid #1E3A8A;
//             margin-bottom: 20px;
//           }
//           .signature {
//             margin-top: 50px;
//             text-align: center;
//             padding-top: 20px;
//             border-top: 2px dashed #1E3A8A;
//           }
//           .signature-name {
//             font-size: 18px;
//             font-weight: bold;
//             color: #1E3A8A;
//           }
//           .signature-line {
//             width: 200px;
//             height: 1px;
//             background: #333;
//             margin: 10px auto;
//           }
//           .footer {
//             margin-top: 30px;
//             text-align: center;
//             color: #999;
//             font-size: 10px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <div class="church-name">DEEPER LIFE BIBLE CHURCH</div>
//           <div class="region">OGUN WEST</div>
//           <div class="fellowship">HOUSE CARING FELLOWSHIP REPORT</div>
//         </div>

//         <div class="info-grid">
//           <div class="info-row">
//             <span class="info-label">Group:</span>
//             <span class="info-value">${report.groupName || "____________________"}</span>
//           </div>
//           <div class="info-row">
//             <span class="info-label">Pastor:</span>
//             <span class="info-value">${report.groupPastor || "____________________"}</span>
//           </div>
//           <div class="info-row">
//             <span class="info-label">Date:</span>
//             <span class="info-value">${date}</span>
//           </div>
//         </div>

//         <div class="section-title">ATTENDANCE & OFFERINGS SUMMARY</div>
//         <table>
//           <thead>
//             <tr>
//               <th rowspan="2">District</th>
//               <th colspan="3">Adult</th>
//               <th colspan="3">Youth</th>
//               <th colspan="3">Children</th>
//               <th rowspan="2">Offering</th>
//             </tr>
//             <tr>
//               <th>M</th><th>V</th><th>Tot</th>
//               <th>M</th><th>V</th><th>Tot</th>
//               <th>M</th><th>V</th><th>Tot</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${districtRows}
//             <tr class="total-row">
//               <td><strong>TOTAL</strong></td>
//               <td colspan="3" style="text-align: center;"><strong>${totals.totalMembers + totals.totalVisitors}</strong></td>
//               <td colspan="3" style="text-align: center;"><strong>${totals.totalMembers + totals.totalVisitors}</strong></td>
//               <td colspan="3" style="text-align: center;"><strong>${totals.totalMembers + totals.totalVisitors}</strong></td>
//               <td style="text-align: right;"><strong>₦${totals.totalOfferings.toLocaleString()}</strong></td>
//             </tr>
//           </tbody>
//         </table>

//         <div class="section-title">VISITATION REPORT</div>
//         <div class="narrative">${report.visitationReport || "No visitation report entered"}</div>

//         <div class="section-title">TESTIMONIES</div>
//         <div class="narrative">${report.testimonies || "No testimonies entered"}</div>

//         <div class="section-title">PROBLEMS ENCOUNTERED</div>
//         <div class="narrative">${report.problems || "No problems recorded"}</div>

//         <div class="section-title">SOLUTIONS OFFERED</div>
//         <div class="narrative">${report.solutions || "No solutions recorded"}</div>

//         <div class="section-title">FINAL REMARKS</div>
//         <div class="narrative">${report.finalRemarks || "No final remarks"}</div>

//         <div class="signature">
//           <div class="signature-name">${report.signatureName || "____________________"}</div>
//           <div class="signature-line"></div>
//           <div style="color: #666;">Pastor's Signature</div>
//           <div style="margin-top: 10px; color: #999;">
//             ${report.signatureDate ? new Date(report.signatureDate).toLocaleDateString() : new Date().toLocaleDateString()}
//           </div>
//         </div>

//         <div class="footer">
//           Generated on ${new Date().toLocaleString()} • DLC HCF Report System
//         </div>
//       </body>
//       </html>
//     `;

//     const { uri } = await Print.printToFileAsync({
//       html,
//       base64: false,
//     });

//     return uri;
//   } catch (error) {
//     console.error("PDF Generation Error:", error);
//     throw error;
//   }
// };

// export default function ReportHistoryScreen() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { savedReports, deleteReport, syncReports, isOnline, isLoading } =
//     useReport();

//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [filterType, setFilterType] = useState<string>("all");
//   const [sortBy, setSortBy] = useState<string>("date");
//   const [exporting, setExporting] = useState<boolean>(false);
//   const [previewVisible, setPreviewVisible] = useState<boolean>(false);
//   const [selectedReport, setSelectedReport] = useState<Report | null>(null);

//   // Animation values
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const [slideAnim] = useState(new Animated.Value(50));

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Log saved reports for debugging
//     console.log("Saved Reports:", savedReports.length);
//   }, []);

//   const filteredReports = useMemo((): Report[] => {
//     let reports = [...savedReports];

//     if (searchQuery) {
//       reports = reports.filter(
//         (report) =>
//           report.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           report.groupPastor?.toLowerCase().includes(searchQuery.toLowerCase()),
//       );
//     }

//     if (filterType === "synced") {
//       reports = reports.filter((r) => r.synced);
//     } else if (filterType === "pending") {
//       reports = reports.filter((r) => !r.synced);
//     }

//     reports.sort((a, b) => {
//       if (sortBy === "date") {
//         return new Date(b.date).getTime() - new Date(a.date).getTime();
//       } else if (sortBy === "group") {
//         return (a.groupName || "").localeCompare(b.groupName || "");
//       } else if (sortBy === "attendance") {
//         const aTotal =
//           a.districts?.reduce((sum, d) => {
//             return (
//               sum +
//               (d.adult?.membersMale || 0) +
//               (d.adult?.membersFemale || 0) +
//               (d.adult?.visitorsMale || 0) +
//               (d.adult?.visitorsFemale || 0) +
//               (d.youth?.membersMale || 0) +
//               (d.youth?.membersFemale || 0) +
//               (d.youth?.visitorsMale || 0) +
//               (d.youth?.visitorsFemale || 0) +
//               (d.children?.members || 0) +
//               (d.children?.visitors || 0)
//             );
//           }, 0) || 0;
//         const bTotal =
//           b.districts?.reduce((sum, d) => {
//             return (
//               sum +
//               (d.adult?.membersMale || 0) +
//               (d.adult?.membersFemale || 0) +
//               (d.adult?.visitorsMale || 0) +
//               (d.adult?.visitorsFemale || 0) +
//               (d.youth?.membersMale || 0) +
//               (d.youth?.membersFemale || 0) +
//               (d.youth?.visitorsMale || 0) +
//               (d.youth?.visitorsFemale || 0) +
//               (d.children?.members || 0) +
//               (d.children?.visitors || 0)
//             );
//           }, 0) || 0;
//         return bTotal - aTotal;
//       }
//       return 0;
//     });

//     return reports;
//   }, [savedReports, searchQuery, filterType, sortBy]);

//   const handleDeleteReport = (reportId: string): void => {
//     Alert.alert(
//       "Delete Report",
//       "Are you sure you want to delete this report? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => deleteReport(reportId),
//         },
//       ],
//     );
//   };

//   const handleSyncAll = async (): Promise<void> => {
//     if (!isOnline) {
//       Alert.alert("Offline", "Please connect to the internet to sync reports.");
//       return;
//     }
//     const result = await syncReports();
//     Alert.alert(result.success ? "Success" : "Error", result.message);
//   };

//   const handleExportPDF = async (report: Report): Promise<void> => {
//     setExporting(true);

//     try {
//       const uri = await generatePDF(report);

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(uri, {
//           mimeType: "application/pdf",
//           dialogTitle: "Export Report",
//           UTI: "com.adobe.pdf",
//         });
//       } else {
//         Alert.alert("Success", `PDF saved to: ${uri}`);
//       }
//     } catch (error) {
//       console.error("Export Error:", error);
//       Alert.alert("Error", "Failed to generate PDF. Please try again.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleExportPress = (report: Report): void => {
//     setSelectedReport(report);
//     setPreviewVisible(true);
//   };

//   const stats: Stats = {
//     total: savedReports.length,
//     synced: savedReports.filter((r) => r.synced).length,
//     pending: savedReports.filter((r) => !r.synced).length,
//     growth: savedReports.length > 0 ? 12 : 0,
//   };

//   if (isLoading) {
//     return (
//       <View
//         style={[
//           styles.container,
//           { justifyContent: "center", alignItems: "center" },
//         ]}
//       >
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ marginTop: SPACING.md, color: COLORS.gray }}>
//           Loading reports...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { paddingTop: 0 }]}>
//       {/* ✅ HEADER WITH BACK BUTTON ADDED */}
//       <LinearGradient
//         colors={[COLORS.primary, COLORS.primaryDark]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[styles.header, { paddingTop: insets.top + 10 }]}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => router.back()}
//             activeOpacity={0.7}
//           >
//             <Icon name="arrow-back-ios" size={20} color={COLORS.white} />
//           </TouchableOpacity>
          
//           <View style={styles.headerTitleContainer}>
//             <Text style={styles.headerTitle}>Report History</Text>
//             <Text style={styles.headerSubtitle}>View all your past reports</Text>
//           </View>
          
//           <TouchableOpacity
//             style={styles.syncButton}
//             onPress={handleSyncAll}
//             disabled={!isOnline || stats.pending === 0}
//           >
//             <Icon 
//               name="sync" 
//               size={22} 
//               color={stats.pending > 0 ? COLORS.white : COLORS.white + "80"} 
//             />
//             {stats.pending > 0 && (
//               <View style={styles.syncBadge}>
//                 <Text style={styles.syncBadgeText}>{stats.pending}</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* Stats Cards */}
//       <Animated.View
//         style={[
//           styles.statsRow,
//           {
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }],
//             paddingTop: SPACING.md,
//           },
//         ]}
//       >
//         <StatCard
//           icon="description"
//           label="Total Reports"
//           value={stats.total}
//           color={COLORS.primary}
//           trend={stats.growth}
//         />
//         <StatCard
//           icon="cloud-done"
//           label="Synced"
//           value={stats.synced}
//           color={COLORS.success}
//         />
//         <StatCard
//           icon="cloud-upload"
//           label="Pending"
//           value={stats.pending}
//           color={COLORS.warning}
//         />
//       </Animated.View>

//       {/* Filters */}
//       <View style={styles.filtersContainer}>
//         <View style={styles.filterRow}>
//           <FilterChip
//             label="All"
//             isActive={filterType === "all"}
//             onPress={() => setFilterType("all")}
//             color={COLORS.primary}
//           />
//           <FilterChip
//             label="Synced"
//             isActive={filterType === "synced"}
//             onPress={() => setFilterType("synced")}
//             color={COLORS.success}
//           />
//           <FilterChip
//             label="Pending"
//             isActive={filterType === "pending"}
//             onPress={() => setFilterType("pending")}
//             color={COLORS.warning}
//           />
//         </View>

//         <View style={styles.sortRow}>
//           <Text style={styles.sortLabel}>Sort by:</Text>
//           <View style={styles.sortOptions}>
//             <SortOption
//               label="Date"
//               icon="calendar-today"
//               isActive={sortBy === "date"}
//               onPress={() => setSortBy("date")}
//             />
//             <SortOption
//               label="Group"
//               icon="group"
//               isActive={sortBy === "group"}
//               onPress={() => setSortBy("group")}
//             />
//             <SortOption
//               label="Attendance"
//               icon="people"
//               isActive={sortBy === "attendance"}
//               onPress={() => setSortBy("attendance")}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Reports List */}
//       <FlatList
//         data={filteredReports}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <ReportCard
//             report={item}
//             onPress={() =>
//               router.push({
//                 pathname: "/(app)/report/review",
//                 params: { reportId: item.id },
//               })
//             }
//             onEdit={() =>
//               router.push({
//                 pathname: "/(app)/report/GroupInfoScreen",
//                 params: { reportId: item.id, edit: true },
//               })
//             }
//             onDelete={() => handleDeleteReport(item.id)}
//             onExportPress={handleExportPress}
//           />
//         )}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Icon name="history" size={80} color={COLORS.lightGray} />
//             <Text style={styles.emptyTitle}>No Reports Found</Text>
//             <Text style={styles.emptyText}>
//               {searchQuery
//                 ? "Try adjusting your search or filters"
//                 : "Create your first report to get started"}
//             </Text>
//             {!searchQuery && (
//               <TouchableOpacity
//                 style={styles.createButton}
//                 onPress={() => router.push("/(app)/report/GroupInfoScreen")}
//               >
//                 <LinearGradient
//                   colors={[COLORS.primary, COLORS.primaryLight]}
//                   style={styles.createButtonGradient}
//                 >
//                   <Text style={styles.createButtonText}>Create New Report</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             )}
//           </View>
//         }
//       />

//       {/* PDF Preview Modal */}
//       {selectedReport && (
//         <PDFPreviewModal
//           visible={previewVisible}
//           report={selectedReport}
//           onClose={() => {
//             setPreviewVisible(false);
//             setSelectedReport(null);
//           }}
//           onExport={handleExportPDF}
//         />
//       )}
//     </View>
//   );
// }

// // Styles Interface
// interface Styles {
//   container: ViewStyle;
//   header: ViewStyle;
//   headerContent: ViewStyle;
//   backButton: ViewStyle;
//   headerTitleContainer: ViewStyle;
//   headerTitle: TextStyle;
//   headerSubtitle: TextStyle;
//   syncButton: ViewStyle;
//   syncBadge: ViewStyle;
//   syncBadgeText: TextStyle;
//   statsRow: ViewStyle;
//   statCard: ViewStyle;
//   statHeader: ViewStyle;
//   statIconContainer: ViewStyle;
//   trendBadge: ViewStyle;
//   trendText: TextStyle;
//   statValue: TextStyle;
//   statLabel: TextStyle;
//   filtersContainer: ViewStyle;
//   filterRow: ViewStyle;
//   filterChip: ViewStyle;
//   filterChipText: TextStyle;
//   filterChipTextActive: TextStyle;
//   sortRow: ViewStyle;
//   sortLabel: TextStyle;
//   sortOptions: ViewStyle;
//   sortOption: ViewStyle;
//   sortOptionActive: ViewStyle;
//   sortOptionText: TextStyle;
//   sortOptionTextActive: TextStyle;
//   listContent: ViewStyle;
//   reportCard: ViewStyle;
//   cardAccent: ViewStyle;
//   reportHeader: ViewStyle;
//   reportIconContainer: ViewStyle;
//   reportIcon: ViewStyle;
//   reportTitleContainer: ViewStyle;
//   reportGroup: TextStyle;
//   reportPastor: TextStyle;
//   reportDate: TextStyle;
//   pendingBadge: ViewStyle;
//   pendingText: TextStyle;
//   reportStats: ViewStyle;
//   statRow: ViewStyle;
//   expandedContent: ViewStyle;
//   divider: ViewStyle;
//   districtPreview: ViewStyle;
//   districtPreviewName: TextStyle;
//   districtPreviewStats: TextStyle;
//   moreText: TextStyle;
//   cardActions: ViewStyle;
//   actionButton: ViewStyle;
//   actionText: TextStyle;
//   emptyContainer: ViewStyle;
//   emptyTitle: TextStyle;
//   emptyText: TextStyle;
//   createButton: ViewStyle;
//   createButtonGradient: ViewStyle;
//   createButtonText: TextStyle;
//   modalOverlay: ViewStyle;
//   modalContent: ViewStyle;
//   modalGradient: ViewStyle;
//   modalHeader: ViewStyle;
//   modalHeaderLeft: ViewStyle;
//   modalIcon: ViewStyle;
//   modalTitle: TextStyle;
//   modalSubtitle: TextStyle;
//   modalCloseButton: ViewStyle;
//   previewContent: ViewStyle;
//   previewStatsGrid: ViewStyle;
//   previewStatItem: ViewStyle;
//   previewStatDivider: ViewStyle;
//   previewStatLabel: TextStyle;
//   previewStatValue: TextStyle;
//   previewSection: ViewStyle;
//   previewSectionTitle: TextStyle;
//   previewInfoRow: ViewStyle;
//   previewInfoLabel: TextStyle;
//   previewInfoValue: TextStyle;
//   previewDistrictRow: ViewStyle;
//   previewDistrictName: TextStyle;
//   previewDistrictStats: TextStyle;
//   previewNarrative: TextStyle;
//   previewSignature: ViewStyle;
//   previewSignatureName: TextStyle;
//   previewSignatureLine: ViewStyle;
//   previewSignatureDate: TextStyle;
//   modalFooter: ViewStyle;
//   modalCancelButton: ViewStyle;
//   modalCancelText: TextStyle;
//   modalExportButton: ViewStyle;
//   modalExportGradient: ViewStyle;
//   modalExportText: TextStyle;
// }

// const styles = StyleSheet.create<Styles>({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.md,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
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
//   headerTitleContainer: {
//     flex: 1,
//     marginLeft: SPACING.md,
//   },
//   headerTitle: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "bold",
//     color: COLORS.white,
//   },
//   headerSubtitle: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.white + "CC",
//     marginTop: 2,
//   },
//   syncButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//   },
//   syncBadge: {
//     position: "absolute",
//     top: -4,
//     right: -4,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: COLORS.warning,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },
//   syncBadgeText: {
//     fontSize: 8,
//     color: COLORS.white,
//     fontWeight: "bold",
//   },
//   statsRow: {
//     flexDirection: "row",
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.md,
//     gap: SPACING.sm,
//   },
//   statCard: {
//     flex: 1,
//     padding: SPACING.sm,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     backgroundColor: COLORS.white,
//   },
//   statHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: SPACING.xs,
//   },
//   statIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   trendBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: SPACING.xs,
//     paddingVertical: 2,
//     borderRadius: 8,
//   },
//   trendText: {
//     fontSize: 8,
//     color: COLORS.white,
//     marginLeft: 2,
//   },
//   statValue: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "bold",
//     color: COLORS.text.primary,
//   },
//   statLabel: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   filtersContainer: {
//     paddingHorizontal: SPACING.lg,
//     marginBottom: SPACING.md,
//   },
//   filterRow: {
//     flexDirection: "row",
//     marginBottom: SPACING.sm,
//     gap: SPACING.sm,
//   },
//   filterChip: {
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.xs,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     backgroundColor: COLORS.white,
//   },
//   filterChipText: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.primary,
//   },
//   filterChipTextActive: {
//     color: COLORS.white,
//   },
//   sortRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   sortLabel: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.gray,
//     marginRight: SPACING.sm,
//   },
//   sortOptions: {
//     flex: 1,
//     flexDirection: "row",
//     gap: SPACING.xs,
//   },
//   sortOption: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: SPACING.xs,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     backgroundColor: COLORS.white,
//   },
//   sortOptionActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   sortOptionText: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.primary,
//     marginLeft: 4,
//   },
//   sortOptionTextActive: {
//     color: COLORS.white,
//   },
//   listContent: {
//     padding: SPACING.lg,
//     paddingTop: 0,
//   },
//   reportCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     position: "relative",
//     overflow: "hidden",
//   },
//   cardAccent: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 4,
//   },
//   reportHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: SPACING.md,
//   },
//   reportIconContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   reportIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: SPACING.md,
//   },
//   reportTitleContainer: {
//     flex: 1,
//   },
//   reportGroup: {
//     fontSize: TYPOGRAPHY.md,
//     fontWeight: "600",
//     color: COLORS.text.primary,
//   },
//   reportPastor: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.gray,
//   },
//   reportDate: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   pendingBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: COLORS.warning,
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   pendingText: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.white,
//     marginLeft: 4,
//   },
//   reportStats: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: SPACING.md,
//     marginBottom: SPACING.sm,
//   },
//   statRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     minWidth: "45%",
//   },
//   expandedContent: {
//     marginTop: SPACING.sm,
//     paddingTop: SPACING.sm,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: COLORS.border,
//     marginVertical: SPACING.sm,
//   },
//   districtPreview: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: SPACING.xs,
//   },
//   districtPreviewName: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.primary,
//     fontWeight: "500",
//   },
//   districtPreviewStats: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   moreText: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//     fontStyle: "italic",
//     marginTop: SPACING.xs,
//   },
//   cardActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: SPACING.md,
//     paddingTop: SPACING.md,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: SPACING.xs,
//     paddingHorizontal: SPACING.sm,
//     borderRadius: 8,
//   },
//   actionText: {
//     fontSize: TYPOGRAPHY.sm,
//     marginLeft: SPACING.xs,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: SPACING.xxl,
//   },
//   emptyTitle: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "600",
//     color: COLORS.text.primary,
//     marginTop: SPACING.md,
//     marginBottom: SPACING.xs,
//   },
//   emptyText: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.gray,
//     textAlign: "center",
//     marginBottom: SPACING.lg,
//     paddingHorizontal: SPACING.xl,
//   },
//   createButton: {
//     borderRadius: 25,
//     overflow: "hidden",
//   },
//   createButtonGradient: {
//     paddingHorizontal: SPACING.xl,
//     paddingVertical: SPACING.md,
//   },
//   createButtonText: {
//     color: COLORS.white,
//     fontSize: TYPOGRAPHY.md,
//     fontWeight: "600",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: width * 0.9,
//     maxHeight: "80%",
//     borderRadius: 20,
//     overflow: "hidden",
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },
//   modalGradient: {
//     padding: SPACING.lg,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: SPACING.lg,
//   },
//   modalHeaderLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   modalIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: SPACING.md,
//   },
//   modalTitle: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "600",
//     color: COLORS.text.primary,
//   },
//   modalSubtitle: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.gray,
//   },
//   modalCloseButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.lightGray,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   previewContent: {
//     maxHeight: 400,
//   },
//   previewStatsGrid: {
//     flexDirection: "row",
//     backgroundColor: COLORS.background,
//     borderRadius: 12,
//     padding: SPACING.md,
//     marginBottom: SPACING.lg,
//   },
//   previewStatItem: {
//     flex: 1,
//     alignItems: "center",
//   },
//   previewStatDivider: {
//     width: 1,
//     backgroundColor: COLORS.border,
//   },
//   previewStatLabel: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   previewStatValue: {
//     fontSize: TYPOGRAPHY.md,
//     fontWeight: "600",
//     color: COLORS.primary,
//   },
//   previewSection: {
//     marginBottom: SPACING.lg,
//   },
//   previewSectionTitle: {
//     fontSize: TYPOGRAPHY.md,
//     fontWeight: "600",
//     color: COLORS.primary,
//     marginBottom: SPACING.sm,
//   },
//   previewInfoRow: {
//     flexDirection: "row",
//     marginBottom: SPACING.xs,
//   },
//   previewInfoLabel: {
//     width: 80,
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.gray,
//   },
//   previewInfoValue: {
//     flex: 1,
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.primary,
//     fontWeight: "500",
//   },
//   previewDistrictRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: SPACING.xs,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   previewDistrictName: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.primary,
//     fontWeight: "500",
//   },
//   previewDistrictStats: {
//     fontSize: TYPOGRAPHY.xs,
//     color: COLORS.gray,
//   },
//   previewNarrative: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.text.secondary,
//     lineHeight: 20,
//     backgroundColor: COLORS.background,
//     padding: SPACING.md,
//     borderRadius: 8,
//   },
//   previewSignature: {
//     alignItems: "center",
//     marginTop: SPACING.lg,
//     paddingTop: SPACING.lg,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   previewSignatureName: {
//     fontSize: TYPOGRAPHY.lg,
//     fontWeight: "600",
//     color: COLORS.primary,
//   },
//   previewSignatureLine: {
//     width: 200,
//     height: 1,
//     backgroundColor: COLORS.border,
//     marginVertical: SPACING.xs,
//   },
//   previewSignatureDate: {
//     fontSize: TYPOGRAPHY.sm,
//     color: COLORS.gray,
//   },
//   modalFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: SPACING.lg,
//     paddingTop: SPACING.lg,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   modalCancelButton: {
//     flex: 1,
//     paddingVertical: SPACING.md,
//     marginRight: SPACING.sm,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     alignItems: "center",
//   },
//   modalCancelText: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.gray,
//     fontWeight: "500",
//   },
//   modalExportButton: {
//     flex: 2,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   modalExportGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: SPACING.md,
//   },
//   modalExportText: {
//     fontSize: TYPOGRAPHY.md,
//     color: COLORS.white,
//     fontWeight: "600",
//     marginLeft: SPACING.xs,
//   },
// });