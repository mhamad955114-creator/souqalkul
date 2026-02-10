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
}

export const ar: Translations = {
  appName: "السوق المفتوح",
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
};

export const en: Translations = {
  appName: "Open Market",
  appLogo: "O",
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
};

export const tr: Translations = {
  appName: "Açık Pazar",
  appLogo: "A",
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
