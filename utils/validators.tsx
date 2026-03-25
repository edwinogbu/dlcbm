export const validateGroupInfo = (groupInfo) => {
  const errors = {};
  
  if (!groupInfo.groupName) {
    errors.groupName = 'Group name is required';
  }
  
  if (!groupInfo.groupPastor) {
    errors.groupPastor = 'Group pastor is required';
  }
  
  if (!groupInfo.date) {
    errors.date = 'Date is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateDistrict = (district) => {
  return district.districtName && district.districtName.trim().length > 0;
};

// export const validateGroupInfo = (group, pastor, date) => {
//   const errors = {};
//   if (!group) errors.group = 'Group is required';
//   if (!pastor) errors.pastor = 'Pastor name is required';
//   if (!date) errors.date = 'Date is required';
//   return errors;
// };

// export const validateAttendance = (attendance) => {
//   // Basic validation - can be expanded
//   return attendance.length > 0;
// };