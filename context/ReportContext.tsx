import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Define types for all data structures
interface District {
  id: string;
  name: string;
  code: string;
  adult: {
    membersMale: number;
    membersFemale: number;
    visitorsMale: number;
    visitorsFemale: number;
    total: number;
  };
  youth: {
    membersMale: number;
    membersFemale: number;
    visitorsMale: number;
    visitorsFemale: number;
    total: number;
  };
  children: {
    members: number;
    visitors: number;
    total: number;
  };
  offering: number;
}

interface Problem {
  id: string;
  text: string;
  completed: boolean;
}

interface Solution {
  id: string;
  text: string;
  completed: boolean;
}

interface Report {
  id: string | null;
  groupName: string;
  groupPastor: string;
  date: string;
  districts: District[];
  visitationReport: string;
  testimonies: string;
  problems: Problem[];
  solutions: Solution[];
  finalRemarks: string;
  signature: string;
  signatureName: string;
  signatureDate: string;
  isSubmitted: boolean;
  lastModified: string;
  totalAttendance?: number;
  totalOfferings?: number;
  synced?: boolean;
  submittedAt?: string;
  createdAt?: string;
}

interface ReportContextType {
  currentReport: Report;
  savedReports: Report[];
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  updateReport: (updates: Partial<Report>) => void;
  addDistrict: (newDistrict: District) => void;
  updateDistrict: (districtId: string, updates: Partial<District>) => void;
  removeDistrict: (districtId: string) => void;
  addProblem: (problem: string) => Problem;
  updateProblem: (problemId: string, updates: Partial<Problem>) => void;
  removeProblem: (problemId: string) => void;
  addSolution: (solution: string) => Solution;
  updateSolution: (solutionId: string, updates: Partial<Solution>) => void;
  removeSolution: (solutionId: string) => void;
  submitReport: () => Promise<Report>;
  resetReport: () => void;
  loadReport: (reportId: string) => void;
  deleteReport: (reportId: string) => Promise<void>;
  syncReports: () => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

// Define the context with a default value
const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

// Storage keys
const STORAGE_KEYS = {
  SAVED_REPORTS: 'savedReports',
} as const;

// Error messages
const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load reports. Please try again.',
  SAVE_FAILED: 'Failed to save report. Please check your storage.',
  DELETE_FAILED: 'Failed to delete report. Please try again.',
  SYNC_FAILED: 'Failed to sync reports. Please check your connection.',
  SUBMIT_FAILED: 'Failed to submit report. Please try again.',
  NO_INTERNET: 'No internet connection. Please connect and try again.',
  INVALID_REPORT: 'Invalid report data. Please check all fields.',
} as const;

