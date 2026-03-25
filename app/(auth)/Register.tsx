import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  TextStyle,
  ViewStyle,
  ImageStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import InputField from '../../components/InputField';
import GradientButton from '../../components/GradientButton';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

// Define form data interface
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Define form errors interface
interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success',
        'Registration successful! Please verify your email.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/(auth)/OTPVerification',
              params: { email: form.email }
            })
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        'Unable to create account. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof FormData, value: string): void => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (): void => {
    setSecureTextEntry(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = (): void => {
    setConfirmSecureTextEntry(prev => !prev);
  };

  const toggleTermsAgreement = (): void => {
    setAgreeTerms(prev => !prev);
    if (errors.terms) {
      setErrors(prev => ({ ...prev, terms: undefined }));
    }
  };

  // Check password requirements
  const hasMinLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appName}>Join Our Community</Text>
          </View>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <InputField
                label="Full Name"
                value={form.fullName}
                onChangeText={(text) => updateForm('fullName', text)}
                placeholder="Enter your full name"
                error={errors.fullName}
                icon="person"
                iconColor={colors.primary}
              />

              <InputField
                label="Email Address"
                value={form.email}
                onChangeText={(text) => updateForm('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                icon="email"
                iconColor={colors.primary}
              />

              <InputField
                label="Phone Number"
                value={form.phone}
                onChangeText={(text) => updateForm('phone', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                error={errors.phone}
                icon="phone"
                iconColor={colors.primary}
              />

              <InputField
                label="Password"
                value={form.password}
                onChangeText={(text) => updateForm('password', text)}
                placeholder="Create a password"
                secureTextEntry={secureTextEntry}
                error={errors.password}
                icon="lock"
                iconColor={colors.primary}
                rightIcon={secureTextEntry ? "visibility-off" : "visibility"}
                onRightIconPress={togglePasswordVisibility}
              />

              <InputField
                label="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(text) => updateForm('confirmPassword', text)}
                placeholder="Confirm your password"
                secureTextEntry={confirmSecureTextEntry}
                error={errors.confirmPassword}
                icon="lock"
                iconColor={colors.primary}
                rightIcon={confirmSecureTextEntry ? "visibility-off" : "visibility"}
                onRightIconPress={toggleConfirmPasswordVisibility}
              />

              {/* Terms and Conditions */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={toggleTermsAgreement}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

              {/* Password Requirements */}
              {form.password.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password must contain:</Text>
                  <View style={styles.requirementRow}>
                    <View style={[styles.requirementDot, hasMinLength && styles.requirementMet]} />
                    <Text style={styles.requirementText}>At least 8 characters</Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <View style={[styles.requirementDot, hasUppercase && styles.requirementMet]} />
                    <Text style={styles.requirementText}>One uppercase letter</Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <View style={[styles.requirementDot, hasNumber && styles.requirementMet]} />
                    <Text style={styles.requirementText}>One number</Text>
                  </View>
                </View>
              )}

              <GradientButton
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
                textStyle={styles.buttonText}
              />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Define styles interface
interface Styles {
  container: ViewStyle;
  keyboardView: ViewStyle;
  scrollContent: ViewStyle;
  logoSection: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  appName: TextStyle;
  headerSection: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  formContainer: ViewStyle;
  formCard: ViewStyle;
  termsContainer: ViewStyle;
  checkbox: ViewStyle;
  checkboxChecked: ViewStyle;
  checkmark: TextStyle;
  termsText: TextStyle;
  termsLink: TextStyle;
  errorText: TextStyle;
  requirementsContainer: ViewStyle;
  requirementsTitle: TextStyle;
  requirementRow: ViewStyle;
  requirementDot: ViewStyle;
  requirementMet: ViewStyle;
  requirementText: TextStyle;
  registerButton: ViewStyle;
  buttonText: TextStyle;
  loginContainer: ViewStyle;
  loginText: TextStyle;
  loginLink: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  logoContainer: {
    width: width * 0.18,
    height: width * 0.18,
    backgroundColor: colors.white,
    borderRadius: width * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logo: {
    width: '90%',
    height: '90%',
    borderRadius: width * 0.09,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: spacing.lg,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.sm,
    marginLeft: 28,
  },
  requirementsContainer: {
    backgroundColor: colors.lightGray + '40',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray,
    marginRight: spacing.xs,
  },
  requirementMet: {
    backgroundColor: colors.success,
  },
  requirementText: {
    fontSize: 12,
    color: colors.gray,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginText: {
    color: colors.white,
    fontSize: 15,
  },
  loginLink: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default Register;