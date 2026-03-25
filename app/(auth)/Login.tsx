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
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/InputField';
import GradientButton from '../../components/GradientButton';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

// Define error type
interface FormErrors {
  email?: string;
  password?: string;
}

// Define component props for InputField if needed
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  error?: string;
  icon?: string;
  iconColor?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

// Define GradientButton props
interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleLogin = async (): Promise<void> => {
  //   if (!validate()) return;

  //   setLoading(true);
  //   try {
  //     // Simulate API call
  //     await new Promise(resolve => setTimeout(resolve, 1500));
      
  //     // Store user session
  //     await AsyncStorage.setItem('userToken', 'mock-token');
  //     await AsyncStorage.setItem('userEmail', email);
      
  //     // Navigate to main app
  //     router.replace('/(app)/(tabs)');
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     Alert.alert(
  //       'Login Failed',
  //       'Unable to sign in. Please check your credentials and try again.',
  //       [{ text: 'OK', style: 'default' }]
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // In your handleLogin function, update the navigation:
const handleLogin = async (): Promise<void> => {
  if (!validate()) return;

  setLoading(true);
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store user session
    await AsyncStorage.setItem('userToken', 'mock-token');
    await AsyncStorage.setItem('userEmail', email);
    
    console.log('Login successful, navigating to app...');
    
    // Navigate to main app - using replace to prevent going back to login
    router.replace('/(app)/(tabs)');
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert(
      'Login Failed',
      'Unable to sign in. Please check your credentials and try again.',
      [{ text: 'OK', style: 'default' }]
    );
  } finally {
    setLoading(false);
  }
};

  const toggleSecureEntry = (): void => {
    setSecureTextEntry(prev => !prev);
  };

  // Debug: Check if colors are loaded
  console.log('Colors loaded:', colors.primary, colors.primaryLight);

  return (
    <LinearGradient
      colors={[colors.primaryLight || '#3B5BA5', colors.primary || '#1E3A8A']}
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
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Deeper Life Church</Text>
            <Text style={styles.appSubtitle}>House Caring Fellowship</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon="email"
              iconColor={colors.primary}
            />

            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={secureTextEntry}
              error={errors.password}
              icon="lock"
              iconColor={colors.primary}
              rightIcon={secureTextEntry ? "visibility-off" : "visibility"}
              onRightIconPress={toggleSecureEntry}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/ForgotPassword')}
              style={styles.forgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => console.log('Google login')}
                activeOpacity={0.7}
              >
                <Text style={styles.socialIcon}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => console.log('Facebook login')}
                activeOpacity={0.7}
              >
                <Text style={styles.socialIcon}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => console.log('Apple login')}
                activeOpacity={0.7}
              >
                <Text style={styles.socialIcon}>A</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Define styles with proper typing
interface Styles {
  container: ViewStyle;
  keyboardView: ViewStyle;
  scrollContent: ViewStyle;
  logoSection: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  appName: TextStyle;
  appSubtitle: TextStyle;
  welcomeSection: ViewStyle;
  welcomeTitle: TextStyle;
  welcomeSubtitle: TextStyle;
  formCard: ViewStyle;
  forgotPassword: ViewStyle;
  forgotPasswordText: TextStyle;
  loginButton: ViewStyle;
  dividerContainer: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  socialContainer: ViewStyle;
  socialButton: ViewStyle;
  socialIcon: TextStyle;
  registerContainer: ViewStyle;
  registerText: TextStyle;
  registerLink: TextStyle;
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
    marginBottom: height * 0.03,
  },
  logoContainer: {
    width: width * 0.2,
    height: width * 0.2,
    backgroundColor: colors.white,
    borderRadius: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logo: {
    width: '55%',
    height: '55%',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    color: colors.gray,
    fontSize: 12,
    marginHorizontal: spacing.sm,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  registerText: {
    color: colors.white,
    fontSize: 15,
  },
  registerLink: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default Login;