// Sample Data Generator (will be replaced with API later)
const generateSampleReports = (): Report[] => {
  const districts = [
    { id: 'dist1', name: 'Ikorodu Central', code: 'DLC-001' },
    { id: 'dist2', name: 'Ikorodu East', code: 'DLC-002' },
    { id: 'dist3', name: 'Ikorodu West', code: 'DLC-003' },
    { id: 'dist4', name: 'Agric', code: 'DLC-004' },
    { id: 'dist5', name: 'Owode', code: 'DLC-005' },
    { id: 'dist6', name: 'Ibeshe', code: 'DLC-006' },
    { id: 'dist7', name: 'Ijede', code: 'DLC-007' },
    { id: 'dist8', name: 'Igbe', code: 'DLC-008' },
  ];

  const generateDistrictAttendance = (baseMembers = 20, baseVisitors = 5): District[] => {
    return districts.map(district => ({
      id: district.id,
      name: district.name,
      code: district.code,
      adult: {
        membersMale: Math.floor(Math.random() * 15) + baseMembers,
        membersFemale: Math.floor(Math.random() * 15) + baseMembers,
        visitorsMale: Math.floor(Math.random() * 5) + baseVisitors,
        visitorsFemale: Math.floor(Math.random() * 5) + baseVisitors,
        total: 0
      },
      youth: {
        membersMale: Math.floor(Math.random() * 10) + 5,
        membersFemale: Math.floor(Math.random() * 10) + 5,
        visitorsMale: Math.floor(Math.random() * 3) + 1,
        visitorsFemale: Math.floor(Math.random() * 3) + 1,
        total: 0
      },
      children: {
        members: Math.floor(Math.random() * 8) + 2,
        visitors: Math.floor(Math.random() * 3) + 1,
        total: 0
      },
      offering: Math.floor(Math.random() * 50000) + 10000,
    }));
  };

  const calculateDistrictTotals = (districts: District[]): District[] => {
    return districts.map(d => ({
      ...d,
      adult: {
        ...d.adult,
        total: (d.adult.membersMale || 0) + (d.adult.membersFemale || 0) +
               (d.adult.visitorsMale || 0) + (d.adult.visitorsFemale || 0)
      },
      youth: {
        ...d.youth,
        total: (d.youth.membersMale || 0) + (d.youth.membersFemale || 0) +
               (d.youth.visitorsMale || 0) + (d.youth.visitorsFemale || 0)
      },
      children: {
        ...d.children,
        total: (d.children.members || 0) + (d.children.visitors || 0)
      }
    }));
  };

  const getRandomDate = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  const sampleProblems: Problem[] = [
    { id: 'prob1', text: "Low youth attendance in Ikorodu Central district. Only 5 youths present this week.", completed: false },
    { id: 'prob2', text: "Transportation issues affecting members from Ibeshe area.", completed: false },
    { id: 'prob3', text: "Conflict between two members in Agric district that needs pastoral attention.", completed: false },
    { id: 'prob4', text: "Financial constraints for planned outreach program.", completed: false },
    { id: 'prob5', text: "Some members struggling with attendance due to work schedules.", completed: false },
    { id: 'prob6', text: "Need for more ushers during Sunday services.", completed: false },
    { id: 'prob7', text: "Children's department needs more teachers.", completed: false },
    { id: 'prob8', text: "Follow-up needed on 3 new converts from last month.", completed: false },
  ];

  const sampleSolutions: Solution[] = [
    { id: 'sol1', text: "Organized youth fellowship meeting to address concerns. Scheduled special youth program.", completed: false },
    { id: 'sol2', text: "Arranged carpool system with members who have vehicles. Three volunteers offered help.", completed: false },
    { id: 'sol3', text: "Mediation session scheduled for next Tuesday. Both parties willing to reconcile.", completed: false },
    { id: 'sol4', text: "Church agreed to provide 50% funding. Members encouraged to give special offering.", completed: false },
    { id: 'sol5', text: "Introduced evening fellowship for workers. Good response from affected members.", completed: false },
    { id: 'sol6', text: "Trained 5 new ushers. They will start next Sunday.", completed: false },
    { id: 'sol7', text: "Two new teachers volunteered. Training scheduled for this weekend.", completed: false },
    { id: 'sol8', text: "Assigning follow-up counselors to each convert. First meeting this Friday.", completed: false },
  ];

  const sampleTestimonies: string[] = [
    "🙌 Sister Mary healed of chronic back pain during prayer session!",
    "🎉 Three souls gave their lives to Christ in Ikorodu East!",
    "✨ Brother John received a new job after months of unemployment!",
    "🙏 Marriage restored in Owode district - couple reconciled!",
    "💫 Financial breakthrough for a family in Ijede - debt cleared!",
    "⭐ Young graduate got scholarship for further studies!",
    "🎊 Church building renovation completed ahead of schedule!",
    "🙌 Twelve members received Holy Ghost baptism last Sunday!"
  ];

  const sampleVisitations: string[] = [
    "Visited 5 families in Ikorodu Central. Prayed with Sister Grace who is recovering from surgery.",
    "Conducted home visits in Agric district. Brother Michael's family welcomed us warmly.",
    "Follow-up visits to 3 new converts in Ibeshe. All are doing well and attending regularly.",
    "Hospital visitation to Sister Esther who delivered a baby boy. Mother and child are healthy.",
    "Visited 4 absent members in Ijede. Two promised to return next Sunday.",
    "Pastoral visit to Elder Paul's family. Discussed upcoming church programs."
  ];

  const sampleRemarks: string[] = [
    "Overall group growth is encouraging. Youth department showing improvement. Continue visitation efforts.",
    "Challenges with attendance persist but solutions are working. Need more focus on children's ministry.",
    "Excellent month! All districts showing growth. Testimonies are inspiring. Keep up the good work.",
    "Some districts need more attention. Focus on Ikorodu West next month. Praise God for salvations!",
    "Great improvement in offerings. Mission fund exceeded target. God is faithful!"
  ];

  const reports: Report[] = [];
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const districtData = generateDistrictAttendance(15 + i, 3 + i);
    const calculatedDistricts = calculateDistrictTotals(districtData);
    
    const totalAttendance = calculatedDistricts.reduce((sum, d) => 
      sum + (d.adult?.total || 0) + (d.youth?.total || 0) + (d.children?.total || 0), 0);
    const totalOfferings = calculatedDistricts.reduce((sum, d) => sum + (d.offering || 0), 0);
    
    const numProblems = Math.floor(Math.random() * 3) + 1;
    const selectedProblems: Problem[] = [];
    for (let j = 0; j < numProblems; j++) {
      const problem = { ...sampleProblems[Math.floor(Math.random() * sampleProblems.length)] };
      problem.id = `prob_${Date.now()}_${j}_${Math.random().toString(36).substr(2, 3)}`;
      selectedProblems.push(problem);
    }

    const numSolutions = Math.floor(Math.random() * 3) + 1;
    const selectedSolutions: Solution[] = [];
    for (let j = 0; j < numSolutions; j++) {
      const solution = { ...sampleSolutions[Math.floor(Math.random() * sampleSolutions.length)] };
      solution.id = `sol_${Date.now()}_${j}_${Math.random().toString(36).substr(2, 3)}`;
      selectedSolutions.push(solution);
    }

    const numTestimonies = Math.floor(Math.random() * 3) + 1;
    const selectedTestimonies: string[] = [];
    for (let j = 0; j < numTestimonies; j++) {
      selectedTestimonies.push(sampleTestimonies[Math.floor(Math.random() * sampleTestimonies.length)]);
    }

    const report: Report = {
      id: `report_${Date.now() - i * 86400000}_${Math.random().toString(36).substr(2, 3)}`,
      groupName: ['Ikorodu Group', 'Agric Group', 'Owode Group', 'Ijede Group', 'Ibeshe Group'][Math.floor(Math.random() * 5)],
      groupPastor: ['Pastor James Ade', 'Pastor Michael Ojo', 'Pastor David Okon', 'Pastor John Obi', 'Pastor Peter Akpan'][Math.floor(Math.random() * 5)],
      date: getRandomDate(daysAgo),
      districts: calculatedDistricts,
      visitationReport: sampleVisitations[Math.floor(Math.random() * sampleVisitations.length)],
      testimonies: selectedTestimonies.join('\n\n'),
      problems: selectedProblems,
      solutions: selectedSolutions,
      finalRemarks: sampleRemarks[Math.floor(Math.random() * sampleRemarks.length)],
      signature: '',
      signatureName: ['Pastor James Ade', 'Pastor Michael Ojo', 'Pastor David Okon'][Math.floor(Math.random() * 3)],
      signatureDate: getRandomDate(0),
      totalAttendance,
      totalOfferings,
      isSubmitted: true,
      synced: Math.random() > 0.3,
      submittedAt: getRandomDate(daysAgo),
      lastModified: getRandomDate(Math.floor(Math.random() * 5)),
      createdAt: getRandomDate(daysAgo + 1),
    };
    
    reports.push(report);
  }

  return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const initialReport: Report = {
  id: null,
  groupName: '',
  groupPastor: '',
  date: new Date().toISOString(),
  districts: [],
  visitationReport: '',
  testimonies: '',
  problems: [],
  solutions: [],
  finalRemarks: '',
  signature: '',
  signatureName: '',
  signatureDate: new Date().toISOString(),
  isSubmitted: false,
  lastModified: new Date().toISOString()
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const [currentReport, setCurrentReport] = useState<Report>(initialReport);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load saved reports from AsyncStorage on mount
  useEffect(() => {
    loadSavedReports();
    
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Save reports to AsyncStorage whenever they change
  useEffect(() => {
    saveReportsToStorage();
  }, [savedReports]);

  const loadSavedReports = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      
      const reportsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_REPORTS);
      
      if (reportsJson) {
        const parsedReports: Report[] = JSON.parse(reportsJson);
        setSavedReports(parsedReports);
      } else {
        // Load sample data on first launch
        const sampleReports = generateSampleReports();
        setSavedReports(sampleReports);
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_REPORTS, JSON.stringify(sampleReports));
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(ERROR_MESSAGES.LOAD_FAILED);
      
      // Fallback to sample data if storage fails
      try {
        setSavedReports(generateSampleReports());
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError(ERROR_MESSAGES.LOAD_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const saveReportsToStorage = useCallback(async () => {
    try {
      // Don't save empty arrays unnecessarily
      if (savedReports.length === 0) return;
      
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_REPORTS, JSON.stringify(savedReports));
    } catch (err) {
      console.error('Error saving reports:', err);
      setError(ERROR_MESSAGES.SAVE_FAILED);
    }
  }, [savedReports]);

  const updateReport = useCallback((updates: Partial<Report>) => {
    setCurrentReport(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date().toISOString()
    }));
  }, []);

  const addDistrict = useCallback((newDistrict: District) => {
    setCurrentReport(prev => ({
      ...prev,
      districts: [...prev.districts, newDistrict]
    }));
  }, []);

  const updateDistrict = useCallback((districtId: string, updates: Partial<District>) => {
    setCurrentReport(prev => ({
      ...prev,
      districts: prev.districts.map(d =>
        d.id === districtId ? { ...d, ...updates } : d
      )
    }));
  }, []);

  const removeDistrict = useCallback((districtId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      districts: prev.districts.filter(d => d.id !== districtId)
    }));
  }, []);

  const addProblem = useCallback((problem: string): Problem => {
    const newProblem: Problem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 3),
      text: problem,
      completed: false
    };
    setCurrentReport(prev => ({
      ...prev,
      problems: [...prev.problems, newProblem]
    }));
    return newProblem;
  }, []);

  const updateProblem = useCallback((problemId: string, updates: Partial<Problem>) => {
    setCurrentReport(prev => ({
      ...prev,
      problems: prev.problems.map(p =>
        p.id === problemId ? { ...p, ...updates } : p
      )
    }));
  }, []);

  const removeProblem = useCallback((problemId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      problems: prev.problems.filter(p => p.id !== problemId)
    }));
  }, []);

  const addSolution = useCallback((solution: string): Solution => {
    const newSolution: Solution = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 3),
      text: solution,
      completed: false
    };
    setCurrentReport(prev => ({
      ...prev,
      solutions: [...prev.solutions, newSolution]
    }));
    return newSolution;
  }, []);

  const updateSolution = useCallback((solutionId: string, updates: Partial<Solution>) => {
    setCurrentReport(prev => ({
      ...prev,
      solutions: prev.solutions.map(s =>
        s.id === solutionId ? { ...s, ...updates } : s
      )
    }));
  }, []);

  const removeSolution = useCallback((solutionId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      solutions: prev.solutions.filter(s => s.id !== solutionId)
    }));
  }, []);

  const submitReport = useCallback(async (): Promise<Report> => {
    try {
      setIsLoading(true);
      clearError();

      // Validate required fields
      if (!currentReport.groupName.trim()) {
        throw new Error('Group name is required');
      }
      if (!currentReport.groupPastor.trim()) {
        throw new Error('Group pastor name is required');
      }

      const totalAttendance = currentReport.districts.reduce(
        (sum, d) =>
          sum +
          (d.adult?.total || 0) +
          (d.youth?.total || 0) +
          (d.children?.total || 0),
        0
      );

      const totalOfferings = currentReport.districts.reduce(
        (sum, d) => sum + (d.offering || 0),
        0
      );

      const reportId = currentReport.id || 
        `report_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const reportToSave: Report = {
        ...currentReport,
        id: reportId,
        totalAttendance,
        totalOfferings,
        isSubmitted: true,
        synced: isOnline,
        createdAt: currentReport.createdAt || new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      setSavedReports(prev => [reportToSave, ...prev]);
      resetReport();

      return reportToSave;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SUBMIT_FAILED;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentReport, isOnline, clearError]);

  const resetReport = useCallback(() => {
    setCurrentReport(initialReport);
  }, []);

  const loadReport = useCallback((reportId: string) => {
    const report = savedReports.find(r => r.id === reportId);
    if (report) {
      setCurrentReport(report);
      clearError();
    } else {
      setError('Report not found');
    }
  }, [savedReports, clearError]);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      setIsLoading(true);
      clearError();
      
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      
      // If we're currently viewing the deleted report, reset to new report
      if (currentReport.id === reportId) {
        resetReport();
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(ERROR_MESSAGES.DELETE_FAILED);
      throw new Error(ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, [currentReport.id, resetReport, clearError]);

  const syncReports = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!isOnline) {
      setError(ERROR_MESSAGES.NO_INTERNET);
      return { success: false, message: ERROR_MESSAGES.NO_INTERNET };
    }

    try {
      setIsLoading(true);
      clearError();
      
      const unsyncedReports = savedReports.filter(r => !r.synced && r.isSubmitted);
      
      if (unsyncedReports.length === 0) {
        return { success: true, message: 'All reports are already synced' };
      }
      
      // Simulate syncing (will be replaced with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSavedReports(prev => prev.map(r => ({ ...r, synced: true })));
      
      return { success: true, message: `${unsyncedReports.length} reports synced successfully` };
    } catch (err) {
      console.error('Error syncing reports:', err);
      setError(ERROR_MESSAGES.SYNC_FAILED);
      return { success: false, message: ERROR_MESSAGES.SYNC_FAILED };
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, savedReports, clearError]);

  // Memoize computed values
  const memoizedValue = useMemo<ReportContextType>(() => ({
    currentReport,
    savedReports,
    isOnline,
    isLoading,
    error,
    updateReport,
    addDistrict,
    updateDistrict,
    removeDistrict,
    addProblem,
    updateProblem,
    removeProblem,
    addSolution,
    updateSolution,
    removeSolution,
    submitReport,
    resetReport,
    loadReport,
    deleteReport,
    syncReports,
    clearError
  }), [
    currentReport,
    savedReports,
    isOnline,
    isLoading,
    error,
    updateReport,
    addDistrict,
    updateDistrict,
    removeDistrict,
    addProblem,
    updateProblem,
    removeProblem,
    addSolution,
    updateSolution,
    removeSolution,
    submitReport,
    resetReport,
    loadReport,
    deleteReport,
    syncReports,
    clearError
  ]);

  return (
    <ReportContext.Provider value={memoizedValue}>
      {children}
    </ReportContext.Provider>
  );
};