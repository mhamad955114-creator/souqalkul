export type Language = "ar" | "en" | "tr";

export interface Translations {
  // General
  appName: string;
  appLogo: string;
  
  // Navigation
  nav: {
    home: string;
    categories: string;
    offers: string;
    contact: string;
    addListing: string;
    myListings: string;
    myOrders: string;
    favorites: string;
    messages: string;
    settings: string;
    adminPanel: string;
    signIn: string;
    signOut: string;
    myAccount: string;
    addAd: string;
  };

  // Hero
  hero: {
    title1: string;
    titleHighlight: string;
    subtitle: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    detectLocation: string;
    search: string;
    activeAds: string;
    users: string;
    categoriesCount: string;
  };

  // Categories
  categories: {
    browseByCategory: string;
    chooseCategoryDesc: string;
    cars: string;
    realEstate: string;
    electronics: string;
    clothing: string;
    furniture: string;
    jobs: string;
    games: string;
    services: string;
    dating: string;
    pets: string;
    industrial: string;
    agricultural: string;
    other: string;
    allCategories: string;
    ad: string;
  };

  // Cities
  cities: {
    damascus: string;
    aleppo: string;
    homs: string;
    hama: string;
    latakia: string;
    tartus: string;
    deirEzZor: string;
    raqqa: string;
    hasaka: string;
    daraa: string;
    sweida: string;
    idlib: string;
    quneitra: string;
    rifDimashq: string;
    allCities: string;
  };

  // Listings
  listings: {
    latestListings: string;
    viewAll: string;
    noListings: string;
    allListings: string;
    browseAds: string;
    featured: string;
    search: string;
    filters: string;
    filterListings: string;
    category: string;
    city: string;
    area: string;
    allAreas: string;
    priceRange: string;
    sortBy: string;
    clearFilters: string;
    newest: string;
    oldest: string;
    priceAsc: string;
    priceDesc: string;
    searchIn: string;
    ad: string;
    available: string;
  };

  // Listing Details
  details: {
    back: string;
    description: string;
    noDescription: string;
    sellerInfo: string;
    member: string;
    memberSince: string;
    call: string;
    whatsapp: string;
    chatWithSeller: string;
    reportListing: string;
    noPhone: string;
    views: string;
    safetyTips: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
  };

  // Auth
  auth: {
    login: string;
    signup: string;
    phone: string;
    verifyCode: string;
    sendCode: string;
    fullName: string;
    welcomeBack: string;
    createAccount: string;
    email: string;
    password: string;
    enterFullName: string;
    enterPassword: string;
    processing: string;
    noAccount: string;
    hasAccount: string;
    loginSuccess: string;
    loginError: string;
    signupSuccess: string;
    signupError: string;
    fullNameRequired: string;
  };

  // Report
  report: {
    title: string;
    reason: string;
    details: string;
    submit: string;
    alreadyReported: string;
    success: string;
    error: string;
    selectReason: string;
    reasons: {
      inappropriate: string;
      fraud: string;
      fakePrice: string;
      stolenImages: string;
      spam: string;
      other: string;
    };
  };

  // Footer
  footer: {
    about: string;
    aboutDesc: string;
    quickLinks: string;
    categoriesTitle: string;
    contactUs: string;
    rights: string;
    privacy: string;
    terms: string;
  };

  // Admin
  admin: {
    dashboard: string;
    statsAndReports: string;
    activeAds: string;
    registeredUsers: string;
    reportsSubmitted: string;
    totalViews: string;
    categoryDistribution: string;
    dailyListings: string;
    pending: string;
    reviewed: string;
    resolved: string;
    dismissed: string;
    allReports: string;
    reports: string;
    listing: string;
    reporter: string;
    reasonCol: string;
    date: string;
    status: string;
    actions: string;
    reportDetails: string;
    changeStatus: string;
    viewListing: string;
    deleteListing: string;
    confirmDelete: string;
    confirmDeleteDesc: string;
    cancel: string;
    delete: string;
    noReports: string;
    noReportsDesc: string;
    exportCsv: string;
    exportReports: string;
    exportListings: string;
    exportUsers: string;
    filterByStatus: string;
    adCount: string;
    deletedListing: string;
    user: string;
  };

  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    confirm: string;
    syp: string;
    minutesAgo: string;
    hoursAgo: string;
    dayAgo: string;
    daysAgo: string;
    weekAgo: string;
  };

  // Ratings
  ratings: {
    title: string;
    addRating: string;
    noRatings: string;
    comment: string;
    submit: string;
  };

  // Messages / Chat
  messages: {
    title: string;
    noMessages: string;
    typeMessage: string;
    send: string;
    noConversations: string;
    startFromListing: string;
    startNow: string;
    user: string;
    listing: string;
    you: string;
    conversation: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    darkMode: string;
    darkModeDesc: string;
    lightMode: string;
    notifications: string;
    editProfile: string;
    backToListings: string;
    profilePicture: string;
    profilePictureDesc: string;
    clickToChange: string;
    maxSize: string;
    personalInfo: string;
    basicInfo: string;
    email: string;
    emailCantChange: string;
    fullName: string;
    fullNamePlaceholder: string;
    contactInfo: string;
    contactInfoDesc: string;
    phone: string;
    phonePlaceholder: string;
    phoneHint: string;
    phoneError: string;
    location: string;
    locationDesc: string;
    city: string;
    selectCity: string;
    saveChanges: string;
    saving: string;
    saveSuccess: string;
    saveError: string;
    uploadSuccess: string;
    uploadError: string;
    invalidImage: string;
    imageTooLarge: string;
    loadError: string;
    changePassword: string;
    changePasswordDesc: string;
    currentPassword: string;
    currentPasswordPlaceholder: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    updatePassword: string;
    updatingPassword: string;
    passwordSuccess: string;
    passwordError: string;
    passwordMismatch: string;
    passwordTooShort: string;
    currentPasswordRequired: string;
  };

  // MyAccount
  myAccount: {
    title: string;
    subtitle: string;
    settingsBtn: string;
    backToHome: string;
    noListings: string;
    noListingsDesc: string;
    addNewListing: string;
    noDescription: string;
    views: string;
    editBtn: string;
    deleteBtn: string;
    deleteConfirm: string;
    deleteConfirmDesc: string;
    cancelBtn: string;
    deleteListingBtn: string;
    deleting: string;
    deleteSuccess: string;
    deleteError: string;
    loadError: string;
    markAsSold: string;
    markAsActive: string;
    soldSuccess: string;
    reactivateSuccess: string;
    soldBadge: string;
  };

  // Favorites
  favoritesPage: {
    title: string;
    savedAds: string;
    pleaseSignIn: string;
    mustSignIn: string;
    noFavorites: string;
    startAdding: string;
  };

  // Messages Page
  messagesPage: {
    title: string;
    noMessages: string;
    noMessagesDesc: string;
    listing: string;
    user: string;
    you: string;
    now: string;
    minsAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };

  // Listing Form (Add/Edit)
  listingForm: {
    addTitle: string;
    editTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    price: string;
    category: string;
    selectCategory: string;
    autoDetected: string;
    city: string;
    selectCity: string;
    myLocation: string;
    area: string;
    selectArea: string;
    selectCityFirst: string;
    phone: string;
    adType: string;
    freeAd: string;
    freeAdDesc: string;
    paidAd: string;
    paidAdDesc: string;
    images: string;
    uploading: string;
    moderating: string;
    clickToUpload: string;
    clickToUploadMore: string;
    rejectedImages: string;
    publishAd: string;
    publishing: string;
    saveChanges: string;
    updating: string;
    cancel: string;
    status: string;
    selectStatus: string;
    requiredFields: string;
    invalidPhone: string;
    uploadFailed: string;
    uploadedChecking: string;
    imagesApproved: string;
    imagesRejected: string;
    categoryDetected: string;
    addSuccess: string;
    addError: string;
    editSuccess: string;
    editError: string;
  };

  // Pricing
  pricing: {
    title: string;
    subtitle: string;
    back: string;
    free: string;
    forever: string;
    forNewUsers: string;
    featured: string;
    monthly: string;
    mostPopular: string;
    professional: string;
    forProfessionals: string;
    subscribeNow: string;
    startFree: string;
    freeText: string;
    // Free plan features
    freeFeature1: string;
    freeFeature2: string;
    freeFeature3: string;
    freeFeature4: string;
    freeFeature5: string;
    // Free plan not included
    freeNot1: string;
    freeNot2: string;
    freeNot3: string;
    // Featured plan features
    featuredFeature1: string;
    featuredFeature2: string;
    featuredFeature3: string;
    featuredFeature4: string;
    featuredFeature5: string;
    featuredFeature6: string;
    featuredFeature7: string;
    featuredNot1: string;
    // Pro plan features
    proFeature1: string;
    proFeature2: string;
    proFeature3: string;
    proFeature4: string;
    proFeature5: string;
    proFeature6: string;
    proFeature7: string;
    proFeature8: string;
    proFeature9: string;
    // FAQ
    faq: string;
    faqQ1: string;
    faqA1: string;
    faqQ2: string;
    faqA2: string;
    faqQ3: string;
    faqA3: string;
  };

  // About Us
  aboutUs: {
    title: string;
    subtitle: string;
    back: string;
    whoWeAre: string;
    whoWeAreDesc: string;
    ourMission: string;
    ourMissionDesc: string;
    ourVision: string;
    ourVisionDesc: string;
    whyChooseUs: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    teamTitle: string;
    teamDesc: string;
    contactTitle: string;
    contactDesc: string;
    contactEmail: string;
  };

  // Privacy & Terms
  privacy: {
    title: string;
    subtitle: string;
    back: string;
    lastUpdated: string;
    intro: string;
    dataCollectionTitle: string;
    dataCollectionDesc: string;
    dataUsageTitle: string;
    dataUsageDesc: string;
    dataSharingTitle: string;
    dataSharingDesc: string;
    dataProtectionTitle: string;
    dataProtectionDesc: string;
    cookiesTitle: string;
    cookiesDesc: string;
    userRightsTitle: string;
    userRightsDesc: string;
    contactTitle: string;
    contactDesc: string;
  };

  terms: {
    title: string;
    subtitle: string;
    back: string;
    lastUpdated: string;
    intro: string;
    acceptanceTitle: string;
    acceptanceDesc: string;
    accountTitle: string;
    accountDesc: string;
    listingRulesTitle: string;
    listingRulesDesc: string;
    prohibitedTitle: string;
    prohibitedDesc: string;
    liabilityTitle: string;
    liabilityDesc: string;
    terminationTitle: string;
    terminationDesc: string;
    changesTitle: string;
    changesDesc: string;
    contactTitle: string;
    contactDesc: string;
  };

  // Contact Form
  contactForm: {
    title: string;
    subtitle: string;
    back: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    success: string;
    error: string;
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    subjectRequired: string;
    messageRequired: string;
    infoTitle: string;
    infoDesc: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
  };
}

