
import { Stack } from 'expo-router';

export default function ReportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GroupInfoScreen" options={{ title: 'Group Info' }} />
      <Stack.Screen name="AdultAttendanceScreen" options={{ title: 'Adult Attendance' }} />
      <Stack.Screen name="ChildrenAttendanceScreen" options={{ title: 'Children Attendance' }} />
      <Stack.Screen name="YouthAttendanceScreen" options={{ title: 'Youth Attendance' }} />
      <Stack.Screen name="DistrictListScreen" options={{ title: 'District List' }} />
      <Stack.Screen name="OfferingScreen" options={{ title: 'Offering' }} />
      <Stack.Screen name="ProblemsScreen" options={{ title: 'Problems' }} />
      <Stack.Screen name="SolutionsScreen" options={{ title: 'Solutions' }} />
      <Stack.Screen name="TestimonyScreen" options={{ title: 'Testimony' }} />
      <Stack.Screen name="VisitationReportScreen" options={{ title: 'Visitation Report' }} />
      <Stack.Screen name="ReportReviewScreen" options={{ title: 'Review Report' }} />
      <Stack.Screen name="SignatureScreen" options={{ title: 'Signature' }} />
      <Stack.Screen name="FinalRemarksScreen" options={{ title: 'Final Remarks' }} />
    </Stack>
  );
}

// import { Stack } from 'expo-router';

// export default function ReportLayout() {
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: true,
//         animation: 'slide_from_right',
//       }}
//     >
//       <Stack.Screen name="GroupInfoScreen" options={{ title: 'Group Info' }} />
//       <Stack.Screen name="AdultAttendanceScreen" options={{ title: 'Adult Attendance' }} />
//       <Stack.Screen name="ChildrenAttendanceScreen" options={{ title: 'Children Attendance' }} />
//       <Stack.Screen name="YouthAttendanceScreen" options={{ title: 'Youth Attendance' }} />
//       <Stack.Screen name="DistrictListScreen" options={{ title: 'District List' }} />
//       <Stack.Screen name="OfferingScreen" options={{ title: 'Offering' }} />
//       <Stack.Screen name="ProblemsScreen" options={{ title: 'Problems' }} />
//       <Stack.Screen name="SolutionsScreen" options={{ title: 'Solutions' }} />
//       <Stack.Screen name="TestimonyScreen" options={{ title: 'Testimony' }} />
//       <Stack.Screen name="VisitationReportScreen" options={{ title: 'Visitation Report' }} />
//       <Stack.Screen name="ReportReviewScreen" options={{ title: 'Review Report' }} />
//       <Stack.Screen name="SignatureScreen" options={{ title: 'Signature' }} />
//       <Stack.Screen name="FinalRemarksScreen" options={{ title: 'Final Remarks' }} />
//     </Stack>
//   );
// }