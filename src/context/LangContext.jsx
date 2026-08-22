import { createContext, useContext, useState } from 'react'

const LangContext = createContext({ lang: 'en', t: (k) => k, setLang: () => {} })

export const translations = {
  en: {
    // Language toggle
    english: 'English', amharic: 'አማርኛ',

    // Navbar / Home
    about: 'About', academics: 'Academics', announcements: 'Announcements',
    contact: 'Contact', services: 'Services',
    parentPortal: 'Parent Portal', staffLogin: 'Staff Login',
    portalAccess: 'Portal Access',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    heroBadge: '☪ Islamic Academy — Est. 2010',
    heroWelcome: 'Welcome to', heroName: 'Hidaya', heroSubTitle: 'Islamic Academy',
    heroTagline: '"Seeking knowledge is an obligation upon every Muslim." — Prophet Muhammad ﷺ',
    heroDesc: 'Nurturing minds with Islamic values and academic excellence. A complete school management system for students, teachers, parents and staff.',

    // Sidebar
    dashboard: 'Dashboard', backToHome: 'Back to Home',

    // Sidebar items
    overview: 'Overview', myCalendar: 'My Calendar', attendance: 'Attendance',
    dailyTopics: 'Daily Topics', results: 'Results', viewSubmitted: 'View Submitted',
    receivedFiles: 'Received Files', calendar: 'Calendar',
    taskMonitoring: 'Task Monitoring', teacherAttendance: 'Teacher Attendance',
    performanceReport: 'Performance Report', students: 'Students',
    studentResults: 'Student Results', teachers: 'Teachers', assistants: 'Assistants',
    assignTasks: 'Assign Tasks', reports: 'Reports', studentResultsLabel: 'Student Results',
    analytics: 'Analytics', people: 'People', schoolRanking: 'School Ranking',
    strategicControl: 'Strategic Control',

    // Teacher overview
    welcomeBack: 'Welcome back', hereIsYourOverview: "Here's your daily overview",
    todayClasses: "Today's Classes", periods: 'periods',
    confirmAttendance: 'Confirm Attendance', confirmed: 'Attendance Confirmed',
    confirmToday: 'Confirm Today', confirm: 'Confirm',
    thisWeek: 'This Week', openFullCalendar: 'Open Full Calendar',
    todayTopic: "Today's Topic", addTopic: 'Add Topic', viewTopic: 'View Topic',
    noTopicYet: 'No topic submitted yet today.',
    attendanceThisWeek: 'Attendance (This Week)',
    manageResults: 'Manage Results', noResults: 'No results submitted yet.',
    submittedWork: 'Submitted Work', viewAllSubmitted: 'View All Submitted',
    noSubmitted: 'Nothing submitted today.',
    openFiles: 'Open Files', noFiles: 'No files received yet.',
    pending: 'Pending', upcoming: 'Upcoming',
    attendanceMarked: 'Attendance marked for today',
    topicSubmitted: 'Topic submitted',
    caSubmitted: 'CA results submitted for',
    newFiles: 'new file', newFilesPlural: 'new files',

    // Attendance page
    markAttendance: 'Mark Attendance',
    today: 'Today',
    attendanceSubmitted: 'Attendance submitted — locked for today',
    submitAttendance: 'Submit Attendance',
    present: 'Present', absent: 'Absent', late: 'Late',

    // Topics page
    dailyTopicSubmission: 'Daily Topic Submission',
    topicSubmittedLocked: 'Topic submitted — locked for today',
    lessonTopic: 'Lesson Topic', description: 'Description',
    topicPlaceholder: 'e.g. Introduction to Algebra',
    descPlaceholder: 'Describe what was covered in today\'s lesson...',
    submitTopic: 'Submit Topic',

    // Results page
    studentResultsCA: 'Student Results — CA Entry',
    subject: 'Subject', caParts: 'CA Parts',
    submitCAMarks: 'Submit CA Marks',
    caSummary: 'CA Summary',

    // Files page
    noFilesReceived: 'No files received yet',
    filesWillAppear: 'Files sent by the Manager will appear here',
    from: 'From', manager: 'Manager',
    viewOnly: 'View Only', downloadAllowed: 'Download Allowed',
    accept: 'Accept', reject: 'Reject', download: 'Download',

    // Login
    loginTitle: 'Login', enterCredentials: 'Enter your credentials to access your dashboard',
    staffId: 'Staff ID / Username', password: 'Password',
    enterYourId: 'Enter your', enterPassword: 'Enter your password',
    signingIn: 'Signing in...', signInAs: 'Sign in as',
    demoMode: 'Demo mode — any credentials will work',
    teacherIds: 'Teacher IDs',

    // Role select
    selectRole: 'Select Your Role', chooseRole: 'Choose how you want to access the system',
    continueAs: 'Continue as',

    // Map section
    findUs: 'Find Us', visitUs: 'Visit Hidaya Islamic Academy',
    visitDesc: 'Come visit us — we would love to welcome you to our campus.',
    joinUs: 'Join Us', contactManager: 'Contact Manager',

    // Home page sections
    ourHistory: 'Our History',
    aboutTitle: 'About Hidaya Islamic Academy',
    aboutPara1: 'Hidaya Islamic Academy has been a beacon of Islamic education since 2010. We combine rigorous academic curriculum with deep-rooted Islamic values, preparing students to be confident, knowledgeable and God-conscious individuals.',
    aboutPara2: 'Our school management system ensures full transparency for parents, accountability for teachers, and seamless administration for management — all in one unified platform.',
    ourValues: 'Our Values',
    exploreMore: 'Explore More →',
    curriculumLabel: 'Curriculum',
    academicProgrammes: 'Academic Programmes',
    academicSub: 'A balanced blend of Islamic and modern sciences, designed to nurture well-rounded, God-conscious graduates.',
    servicesLabel: 'What We Offer',
    servicesTitle: 'OUR SERVICES',
    servicesSub: 'Hidaya Islamic Academy provides a complete range of educational services, combining Islamic values with modern academic excellence.',
    rolesLabel: 'Role-Based Access',
    rolesTitle: 'One Platform, Every Role',
    teamLabel: '✦ Meet The Experts ✦',
    teamTitle: 'Our Management Team',
    teamSub: 'Dedicated professionals committed to nurturing the next generation with Islamic values and academic excellence.',
    islamicBanner: 'Knowledge is the light that guides the believer on the path of righteousness',

    // Manager dashboard
    manageStudents: 'Manage Students', manageTeachers: 'Manage Teachers',
    manageAssistants: 'Manage Assistants', assignTasksTitle: 'Assign Tasks',
    approveAcademic: 'Approve Academic Data', viewAllReports: 'View All Reports',
    studentManagement: 'Student Management', teacherManagement: 'Teacher Management',
    assistantManagement: 'Assistant Management',
    searchStudents: 'Search by name, ID or grade...',
    semesterOne: 'Semester One', semesterTwo: 'Semester Two', finalYear: 'Final Year Result',

    // Reports
    reportsTitle: 'Reports', reportsReadOnly: 'Reports are READ-ONLY',
    studentPerf: 'Student Performance', teacherTaskRate: 'Teacher Task Rate',
    attendanceRate: 'Attendance Rate', topClass: 'Top Class',
    studentPerfTrend: 'Student Performance Trend',
    monthlyAvg: 'Monthly avg score — Jan to Jun 2026',
    teacherTaskCompletion: 'Teacher Task Completion',
    perTeacher: 'Per teacher — current term',
    attendanceBreakdown: 'Attendance Breakdown',
    studTeachAsst: 'Students · Teachers · Assistants',
    gradeDistribution: 'Grade Distribution',
    studentsByGrade: 'Students by grade level',
    teachers4: '4 teachers',

    // Days / Months
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
    jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
    jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',

    // Read only
    readOnly: 'Submitted data is READ-ONLY (cannot be edited)',
  },

  am: {
    // Language toggle
    english: 'English', amharic: 'አማርኛ',

    // Navbar / Home
    Home: "መነሻ", about: 'ስለ እኛ', academics: 'ትምህርት', announcements: 'ማስታወቂያዎች',
    contact: 'ያግኙን', services: 'አገልግሎቶች',
    parentPortal: 'የወላጅ ፖርታል', staffLogin: 'የሰራተኛ መግቢያ',
    portalAccess: 'ፖርታል መዳረሻ',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    heroBadge: '☪ እስላማዊ አካዳሚ — ከ2010 ጀምሮ',
    heroWelcome: 'እንኳን ደህና መጡ', heroName: 'ሂዳያ', heroSubTitle: 'እስላማዊ አካዳሚ',
    heroTagline: '"እውቀትን መፈለግ ለእያንዳንዱ ሙስሊም ግዴታ ነው።" — ነቢዩ ሙሐመድ ﷺ',
    heroDesc: 'አዕምሮዎችን በእስላማዊ እሴቶች እና ትምህርታዊ ብቃት ማሳደግ። ለተማሪዎች፣ ለአስተማሪዎች፣ ለወላጆች እና ለሰራተኞች የተሟላ የትምህርት ቤት አስተዳደር ስርዓት።',

    // Home page
    Play:"በጭዋታ",learn:"በትምህርት", and:"እና" ,grow:"በእድገት",
    // Sidebar
    dashboard: 'ዳሽቦርድ', backToHome: 'ወደ መነሻ ተመለስ',

    // Sidebar items
    overview: 'አጠቃላይ እይታ', myCalendar: 'የእኔ ቀን መቁጠሪያ', attendance: 'መገኘት',
    dailyTopics: 'ዕለታዊ ርዕሶች', results: 'ውጤቶች', viewSubmitted: 'የቀረቡ ይመልከቱ',
    receivedFiles: 'የተቀበሉ ፋይሎች', calendar: 'ቀን መቁጠሪያ',
    taskMonitoring: 'ተግባር ክትትል', teacherAttendance: 'የአስተማሪ መገኘት',
    performanceReport: 'የአፈጻጸም ሪፖርት', students: 'ተማሪዎች',
    studentResults: 'የተማሪ ውጤቶች', teachers: 'አስተማሪዎች', assistants: 'ረዳቶች',
    assignTasks: 'ተግባር ምደባ', reports: 'ሪፖርቶች', studentResultsLabel: 'የተማሪ ውጤቶች',
    analytics: 'ትንታኔ', people: 'ሰዎች', schoolRanking: 'የትምህርት ቤት ደረጃ',
    strategicControl: 'ስትራቴጂካዊ ቁጥጥር',

    // Teacher overview
    welcomeBack: 'እንኳን ደህና ተመለሱ', hereIsYourOverview: 'የዛሬ አጠቃላይ እይታ',
    todayClasses: 'የዛሬ ክፍሎች', periods: 'ክፍለ ጊዜዎች',
    confirmAttendance: 'መገኘት አረጋግጥ', confirmed: 'መገኘት ተረጋግጧል',
    confirmToday: 'ዛሬ አረጋግጥ', confirm: 'አረጋግጥ',
    thisWeek: 'ይህ ሳምንት', openFullCalendar: 'ሙሉ ቀን መቁጠሪያ ክፈት',
    todayTopic: 'የዛሬ ርዕስ', addTopic: 'ርዕስ ጨምር', viewTopic: 'ርዕስ ይመልከቱ',
    noTopicYet: 'ዛሬ ምንም ርዕስ አልቀረበም።',
    attendanceThisWeek: 'የዚህ ሳምንት መገኘት',
    manageResults: 'ውጤቶችን አስተዳድር', noResults: 'እስካሁን ምንም ውጤት አልቀረበም።',
    submittedWork: 'የቀረቡ ስራዎች', viewAllSubmitted: 'ሁሉንም ቀረቦ ይመልከቱ',
    noSubmitted: 'ዛሬ ምንም አልቀረበም።',
    openFiles: 'ፋይሎች ክፈት', noFiles: 'እስካሁን ምንም ፋይል አልተቀበለም።',
    pending: 'በመጠባበቅ ላይ', upcoming: 'ሊመጣ ያለ',
    attendanceMarked: 'ዛሬ መገኘት ተመዝግቧል',
    topicSubmitted: 'ርዕስ ቀርቧል',
    caSubmitted: 'CA ውጤቶች ቀርበዋል',
    newFiles: 'አዲስ ፋይል', newFilesPlural: 'አዲስ ፋይሎች',

    // Attendance page
    markAttendance: 'መገኘት ምዝገባ',
    today: 'ዛሬ',
    attendanceSubmitted: 'መገኘት ቀርቧል — ለዛሬ ተቆልፏል',
    submitAttendance: 'መገኘት አስገባ',
    present: 'ተገኝቷል', absent: 'አልተገኘም', late: 'ዘግይቷል',

    // Topics page
    dailyTopicSubmission: 'ዕለታዊ ርዕስ ማስገቢያ',
    topicSubmittedLocked: 'ርዕስ ቀርቧል — ለዛሬ ተቆልፏል',
    lessonTopic: 'የትምህርት ርዕስ', description: 'መግለጫ',
    topicPlaceholder: 'ለምሳሌ፡ ወደ አልጀብራ መግቢያ',
    descPlaceholder: 'ዛሬ ምን እንደተሸፈነ ይግለጹ...',
    submitTopic: 'ርዕስ አስገባ',

    // Results page
    studentResultsCA: 'የተማሪ ውጤቶች — CA ማስገቢያ',
    subject: 'ትምህርት', caParts: 'CA ክፍሎች',
    submitCAMarks: 'CA ውጤቶች አስገባ',
    caSummary: 'CA ማጠቃለያ',

    // Files page
    noFilesReceived: 'እስካሁን ምንም ፋይል አልተቀበለም',
    filesWillAppear: 'በአስተዳዳሪ የተላኩ ፋይሎች እዚህ ይታያሉ',
    from: 'ከ', manager: 'አስተዳዳሪ',
    viewOnly: 'ማየት ብቻ', downloadAllowed: 'ማውረድ ይፈቀዳል',
    accept: 'ተቀበል', reject: 'ውድቅ አድርግ', download: 'አውርድ',

    // Login
    loginTitle: 'መግቢያ', enterCredentials: 'ዳሽቦርድዎን ለመድረስ ምስክርነቶችዎን ያስገቡ',
    staffId: 'የሰራተኛ መታወቂያ', password: 'የይለፍ ቃል',
    enterYourId: 'የእርስዎን ያስገቡ', enterPassword: 'የይለፍ ቃልዎን ያስገቡ',
    signingIn: 'በመግባት ላይ...', signInAs: 'እንደ ይግቡ',
    demoMode: 'ሙከራ ሁነታ — ማንኛውም ምስክርነት ይሰራል',
    teacherIds: 'የአስተማሪ መታወቂያዎች',

    // Role select
    selectRole: 'ሚናዎን ይምረጡ', chooseRole: 'ስርዓቱን እንዴት ማግኘት እንደሚፈልጉ ይምረጡ',
    continueAs: 'እንደ ቀጥሉ',

    // Map section
    findUs: 'ያግኙን', visitUs: 'ሂዳያ እስላማዊ አካዳሚን ይጎብኙ',
    visitDesc: 'ጎብኙን — ወደ ካምፓሳችን እንኳን ደህና መጡ።',
    joinUs: 'ይቀላቀሉን', contactManager: 'አስተዳዳሪን ያግኙ',

    // Home page sections
    ourHistory: 'ታሪካችን',
    aboutTitle: 'ስለ ሂዳያ እስላማዊ አካዳሚ',
    aboutPara1: 'ሂዳያ እስላማዊ አካዳሚ ከ2010 ጀምሮ የእስላማዊ ትምህርት ምሰሶ ሆኖ አገልግሏል። ጠንካራ ትምህርታዊ ሥርዓትን ከጥልቅ እስላማዊ እሴቶች ጋር አጣምረን ተማሪዎቻችንን ብቁ፣ ዕውቀት ያላቸው እና አምላክን የሚፈሩ ዜጎች እናደርጋቸዋለን።',
    aboutPara2: 'የትምህርት ቤቱ አስተዳደር ስርዓታችን ለወላጆች ሙሉ ግልጽነት፣ ለአስተማሪዎች ተጠያቂነት እና ለአስተዳደር ቀልጣፋ አሠራር ያረጋግጣል — ሁሉም በአንድ የተዋሃደ መድረክ።',
    ourValues: 'እሴቶቻችን',
    exploreMore: 'ተጨማሪ ያስሱ →',
    curriculumLabel: 'ሥርዓተ ትምህርት',
    academicProgrammes: 'የትምህርት ፕሮግራሞች',
    academicSub: 'ሚዛናዊ የእስላማዊ እና ዘመናዊ ሳይንሶች ጥምረት፣ ሁለንተናዊ ምሩቃን ለማፍራት የተዘጋጀ።',
    servicesLabel: 'የምናቀርበው',
    servicesTitle: 'አገልግሎቶቻችን',
    servicesSub: 'ሂዳያ እስላማዊ አካዳሚ እስላማዊ እሴቶችን ከዘመናዊ ትምህርታዊ ብቃት ጋር አጣምሮ ሙሉ የትምህርት አገልግሎቶችን ያቀርባል።',
    rolesLabel: 'ሚና ላይ የተመሰረተ ተደራሽነት',
    rolesTitle: 'አንድ መድረክ፣ ሁሉም ሚናዎች',
    teamLabel: '✦ ባለሙያዎቹን ያግኙ ✦',
    teamTitle: 'የአስተዳደር ቡድናችን',
    teamSub: 'ቀጣዩን ትውልድ በእስላማዊ እሴቶች እና ትምህርታዊ ብቃት ለማሳደግ ቁርጠኛ የሆኑ ባለሙያዎች።',
    islamicBanner: 'እውቀት ምዕምኑን በጽድቅ መንገድ የሚመራ ብርሃን ነው',

    // Manager dashboard
    manageStudents: 'ተማሪዎችን አስተዳድር', manageTeachers: 'አስተማሪዎችን አስተዳድር',
    manageAssistants: 'ረዳቶችን አስተዳድር', assignTasksTitle: 'ተግባር ምደባ',
    approveAcademic: 'ትምህርታዊ ውሂብ ያፅድቁ', viewAllReports: 'ሁሉንም ሪፖርቶች ይመልከቱ',
    studentManagement: 'የተማሪ አስተዳደር', teacherManagement: 'የአስተማሪ አስተዳደር',
    assistantManagement: 'የረዳት አስተዳደር',
    searchStudents: 'በስም፣ መታወቂያ ወይም ክፍል ይፈልጉ...',
    semesterOne: 'የመጀመሪያ ሴሚስተር', semesterTwo: 'ሁለተኛ ሴሚስተር', finalYear: 'የዓመቱ ውጤት',

    // Reports
    reportsTitle: 'ሪፖርቶች', reportsReadOnly: 'ሪፖርቶች ለማንበብ ብቻ ናቸው',
    studentPerf: 'የተማሪ አፈጻጸም', teacherTaskRate: 'የአስተማሪ ተግባር ምጣኔ',
    attendanceRate: 'የመገኘት ምጣኔ', topClass: 'ምርጥ ክፍል',
    studentPerfTrend: 'የተማሪ አፈጻጸም አዝማሚያ',
    monthlyAvg: 'ወርሃዊ አማካይ ውጤት — ጃን እስከ ጁን 2026',
    teacherTaskCompletion: 'የአስተማሪ ተግባር ማጠናቀቂያ',
    perTeacher: 'በአስተማሪ — የአሁኑ ሴሚስተር',
    attendanceBreakdown: 'የመገኘት ዝርዝር',
    studTeachAsst: 'ተማሪዎች · አስተማሪዎች · ረዳቶች',
    gradeDistribution: 'የክፍል ደረጃ ስርጭት',
    studentsByGrade: 'ተማሪዎች በክፍል ደረጃ',
    teachers4: '4 አስተማሪዎች',

    // Days / Months
    mon: 'ሰኞ', tue: 'ማክሰኞ', wed: 'ረቡዕ', thu: 'ሐሙስ', fri: 'አርብ', sat: 'ቅዳሜ', sun: 'እሁድ',
    jan: 'ጃን', feb: 'ፌብ', mar: 'ማር', apr: 'ኤፕ', may: 'ሜይ', jun: 'ጁን',
    jul: 'ጁላ', aug: 'ኦገ', sep: 'ሴፕ', oct: 'ኦክ', nov: 'ኖቭ', dec: 'ዲሴ',

    // Read only
    readOnly: 'የቀረቡ ውሂቦች ለማንበብ ብቻ ናቸው (ሊስተካከሉ አይችሉም)',
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('hidaya_lang') || 'en')

  const setLang = (l) => {
    setLangState(l)
    localStorage.setItem('hidaya_lang', l)
  }

  const t = (key) => translations[lang][key] ?? translations['en'][key] ?? key

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
