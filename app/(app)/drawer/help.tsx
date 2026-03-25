import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../../../constants/colors";
import spacing, { BORDER_RADIUS } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      id: 1,
      question: "How do I create a new report?",
      answer:
        'Go to the Dashboard and tap on "New Report" or use the "New Report" option in the drawer menu. Then follow the step-by-step process to add districts, attendance, and offerings.',
    },
    {
      id: 2,
      question: "How do I sync my reports?",
      answer:
        "Reports sync automatically when you're online. You can also manually sync by going to Report History and tapping the sync button in the top right corner.",
    },
    {
      id: 3,
      question: "What happens when I'm offline?",
      answer:
        "All reports are saved locally on your device. When you reconnect to the internet, they will automatically sync to the cloud. You can see pending sync reports with a yellow badge.",
    },
    {
      id: 4,
      question: "How do I edit a submitted report?",
      answer:
        "Go to Report History, find the report you want to edit, and tap the edit button (pencil icon). Note that you can only edit unsynced reports.",
    },
    {
      id: 5,
      question: "How do I add multiple districts?",
      answer:
        'When creating a new report, tap "Add District" on the District List screen. You can add as many districts as needed for your fellowship group.',
    },
    {
      id: 6,
      question: "How do I track offerings?",
      answer:
        "During report creation, you'll reach the Offering screen where you can enter offering amounts for each district. The totals are automatically calculated.",
    },
    {
      id: 7,
      question: "Can I delete a report?",
      answer:
        "Yes, go to Report History, find the report, and tap the delete button (trash icon). You will be asked to confirm before deletion.",
    },
    {
      id: 8,
      question: "How do I change my profile picture?",
      answer:
        "Go to your Profile screen and tap on the avatar/placeholder. You can then choose to take a photo or select one from your gallery.",
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs;

  const tutorials = [
    {
      title: "Getting Started",
      icon: "play-circle",
      duration: "3 min",
      onPress: () =>
        Alert.alert("Tutorial", "Getting Started video would play"),
    },
    {
      title: "Creating Your First Report",
      icon: "play-circle",
      duration: "5 min",
      onPress: () => Alert.alert("Tutorial", "Report creation tutorial"),
    },
    {
      title: "Understanding Analytics",
      icon: "play-circle",
      duration: "4 min",
      onPress: () => Alert.alert("Tutorial", "Analytics tutorial"),
    },
  ];

  const contactOptions = [
    {
      icon: "email",
      title: "Email Support",
      description: "support@dlc.org",
      onPress: () => Alert.alert("Email", "Opening email client..."),
    },
    {
      icon: "phone",
      title: "Phone Support",
      description: "+234 800 123 4567",
      onPress: () => Alert.alert("Phone", "Initiating call..."),
    },
    {
      icon: "chat",
      title: "Live Chat",
      description: "Mon-Fri, 9am-5pm",
      onPress: () => Alert.alert("Chat", "Opening live chat..."),
    },
    {
      icon: "whatsapp",
      title: "WhatsApp",
      description: "Quick response",
      onPress: () => Alert.alert("WhatsApp", "Opening WhatsApp..."),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="help" size={48} color={colors.primary} />
        <Text style={styles.headerTitle}>How can we help you?</Text>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color={colors.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for answers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close" size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Tutorials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tutorials</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tutorialScroll}
        >
          {tutorials.map((tutorial, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tutorialCard}
              onPress={tutorial.onPress}
            >
              <Icon name={tutorial.icon} size={32} color={colors.primary} />
              <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
              <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {filteredFaqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() =>
                  setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                }
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <Icon
                  name={expandedFaq === faq.id ? "expand-less" : "expand-more"}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              {expandedFaq === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Contact Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactGrid}>
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={option.onPress}
            >
              <View style={styles.contactIcon}>
                <Icon name={option.icon} size={24} color={colors.white} />
              </View>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactDescription}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Report a Problem */}
      <View style={styles.problemSection}>
        <TouchableOpacity
          style={styles.problemButton}
          onPress={() =>
            Alert.alert("Report Problem", "Opening feedback form...")
          }
        >
          <Icon name="bug-report" size={24} color={colors.white} />
          <Text style={styles.problemButtonText}>Report a Problem</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: spacing.md,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: TYPOGRAPHY.md,
    color: colors.text.primary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  tutorialScroll: {
    marginBottom: spacing.sm,
  },
  tutorialCard: {
    backgroundColor: colors.white,
    borderRadius: BORDER_RADIUS.md,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: "center",
    width: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tutorialTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: "500",
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  tutorialDuration: {
    fontSize: TYPOGRAPHY.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  faqContainer: {
    backgroundColor: colors.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  questionText: {
    fontSize: TYPOGRAPHY.md,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  answerText: {
    fontSize: TYPOGRAPHY.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  contactCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: BORDER_RADIUS.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    color: colors.text.primary,
  },
  contactDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 2,
  },
  problemSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  problemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: BORDER_RADIUS.md,
  },
  problemButtonText: {
    color: colors.white,
    fontSize: TYPOGRAPHY.md,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