export const ar: Translations = {
  appName: "سوق الكل",
  appLogo: "س",
  nav: {
    home: "الرئيسية",
    categories: "التصنيفات",
    offers: "العروض",
    contact: "تواصل معنا",
    addListing: "أضف إعلانك",
    myListings: "إعلاناتي",
    myOrders: "طلباتي",
    favorites: "المفضلة",
    messages: "الرسائل",
    settings: "الإعدادات",
    adminPanel: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    myAccount: "حسابي",
    addAd: "أضف إعلان",
  },
  hero: {
    title1: "اشتري وبيع ",
    titleHighlight: "كل شيء",
    subtitle: "أكبر سوق إلكتروني مفتوح - آلاف الإعلانات الجديدة يومياً",
    searchPlaceholder: "ماذا تبحث عنه؟",
    locationPlaceholder: "المدينة أو المنطقة",
    detectLocation: "تحديد موقعي الحالي",
    search: "بحث",
    activeAds: "إعلان نشط",
    users: "مستخدم",
    categoriesCount: "تصنيف",
  },
  categories: {
    browseByCategory: "تصفح حسب التصنيف",
    chooseCategoryDesc: "اختر التصنيف المناسب لتجد ما تبحث عنه",
    cars: "سيارات",
    realEstate: "عقارات",
    electronics: "إلكترونيات",
    clothing: "ملابس",
    furniture: "أثاث",
    jobs: "وظائف",
    games: "ألعاب",
    services: "خدمات",
    dating: "تعارف",
    pets: "حيوانات أليفة",
    industrial: "معدات صناعية",
    agricultural: "معدات زراعية",
    other: "أخرى",
    allCategories: "جميع التصنيفات",
    ad: "إعلان",
  },
  cities: {
    damascus: "دمشق",
    aleppo: "حلب",
    homs: "حمص",
    hama: "حماة",
    latakia: "اللاذقية",
    tartus: "طرطوس",
    deirEzZor: "دير الزور",
    raqqa: "الرقة",
    hasaka: "الحسكة",
    daraa: "درعا",
    sweida: "السويداء",
    idlib: "إدلب",
    quneitra: "القنيطرة",
    rifDimashq: "ريف دمشق",
    allCities: "جميع المدن",
  },
  listings: {
    latestListings: "أحدث الإعلانات",
    viewAll: "عرض الكل",
    noListings: "لا توجد إعلانات",
    allListings: "جميع الإعلانات",
    browseAds: "تصفح",
    featured: "مميز",
    search: "ابحث في الإعلانات...",
    filters: "الفلاتر",
    filterListings: "فلترة الإعلانات",
    category: "التصنيف",
    city: "المدينة",
    area: "المنطقة",
    allAreas: "جميع المناطق",
    priceRange: "نطاق السعر",
    sortBy: "ترتيب حسب",
    clearFilters: "مسح الفلاتر",
    newest: "الأحدث",
    oldest: "الأقدم",
    priceAsc: "السعر: من الأقل للأعلى",
    priceDesc: "السعر: من الأعلى للأقل",
    searchIn: "ابحث في الإعلانات...",
    ad: "إعلان",
    available: "إعلان متاح",
  },
  details: {
    back: "العودة",
    description: "الوصف",
    noDescription: "لا يوجد وصف",
    sellerInfo: "معلومات البائع",
    member: "مستخدم",
    memberSince: "عضو منذ",
    call: "اتصال",
    whatsapp: "واتساب",
    chatWithSeller: "دردشة مع البائع",
    reportListing: "إبلاغ عن الإعلان",
    noPhone: "البائع لم يضف رقم هاتف",
    views: "مشاهدة",
    safetyTips: "نصائح أمان",
    tip1: "قابل البائع في مكان عام",
    tip2: "تفحص المنتج قبل الدفع",
    tip3: "لا ترسل أموالاً مقدماً",
    tip4: "احذر من العروض المبالغ فيها",
  },
  auth: {
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    phone: "رقم الهاتف",
    verifyCode: "رمز التحقق",
    sendCode: "إرسال الرمز",
    fullName: "الاسم الكامل",
    welcomeBack: "مرحباً بك",
    createAccount: "إنشاء حساب جديد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    enterFullName: "أدخل اسمك الكامل",
    enterPassword: "أدخل كلمة المرور",
    processing: "جاري المعالجة...",
    noAccount: "ليس لديك حساب؟ إنشاء حساب جديد",
    hasAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    loginError: "فشل تسجيل الدخول: ",
    signupSuccess: "تم إنشاء الحساب بنجاح!",
    signupError: "فشل إنشاء الحساب: ",
    fullNameRequired: "يرجى إدخال الاسم الكامل",
  },
  report: {
    title: "الإبلاغ عن إعلان مخالف",
    reason: "سبب الإبلاغ",
    details: "تفاصيل إضافية (اختياري)",
    submit: "إرسال البلاغ",
    alreadyReported: "لقد أبلغت عن هذا الإعلان مسبقاً",
    success: "تم إرسال البلاغ بنجاح، شكراً لمساعدتنا في تحسين المنصة",
    error: "حدث خطأ أثناء إرسال البلاغ",
    selectReason: "يرجى اختيار سبب الإبلاغ",
    reasons: {
      inappropriate: "محتوى مخالف أو غير لائق",
      fraud: "إعلان احتيالي أو مضلل",
      fakePrice: "سعر غير حقيقي",
      stolenImages: "صور مسروقة أو غير حقيقية",
      spam: "إعلان مكرر أو سبام",
      other: "سبب آخر",
    },
  },
  footer: {
    about: "عن الموقع",
    aboutDesc: "أكبر سوق إلكتروني مفتوح للبيع والشراء. نربط البائعين والمشترين في مكان واحد بكل سهولة وأمان.",
    quickLinks: "روابط سريعة",
    categoriesTitle: "التصنيفات",
    contactUs: "تواصل معنا",
    rights: "© 2024 السوق المفتوح. جميع الحقوق محفوظة.",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
  },
  admin: {
    dashboard: "لوحة التحكم",
    statsAndReports: "إحصائيات عامة وإدارة البلاغات",
    activeAds: "إعلان نشط",
    registeredUsers: "مستخدم مسجّل",
    reportsSubmitted: "بلاغ مقدّم",
    totalViews: "مشاهدة إجمالية",
    categoryDistribution: "توزيع الإعلانات حسب التصنيف",
    dailyListings: "الإعلانات المضافة يومياً (آخر 30 يوم)",
    pending: "قيد المراجعة",
    reviewed: "تمت المراجعة",
    resolved: "تم الحل",
    dismissed: "مرفوض",
    allReports: "جميع البلاغات",
    reports: "بلاغ",
    listing: "الإعلان",
    reporter: "المُبلّغ",
    reasonCol: "السبب",
    date: "التاريخ",
    status: "الحالة",
    actions: "إجراءات",
    reportDetails: "تفاصيل البلاغ",
    changeStatus: "تغيير الحالة",
    viewListing: "عرض الإعلان",
    deleteListing: "حذف الإعلان المخالف",
    confirmDelete: "تأكيد حذف الإعلان",
    confirmDeleteDesc: "هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    delete: "حذف الإعلان",
    noReports: "لا توجد بلاغات",
    noReportsDesc: "لا توجد بلاغات مطابقة للفلتر الحالي",
    exportCsv: "تصدير CSV",
    exportReports: "تصدير البلاغات",
    exportListings: "تصدير الإعلانات",
    exportUsers: "تصدير المستخدمين",
    filterByStatus: "فلترة حسب الحالة",
    adCount: "عدد الإعلانات",
    deletedListing: "إعلان محذوف",
    user: "مستخدم",
  },
  common: {
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "تمت العملية بنجاح",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    close: "إغلاق",
    confirm: "تأكيد",
    syp: "ل.س",
    minutesAgo: "منذ دقائق",
    hoursAgo: "ساعة",
    dayAgo: "منذ يوم",
    daysAgo: "أيام",
    weekAgo: "أسبوع",
  },
  ratings: {
    title: "التقييمات",
    addRating: "أضف تقييم",
    noRatings: "لا توجد تقييمات بعد",
    comment: "تعليق",
    submit: "إرسال التقييم",
  },
  messages: {
    title: "الرسائل",
    noMessages: "لا توجد رسائل",
    typeMessage: "اكتب رسالتك...",
    send: "إرسال",
    noConversations: "لا توجد محادثات بعد",
    startFromListing: "ابدأ محادثة من صفحة أي إعلان",
    startNow: "ابدأ المحادثة الآن",
    user: "مستخدم",
    listing: "إعلان",
    you: "أنت",
    conversation: "محادثة",
  },
  settings: {
    title: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    darkMode: "الوضع الداكن",
    darkModeDesc: "تبديل بين الوضع الفاتح والداكن",
    lightMode: "الوضع الفاتح",
    notifications: "الإشعارات",
    editProfile: "تعديل معلومات الملف الشخصي",
    backToListings: "العودة لإعلاناتي",
    profilePicture: "الصورة الشخصية",
    profilePictureDesc: "صورتك التي ستظهر للآخرين",
    clickToChange: "انقر على أيقونة الكاميرا لتغيير الصورة",
    maxSize: "الحد الأقصى: 2 ميجابايت",
    personalInfo: "المعلومات الشخصية",
    basicInfo: "معلوماتك الأساسية",
    email: "البريد الإلكتروني",
    emailCantChange: "لا يمكن تغيير البريد الإلكتروني",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    contactInfo: "معلومات التواصل",
    contactInfoDesc: "كيف يمكن للآخرين التواصل معك",
    phone: "رقم الهاتف",
    phonePlaceholder: "09xxxxxxxx",
    phoneHint: "رقم الهاتف السوري (يبدأ بـ 09)",
    phoneError: "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام",
    location: "الموقع",
    locationDesc: "موقعك الافتراضي للإعلانات",
    city: "المدينة",
    selectCity: "اختر المدينة",
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    saveSuccess: "تم حفظ الإعدادات بنجاح",
    saveError: "فشل حفظ الإعدادات",
    uploadSuccess: "تم رفع الصورة بنجاح",
    uploadError: "فشل رفع الصورة",
    invalidImage: "يرجى اختيار ملف صورة صالح",
    imageTooLarge: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
    loadError: "فشل تحميل بيانات الحساب",
    changePassword: "تغيير كلمة المرور",
    changePasswordDesc: "قم بتحديث كلمة المرور الخاصة بحسابك",
    currentPassword: "كلمة المرور الحالية",
    currentPasswordPlaceholder: "أدخل كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    newPasswordPlaceholder: "أدخل كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور",
    updatingPassword: "جاري التحديث...",
    passwordSuccess: "تم تغيير كلمة المرور بنجاح",
    passwordError: "فشل تغيير كلمة المرور",
    passwordMismatch: "كلمتا المرور غير متطابقتين",
    passwordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    currentPasswordRequired: "يرجى إدخال كلمة المرور الحالية",
  },
  myAccount: {
    title: "إعلاناتي",
    subtitle: "إدارة جميع إعلاناتك من مكان واحد",
    settingsBtn: "الإعدادات",
    backToHome: "العودة للرئيسية",
    noListings: "لا توجد إعلانات حتى الآن",
    noListingsDesc: "ابدأ بإضافة إعلانك الأول الآن",
    addNewListing: "إضافة إعلان جديد",
    noDescription: "لا يوجد وصف",
    views: "مشاهدة",
    editBtn: "تعديل",
    deleteBtn: "حذف",
    deleteConfirm: "هل أنت متأكد من حذف هذا الإعلان؟",
    deleteConfirmDesc: "سيتم حذف الإعلان نهائياً ولا يمكن التراجع عن هذا الإجراء.",
    cancelBtn: "إلغاء",
    deleteListingBtn: "حذف الإعلان",
    deleting: "جاري الحذف...",
    deleteSuccess: "تم حذف الإعلان بنجاح",
    deleteError: "فشل حذف الإعلان",
    loadError: "فشل تحميل الإعلانات",
    markAsSold: "تم البيع",
    markAsActive: "إعادة تفعيل",
    soldSuccess: "تم تحديد الإعلان كمباع",
    reactivateSuccess: "تم إعادة تفعيل الإعلان",
    soldBadge: "مباع",
  },
  favoritesPage: {
    title: "المفضلة",
    savedAds: "الإعلانات المحفوظة",
    pleaseSignIn: "يرجى تسجيل الدخول",
    mustSignIn: "يجب عليك تسجيل الدخول لعرض الإعلانات المفضلة",
    noFavorites: "لا توجد إعلانات مفضلة",
    startAdding: "ابدأ بإضافة الإعلانات المهمة إلى قائمة المفضلة",
  },
  messagesPage: {
    title: "الرسائل",
    noMessages: "لا توجد رسائل",
    noMessagesDesc: "ابدأ محادثة من صفحة أي إعلان للتواصل مع البائع",
    listing: "إعلان",
    user: "مستخدم",
    you: "أنت",
    now: "الآن",
    minsAgo: "د",
    hoursAgo: "س",
    daysAgo: "ي",
  },
  listingForm: {
    addTitle: "إضافة إعلان جديد",
    editTitle: "تعديل الإعلان",
    titleLabel: "عنوان الإعلان",
    titlePlaceholder: "أدخل عنوان الإعلان",
    description: "الوصف",
    descriptionPlaceholder: "أدخل وصف تفصيلي للإعلان",
    price: "السعر (ل.س)",
    category: "التصنيف",
    selectCategory: "اختر التصنيف",
    autoDetected: "تم الاكتشاف تلقائياً",
    city: "المدينة",
    selectCity: "اختر المدينة",
    myLocation: "موقعي الحالي",
    area: "المنطقة",
    selectArea: "اختر المنطقة",
    selectCityFirst: "اختر المدينة أولاً",
    phone: "رقم الهاتف",
    adType: "نوع الإعلان",
    freeAd: "إعلان مجاني",
    freeAdDesc: "يظهر بعد الإعلانات المدفوعة",
    paidAd: "إعلان مدفوع",
    paidAdDesc: "يظهر دائماً في المقدمة",
    images: "صور الإعلان",
    uploading: "جاري الرفع...",
    moderating: "جاري فحص الصور بالذكاء الاصطناعي...",
    clickToUpload: "اضغط لرفع الصور",
    clickToUploadMore: "اضغط لرفع صور إضافية",
    rejectedImages: "تم رفض الصور التالية:",
    publishAd: "نشر الإعلان",
    publishing: "جاري الإضافة...",
    saveChanges: "حفظ التغييرات",
    updating: "جاري التحديث...",
    cancel: "إلغاء",
    status: "حالة الإعلان",
    selectStatus: "اختر الحالة",
    requiredFields: "يرجى ملء جميع الحقول المطلوبة",
    invalidPhone: "يرجى إدخال رقم هاتف صحيح (09xxxxxxxx)",
    uploadFailed: "فشل رفع الصورة",
    uploadedChecking: "صورة، جاري فحص المحتوى...",
    imagesApproved: "صورة",
    imagesRejected: "صورة لمخالفتها القوانين",
    categoryDetected: "تم اكتشاف التصنيف تلقائياً",
    addSuccess: "تم إضافة الإعلان بنجاح!",
    addError: "فشل إضافة الإعلان",
    editSuccess: "تم تحديث الإعلان بنجاح!",
    editError: "فشل تحديث الإعلان",
  },
  pricing: {
    title: "أسعار الإعلانات المدفوعة",
    subtitle: "اختر الخطة المناسبة لك واحصل على مميزات حصرية لإعلاناتك",
    back: "رجوع",
    free: "مجاني",
    forever: "دائم",
    forNewUsers: "للمستخدمين الجدد",
    featured: "مميز",
    monthly: "شهرياً",
    mostPopular: "الأكثر شعبية",
    professional: "احترافي",
    forProfessionals: "للمحترفين والشركات",
    subscribeNow: "اشترك الآن",
    startFree: "ابدأ مجاناً",
    freeText: "مجاني",
    freeFeature1: "نشر إعلان واحد",
    freeFeature2: "مدة الإعلان 30 يوم",
    freeFeature3: "يظهر بعد الإعلانات المدفوعة",
    freeFeature4: "صورة واحدة للإعلان",
    freeFeature5: "دعم فني أساسي",
    freeNot1: "التثبيت في أعلى القائمة",
    freeNot2: "الشارة الذهبية",
    freeNot3: "إحصائيات المشاهدات",
    featuredFeature1: "نشر 5 إعلانات",
    featuredFeature2: "مدة الإعلان 60 يوم",
    featuredFeature3: "التثبيت في أعلى القائمة",
    featuredFeature4: "الشارة الذهبية المميزة",
    featuredFeature5: "حتى 10 صور للإعلان",
    featuredFeature6: "إحصائيات المشاهدات",
    featuredFeature7: "دعم فني متقدم",
    featuredNot1: "أولوية في نتائج البحث",
    proFeature1: "نشر غير محدود للإعلانات",
    proFeature2: "مدة الإعلان 90 يوم",
    proFeature3: "التثبيت في أعلى القائمة",
    proFeature4: "الشارة الذهبية المميزة",
    proFeature5: "حتى 20 صور للإعلان",
    proFeature6: "إحصائيات مفصلة",
    proFeature7: "أولوية في نتائج البحث",
    proFeature8: "دعم فني على مدار الساعة",
    proFeature9: "شارة تاجر موثوق",
    faq: "الأسئلة الشائعة",
    faqQ1: "كيف يتم الدفع؟",
    faqA1: "يمكنك الدفع عبر التحويل البنكي أو الدفع الإلكتروني. بعد إتمام الدفع، سيتم تفعيل الباقة خلال 24 ساعة.",
    faqQ2: "هل يمكنني إلغاء الاشتراك؟",
    faqA2: "نعم، يمكنك إلغاء الاشتراك في أي وقت. سيستمر حسابك المدفوع حتى نهاية فترة الفوترة الحالية.",
    faqQ3: "ما الفرق بين الإعلان المجاني والمدفوع؟",
    faqA3: "الإعلانات المدفوعة تظهر دائماً في أعلى نتائج البحث، وتحصل على شارة ذهبية مميزة، مما يزيد من فرص مشاهدتها والتواصل معك.",
  },
  aboutUs: {
    title: "من نحن",
    subtitle: "تعرّف على قصتنا وفريقنا",
    back: "العودة للرئيسية",
    whoWeAre: "من نحن؟",
    whoWeAreDesc: "نحن منصة إلكترونية رائدة للبيع والشراء، نهدف إلى ربط البائعين والمشترين في مكان واحد آمن وموثوق. تأسسنا بهدف تسهيل التجارة الإلكترونية وجعلها في متناول الجميع.",
    ourMission: "مهمتنا",
    ourMissionDesc: "توفير منصة سهلة وآمنة تمكّن الجميع من بيع وشراء المنتجات والخدمات بكل سهولة وشفافية، مع ضمان أفضل تجربة مستخدم ممكنة.",
    ourVision: "رؤيتنا",
    ourVisionDesc: "أن نكون المنصة الأولى والأكثر ثقة للتجارة الإلكترونية المحلية، ونساهم في بناء اقتصاد رقمي مزدهر يخدم المجتمع.",
    whyChooseUs: "لماذا تختارنا؟",
    feature1Title: "سهولة الاستخدام",
    feature1Desc: "واجهة بسيطة وسلسة تتيح لك نشر إعلانك في دقائق معدودة.",
    feature2Title: "أمان وموثوقية",
    feature2Desc: "نظام تحقق متقدم وحماية لبياناتك الشخصية ومعاملاتك.",
    feature3Title: "وصول واسع",
    feature3Desc: "آلاف المستخدمين النشطين يومياً مما يضمن وصول إعلانك لأكبر عدد.",
    feature4Title: "دعم فني متواصل",
    feature4Desc: "فريق دعم متاح لمساعدتك في أي وقت والإجابة على استفساراتك.",
    teamTitle: "فريقنا",
    teamDesc: "فريق متخصص من المطورين والمصممين وخبراء التجارة الإلكترونية، يعملون بشغف لتقديم أفضل تجربة لمستخدمينا.",
    contactTitle: "تواصل معنا",
    contactDesc: "نسعد بتواصلكم معنا لأي استفسار أو اقتراح.",
    contactEmail: "info@soukcom.com",
  },
  privacy: {
    title: "سياسة الخصوصية",
    subtitle: "كيف نحمي بياناتك ونحترم خصوصيتك",
    back: "العودة للرئيسية",
    lastUpdated: "آخر تحديث: فبراير 2026",
    intro: "نحن في السوق المفتوح نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية.",
    dataCollectionTitle: "البيانات التي نجمعها",
    dataCollectionDesc: "نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، مثل الاسم والبريد الإلكتروني ورقم الهاتف والمدينة. كما نجمع بيانات الإعلانات التي تنشرها بما في ذلك الصور والأوصاف والأسعار.",
    dataUsageTitle: "كيف نستخدم بياناتك",
    dataUsageDesc: "نستخدم بياناتك لتوفير خدماتنا وتحسينها، والتواصل معك بشأن حسابك وإعلاناتك، وإرسال إشعارات مهمة، وضمان أمان المنصة ومنع الاحتيال.",
    dataSharingTitle: "مشاركة البيانات",
    dataSharingDesc: "لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلومات الاتصال الخاصة بك (مثل رقم الهاتف) مع المستخدمين الآخرين فقط عند نشر إعلان، لتسهيل عمليات البيع والشراء.",
    dataProtectionTitle: "حماية البيانات",
    dataProtectionDesc: "نستخدم تقنيات تشفير متقدمة وإجراءات أمنية صارمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف.",
    cookiesTitle: "ملفات تعريف الارتباط",
    cookiesDesc: "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتذكر تفضيلاتك مثل اللغة والوضع الداكن. يمكنك التحكم في إعدادات الكوكيز من متصفحك.",
    userRightsTitle: "حقوقك",
    userRightsDesc: "لديك الحق في الوصول إلى بياناتك الشخصية وتعديلها أو حذفها في أي وقت من خلال إعدادات حسابك. يمكنك أيضاً طلب نسخة من بياناتك أو طلب حذف حسابك بالكامل.",
    contactTitle: "تواصل معنا",
    contactDesc: "إذا كانت لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: privacy@soukcom.com",
  },
  terms: {
    title: "شروط الاستخدام",
    subtitle: "القواعد والأحكام التي تنظم استخدام المنصة",
    back: "العودة للرئيسية",
    lastUpdated: "آخر تحديث: فبراير 2026",
    intro: "باستخدامك لمنصة السوق المفتوح، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام المنصة.",
    acceptanceTitle: "قبول الشروط",
    acceptanceDesc: "باستخدامك للمنصة أو إنشاء حساب فيها، فإنك تقر بأنك قد قرأت وفهمت ووافقت على هذه الشروط. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.",
    accountTitle: "الحساب والتسجيل",
    accountDesc: "أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب أن تكون المعلومات المقدمة عند التسجيل دقيقة وحقيقية. يحق لنا تعليق أو إنهاء حسابك في حالة تقديم معلومات كاذبة.",
    listingRulesTitle: "قواعد نشر الإعلانات",
    listingRulesDesc: "يجب أن تكون جميع الإعلانات المنشورة حقيقية ودقيقة. يتحمل المعلن المسؤولية الكاملة عن محتوى إعلانه. يجب أن تتضمن الإعلانات صوراً حقيقية للمنتج وسعراً واقعياً ومعلومات اتصال صحيحة.",
    prohibitedTitle: "المحتوى المحظور",
    prohibitedDesc: "يُمنع نشر إعلانات تتضمن منتجات غير قانونية أو مسروقة أو مزيفة، أو محتوى مسيء أو تمييزي، أو معلومات مضللة أو كاذبة، أو أي محتوى ينتهك حقوق الملكية الفكرية للآخرين.",
    liabilityTitle: "إخلاء المسؤولية",
    liabilityDesc: "المنصة هي وسيط فقط بين البائع والمشتري. لا نتحمل أي مسؤولية عن جودة المنتجات أو صحة المعلومات المقدمة في الإعلانات. ننصح دائماً بالتحقق من المنتج قبل الشراء والالتقاء في أماكن عامة آمنة.",
    terminationTitle: "إنهاء الحساب",
    terminationDesc: "يحق لنا تعليق أو إنهاء حسابك وحذف إعلاناتك في حالة مخالفة هذه الشروط، أو تلقي شكاوى متعددة، أو أي سلوك يضر بالمنصة أو مستخدميها.",
    changesTitle: "تعديل الشروط",
    changesDesc: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطارك بالتغييرات الجوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.",
    contactTitle: "تواصل معنا",
    contactDesc: "لأي استفسارات حول شروط الاستخدام، يرجى التواصل معنا عبر البريد الإلكتروني: legal@soukcom.com",
  },
  contactForm: {
    title: "تواصل معنا",
    subtitle: "نحن هنا لمساعدتك! أرسل لنا رسالتك وسنرد عليك في أقرب وقت",
    back: "العودة",
    name: "الاسم الكامل",
    namePlaceholder: "أدخل اسمك الكامل",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    subject: "الموضوع",
    subjectPlaceholder: "موضوع الرسالة",
    message: "الرسالة",
    messagePlaceholder: "اكتب رسالتك هنا...",
    send: "إرسال الرسالة",
    sending: "جاري الإرسال...",
    success: "تم إرسال رسالتك بنجاح! سنرد عليك قريباً",
    error: "حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى",
    nameRequired: "الاسم مطلوب",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "البريد الإلكتروني غير صالح",
    subjectRequired: "الموضوع مطلوب",
    messageRequired: "الرسالة مطلوبة",
    infoTitle: "معلومات التواصل",
    infoDesc: "يمكنك أيضاً التواصل معنا عبر الوسائل التالية",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    addressLabel: "العنوان",
  },
};

