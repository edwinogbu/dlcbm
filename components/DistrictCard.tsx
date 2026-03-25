import { MaterialIcons as Icon } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import { calculateDistrictTotals } from "../utils/calculations";
import { formatCurrency } from "../utils/formatters";

const DistrictCard = ({ district, onPress, onEdit, onDelete }) => {
  const totals = calculateDistrictTotals(district);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.districtName}>{district.districtName}</Text>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Icon name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Adult</Text>
          <Text style={styles.statValue}>{totals.adultTotal}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Youth</Text>
          <Text style={styles.statValue}>{totals.youthTotal}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Children</Text>
          <Text style={styles.statValue}>{totals.childrenTotal}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{totals.totalAttendance}</Text>
        </View>
      </View>

      <View style={styles.offering}>
        <Text style={styles.offeringLabel}>Offering:</Text>
        <Text style={styles.offeringValue}>
          {formatCurrency(totals.totalOffering)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  districtName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.hint,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  offering: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  offeringLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  offeringValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
  },
});

export default DistrictCard;
