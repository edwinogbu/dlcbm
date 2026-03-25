import { MaterialIcons as Icon } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
} from "react-native";
import colors from "../constants/colors";
import spacing from "../constants/spacing";

// Define the district attendance types
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

// Define component props
interface AttendanceInputRowProps {
  district: District;
  onUpdate: (updatedDistrict: District) => void;
  onRemove: () => void;
  showRemove?: boolean;
}

const AttendanceInputRow: React.FC<AttendanceInputRowProps> = ({
  district,
  onUpdate,
  onRemove,
  showRemove = true,
}) => {
  const handleNumberInput = (field: keyof District, value: string | number) => {
    const numValue = value === "" ? 0 : parseInt(value as string) || 0;
    
    if (field === 'adult' || field === 'youth' || field === 'children') {
      // Handle nested attendance fields
      onUpdate({ 
        ...district, 
        [field]: { ...district[field], ...value as any }
      });
    } else {
      // Handle top-level fields like offering
      onUpdate({ ...district, [field]: numValue });
    }
  };

  const handleAttendanceInput = (
    category: 'adult' | 'youth' | 'children',
    subField: string,
    value: string
  ) => {
    const numValue = value === "" ? 0 : parseInt(value) || 0;
    const currentCategory = district[category] as Attendance;
    
    onUpdate({
      ...district,
      [category]: {
        ...currentCategory,
        [subField]: numValue,
      },
    });
  };

  const handleOfferingInput = (value: string) => {
    const numValue = value === "" ? 0 : parseInt(value.replace(/[^0-9]/g, "")) || 0;
    onUpdate({ ...district, offering: numValue });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.districtName}>{district.name}</Text>
        {showRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Icon name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Adult HCF Attendance */}
      <Text style={styles.sectionTitle}>Adult HCF Attendance</Text>
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>M</Text>
          <TextInput
            style={styles.input}
            value={String(district.adult?.membersMale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("adult", "membersMale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>F</Text>
          <TextInput
            style={styles.input}
            value={String(district.adult?.membersFemale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("adult", "membersFemale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>V M</Text>
          <TextInput
            style={styles.input}
            value={String(district.adult?.visitorsMale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("adult", "visitorsMale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>V F</Text>
          <TextInput
            style={styles.input}
            value={String(district.adult?.visitorsFemale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("adult", "visitorsFemale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      {/* Youth HCF Attendance */}
      <Text style={styles.sectionTitle}>Youth HCF Attendance</Text>
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>M</Text>
          <TextInput
            style={styles.input}
            value={String(district.youth?.membersMale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("youth", "membersMale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>F</Text>
          <TextInput
            style={styles.input}
            value={String(district.youth?.membersFemale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("youth", "membersFemale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>V M</Text>
          <TextInput
            style={styles.input}
            value={String(district.youth?.visitorsMale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("youth", "visitorsMale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>V F</Text>
          <TextInput
            style={styles.input}
            value={String(district.youth?.visitorsFemale || "")}
            onChangeText={(value) =>
              handleAttendanceInput("youth", "visitorsFemale", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      {/* Children HCF */}
      <Text style={styles.sectionTitle}>Children HCF</Text>
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Members</Text>
          <TextInput
            style={styles.input}
            value={String(district.children?.members || "")}
            onChangeText={(value) =>
              handleAttendanceInput("children", "members", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Visitors</Text>
          <TextInput
            style={styles.input}
            value={String(district.children?.visitors || "")}
            onChangeText={(value) =>
              handleAttendanceInput("children", "visitors", value)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      {/* Offering */}
      <View style={styles.offeringRow}>
        <Text style={styles.sectionTitle}>HCF Offering (₦)</Text>
        <TextInput
          style={[styles.input, styles.offeringInput]}
          value={district.offering ? String(district.offering) : ""}
          onChangeText={handleOfferingInput}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>
    </View>
  );
};

// Define styles interface - separate ViewStyle and TextStyle correctly
interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  districtName: TextStyle;  // This is Text, so use TextStyle
  removeButton: ViewStyle;
  sectionTitle: TextStyle;    // This is Text, so use TextStyle
  row: ViewStyle;
  inputGroup: ViewStyle;
  label: TextStyle;           // This is Text, so use TextStyle
  input: TextStyle;           // TextInput uses TextStyle, not ViewStyle
  offeringRow: ViewStyle;
  offeringInput: TextStyle;   // TextInput uses TextStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  districtName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  removeButton: {
    padding: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  inputGroup: {
    flex: 1,
    minWidth: 70,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: colors.text.hint,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.sm,
    fontSize: 14,
    textAlign: "center",
  },
  offeringRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  offeringInput: {
    width: 120,
    textAlign: "right",
  },
});

export default AttendanceInputRow;