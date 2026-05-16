import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Nav
      dashboard: 'Dashboard',
      students: 'Students',
      timetable: 'Timetable',
      attendance: 'Attendance',
      settings: 'Settings',
      language: 'Language',
      logout: 'Log Out',
      qrAttendance: 'QR Attendance',
      auditTrail: 'Audit Trail',

      // Dashboard
      totalEnrolled: 'Total Enrolled',
      presentToday: 'Present Today',
      absentToday: 'Absent Today',
      lateArrivals: 'Late Arrivals',
      exportToExcel: 'Export to Excel',
      overview: 'Overview',
      academics: 'Academics',
      announcements: 'Announcements',
      admin: 'Admin',
      welcomeBack: 'Welcome back',
      riskAlert: 'Risk Alert',
      viewStudents: 'View Students',
      attendanceTrend: 'College Attendance Trend (Weekly)',
      sectionWise: 'Section-wise Attendance',

      // Students table headers
      usn: 'USN',
      branch: 'Branch',
      semSec: 'Sem / Sec',
      faceStatus: 'Face Status',
      actions: 'Actions',
      enrolledStatus: 'ENROLLED',
      pendingStatus: 'PENDING',
      manageEnrollments: 'Manage enrollments and face registration status.',
      bulkImport: 'Bulk Import',
      addStudent: 'Add Student',
      totalStudents: 'Total Students',
      enrolled: 'Enrolled',
      pending: 'Pending',
      atRisk: 'At Risk (<75%)',
      searchStudent: 'Search by name or USN...',
      allBranches: 'All Branches',
      allStatus: 'All Status',
      registerFace: 'Register Face',
      noStudents: 'No students match your filters.',

      // Timetable
      timetableTitle: 'Timetable',
      manageSchedule: 'Manage class schedules and room assignments.',
      uploadExcel: 'Upload Excel',
      weeklyOverview: 'Weekly Overview',

      // Attendance
      photoAttendance: 'Photo Attendance',
      instantAI: 'Instant AI detection with spatial verification.',
      selectSubject: 'Select Subject:',
      changePhoto: 'Change Photo',
      selectPhoto: 'Select Photo',
      processAI: 'Process AI',
      detectionAnalysis: 'Detection Analysis',
      facesDetected: 'Faces',
      matches: 'Matches',
      awaitingUpload: 'Awaiting upload...',

      // Settings
      settingsTitle: 'Settings',
      configureSystem: 'Configure system parameters and integrations.',
      saveChanges: 'Save Changes',
      attendanceRules: 'Attendance Rules',
      faceRecognition: 'Face Recognition',
      geoFencing: 'Geo-Fencing',
      notifications: 'Notifications',
      systemStatus: 'System Status',

      // Login
      loginAs: 'Login as',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      helpDesk: 'Help Desk',
    }
  },
  kn: {
    translation: {
      // Nav
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      students: 'ವಿದ್ಯಾರ್ಥಿಗಳು',
      timetable: 'ಸಮಯಪಟ್ಟಿ',
      attendance: 'ಹಾಜರಾತಿ',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      language: 'ಭಾಷೆ',
      logout: 'ಲಾಗ್ ಔಟ್',
      qrAttendance: 'QR ಹಾಜರಾತಿ',
      auditTrail: 'ಆಡಿಟ್ ದಾಖಲೆ',

      // Dashboard
      totalEnrolled: 'ಒಟ್ಟು ನೋಂದಾಯಿತ',
      presentToday: 'ಇಂದು ಹಾಜರು',
      absentToday: 'ಇಂದು ಗೈರು',
      lateArrivals: 'ತಡ ಆಗಮನ',
      exportToExcel: 'ಎಕ್ಸೆಲ್‌ಗೆ ರಫ್ತು',
      overview: 'ಅವಲೋಕನ',
      academics: 'ಶೈಕ್ಷಣಿಕ',
      announcements: 'ಪ್ರಕಟಣೆಗಳು',
      admin: 'ಆಡಳಿತ',
      welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ',
      riskAlert: 'ಅಪಾಯ ಎಚ್ಚರಿಕೆ',
      viewStudents: 'ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ನೋಡಿ',
      attendanceTrend: 'ಕಾಲೇಜು ಹಾಜರಾತಿ ಪ್ರವೃತ್ತಿ (ವಾರಾಂತ್ಯ)',
      sectionWise: 'ವಿಭಾಗವಾರು ಹಾಜರಾತಿ',

      // Students table headers
      usn: 'USN',
      branch: 'ಶಾಖೆ',
      semSec: 'ಸೆಮ್ / ಸೆಕ್',
      faceStatus: 'ಮುಖ ಸ್ಥಿತಿ',
      actions: 'ಕ್ರಿಯೆಗಳು',
      enrolledStatus: 'ನೋಂದಾಯಿತ',
      pendingStatus: 'ಬಾಕಿ',
      manageEnrollments: 'ನೋಂದಣಿ ಮತ್ತು ಮುಖ ನೋಂದಣಿ ಸ್ಥಿತಿ ನಿರ್ವಹಿಸಿ.',
      bulkImport: 'ಬಲ್ಕ್ ಆಮದು',
      addStudent: 'ವಿದ್ಯಾರ್ಥಿ ಸೇರಿಸಿ',
      totalStudents: 'ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು',
      enrolled: 'ನೋಂದಾಯಿತ',
      pending: 'ಬಾಕಿ',
      atRisk: 'ಅಪಾಯದಲ್ಲಿ (<75%)',
      searchStudent: 'ಹೆಸರು ಅಥವಾ USN ಮೂಲಕ ಹುಡುಕಿ...',
      allBranches: 'ಎಲ್ಲಾ ಶಾಖೆಗಳು',
      allStatus: 'ಎಲ್ಲಾ ಸ್ಥಿತಿ',
      registerFace: 'ಮುಖ ನೋಂದಾಯಿಸಿ',
      noStudents: 'ಯಾವ ವಿದ್ಯಾರ್ಥಿಗಳೂ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.',

      // Timetable
      timetableTitle: 'ಸಮಯಪಟ್ಟಿ',
      manageSchedule: 'ತರಗತಿ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಕೊಠಡಿ ನಿಯೋಜನೆ ನಿರ್ವಹಿಸಿ.',
      uploadExcel: 'ಎಕ್ಸೆಲ್ ಅಪ್‌ಲೋಡ್',
      weeklyOverview: 'ವಾರದ ಅವಲೋಕನ',

      // Attendance
      photoAttendance: 'ಫೋಟೋ ಹಾಜರಾತಿ',
      instantAI: 'ತ್ವರಿತ AI ಪತ್ತೆ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಪರಿಶೀಲನೆ.',
      selectSubject: 'ವಿಷಯ ಆಯ್ಕೆ ಮಾಡಿ:',
      changePhoto: 'ಫೋಟೋ ಬದಲಿಸಿ',
      selectPhoto: 'ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ',
      processAI: 'AI ಪ್ರಕ್ರಿಯೆ',
      detectionAnalysis: 'ಪತ್ತೆ ವಿಶ್ಲೇಷಣೆ',
      facesDetected: 'ಮುಖಗಳು',
      matches: 'ಹೊಂದಾಣಿಕೆಗಳು',
      awaitingUpload: 'ಅಪ್‌ಲೋಡ್ ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ...',

      // Settings
      settingsTitle: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      configureSystem: 'ಸಿಸ್ಟಮ್ ನಿಯತಾಂಕಗಳು ಮತ್ತು ಏಕೀಕರಣಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ.',
      saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
      attendanceRules: 'ಹಾಜರಾತಿ ನಿಯಮಗಳು',
      faceRecognition: 'ಮುಖ ಗುರುತಿಸುವಿಕೆ',
      geoFencing: 'ಜಿಯೋ-ಫೆನ್ಸಿಂಗ್',
      notifications: 'ಅಧಿಸೂಚನೆಗಳು',
      systemStatus: 'ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ',

      // Login
      loginAs: 'ಲಾಗಿನ್ ಆಗಿ',
      password: 'ಪಾಸ್‌ವರ್ಡ್',
      forgotPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
      helpDesk: 'ಸಹಾಯ ಕೇಂದ್ರ',
    }
  },
  hi: {
    translation: {
      // Nav
      dashboard: 'डैशबोर्ड',
      students: 'छात्र',
      timetable: 'समय सारणी',
      attendance: 'उपस्थिति',
      settings: 'सेटिंग्स',
      language: 'भाषा',
      logout: 'लॉग आउट',
      qrAttendance: 'QR उपस्थिति',
      auditTrail: 'ऑडिट ट्रेल',

      // Dashboard
      totalEnrolled: 'कुल नामांकित',
      presentToday: 'आज उपस्थित',
      absentToday: 'आज अनुपस्थित',
      lateArrivals: 'देर से आने वाले',
      exportToExcel: 'एक्सेल में निर्यात',
      overview: 'अवलोकन',
      academics: 'शैक्षणिक',
      announcements: 'घोषणाएं',
      admin: 'प्रशासन',
      welcomeBack: 'वापस स्वागत है',
      riskAlert: 'जोखिम चेतावनी',
      viewStudents: 'छात्र देखें',
      attendanceTrend: 'कॉलेज उपस्थिति प्रवृत्ति (साप्ताहिक)',
      sectionWise: 'अनुभाग-वार उपस्थिति',

      // Students table headers
      usn: 'USN',
      branch: 'शाखा',
      semSec: 'सेम / सेक',
      faceStatus: 'चेहरा स्थिति',
      actions: 'क्रियाएं',
      enrolledStatus: 'नामांकित',
      pendingStatus: 'लंबित',
      manageEnrollments: 'नामांकन और चेहरा पंजीकरण स्थिति प्रबंधित करें।',
      bulkImport: 'बल्क आयात',
      addStudent: 'छात्र जोड़ें',
      totalStudents: 'कुल छात्र',
      enrolled: 'नामांकित',
      pending: 'लंबित',
      atRisk: 'जोखिम में (<75%)',
      searchStudent: 'नाम या USN से खोजें...',
      allBranches: 'सभी शाखाएं',
      allStatus: 'सभी स्थिति',
      registerFace: 'चेहरा पंजीकृत करें',
      noStudents: 'कोई छात्र मेल नहीं खाता।',

      // Timetable
      timetableTitle: 'समय सारणी',
      manageSchedule: 'कक्षा कार्यक्रम और कमरा असाइनमेंट प्रबंधित करें।',
      uploadExcel: 'एक्सेल अपलोड करें',
      weeklyOverview: 'साप्ताहिक अवलोकन',

      // Attendance
      photoAttendance: 'फोटो उपस्थिति',
      instantAI: 'तत्काल AI पहचान के साथ स्थानिक सत्यापन।',
      selectSubject: 'विषय चुनें:',
      changePhoto: 'फोटो बदलें',
      selectPhoto: 'फोटो चुनें',
      processAI: 'AI प्रक्रिया',
      detectionAnalysis: 'पहचान विश्लेषण',
      facesDetected: 'चेहरे',
      matches: 'मिलान',
      awaitingUpload: 'अपलोड की प्रतीक्षा...',

      // Settings
      settingsTitle: 'सेटिंग्स',
      configureSystem: 'सिस्टम पैरामीटर और एकीकरण कॉन्फ़िगर करें।',
      saveChanges: 'परिवर्तन सहेजें',
      attendanceRules: 'उपस्थिति नियम',
      faceRecognition: 'चेहरा पहचान',
      geoFencing: 'जियो-फेंसिंग',
      notifications: 'सूचनाएं',
      systemStatus: 'सिस्टम स्थिति',

      // Login
      loginAs: 'लॉगिन करें',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      helpDesk: 'हेल्प डेस्क',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
