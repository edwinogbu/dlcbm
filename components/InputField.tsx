// InputField.tsx - Updated version
import { MaterialIcons as Icon } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TextInputProps,
    ViewStyle,
    TextStyle,
} from "react-native";
import colors from "../constants/colors";
import spacing from "../constants/spacing";

// Define the props interface
interface InputFieldProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad" | "visible-password" | "ascii-capable" | "numbers-and-punctuation" | "url" | "name-phone-pad" | "twitter" | "web-search";
  error?: string;
  icon?: keyof typeof Icon.glyphMap;
  iconColor?: string;  // Added iconColor prop
  rightIcon?: keyof typeof Icon.glyphMap;  // Added rightIcon prop
  onIconPress?: () => void;
  onRightIconPress?: () => void;  // Added onRightIconPress prop
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  icon,
  iconColor,
  rightIcon,
  onIconPress,
  onRightIconPress,
  containerStyle,
  inputContainerStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        inputContainerStyle,
        error && styles.inputError
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.hint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
        {icon && (
          <TouchableOpacity 
            onPress={onIconPress} 
            style={styles.iconContainer}
            disabled={!onIconPress}
          >
            <Icon name={icon} size={24} color={iconColor || colors.primary} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress} 
            style={styles.iconContainer}
            disabled={!onRightIconPress}
          >
            <Icon name={rightIcon} size={24} color={iconColor || colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

// Define styles interface
interface Styles {
  container: ViewStyle;
  label: TextStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  inputError: ViewStyle;
  iconContainer: ViewStyle;
  errorText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  iconContainer: {
    paddingHorizontal: spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default InputField;