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

  // Messages
  messages: {
    title: string;
    noMessages: string;
    typeMessage: string;
    send: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
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
    typeMessage: "اكتب رسالة...",
    send: "إرسال",
  },
  settings: {
    title: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    notifications: "الإشعارات",
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
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
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
  },
  settings: {
    title: "Ayarlar",
    language: "Dil",
    theme: "Tema",
    notifications: "Bildirimler",
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