export const en: Translations = {
  appName: "Souq Alkul",
  appLogo: "S",
  nav: {
    home: "Home",
    categories: "Categories",
    offers: "Offers",
    contact: "Contact Us",
    addListing: "Add Listing",
    myListings: "My Listings",
    myOrders: "My Orders",
    favorites: "Favorites",
    messages: "Messages",
    settings: "Settings",
    adminPanel: "Admin Panel",
    signIn: "Sign In",
    signOut: "Sign Out",
    myAccount: "My Account",
    addAd: "Add Ad",
  },
  hero: {
    title1: "Buy & Sell ",
    titleHighlight: "Everything",
    subtitle: "The largest open marketplace — thousands of new ads daily",
    searchPlaceholder: "What are you looking for?",
    locationPlaceholder: "City or area",
    detectLocation: "Detect my location",
    search: "Search",
    activeAds: "Active ads",
    users: "Users",
    categoriesCount: "Categories",
  },
  categories: {
    browseByCategory: "Browse by Category",
    chooseCategoryDesc: "Choose the right category to find what you need",
    cars: "Cars",
    realEstate: "Real Estate",
    electronics: "Electronics",
    clothing: "Clothing",
    furniture: "Furniture",
    jobs: "Jobs",
    games: "Games",
    services: "Services",
    dating: "Dating",
    pets: "Pets",
    industrial: "Industrial Equipment",
    agricultural: "Agricultural Equipment",
    other: "Other",
    allCategories: "All Categories",
    ad: "ad",
  },
  cities: {
    damascus: "Damascus",
    aleppo: "Aleppo",
    homs: "Homs",
    hama: "Hama",
    latakia: "Latakia",
    tartus: "Tartus",
    deirEzZor: "Deir ez-Zor",
    raqqa: "Raqqa",
    hasaka: "Al-Hasakah",
    daraa: "Daraa",
    sweida: "As-Suwayda",
    idlib: "Idlib",
    quneitra: "Quneitra",
    rifDimashq: "Rif Dimashq",
    allCities: "All Cities",
  },
  listings: {
    latestListings: "Latest Listings",
    viewAll: "View All",
    noListings: "No listings found",
    allListings: "All Listings",
    browseAds: "Browse",
    featured: "Featured",
    search: "Search listings...",
    filters: "Filters",
    filterListings: "Filter Listings",
    category: "Category",
    city: "City",
    area: "Area",
    allAreas: "All Areas",
    priceRange: "Price Range",
    sortBy: "Sort By",
    clearFilters: "Clear Filters",
    newest: "Newest",
    oldest: "Oldest",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    searchIn: "Search listings...",
    ad: "ad",
    available: "ad available",
  },
  details: {
    back: "Back",
    description: "Description",
    noDescription: "No description",
    sellerInfo: "Seller Info",
    member: "User",
    memberSince: "Member since",
    call: "Call",
    whatsapp: "WhatsApp",
    chatWithSeller: "Chat with Seller",
    reportListing: "Report Listing",
    noPhone: "Seller has not added a phone number",
    views: "views",
    safetyTips: "Safety Tips",
    tip1: "Meet the seller in a public place",
    tip2: "Inspect the product before paying",
    tip3: "Don't send money in advance",
    tip4: "Beware of too-good-to-be-true deals",
  },
  auth: {
    login: "Sign In",
    signup: "Sign Up",
    phone: "Phone Number",
    verifyCode: "Verification Code",
    sendCode: "Send Code",
    fullName: "Full Name",
    welcomeBack: "Welcome Back",
    createAccount: "Create New Account",
    email: "Email",
    password: "Password",
    enterFullName: "Enter your full name",
    enterPassword: "Enter your password",
    processing: "Processing...",
    noAccount: "Don't have an account? Sign Up",
    hasAccount: "Already have an account? Sign In",
    loginSuccess: "Signed in successfully!",
    loginError: "Sign in failed: ",
    signupSuccess: "Account created successfully!",
    signupError: "Account creation failed: ",
    fullNameRequired: "Please enter your full name",
  },
  report: {
    title: "Report Listing",
    reason: "Reason",
    details: "Additional details (optional)",
    submit: "Submit Report",
    alreadyReported: "You have already reported this listing",
    success: "Report submitted successfully, thank you for helping improve the platform",
    error: "An error occurred while submitting the report",
    selectReason: "Please select a reason",
    reasons: {
      inappropriate: "Inappropriate or offensive content",
      fraud: "Fraudulent or misleading ad",
      fakePrice: "Unrealistic price",
      stolenImages: "Stolen or fake images",
      spam: "Duplicate or spam ad",
      other: "Other reason",
    },
  },
  footer: {
    about: "About",
    aboutDesc: "The largest open marketplace for buying and selling. We connect buyers and sellers in one place with ease and security.",
    quickLinks: "Quick Links",
    categoriesTitle: "Categories",
    contactUs: "Contact Us",
    rights: "© 2024 Open Market. All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
  admin: {
    dashboard: "Dashboard",
    statsAndReports: "General stats and report management",
    activeAds: "Active ads",
    registeredUsers: "Registered users",
    reportsSubmitted: "Reports submitted",
    totalViews: "Total views",
    categoryDistribution: "Listings by Category",
    dailyListings: "Daily Listings (Last 30 Days)",
    pending: "Pending",
    reviewed: "Reviewed",
    resolved: "Resolved",
    dismissed: "Dismissed",
    allReports: "All Reports",
    reports: "report",
    listing: "Listing",
    reporter: "Reporter",
    reasonCol: "Reason",
    date: "Date",
    status: "Status",
    actions: "Actions",
    reportDetails: "Report Details",
    changeStatus: "Change Status",
    viewListing: "View Listing",
    deleteListing: "Delete Listing",
    confirmDelete: "Confirm Delete",
    confirmDeleteDesc: "Are you sure you want to delete this listing? This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
    noReports: "No reports",
    noReportsDesc: "No reports matching the current filter",
    exportCsv: "Export CSV",
    exportReports: "Export Reports",
    exportListings: "Export Listings",
    exportUsers: "Export Users",
    filterByStatus: "Filter by status",
    adCount: "Ad count",
    deletedListing: "Deleted listing",
    user: "User",
  },
  common: {
    loading: "Loading...",
    error: "An error occurred",
    success: "Operation successful",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    syp: "SYP",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    dayAgo: "a day ago",
    daysAgo: "days ago",
    weekAgo: "weeks ago",
  },
  ratings: {
    title: "Ratings",
    addRating: "Add Rating",
    noRatings: "No ratings yet",
    comment: "Comment",
    submit: "Submit Rating",
  },
  messages: {
    title: "Messages",
    noMessages: "No messages",
    typeMessage: "Type a message...",
    send: "Send",
    noConversations: "No conversations yet",
    startFromListing: "Start a conversation from any listing page",
    startNow: "Start the conversation now",
    user: "User",
    listing: "Listing",
    you: "You",
    conversation: "Conversation",
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    darkModeDesc: "Toggle between light and dark mode",
    lightMode: "Light Mode",
    notifications: "Notifications",
    editProfile: "Edit profile information",
    backToListings: "Back to my listings",
    profilePicture: "Profile Picture",
    profilePictureDesc: "Your photo visible to others",
    clickToChange: "Click the camera icon to change photo",
    maxSize: "Max size: 2MB",
    personalInfo: "Personal Information",
    basicInfo: "Your basic info",
    email: "Email",
    emailCantChange: "Email cannot be changed",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    contactInfo: "Contact Information",
    contactInfoDesc: "How others can reach you",
    phone: "Phone Number",
    phonePlaceholder: "09xxxxxxxx",
    phoneHint: "Syrian phone number (starts with 09)",
    phoneError: "Phone number must start with 09 and be 10 digits",
    location: "Location",
    locationDesc: "Your default location for listings",
    city: "City",
    selectCity: "Select city",
    saveChanges: "Save Changes",
    saving: "Saving...",
    saveSuccess: "Settings saved successfully",
    saveError: "Failed to save settings",
    uploadSuccess: "Photo uploaded successfully",
    uploadError: "Failed to upload photo",
    invalidImage: "Please select a valid image file",
    imageTooLarge: "Image size must be less than 2MB",
    loadError: "Failed to load account data",
    changePassword: "Change Password",
    changePasswordDesc: "Update your account password",
    currentPassword: "Current Password",
    currentPasswordPlaceholder: "Enter current password",
    newPassword: "New Password",
    newPasswordPlaceholder: "Enter new password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter new password",
    updatePassword: "Update Password",
    updatingPassword: "Updating...",
    passwordSuccess: "Password changed successfully",
    passwordError: "Failed to change password",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    currentPasswordRequired: "Please enter your current password",
  },
  myAccount: {
    title: "My Listings",
    subtitle: "Manage all your listings in one place",
    settingsBtn: "Settings",
    backToHome: "Back to Home",
    noListings: "No listings yet",
    noListingsDesc: "Start by adding your first listing now",
    addNewListing: "Add New Listing",
    noDescription: "No description",
    views: "views",
    editBtn: "Edit",
    deleteBtn: "Delete",
    deleteConfirm: "Are you sure you want to delete this listing?",
    deleteConfirmDesc: "This listing will be permanently deleted and cannot be undone.",
    cancelBtn: "Cancel",
    deleteListingBtn: "Delete Listing",
    deleting: "Deleting...",
    deleteSuccess: "Listing deleted successfully",
    deleteError: "Failed to delete listing",
    loadError: "Failed to load listings",
    markAsSold: "Mark as Sold",
    markAsActive: "Reactivate",
    soldSuccess: "Listing marked as sold",
    reactivateSuccess: "Listing reactivated",
    soldBadge: "Sold",
  },
  favoritesPage: {
    title: "Favorites",
    savedAds: "Saved ads",
    pleaseSignIn: "Please sign in",
    mustSignIn: "You must sign in to view your favorite listings",
    noFavorites: "No favorite listings",
    startAdding: "Start adding important listings to your favorites",
  },
  messagesPage: {
    title: "Messages",
    noMessages: "No messages",
    noMessagesDesc: "Start a conversation from any listing page to contact the seller",
    listing: "Listing",
    user: "User",
    you: "You",
    now: "Now",
    minsAgo: "m",
    hoursAgo: "h",
    daysAgo: "d",
  },
  listingForm: {
    addTitle: "Add New Listing",
    editTitle: "Edit Listing",
    titleLabel: "Listing Title",
    titlePlaceholder: "Enter listing title",
    description: "Description",
    descriptionPlaceholder: "Enter a detailed description",
    price: "Price (SYP)",
    category: "Category",
    selectCategory: "Select category",
    autoDetected: "Auto-detected",
    city: "City",
    selectCity: "Select city",
    myLocation: "My location",
    area: "Area",
    selectArea: "Select area",
    selectCityFirst: "Select city first",
    phone: "Phone Number",
    adType: "Ad Type",
    freeAd: "Free Ad",
    freeAdDesc: "Appears after paid ads",
    paidAd: "Paid Ad",
    paidAdDesc: "Always appears first",
    images: "Listing Images",
    uploading: "Uploading...",
    moderating: "Checking images with AI...",
    clickToUpload: "Click to upload images",
    clickToUploadMore: "Click to upload more images",
    rejectedImages: "The following images were rejected:",
    publishAd: "Publish Listing",
    publishing: "Publishing...",
    saveChanges: "Save Changes",
    updating: "Updating...",
    cancel: "Cancel",
    status: "Listing Status",
    selectStatus: "Select status",
    requiredFields: "Please fill in all required fields",
    invalidPhone: "Please enter a valid phone number (09xxxxxxxx)",
    uploadFailed: "Failed to upload image",
    uploadedChecking: "image(s) uploaded, checking content...",
    imagesApproved: "image(s) approved",
    imagesRejected: "image(s) rejected for policy violations",
    categoryDetected: "Category auto-detected",
    addSuccess: "Listing added successfully!",
    addError: "Failed to add listing",
    editSuccess: "Listing updated successfully!",
    editError: "Failed to update listing",
  },
  pricing: {
    title: "Paid Listing Prices",
    subtitle: "Choose the right plan and get exclusive features for your listings",
    back: "Back",
    free: "Free",
    forever: "Forever",
    forNewUsers: "For new users",
    featured: "Featured",
    monthly: "Monthly",
    mostPopular: "Most Popular",
    professional: "Professional",
    forProfessionals: "For professionals & businesses",
    subscribeNow: "Subscribe Now",
    startFree: "Start Free",
    freeText: "Free",
    freeFeature1: "Post 1 listing",
    freeFeature2: "Listing duration 30 days",
    freeFeature3: "Appears after paid listings",
    freeFeature4: "1 image per listing",
    freeFeature5: "Basic support",
    freeNot1: "Pin to top of list",
    freeNot2: "Gold badge",
    freeNot3: "View statistics",
    featuredFeature1: "Post 5 listings",
    featuredFeature2: "Listing duration 60 days",
    featuredFeature3: "Pin to top of list",
    featuredFeature4: "Gold featured badge",
    featuredFeature5: "Up to 10 images per listing",
    featuredFeature6: "View statistics",
    featuredFeature7: "Advanced support",
    featuredNot1: "Priority in search results",
    proFeature1: "Unlimited listings",
    proFeature2: "Listing duration 90 days",
    proFeature3: "Pin to top of list",
    proFeature4: "Gold featured badge",
    proFeature5: "Up to 20 images per listing",
    proFeature6: "Detailed statistics",
    proFeature7: "Priority in search results",
    proFeature8: "24/7 support",
    proFeature9: "Trusted dealer badge",
    faq: "Frequently Asked Questions",
    faqQ1: "How do I pay?",
    faqA1: "You can pay via bank transfer or electronic payment. After payment, your plan will be activated within 24 hours.",
    faqQ2: "Can I cancel my subscription?",
    faqA2: "Yes, you can cancel anytime. Your paid account will remain active until the end of the current billing period.",
    faqQ3: "What's the difference between free and paid listings?",
    faqA3: "Paid listings always appear at the top of search results and get a gold badge, increasing visibility and contact opportunities.",
  },
  aboutUs: {
    title: "About Us",
    subtitle: "Learn about our story and team",
    back: "Back to Home",
    whoWeAre: "Who We Are",
    whoWeAreDesc: "We are a leading online marketplace for buying and selling, aiming to connect sellers and buyers in one safe and trusted place. We were founded to make e-commerce accessible to everyone.",
    ourMission: "Our Mission",
    ourMissionDesc: "To provide an easy and secure platform that enables everyone to buy and sell products and services with ease and transparency, while ensuring the best possible user experience.",
    ourVision: "Our Vision",
    ourVisionDesc: "To be the most trusted local e-commerce platform, contributing to building a thriving digital economy that serves the community.",
    whyChooseUs: "Why Choose Us?",
    feature1Title: "Easy to Use",
    feature1Desc: "A simple and smooth interface that lets you post your ad in minutes.",
    feature2Title: "Safe & Reliable",
    feature2Desc: "Advanced verification system and protection for your personal data and transactions.",
    feature3Title: "Wide Reach",
    feature3Desc: "Thousands of active users daily ensuring your ad reaches the maximum audience.",
    feature4Title: "Continuous Support",
    feature4Desc: "A support team available to help you anytime and answer your questions.",
    teamTitle: "Our Team",
    teamDesc: "A specialized team of developers, designers, and e-commerce experts, passionately working to deliver the best experience for our users.",
    contactTitle: "Contact Us",
    contactDesc: "We'd love to hear from you for any inquiries or suggestions.",
    contactEmail: "info@soukcom.com",
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "How we protect your data and respect your privacy",
    back: "Back to Home",
    lastUpdated: "Last updated: February 2026",
    intro: "At Open Market, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.",
    dataCollectionTitle: "Data We Collect",
    dataCollectionDesc: "We collect information you provide directly when creating an account, such as your name, email, phone number, and city. We also collect listing data you publish including images, descriptions, and prices.",
    dataUsageTitle: "How We Use Your Data",
    dataUsageDesc: "We use your data to provide and improve our services, communicate with you about your account and listings, send important notifications, and ensure platform security and fraud prevention.",
    dataSharingTitle: "Data Sharing",
    dataSharingDesc: "We do not sell your personal information to third parties. We may share your contact information (such as phone number) with other users only when you publish a listing, to facilitate buying and selling.",
    dataProtectionTitle: "Data Protection",
    dataProtectionDesc: "We use advanced encryption technologies and strict security measures to protect your data from unauthorized access, modification, disclosure, or destruction.",
    cookiesTitle: "Cookies",
    cookiesDesc: "We use cookies to improve your browsing experience and remember your preferences such as language and dark mode. You can control cookie settings from your browser.",
    userRightsTitle: "Your Rights",
    userRightsDesc: "You have the right to access, modify, or delete your personal data at any time through your account settings. You can also request a copy of your data or request complete account deletion.",
    contactTitle: "Contact Us",
    contactDesc: "If you have any questions about our privacy policy, please contact us at: privacy@soukcom.com",
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Rules and conditions governing platform usage",
    back: "Back to Home",
    lastUpdated: "Last updated: February 2026",
    intro: "By using the Open Market platform, you agree to comply with these terms and conditions. Please read them carefully before using the platform.",
    acceptanceTitle: "Acceptance of Terms",
    acceptanceDesc: "By using the platform or creating an account, you acknowledge that you have read, understood, and agreed to these terms. If you do not agree to any of these terms, please do not use the platform.",
    accountTitle: "Account & Registration",
    accountDesc: "You are responsible for maintaining the confidentiality of your account information and password. Information provided during registration must be accurate and truthful. We reserve the right to suspend or terminate your account if false information is provided.",
    listingRulesTitle: "Listing Rules",
    listingRulesDesc: "All published listings must be genuine and accurate. The advertiser bears full responsibility for the content of their listing. Listings must include real product photos, realistic pricing, and correct contact information.",
    prohibitedTitle: "Prohibited Content",
    prohibitedDesc: "It is forbidden to publish listings containing illegal, stolen, or counterfeit products, offensive or discriminatory content, misleading or false information, or any content that violates others' intellectual property rights.",
    liabilityTitle: "Disclaimer",
    liabilityDesc: "The platform is only an intermediary between buyer and seller. We bear no responsibility for product quality or accuracy of information in listings. We always recommend verifying products before purchase and meeting in safe public places.",
    terminationTitle: "Account Termination",
    terminationDesc: "We reserve the right to suspend or terminate your account and delete your listings in case of violation of these terms, receiving multiple complaints, or any behavior that harms the platform or its users.",
    changesTitle: "Changes to Terms",
    changesDesc: "We reserve the right to modify these terms at any time. We will notify you of material changes via email or through a notification on the platform.",
    contactTitle: "Contact Us",
    contactDesc: "For any inquiries about the terms of service, please contact us at: legal@soukcom.com",
  },
  contactForm: {
    title: "Contact Us",
    subtitle: "We're here to help! Send us your message and we'll get back to you soon",
    back: "Back",
    name: "Full Name",
    namePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "Enter your email address",
    subject: "Subject",
    subjectPlaceholder: "Message subject",
    message: "Message",
    messagePlaceholder: "Write your message here...",
    send: "Send Message",
    sending: "Sending...",
    success: "Your message has been sent successfully! We'll respond soon",
    error: "An error occurred while sending the message. Please try again",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email address",
    subjectRequired: "Subject is required",
    messageRequired: "Message is required",
    infoTitle: "Contact Information",
    infoDesc: "You can also reach us through the following channels",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
  },
};

export const tr: Translations = {
  appName: "Souq Alkul",
  appLogo: "S",
  nav: {
    home: "Ana Sayfa",
    categories: "Kategoriler",
    offers: "Teklifler",
    contact: "İletişim",
    addListing: "İlan Ekle",
    myListings: "İlanlarım",
    myOrders: "Siparişlerim",
    favorites: "Favoriler",
    messages: "Mesajlar",
    settings: "Ayarlar",
    adminPanel: "Yönetim Paneli",
    signIn: "Giriş Yap",
    signOut: "Çıkış Yap",
    myAccount: "Hesabım",
    addAd: "İlan Ekle",
  },
  hero: {
    title1: "Her Şeyi ",
    titleHighlight: "Al ve Sat",
    subtitle: "En büyük açık pazar — her gün binlerce yeni ilan",
    searchPlaceholder: "Ne arıyorsunuz?",
    locationPlaceholder: "Şehir veya bölge",
    detectLocation: "Konumumu bul",
    search: "Ara",
    activeAds: "Aktif ilan",
    users: "Kullanıcı",
    categoriesCount: "Kategori",
  },
  categories: {
    browseByCategory: "Kategoriye Göre Ara",
    chooseCategoryDesc: "İhtiyacınıza uygun kategoriyi seçin",
    cars: "Arabalar",
    realEstate: "Emlak",
    electronics: "Elektronik",
    clothing: "Giyim",
    furniture: "Mobilya",
    jobs: "İş İlanları",
    games: "Oyunlar",
    services: "Hizmetler",
    dating: "Tanışma",
    pets: "Evcil Hayvanlar",
    industrial: "Endüstriyel Ekipman",
    agricultural: "Tarım Ekipmanı",
    other: "Diğer",
    allCategories: "Tüm Kategoriler",
    ad: "ilan",
  },
  cities: {
    damascus: "Şam",
    aleppo: "Halep",
    homs: "Humus",
    hama: "Hama",
    latakia: "Lazkiye",
    tartus: "Tartus",
    deirEzZor: "Deir ez-Zor",
    raqqa: "Rakka",
    hasaka: "Haseke",
    daraa: "Dera",
    sweida: "Süveyda",
    idlib: "İdlib",
    quneitra: "Kuneytra",
    rifDimashq: "Şam Kırsalı",
    allCities: "Tüm Şehirler",
  },
  listings: {
    latestListings: "Son İlanlar",
    viewAll: "Tümünü Gör",
    noListings: "İlan bulunamadı",
    allListings: "Tüm İlanlar",
    browseAds: "Göz At",
    featured: "Öne Çıkan",
    search: "İlanlarda ara...",
    filters: "Filtreler",
    filterListings: "İlanları Filtrele",
    category: "Kategori",
    city: "Şehir",
    area: "Bölge",
    allAreas: "Tüm Bölgeler",
    priceRange: "Fiyat Aralığı",
    sortBy: "Sırala",
    clearFilters: "Filtreleri Temizle",
    newest: "En Yeni",
    oldest: "En Eski",
    priceAsc: "Fiyat: Düşükten Yükseğe",
    priceDesc: "Fiyat: Yüksekten Düşüğe",
    searchIn: "İlanlarda ara...",
    ad: "ilan",
    available: "ilan mevcut",
  },
  details: {
    back: "Geri",
    description: "Açıklama",
    noDescription: "Açıklama yok",
    sellerInfo: "Satıcı Bilgileri",
    member: "Kullanıcı",
    memberSince: "Üyelik tarihi",
    call: "Ara",
    whatsapp: "WhatsApp",
    chatWithSeller: "Satıcıyla Sohbet",
    reportListing: "İlanı Şikayet Et",
    noPhone: "Satıcı telefon numarası eklemedi",
    views: "görüntüleme",
    safetyTips: "Güvenlik İpuçları",
    tip1: "Satıcıyla halka açık yerde buluşun",
    tip2: "Ödeme yapmadan ürünü kontrol edin",
    tip3: "Peşin para göndermeyin",
    tip4: "Gerçek olamayacak kadar iyi tekliflere dikkat edin",
  },
  auth: {
    login: "Giriş Yap",
    signup: "Kayıt Ol",
    phone: "Telefon Numarası",
    verifyCode: "Doğrulama Kodu",
    sendCode: "Kod Gönder",
    fullName: "Ad Soyad",
    welcomeBack: "Tekrar Hoşgeldiniz",
    createAccount: "Yeni Hesap Oluştur",
    email: "E-posta",
    password: "Şifre",
    enterFullName: "Adınızı ve soyadınızı girin",
    enterPassword: "Şifrenizi girin",
    processing: "İşleniyor...",
    noAccount: "Hesabınız yok mu? Kayıt Olun",
    hasAccount: "Zaten hesabınız var mı? Giriş Yapın",
    loginSuccess: "Başarıyla giriş yapıldı!",
    loginError: "Giriş başarısız: ",
    signupSuccess: "Hesap başarıyla oluşturuldu!",
    signupError: "Hesap oluşturma başarısız: ",
    fullNameRequired: "Lütfen adınızı ve soyadınızı girin",
  },
  report: {
    title: "İlanı Şikayet Et",
    reason: "Şikayet Nedeni",
    details: "Ek detaylar (isteğe bağlı)",
    submit: "Şikayeti Gönder",
    alreadyReported: "Bu ilanı zaten şikayet ettiniz",
    success: "Şikayet başarıyla gönderildi, platformu iyileştirmemize yardımcı olduğunuz için teşekkürler",
    error: "Şikayet gönderilirken bir hata oluştu",
    selectReason: "Lütfen bir neden seçin",
    reasons: {
      inappropriate: "Uygunsuz veya rahatsız edici içerik",
      fraud: "Sahte veya yanıltıcı ilan",
      fakePrice: "Gerçekçi olmayan fiyat",
      stolenImages: "Çalıntı veya sahte görseller",
      spam: "Tekrarlanan veya spam ilan",
      other: "Diğer neden",
    },
  },
  footer: {
    about: "Hakkında",
    aboutDesc: "Alım satım için en büyük açık pazar. Alıcıları ve satıcıları kolaylık ve güvenlik ile bir araya getiriyoruz.",
    quickLinks: "Hızlı Bağlantılar",
    categoriesTitle: "Kategoriler",
    contactUs: "İletişim",
    rights: "© 2024 Açık Pazar. Tüm hakları saklıdır.",
    privacy: "Gizlilik Politikası",
    terms: "Şartlar ve Koşullar",
  },
  admin: {
    dashboard: "Yönetim Paneli",
    statsAndReports: "Genel istatistikler ve şikayet yönetimi",
    activeAds: "Aktif ilan",
    registeredUsers: "Kayıtlı kullanıcı",
    reportsSubmitted: "Şikayet",
    totalViews: "Toplam görüntüleme",
    categoryDistribution: "Kategoriye Göre İlanlar",
    dailyListings: "Günlük İlanlar (Son 30 Gün)",
    pending: "Beklemede",
    reviewed: "İncelendi",
    resolved: "Çözüldü",
    dismissed: "Reddedildi",
    allReports: "Tüm Şikayetler",
    reports: "şikayet",
    listing: "İlan",
    reporter: "Şikayet Eden",
    reasonCol: "Neden",
    date: "Tarih",
    status: "Durum",
    actions: "İşlemler",
    reportDetails: "Şikayet Detayları",
    changeStatus: "Durumu Değiştir",
    viewListing: "İlanı Görüntüle",
    deleteListing: "İlanı Sil",
    confirmDelete: "Silmeyi Onayla",
    confirmDeleteDesc: "Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    cancel: "İptal",
    delete: "Sil",
    noReports: "Şikayet yok",
    noReportsDesc: "Mevcut filtreyle eşleşen şikayet yok",
    exportCsv: "CSV Dışa Aktar",
    exportReports: "Şikayetleri Dışa Aktar",
    exportListings: "İlanları Dışa Aktar",
    exportUsers: "Kullanıcıları Dışa Aktar",
    filterByStatus: "Duruma göre filtrele",
    adCount: "İlan sayısı",
    deletedListing: "Silinmiş ilan",
    user: "Kullanıcı",
  },
  common: {
    loading: "Yükleniyor...",
    error: "Bir hata oluştu",
    success: "İşlem başarılı",
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    close: "Kapat",
    confirm: "Onayla",
    syp: "SL",
    minutesAgo: "dakika önce",
    hoursAgo: "saat önce",
    dayAgo: "bir gün önce",
    daysAgo: "gün önce",
    weekAgo: "hafta önce",
  },
  ratings: {
    title: "Değerlendirmeler",
    addRating: "Değerlendirme Ekle",
    noRatings: "Henüz değerlendirme yok",
    comment: "Yorum",
    submit: "Değerlendirmeyi Gönder",
  },
  messages: {
    title: "Mesajlar",
    noMessages: "Mesaj yok",
    typeMessage: "Bir mesaj yazın...",
    send: "Gönder",
    noConversations: "Henüz sohbet yok",
    startFromListing: "Herhangi bir ilan sayfasından sohbet başlatın",
    startNow: "Sohbete şimdi başlayın",
    user: "Kullanıcı",
    listing: "İlan",
    you: "Siz",
    conversation: "Sohbet",
  },
  settings: {
    title: "Ayarlar",
    language: "Dil",
    theme: "Tema",
    darkMode: "Karanlık Mod",
    darkModeDesc: "Açık ve karanlık mod arasında geçiş yapın",
    lightMode: "Açık Mod",
    notifications: "Bildirimler",
    editProfile: "Profil bilgilerini düzenle",
    backToListings: "İlanlarıma dön",
    profilePicture: "Profil Fotoğrafı",
    profilePictureDesc: "Başkalarının göreceği fotoğrafınız",
    clickToChange: "Fotoğrafı değiştirmek için kamera simgesine tıklayın",
    maxSize: "Maks boyut: 2MB",
    personalInfo: "Kişisel Bilgiler",
    basicInfo: "Temel bilgileriniz",
    email: "E-posta",
    emailCantChange: "E-posta değiştirilemez",
    fullName: "Ad Soyad",
    fullNamePlaceholder: "Adınızı ve soyadınızı girin",
    contactInfo: "İletişim Bilgileri",
    contactInfoDesc: "Başkalarının size nasıl ulaşacağı",
    phone: "Telefon Numarası",
    phonePlaceholder: "09xxxxxxxx",
    phoneHint: "Suriye telefon numarası (09 ile başlar)",
    phoneError: "Telefon numarası 09 ile başlamalı ve 10 hane olmalıdır",
    location: "Konum",
    locationDesc: "İlanlar için varsayılan konumunuz",
    city: "Şehir",
    selectCity: "Şehir seçin",
    saveChanges: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    saveSuccess: "Ayarlar başarıyla kaydedildi",
    saveError: "Ayarlar kaydedilemedi",
    uploadSuccess: "Fotoğraf başarıyla yüklendi",
    uploadError: "Fotoğraf yüklenemedi",
    invalidImage: "Lütfen geçerli bir resim dosyası seçin",
    imageTooLarge: "Resim boyutu 2MB'den küçük olmalıdır",
    loadError: "Hesap verileri yüklenemedi",
    changePassword: "Şifre Değiştir",
    changePasswordDesc: "Hesap şifrenizi güncelleyin",
    currentPassword: "Mevcut Şifre",
    currentPasswordPlaceholder: "Mevcut şifrenizi girin",
    newPassword: "Yeni Şifre",
    newPasswordPlaceholder: "Yeni şifrenizi girin",
    confirmPassword: "Şifreyi Onayla",
    confirmPasswordPlaceholder: "Yeni şifreyi tekrar girin",
    updatePassword: "Şifreyi Güncelle",
    updatingPassword: "Güncelleniyor...",
    passwordSuccess: "Şifre başarıyla değiştirildi",
    passwordError: "Şifre değiştirilemedi",
    passwordMismatch: "Şifreler eşleşmiyor",
    passwordTooShort: "Şifre en az 6 karakter olmalıdır",
    currentPasswordRequired: "Lütfen mevcut şifrenizi girin",
  },
  myAccount: {
    title: "İlanlarım",
    subtitle: "Tüm ilanlarınızı tek yerden yönetin",
    settingsBtn: "Ayarlar",
    backToHome: "Ana Sayfaya Dön",
    noListings: "Henüz ilan yok",
    noListingsDesc: "İlk ilanınızı şimdi ekleyerek başlayın",
    addNewListing: "Yeni İlan Ekle",
    noDescription: "Açıklama yok",
    views: "görüntüleme",
    editBtn: "Düzenle",
    deleteBtn: "Sil",
    deleteConfirm: "Bu ilanı silmek istediğinizden emin misiniz?",
    deleteConfirmDesc: "Bu ilan kalıcı olarak silinecek ve geri alınamaz.",
    cancelBtn: "İptal",
    deleteListingBtn: "İlanı Sil",
    deleting: "Siliniyor...",
    deleteSuccess: "İlan başarıyla silindi",
    deleteError: "İlan silinemedi",
    loadError: "İlanlar yüklenemedi",
    markAsSold: "Satıldı",
    markAsActive: "Yeniden Etkinleştir",
    soldSuccess: "İlan satıldı olarak işaretlendi",
    reactivateSuccess: "İlan yeniden etkinleştirildi",
    soldBadge: "Satıldı",
  },
  favoritesPage: {
    title: "Favoriler",
    savedAds: "Kayıtlı ilanlar",
    pleaseSignIn: "Lütfen giriş yapın",
    mustSignIn: "Favori ilanlarınızı görmek için giriş yapmalısınız",
    noFavorites: "Favori ilan yok",
    startAdding: "Önemli ilanları favorilerinize eklemeye başlayın",
  },
  messagesPage: {
    title: "Mesajlar",
    noMessages: "Mesaj yok",
    noMessagesDesc: "Satıcıyla iletişim kurmak için herhangi bir ilan sayfasından sohbet başlatın",
    listing: "İlan",
    user: "Kullanıcı",
    you: "Siz",
    now: "Şimdi",
    minsAgo: "dk",
    hoursAgo: "sa",
    daysAgo: "g",
  },
  listingForm: {
    addTitle: "Yeni İlan Ekle",
    editTitle: "İlanı Düzenle",
    titleLabel: "İlan Başlığı",
    titlePlaceholder: "İlan başlığını girin",
    description: "Açıklama",
    descriptionPlaceholder: "Detaylı bir açıklama girin",
    price: "Fiyat (SL)",
    category: "Kategori",
    selectCategory: "Kategori seçin",
    autoDetected: "Otomatik algılandı",
    city: "Şehir",
    selectCity: "Şehir seçin",
    myLocation: "Konumum",
    area: "Bölge",
    selectArea: "Bölge seçin",
    selectCityFirst: "Önce şehir seçin",
    phone: "Telefon Numarası",
    adType: "İlan Türü",
    freeAd: "Ücretsiz İlan",
    freeAdDesc: "Ücretli ilanlardan sonra görünür",
    paidAd: "Ücretli İlan",
    paidAdDesc: "Her zaman önce görünür",
    images: "İlan Görselleri",
    uploading: "Yükleniyor...",
    moderating: "Görseller AI ile kontrol ediliyor...",
    clickToUpload: "Görsel yüklemek için tıklayın",
    clickToUploadMore: "Daha fazla görsel yüklemek için tıklayın",
    rejectedImages: "Aşağıdaki görseller reddedildi:",
    publishAd: "İlanı Yayınla",
    publishing: "Yayınlanıyor...",
    saveChanges: "Değişiklikleri Kaydet",
    updating: "Güncelleniyor...",
    cancel: "İptal",
    status: "İlan Durumu",
    selectStatus: "Durum seçin",
    requiredFields: "Lütfen tüm zorunlu alanları doldurun",
    invalidPhone: "Lütfen geçerli bir telefon numarası girin (09xxxxxxxx)",
    uploadFailed: "Görsel yüklenemedi",
    uploadedChecking: "görsel yüklendi, içerik kontrol ediliyor...",
    imagesApproved: "görsel onaylandı",
    imagesRejected: "görsel politika ihlali nedeniyle reddedildi",
    categoryDetected: "Kategori otomatik algılandı",
    addSuccess: "İlan başarıyla eklendi!",
    addError: "İlan eklenemedi",
    editSuccess: "İlan başarıyla güncellendi!",
    editError: "İlan güncellenemedi",
  },
  pricing: {
    title: "Ücretli İlan Fiyatları",
    subtitle: "Size uygun planı seçin ve ilanlarınız için özel özellikler kazanın",
    back: "Geri",
    free: "Ücretsiz",
    forever: "Süresiz",
    forNewUsers: "Yeni kullanıcılar için",
    featured: "Öne Çıkan",
    monthly: "Aylık",
    mostPopular: "En Popüler",
    professional: "Profesyonel",
    forProfessionals: "Profesyoneller ve şirketler için",
    subscribeNow: "Şimdi Abone Ol",
    startFree: "Ücretsiz Başla",
    freeText: "Ücretsiz",
    freeFeature1: "1 ilan yayınla",
    freeFeature2: "İlan süresi 30 gün",
    freeFeature3: "Ücretli ilanlardan sonra görünür",
    freeFeature4: "İlan başına 1 görsel",
    freeFeature5: "Temel destek",
    freeNot1: "Listenin başına sabitle",
    freeNot2: "Altın rozet",
    freeNot3: "Görüntüleme istatistikleri",
    featuredFeature1: "5 ilan yayınla",
    featuredFeature2: "İlan süresi 60 gün",
    featuredFeature3: "Listenin başına sabitle",
    featuredFeature4: "Altın öne çıkan rozeti",
    featuredFeature5: "İlan başına 10 görsele kadar",
    featuredFeature6: "Görüntüleme istatistikleri",
    featuredFeature7: "Gelişmiş destek",
    featuredNot1: "Arama sonuçlarında öncelik",
    proFeature1: "Sınırsız ilan",
    proFeature2: "İlan süresi 90 gün",
    proFeature3: "Listenin başına sabitle",
    proFeature4: "Altın öne çıkan rozeti",
    proFeature5: "İlan başına 20 görsele kadar",
    proFeature6: "Detaylı istatistikler",
    proFeature7: "Arama sonuçlarında öncelik",
    proFeature8: "7/24 destek",
    proFeature9: "Güvenilir satıcı rozeti",
    faq: "Sıkça Sorulan Sorular",
    faqQ1: "Nasıl ödeme yapılır?",
    faqA1: "Banka havalesi veya elektronik ödeme ile ödeme yapabilirsiniz. Ödeme sonrası planınız 24 saat içinde aktif edilecektir.",
    faqQ2: "Aboneliğimi iptal edebilir miyim?",
    faqA2: "Evet, istediğiniz zaman iptal edebilirsiniz. Ücretli hesabınız mevcut fatura döneminin sonuna kadar aktif kalacaktır.",
    faqQ3: "Ücretsiz ve ücretli ilan arasındaki fark nedir?",
    faqA3: "Ücretli ilanlar her zaman arama sonuçlarının başında görünür ve altın rozet alır, bu da görünürlüğü ve iletişim fırsatlarını artırır.",
  },
  aboutUs: {
    title: "Hakkımızda",
    subtitle: "Hikayemizi ve ekibimizi tanıyın",
    back: "Ana Sayfaya Dön",
    whoWeAre: "Biz Kimiz?",
    whoWeAreDesc: "Alım satım için öncü bir çevrimiçi pazar yeriyiz. Satıcıları ve alıcıları güvenli ve güvenilir tek bir yerde buluşturmayı hedefliyoruz. E-ticareti herkes için erişilebilir kılmak amacıyla kurulduk.",
    ourMission: "Misyonumuz",
    ourMissionDesc: "Herkesin ürün ve hizmetleri kolaylık ve şeffaflıkla alıp satmasını sağlayan, en iyi kullanıcı deneyimini garanti eden kolay ve güvenli bir platform sunmak.",
    ourVision: "Vizyonumuz",
    ourVisionDesc: "En güvenilir yerel e-ticaret platformu olmak ve topluma hizmet eden gelişen bir dijital ekonomi inşa etmeye katkıda bulunmak.",
    whyChooseUs: "Neden Bizi Seçmelisiniz?",
    feature1Title: "Kullanım Kolaylığı",
    feature1Desc: "İlanınızı dakikalar içinde yayınlamanızı sağlayan basit ve akıcı bir arayüz.",
    feature2Title: "Güvenli ve Güvenilir",
    feature2Desc: "Gelişmiş doğrulama sistemi ve kişisel verileriniz ile işlemleriniz için koruma.",
    feature3Title: "Geniş Erişim",
    feature3Desc: "Her gün binlerce aktif kullanıcı, ilanınızın en geniş kitleye ulaşmasını sağlar.",
    feature4Title: "Sürekli Destek",
    feature4Desc: "Her zaman size yardımcı olmak ve sorularınızı yanıtlamak için hazır bir destek ekibi.",
    teamTitle: "Ekibimiz",
    teamDesc: "Kullanıcılarımıza en iyi deneyimi sunmak için tutkuyla çalışan geliştiriciler, tasarımcılar ve e-ticaret uzmanlarından oluşan uzman bir ekip.",
    contactTitle: "Bize Ulaşın",
    contactDesc: "Her türlü soru veya öneri için bizimle iletişime geçmenizden memnuniyet duyarız.",
    contactEmail: "info@soukcom.com",
  },
  privacy: {
    title: "Gizlilik Politikası",
    subtitle: "Verilerinizi nasıl koruyor ve gizliliğinize nasıl saygı duyuyoruz",
    back: "Ana Sayfaya Dön",
    lastUpdated: "Son güncelleme: Şubat 2026",
    intro: "Açık Pazar olarak gizliliğinizi ciddiye alıyoruz. Bu politika, kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.",
    dataCollectionTitle: "Topladığımız Veriler",
    dataCollectionDesc: "Hesap oluştururken doğrudan sağladığınız bilgileri topluyoruz: ad, e-posta, telefon numarası ve şehir. Ayrıca yayınladığınız ilan verilerini de topluyoruz: görseller, açıklamalar ve fiyatlar.",
    dataUsageTitle: "Verilerinizi Nasıl Kullanıyoruz",
    dataUsageDesc: "Verilerinizi hizmetlerimizi sağlamak ve iyileştirmek, hesabınız ve ilanlarınız hakkında sizinle iletişim kurmak, önemli bildirimler göndermek ve platform güvenliğini sağlamak için kullanıyoruz.",
    dataSharingTitle: "Veri Paylaşımı",
    dataSharingDesc: "Kişisel bilgilerinizi üçüncü taraflara satmıyoruz. İletişim bilgilerinizi (telefon numarası gibi) yalnızca ilan yayınladığınızda alım satımı kolaylaştırmak için diğer kullanıcılarla paylaşabiliriz.",
    dataProtectionTitle: "Veri Koruma",
    dataProtectionDesc: "Verilerinizi yetkisiz erişim, değişiklik, ifşa veya imhadan korumak için gelişmiş şifreleme teknolojileri ve sıkı güvenlik önlemleri kullanıyoruz.",
    cookiesTitle: "Çerezler",
    cookiesDesc: "Göz atma deneyiminizi iyileştirmek ve dil ve karanlık mod gibi tercihlerinizi hatırlamak için çerezler kullanıyoruz. Çerez ayarlarını tarayıcınızdan kontrol edebilirsiniz.",
    userRightsTitle: "Haklarınız",
    userRightsDesc: "Hesap ayarlarınız aracılığıyla kişisel verilerinize erişme, değiştirme veya silme hakkınız vardır. Ayrıca verilerinizin bir kopyasını talep edebilir veya hesabınızın tamamen silinmesini isteyebilirsiniz.",
    contactTitle: "Bize Ulaşın",
    contactDesc: "Gizlilik politikamız hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin: privacy@soukcom.com",
  },
  terms: {
    title: "Kullanım Şartları",
    subtitle: "Platform kullanımını düzenleyen kurallar ve koşullar",
    back: "Ana Sayfaya Dön",
    lastUpdated: "Son güncelleme: Şubat 2026",
    intro: "Açık Pazar platformunu kullanarak bu şartlara ve koşullara uymayı kabul ediyorsunuz. Platformu kullanmadan önce lütfen bunları dikkatlice okuyun.",
    acceptanceTitle: "Şartların Kabulü",
    acceptanceDesc: "Platformu kullanarak veya hesap oluşturarak, bu şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylarsınız. Bu şartlardan herhangi birine katılmıyorsanız, lütfen platformu kullanmayın.",
    accountTitle: "Hesap ve Kayıt",
    accountDesc: "Hesap bilgilerinizin ve şifrenizin gizliliğini korumaktan siz sorumlusunuz. Kayıt sırasında sağlanan bilgiler doğru ve gerçek olmalıdır. Yanlış bilgi verilmesi durumunda hesabınızı askıya alma veya sonlandırma hakkımız saklıdır.",
    listingRulesTitle: "İlan Kuralları",
    listingRulesDesc: "Yayınlanan tüm ilanlar gerçek ve doğru olmalıdır. İlan veren, ilanının içeriğinden tamamen sorumludur. İlanlar gerçek ürün fotoğrafları, gerçekçi fiyatlandırma ve doğru iletişim bilgileri içermelidir.",
    prohibitedTitle: "Yasaklı İçerik",
    prohibitedDesc: "Yasadışı, çalıntı veya sahte ürünler, saldırgan veya ayrımcı içerik, yanıltıcı veya yanlış bilgiler veya başkalarının fikri mülkiyet haklarını ihlal eden herhangi bir içerik yayınlamak yasaktır.",
    liabilityTitle: "Sorumluluk Reddi",
    liabilityDesc: "Platform yalnızca alıcı ve satıcı arasında bir aracıdır. İlanlardaki ürün kalitesi veya bilgilerin doğruluğu konusunda hiçbir sorumluluk taşımıyoruz. Satın almadan önce ürünleri doğrulamanızı ve güvenli kamusal alanlarda buluşmanızı her zaman öneriyoruz.",
    terminationTitle: "Hesap Sonlandırma",
    terminationDesc: "Bu şartların ihlali, birden fazla şikayet alınması veya platforma veya kullanıcılarına zarar veren herhangi bir davranış durumunda hesabınızı askıya alma veya sonlandırma ve ilanlarınızı silme hakkımız saklıdır.",
    changesTitle: "Şartlardaki Değişiklikler",
    changesDesc: "Bu şartları istediğimiz zaman değiştirme hakkımız saklıdır. Önemli değişiklikler hakkında sizi e-posta veya platformdaki bir bildirim aracılığıyla bilgilendireceğiz.",
    contactTitle: "Bize Ulaşın",
    contactDesc: "Kullanım şartları hakkında herhangi bir sorunuz için lütfen bizimle iletişime geçin: legal@soukcom.com",
  },
  contactForm: {
    title: "Bize Ulaşın",
    subtitle: "Size yardımcı olmak için buradayız! Mesajınızı gönderin, en kısa sürede size geri dönelim",
    back: "Geri",
    name: "Ad Soyad",
    namePlaceholder: "Adınızı ve soyadınızı girin",
    email: "E-posta",
    emailPlaceholder: "E-posta adresinizi girin",
    subject: "Konu",
    subjectPlaceholder: "Mesaj konusu",
    message: "Mesaj",
    messagePlaceholder: "Mesajınızı buraya yazın...",
    send: "Mesaj Gönder",
    sending: "Gönderiliyor...",
    success: "Mesajınız başarıyla gönderildi! En kısa sürede yanıt vereceğiz",
    error: "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin",
    nameRequired: "Ad gereklidir",
    emailRequired: "E-posta gereklidir",
    emailInvalid: "Geçersiz e-posta adresi",
    subjectRequired: "Konu gereklidir",
    messageRequired: "Mesaj gereklidir",
    infoTitle: "İletişim Bilgileri",
    infoDesc: "Aşağıdaki kanallardan da bize ulaşabilirsiniz",
    emailLabel: "E-posta",
    phoneLabel: "Telefon",
    addressLabel: "Adres",
  },
};

export const translations: Record<Language, Translations> = { ar, en, tr };

export const languageNames: Record<Language, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
};

export const languageDirection: Record<Language, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
  tr: "ltr",
};
