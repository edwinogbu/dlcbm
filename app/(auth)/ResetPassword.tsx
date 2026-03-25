import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import InputField from '../../components/InputField';
import GradientButton from '../../components/GradientButton';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const ResetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params;
  
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Create a new password for{'\n'}
            <Text style={styles.emailText}>{email || 'your account'}</Text>
          </Text>

          <View style={styles.form}>
            <InputField
              label="New Password"
              value={form.password}
              onChangeText={(text) => setForm({...form, password: text})}
              placeholder="Enter new password"
              secureTextEntry
              error={errors.password}
              icon="lock"
            />

            <InputField
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={(text) => setForm({...form, confirmPassword: text})}
              placeholder="Confirm new password"
              secureTextEntry
              error={errors.confirmPassword}
              icon="lock"
            />

            <GradientButton
              title="Reset Password"
              onPress={handleReset}
              loading={loading}
              style={styles.resetButton}
            />

            <GradientButton
              title="Back to Login"
              onPress={() => router.push('/(auth)/Login')}
              gradientColors={[colors.gray, colors.lightGray]}
              style={styles.backButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: spacing.sm,
    marginBottom: spacing.md,

  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  resetButton: {
    marginBottom: spacing.md,
  },
//   backButton: {
//     marginBottom: spacing.md,
//   },
});

export default ResetPassword;