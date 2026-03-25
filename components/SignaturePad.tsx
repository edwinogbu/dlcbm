import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Signature from 'react-native-signature-canvas';
import { COLORS} from '../constants/colors';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

const SignaturePad = ({ onOK, onEmpty, style }) => {
  const ref = useRef();

  const handleOK = (signature) => {
    onOK(signature);
  };

  const handleClear = () => {
    ref.current.clearSignature();
  };

  const handleEmpty = () => {
    onEmpty();
  };

  const styleCSS = `
    .m-signature-pad {
      box-shadow: none;
      border: 1px solid ${COLORS.border};
      border-radius: ${BORDER_RADIUS.sm}px;
      margin: 0;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
  `;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Pastors Signature</Text>
      <View style={styles.signatureContainer}>
        <Signature
          ref={ref}
          onOK={handleOK}
          onEmpty={handleEmpty}
          descriptionText="Sign here"
          clearText="Clear"
          confirmText="Save"
          webStyle={styleCSS}
          backgroundColor={COLORS.white}
        />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  signatureContainer: {
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});

export default SignaturePad;