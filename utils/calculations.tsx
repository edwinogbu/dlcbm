export const calculateAdultTotal = (adult) => {
  const members = (adult.membersMale || 0) + (adult.membersFemale || 0);
  const visitors = (adult.visitorsMale || 0) + (adult.visitorsFemale || 0);
  return members + visitors;
};

export const calculateYouthTotal = (youth) => {
  const members = (youth.membersMale || 0) + (youth.membersFemale || 0);
  const visitors = (youth.visitorsMale || 0) + (youth.visitorsFemale || 0);
  return members + visitors;
};

export const calculateChildrenTotal = (children) => {
  return (children.members || 0) + (children.visitors || 0);
};

export const calculateDistrictTotals = (district) => {
  const adultTotal = calculateAdultTotal(district.adult);
  const youthTotal = calculateYouthTotal(district.youth);
  const childrenTotal = calculateChildrenTotal(district.children);
  const totalAttendance = adultTotal + youthTotal + childrenTotal;
  
  return {
    adultTotal,
    youthTotal,
    childrenTotal,
    totalAttendance,
    totalOffering: district.offering || 0
  };
};

export const calculateGrandTotals = (districts) => {
  return districts.reduce((acc, district) => {
    const totals = calculateDistrictTotals(district);
    return {
      totalAdultMembers: acc.totalAdultMembers + (district.adult.membersMale || 0) + (district.adult.membersFemale || 0),
      totalAdultVisitors: acc.totalAdultVisitors + (district.adult.visitorsMale || 0) + (district.adult.visitorsFemale || 0),
      totalYouthMembers: acc.totalYouthMembers + (district.youth.membersMale || 0) + (district.youth.membersFemale || 0),
      totalYouthVisitors: acc.totalYouthVisitors + (district.youth.visitorsMale || 0) + (district.youth.visitorsFemale || 0),
      totalChildrenMembers: acc.totalChildrenMembers + (district.children.members || 0),
      totalChildrenVisitors: acc.totalChildrenVisitors + (district.children.visitors || 0),
      totalAttendance: acc.totalAttendance + totals.totalAttendance,
      totalOffering: acc.totalOffering + totals.totalOffering
    };
  }, {
    totalAdultMembers: 0,
    totalAdultVisitors: 0,
    totalYouthMembers: 0,
    totalYouthVisitors: 0,
    totalChildrenMembers: 0,
    totalChildrenVisitors: 0,
    totalAttendance: 0,
    totalOffering: 0
  });
};

// export const calculateAdultTotal = (membersM, membersF, visitorsM, visitorsF) => {
//   return (Number(membersM) || 0) + (Number(membersF) || 0) + 
//          (Number(visitorsM) || 0) + (Number(visitorsF) || 0);
// };

// export const calculateYouthTotal = (membersM, membersF, visitorsM, visitorsF) => {
//   return (Number(membersM) || 0) + (Number(membersF) || 0) + 
//          (Number(visitorsM) || 0) + (Number(visitorsF) || 0);
// };

// export const calculateChildrenTotal = (members, visitors) => {
//   return (Number(members) || 0) + (Number(visitors) || 0);
// };

// export const calculateOverallTotal = (adultTotal, youthTotal, childrenTotal) => {
//   return (Number(adultTotal) || 0) + (Number(youthTotal) || 0) + (Number(childrenTotal) || 0);
// };

// export const formatCurrency = (amount) => {
//   return `₦${Number(amount).toLocaleString()}`;
// };