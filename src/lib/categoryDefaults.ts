// ⚠️ AUTO-GENERATED defaults derived from the initial seed migration
// Used by the admin "Reset to defaults" button to restore category_definitions.

export type DefaultCategoryDefinition = {
  category_key: string;
  label: string;
  display_order: number;
  fields: Array<{ key: string; label: string; type: "text" | "select"; options?: string[] }>;
  hide_rules: Record<string, Record<string, string[]>>;
  option_filters: Record<string, Record<string, Record<string, string[]>>>;
};

export const DEFAULT_CATEGORY_DEFINITIONS: DefaultCategoryDefinition[] = [
  {
    "category_key": "سيارات",
    "label": "سيارات",
    "display_order": 1,
    "fields": [
      {
        "key": "model",
        "label": "الموديل",
        "type": "text"
      },
      {
        "key": "year",
        "label": "سنة الصنع",
        "type": "text"
      },
      {
        "key": "registration_year",
        "label": "سنة التسجيل",
        "type": "text"
      },
      {
        "key": "origin",
        "label": "بلد الصنع",
        "type": "text"
      },
      {
        "key": "fuel",
        "label": "نوع الوقود",
        "type": "select",
        "options": [
          "بنزين",
          "ديزل",
          "كهربائي",
          "هايبرد",
          "غاز"
        ]
      },
      {
        "key": "transmission",
        "label": "نوع ناقل الحركة",
        "type": "select",
        "options": [
          "أوتوماتيك",
          "عادي"
        ]
      },
      {
        "key": "drive_type",
        "label": "نوع الدفع",
        "type": "select",
        "options": [
          "أمامي",
          "خلفي",
          "رباعي"
        ]
      },
      {
        "key": "color",
        "label": "اللون",
        "type": "text"
      },
      {
        "key": "doors",
        "label": "عدد الأبواب",
        "type": "select",
        "options": [
          "2 أبواب",
          "4 أبواب",
          "5 أبواب"
        ]
      },
      {
        "key": "previous_owners",
        "label": "عدد المالكين السابقين",
        "type": "select",
        "options": [
          "0 (أول مالك)",
          "1",
          "2",
          "3",
          "أكثر من 3"
        ]
      },
      {
        "key": "licensed",
        "label": "مرخصة",
        "type": "select",
        "options": [
          "نعم",
          "لا"
        ]
      },
      {
        "key": "kilometers",
        "label": "عدد الكيلومترات",
        "type": "text"
      },
      {
        "key": "engine",
        "label": "حجم المحرك",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "عقارات",
    "label": "عقارات",
    "display_order": 2,
    "fields": [
      {
        "key": "property_type",
        "label": "نوع العقار",
        "type": "select",
        "options": [
          "شقة",
          "فيلا",
          "أرض",
          "محل تجاري",
          "مكتب",
          "مستودع",
          "بناء كامل",
          "مزرعة",
          "شاليه"
        ]
      },
      {
        "key": "purpose",
        "label": "الغرض",
        "type": "select",
        "options": [
          "للبيع",
          "للإيجار"
        ]
      },
      {
        "key": "area_sqm",
        "label": "المساحة (م²)",
        "type": "text"
      },
      {
        "key": "rooms",
        "label": "عدد الغرف",
        "type": "text"
      },
      {
        "key": "bathrooms",
        "label": "عدد الحمامات",
        "type": "text"
      },
      {
        "key": "floor",
        "label": "الطابق",
        "type": "text"
      },
      {
        "key": "total_floors",
        "label": "عدد طوابق البناء",
        "type": "text"
      },
      {
        "key": "building_age",
        "label": "عمر العقار",
        "type": "select",
        "options": [
          "جديد",
          "1-5 سنوات",
          "5-10 سنوات",
          "أكثر من 10 سنوات"
        ]
      },
      {
        "key": "furnished",
        "label": "مفروش",
        "type": "select",
        "options": [
          "نعم",
          "لا",
          "نصف مفروش"
        ]
      },
      {
        "key": "view",
        "label": "الإطلالة",
        "type": "select",
        "options": [
          "شارع رئيسي",
          "حديقة",
          "بحر",
          "جبل",
          "مدينة",
          "داخلية",
          "أخرى"
        ]
      },
      {
        "key": "heating",
        "label": "التدفئة",
        "type": "select",
        "options": [
          "مركزية",
          "مازوت",
          "غاز",
          "كهرباء",
          "بدون"
        ]
      },
      {
        "key": "elevator",
        "label": "مصعد",
        "type": "select",
        "options": [
          "نعم",
          "لا"
        ]
      },
      {
        "key": "balcony",
        "label": "شرفة",
        "type": "select",
        "options": [
          "نعم",
          "لا"
        ]
      },
      {
        "key": "parking",
        "label": "موقف سيارة",
        "type": "select",
        "options": [
          "نعم",
          "لا"
        ]
      },
      {
        "key": "tabu",
        "label": "نوع الطابو",
        "type": "select",
        "options": [
          "طابو أخضر",
          "طابو زراعي",
          "حكم محكمة",
          "عقد بيع",
          "وكالة غير قابلة للعزل",
          "بدون"
        ]
      },
      {
        "key": "direction",
        "label": "الاتجاه",
        "type": "select",
        "options": [
          "شمالي",
          "جنوبي",
          "شرقي",
          "غربي",
          "شمالي شرقي",
          "شمالي غربي",
          "جنوبي شرقي",
          "جنوبي غربي"
        ]
      },
      {
        "key": "rental_period",
        "label": "مدة الإيجار",
        "type": "select",
        "options": [
          "شهري",
          "سنوي",
          "يومي"
        ]
      }
    ],
    "hide_rules": {
      "property_type": {
        "أرض": [
          "rooms",
          "bathrooms",
          "floor",
          "total_floors",
          "building_age",
          "furnished",
          "heating",
          "elevator",
          "balcony",
          "view",
          "parking",
          "direction"
        ],
        "مزرعة": [
          "floor",
          "total_floors",
          "elevator",
          "heating",
          "furnished"
        ],
        "محل تجاري": [
          "rooms",
          "furnished",
          "balcony",
          "heating",
          "view",
          "total_floors",
          "elevator",
          "building_age"
        ],
        "مستودع": [
          "rooms",
          "bathrooms",
          "furnished",
          "balcony",
          "heating",
          "view",
          "elevator"
        ],
        "مكتب": [
          "furnished",
          "balcony",
          "heating"
        ],
        "بناء كامل": [
          "floor",
          "furnished"
        ],
        "فيلا": [
          "floor"
        ],
        "شاليه": [
          "floor"
        ]
      },
      "purpose": {
        "للبيع": [
          "rental_period"
        ]
      }
    },
    "option_filters": {}
  },
  {
    "category_key": "الكترونيات",
    "label": "الكترونيات",
    "display_order": 3,
    "fields": [
      {
        "key": "device_type",
        "label": "نوع الجهاز",
        "type": "select",
        "options": [
          "هاتف محمول",
          "لابتوب",
          "تابلت",
          "كمبيوتر مكتبي",
          "تلفزيون",
          "سماعات",
          "كاميرا",
          "طابعة",
          "أخرى"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "model",
        "label": "الموديل",
        "type": "text"
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد",
          "مستعمل",
          "مجدد"
        ]
      },
      {
        "key": "screen_size",
        "label": "حجم الشاشة",
        "type": "text"
      },
      {
        "key": "storage",
        "label": "سعة التخزين",
        "type": "select",
        "options": [
          "16GB",
          "32GB",
          "64GB",
          "128GB",
          "256GB",
          "512GB",
          "1TB",
          "2TB",
          "أخرى"
        ]
      },
      {
        "key": "ram",
        "label": "الذاكرة (RAM)",
        "type": "select",
        "options": [
          "2GB",
          "4GB",
          "6GB",
          "8GB",
          "12GB",
          "16GB",
          "32GB",
          "64GB",
          "أخرى"
        ]
      },
      {
        "key": "os",
        "label": "نظام التشغيل",
        "type": "select",
        "options": [
          "Android",
          "iOS",
          "Windows",
          "macOS",
          "Linux",
          "أخرى"
        ]
      },
      {
        "key": "battery",
        "label": "حالة البطارية",
        "type": "select",
        "options": [
          "ممتازة",
          "جيدة",
          "متوسطة",
          "ضعيفة"
        ]
      },
      {
        "key": "color",
        "label": "اللون",
        "type": "text"
      },
      {
        "key": "warranty",
        "label": "الضمان",
        "type": "select",
        "options": [
          "نعم",
          "لا"
        ]
      }
    ],
    "hide_rules": {
      "device_type": {
        "سماعات": [
          "screen_size",
          "storage",
          "ram",
          "os",
          "battery"
        ],
        "كاميرا": [
          "ram",
          "os"
        ],
        "طابعة": [
          "screen_size",
          "ram",
          "os",
          "battery"
        ],
        "تلفزيون": [
          "ram",
          "battery",
          "os"
        ]
      }
    },
    "option_filters": {}
  },
  {
    "category_key": "أثاث",
    "label": "أثاث",
    "display_order": 4,
    "fields": [
      {
        "key": "furniture_type",
        "label": "نوع الأثاث",
        "type": "select",
        "options": [
          "غرفة نوم",
          "غرفة جلوس",
          "صالون",
          "سفرة",
          "مطبخ",
          "مكتب",
          "خزانة",
          "سرير",
          "طاولة",
          "كرسي",
          "أخرى"
        ]
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد",
          "مستعمل - ممتاز",
          "مستعمل - جيد",
          "مستعمل - مقبول"
        ]
      },
      {
        "key": "material",
        "label": "المادة",
        "type": "select",
        "options": [
          "خشب طبيعي",
          "خشب صناعي (MDF)",
          "معدن",
          "قماش",
          "جلد",
          "زجاج",
          "بلاستيك",
          "أخرى"
        ]
      },
      {
        "key": "pieces_count",
        "label": "عدد القطع",
        "type": "select",
        "options": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "أكثر من 8"
        ]
      },
      {
        "key": "color",
        "label": "اللون",
        "type": "select",
        "options": [
          "أبيض",
          "أسود",
          "بني",
          "بيج",
          "رمادي",
          "أحمر",
          "أزرق",
          "أخضر",
          "خشبي طبيعي",
          "متعدد الألوان",
          "أخرى"
        ]
      },
      {
        "key": "design_style",
        "label": "نمط التصميم",
        "type": "select",
        "options": [
          "كلاسيكي",
          "مودرن",
          "عصري",
          "ريفي",
          "إسلامي",
          "بسيط (مينيمال)",
          "أخرى"
        ]
      },
      {
        "key": "dimensions",
        "label": "الأبعاد (الطول × العرض × الارتفاع)",
        "type": "text"
      }
    ],
    "hide_rules": {
      "furniture_type": {
        "سرير": [
          "pieces_count"
        ],
        "خزانة": [
          "pieces_count"
        ],
        "طاولة": [
          "pieces_count",
          "design_style"
        ],
        "كرسي": [
          "pieces_count",
          "design_style"
        ],
        "غرفة نوم": [
          "dimensions"
        ],
        "غرفة جلوس": [
          "dimensions"
        ],
        "صالون": [
          "dimensions"
        ],
        "سفرة": [
          "dimensions"
        ],
        "مطبخ": [
          "dimensions"
        ]
      }
    },
    "option_filters": {
      "material": {
        "furniture_type": {
          "سرير": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "معدن",
            "قماش",
            "جلد",
            "أخرى"
          ],
          "خزانة": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "معدن",
            "زجاج",
            "أخرى"
          ],
          "طاولة": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "معدن",
            "زجاج",
            "بلاستيك",
            "أخرى"
          ],
          "كرسي": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "معدن",
            "قماش",
            "جلد",
            "بلاستيك",
            "أخرى"
          ],
          "مكتب": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "معدن",
            "زجاج",
            "أخرى"
          ],
          "غرفة نوم": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "أخرى"
          ],
          "سفرة": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "زجاج",
            "أخرى"
          ],
          "مطبخ": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "معدن",
            "أخرى"
          ],
          "غرفة جلوس": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "قماش",
            "جلد",
            "أخرى"
          ],
          "صالون": [
            "خشب طبيعي",
            "خشب صناعي (MDF)",
            "قماش",
            "جلد",
            "أخرى"
          ]
        }
      }
    }
  },
  {
    "category_key": "ملابس",
    "label": "ملابس",
    "display_order": 5,
    "fields": [
      {
        "key": "clothing_type",
        "label": "نوع الملابس",
        "type": "select",
        "options": [
          "قميص",
          "بنطال",
          "فستان",
          "جاكيت",
          "معطف",
          "بدلة",
          "عباية",
          "حجاب",
          "ملابس رياضية",
          "ملابس داخلية",
          "بيجامة",
          "أخرى"
        ]
      },
      {
        "key": "size",
        "label": "المقاس",
        "type": "select",
        "options": [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "XXL",
          "3XL",
          "4XL",
          "مقاس حر"
        ]
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد بالتغليف",
          "جديد بدون تغليف",
          "مستعمل - ممتاز",
          "مستعمل - جيد"
        ]
      },
      {
        "key": "gender",
        "label": "الجنس",
        "type": "select",
        "options": [
          "رجالي",
          "نسائي",
          "أطفال",
          "للجنسين"
        ]
      },
      {
        "key": "brand",
        "label": "العلامة التجارية",
        "type": "text"
      },
      {
        "key": "fabric",
        "label": "الخامة",
        "type": "select",
        "options": [
          "قطن",
          "بوليستر",
          "حرير",
          "صوف",
          "كتان",
          "جلد",
          "جينز",
          "شيفون",
          "مخلوط",
          "أخرى"
        ]
      },
      {
        "key": "season",
        "label": "الموسم",
        "type": "select",
        "options": [
          "صيفي",
          "شتوي",
          "ربيعي/خريفي",
          "لجميع الفصول"
        ]
      },
      {
        "key": "color",
        "label": "اللون",
        "type": "select",
        "options": [
          "أبيض",
          "أسود",
          "أحمر",
          "أزرق",
          "أخضر",
          "بني",
          "بيج",
          "رمادي",
          "وردي",
          "أصفر",
          "متعدد الألوان",
          "أخرى"
        ]
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "اكسسوارات",
    "label": "اكسسوارات",
    "display_order": 6,
    "fields": [
      {
        "key": "accessory_type",
        "label": "نوع الاكسسوار",
        "type": "select",
        "options": [
          "ساعات",
          "نظارات",
          "مجوهرات",
          "حقائب",
          "أحزمة",
          "محافظ",
          "قبعات",
          "أوشحة",
          "أخرى"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "material",
        "label": "المادة",
        "type": "select",
        "options": [
          "ذهب",
          "فضة",
          "جلد طبيعي",
          "جلد صناعي",
          "ستانلس ستيل",
          "تيتانيوم",
          "بلاستيك",
          "قماش",
          "أخرى"
        ]
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد بالتغليف",
          "جديد بدون تغليف",
          "مستعمل - ممتاز",
          "مستعمل - جيد"
        ]
      },
      {
        "key": "gender",
        "label": "الجنس",
        "type": "select",
        "options": [
          "رجالي",
          "نسائي",
          "للجنسين"
        ]
      },
      {
        "key": "color",
        "label": "اللون",
        "type": "select",
        "options": [
          "ذهبي",
          "فضي",
          "أسود",
          "بني",
          "أبيض",
          "متعدد الألوان",
          "أخرى"
        ]
      },
      {
        "key": "origin",
        "label": "بلد المنشأ",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "مكياج",
    "label": "مكياج",
    "display_order": 7,
    "fields": [
      {
        "key": "product_type",
        "label": "نوع المنتج",
        "type": "select",
        "options": [
          "عطور",
          "كريمات",
          "أدوات تجميل",
          "مكياج وجه",
          "عناية بالبشرة",
          "عناية بالشعر",
          "طلاء أظافر",
          "أخرى"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد مغلف",
          "جديد مفتوح",
          "مستعمل"
        ]
      },
      {
        "key": "origin",
        "label": "بلد المنشأ",
        "type": "text"
      },
      {
        "key": "skin_type",
        "label": "نوع البشرة",
        "type": "select",
        "options": [
          "جميع الأنواع",
          "بشرة دهنية",
          "بشرة جافة",
          "بشرة مختلطة",
          "بشرة حساسة"
        ]
      },
      {
        "key": "expiry",
        "label": "تاريخ الانتهاء",
        "type": "text"
      }
    ],
    "hide_rules": {
      "product_type": {
        "عطور": [
          "skin_type"
        ],
        "طلاء أظافر": [
          "skin_type"
        ],
        "عناية بالشعر": [
          "skin_type"
        ],
        "أدوات تجميل": [
          "skin_type"
        ]
      }
    },
    "option_filters": {}
  },
  {
    "category_key": "خدمات",
    "label": "خدمات",
    "display_order": 8,
    "fields": [
      {
        "key": "service_type",
        "label": "نوع الخدمة",
        "type": "select",
        "options": [
          "صيانة",
          "تنظيف",
          "نقل",
          "توصيل",
          "تصميم",
          "برمجة",
          "تدريس",
          "ترجمة",
          "تصوير",
          "حلاقة وتجميل",
          "سباكة",
          "كهرباء",
          "أخرى"
        ]
      },
      {
        "key": "availability",
        "label": "التوفر",
        "type": "select",
        "options": [
          "متاح الآن",
          "بالحجز المسبق",
          "أيام محددة"
        ]
      },
      {
        "key": "experience",
        "label": "سنوات الخبرة",
        "type": "select",
        "options": [
          "أقل من سنة",
          "1-3 سنوات",
          "3-5 سنوات",
          "أكثر من 5 سنوات"
        ]
      },
      {
        "key": "service_area",
        "label": "نطاق الخدمة",
        "type": "select",
        "options": [
          "داخل المدينة",
          "المحافظة كاملة",
          "عدة محافظات",
          "جميع المحافظات"
        ]
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "وظائف",
    "label": "وظائف",
    "display_order": 9,
    "fields": [
      {
        "key": "job_type",
        "label": "نوع الوظيفة",
        "type": "select",
        "options": [
          "دوام كامل",
          "دوام جزئي",
          "عن بعد",
          "مؤقت",
          "تدريب",
          "عقد"
        ]
      },
      {
        "key": "job_field",
        "label": "المجال",
        "type": "select",
        "options": [
          "تقنية المعلومات",
          "هندسة",
          "طب",
          "تعليم",
          "محاسبة",
          "تسويق",
          "إدارة",
          "خدمة عملاء",
          "حرف يدوية",
          "نقل وتوصيل",
          "أخرى"
        ]
      },
      {
        "key": "experience",
        "label": "الخبرة المطلوبة",
        "type": "select",
        "options": [
          "بدون خبرة",
          "أقل من سنة",
          "1-3 سنوات",
          "3-5 سنوات",
          "5-10 سنوات",
          "أكثر من 10 سنوات"
        ]
      },
      {
        "key": "education",
        "label": "المؤهل العلمي",
        "type": "select",
        "options": [
          "غير مطلوب",
          "ثانوية",
          "معهد",
          "بكالوريوس",
          "ماجستير",
          "دكتوراه"
        ]
      },
      {
        "key": "salary_range",
        "label": "نطاق الراتب",
        "type": "text"
      },
      {
        "key": "gender_pref",
        "label": "الجنس المطلوب",
        "type": "select",
        "options": [
          "ذكر",
          "أنثى",
          "غير محدد"
        ]
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "ألعاب",
    "label": "ألعاب",
    "display_order": 10,
    "fields": [
      {
        "key": "game_type",
        "label": "نوع اللعبة",
        "type": "select",
        "options": [
          "ألعاب فيديو",
          "ألعاب طاولة",
          "ألعاب أطفال",
          "ألعاب تعليمية",
          "دمى",
          "ألعاب خارجية",
          "بازل",
          "ليغو",
          "أخرى"
        ]
      },
      {
        "key": "age_group",
        "label": "الفئة العمرية",
        "type": "select",
        "options": [
          "0-3 سنوات",
          "3-6 سنوات",
          "6-12 سنة",
          "12+ سنة",
          "للجميع"
        ]
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد بالتغليف",
          "جديد بدون تغليف",
          "مستعمل - ممتاز",
          "مستعمل - جيد"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "platform",
        "label": "المنصة (لألعاب الفيديو)",
        "type": "select",
        "options": [
          "PlayStation",
          "Xbox",
          "Nintendo",
          "PC",
          "موبايل",
          "غير محدد"
        ]
      },
      {
        "key": "pieces_count",
        "label": "عدد القطع",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "حيوانات أليفة",
    "label": "حيوانات أليفة",
    "display_order": 11,
    "fields": [
      {
        "key": "animal_type",
        "label": "نوع الحيوان",
        "type": "select",
        "options": [
          "قط",
          "كلب",
          "طيور",
          "أسماك",
          "سلاحف",
          "أرانب",
          "هامستر",
          "أخرى"
        ]
      },
      {
        "key": "age",
        "label": "العمر",
        "type": "select",
        "options": [
          "أقل من شهر",
          "1-6 أشهر",
          "6-12 شهر",
          "1-3 سنوات",
          "أكثر من 3 سنوات"
        ]
      },
      {
        "key": "gender",
        "label": "الجنس",
        "type": "select",
        "options": [
          "ذكر",
          "أنثى",
          "غير معروف"
        ]
      },
      {
        "key": "vaccinated",
        "label": "محصّن",
        "type": "select",
        "options": [
          "نعم",
          "لا",
          "جزئياً"
        ]
      },
      {
        "key": "breed",
        "label": "السلالة",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "معدات صناعية",
    "label": "معدات صناعية",
    "display_order": 12,
    "fields": [
      {
        "key": "equipment_type",
        "label": "نوع المعدات",
        "type": "select",
        "options": [
          "مخارط",
          "لحام",
          "ضواغط",
          "مولدات",
          "مضخات",
          "رافعات",
          "قص وثني",
          "أخرى"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد",
          "مستعمل",
          "مجدد"
        ]
      },
      {
        "key": "power_source",
        "label": "مصدر الطاقة",
        "type": "select",
        "options": [
          "كهربائي",
          "ديزل",
          "بنزين",
          "يدوي",
          "هوائي"
        ]
      },
      {
        "key": "year",
        "label": "سنة الصنع",
        "type": "text"
      },
      {
        "key": "warranty",
        "label": "الضمان",
        "type": "select",
        "options": [
          "نعم",
          "لا"
        ]
      },
      {
        "key": "capacity",
        "label": "القدرة/الطاقة",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "معدات زراعية",
    "label": "معدات زراعية",
    "display_order": 13,
    "fields": [
      {
        "key": "equipment_type",
        "label": "نوع المعدات",
        "type": "select",
        "options": [
          "جرار",
          "محراث",
          "حصادة",
          "رشاش",
          "مضخة ري",
          "منشار",
          "أخرى"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد",
          "مستعمل",
          "مجدد"
        ]
      },
      {
        "key": "power_source",
        "label": "مصدر الطاقة",
        "type": "select",
        "options": [
          "كهربائي",
          "ديزل",
          "بنزين",
          "يدوي"
        ]
      },
      {
        "key": "year",
        "label": "سنة الصنع",
        "type": "text"
      },
      {
        "key": "usage",
        "label": "الاستخدام",
        "type": "select",
        "options": [
          "حراثة",
          "ري",
          "حصاد",
          "رش",
          "نقل",
          "تقليم",
          "أخرى"
        ]
      },
      {
        "key": "hours_used",
        "label": "ساعات العمل",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "مواد بناء",
    "label": "مواد بناء",
    "display_order": 14,
    "fields": [
      {
        "key": "material_type",
        "label": "نوع المادة",
        "type": "select",
        "options": [
          "إسمنت",
          "حديد",
          "بلاط",
          "دهانات",
          "رمل",
          "بلوك",
          "خشب",
          "أنابيب",
          "عوازل",
          "أخرى"
        ]
      },
      {
        "key": "quantity",
        "label": "الكمية",
        "type": "text"
      },
      {
        "key": "unit",
        "label": "وحدة القياس",
        "type": "select",
        "options": [
          "طن",
          "كيلو",
          "متر",
          "متر مربع",
          "متر مكعب",
          "قطعة",
          "كيس",
          "لتر"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "origin",
        "label": "بلد المنشأ",
        "type": "select",
        "options": [
          "سوري",
          "تركي",
          "إيراني",
          "صيني",
          "أوروبي",
          "أخرى"
        ]
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "مواد غذائية",
    "label": "مواد غذائية",
    "display_order": 15,
    "fields": [
      {
        "key": "food_type",
        "label": "نوع المنتج",
        "type": "select",
        "options": [
          "حبوب وبقوليات",
          "زيوت وسمن",
          "معلبات",
          "بهارات",
          "مشروبات",
          "ألبان وأجبان",
          "حلويات",
          "أغذية مجمدة",
          "أخرى"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "weight",
        "label": "الوزن / الحجم",
        "type": "text"
      },
      {
        "key": "origin",
        "label": "بلد المنشأ",
        "type": "select",
        "options": [
          "سوري",
          "تركي",
          "لبناني",
          "سعودي",
          "مصري",
          "أخرى"
        ]
      },
      {
        "key": "expiry_date",
        "label": "تاريخ الانتهاء",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "مطاعم",
    "label": "مطاعم",
    "display_order": 16,
    "fields": [
      {
        "key": "cuisine_type",
        "label": "نوع المأكولات",
        "type": "select",
        "options": [
          "وجبات سريعة",
          "مشاوي",
          "بيتزا ومعجنات",
          "حلويات",
          "مأكولات شرقية",
          "مأكولات غربية",
          "مأكولات بحرية",
          "عصائر ومشروبات",
          "أخرى"
        ]
      },
      {
        "key": "price_range",
        "label": "نطاق السعر",
        "type": "select",
        "options": [
          "رخيص $",
          "متوسط $$",
          "مرتفع $$$"
        ]
      },
      {
        "key": "delivery",
        "label": "خدمة التوصيل",
        "type": "select",
        "options": [
          "متوفرة",
          "غير متوفرة"
        ]
      },
      {
        "key": "working_hours",
        "label": "ساعات العمل",
        "type": "text"
      },
      {
        "key": "seating",
        "label": "جلسات داخلية",
        "type": "select",
        "options": [
          "متوفرة",
          "غير متوفرة",
          "داخلية وخارجية"
        ]
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  },
  {
    "category_key": "أخرى",
    "label": "أخرى",
    "display_order": 17,
    "fields": [
      {
        "key": "item_type",
        "label": "نوع المنتج",
        "type": "text"
      },
      {
        "key": "condition",
        "label": "الحالة",
        "type": "select",
        "options": [
          "جديد",
          "مستعمل - ممتاز",
          "مستعمل - جيد",
          "مستعمل - مقبول"
        ]
      },
      {
        "key": "brand",
        "label": "الماركة",
        "type": "text"
      },
      {
        "key": "quantity",
        "label": "الكمية",
        "type": "text"
      }
    ],
    "hide_rules": {},
    "option_filters": {}
  }
] as const;
