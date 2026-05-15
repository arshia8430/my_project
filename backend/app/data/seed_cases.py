CASES_DATA = [
    {
        "case_id": "status-epilepticus",
        "name": "Patient SE-001",
        "diagnosis": "Status Epilepticus",
        "condition": "critical",
        "position": "supine, HOB 30°",
        "diet": "npo",
        "difficulty": "hard",
        "category": "Emergency Medicine",
        "initial_vitals": {
            "hr": 122,
            "spo2": 89,
            "bp": "140/90",
            "gcs": 3
        },
        "stages": [
            {
                "type": "story",
                "question": "مرد 34 ساله‌ای توسط EMS به اورژانس منتقل شده است. طبق گزارش، بیمار حدود 8 دقیقه است که در حال تشنج مداوم Generalized Tonic-Clonic است. همراه بیمار گزارش می‌دهد که بیمار سابقه صرع دارد اما چند روزی است دارویش را نخورده."
            },
            {
                "type": "question",
                "question": "اولین اقدام شما چیست؟",
                "options": [
                    {"id": "ct", "text": "درخواست CT Brain فوری", "isCorrect": False},
                    {"id": "iv", "text": "برقراری دسترسی وریدی و اکسیژن‌رسانی", "isCorrect": True},
                    {"id": "intubation", "text": "اینتوباسیون فوری بدون آمادگی", "isCorrect": False},
                    {"id": "lumbar", "text": "Lumbar Puncture برای رد مننژیت", "isCorrect": False}
                ],
                "hint": "در هر بیمار اورژانسی، ابتدا ABC (Airway, Breathing, Circulation) را تامین کنید. دسترسی وریدی و اکسیژن‌رسانی گام اول است.",
                "orderText": "IV line 18G ×2 | O₂ NRB mask 15 L/min | Pulse Ox | Cardiac monitor",
                "vitalsUpdate": {"hr": 118, "spo2": 94, "bp": "140/90", "gcs": 3}
            },
            {
                "type": "question",
                "question": "قبل از تجویز هر دارویی، یک آزمایش سریع بالینی باید انجام دهید. کدام است؟",
                "options": [
                    {"id": "mri", "text": "MRI مغز اورژانسی", "isCorrect": False},
                    {"id": "bs", "text": "اندازه‌گیری سریع قند خون (Fingerstick BS)", "isCorrect": True},
                    {"id": "eeg", "text": "EEG اورژانسی", "isCorrect": False},
                    {"id": "xray", "text": "رادیوگرافی قفسه سینه", "isCorrect": False}
                ],
                "hint": "Hypoglycemia شایع‌ترین علت قابل برگشت تشنج است. قند خون 45 mg/dL می‌تواند تشنج ایجاد کند و با دکستروز قابل درمان است.",
                "orderText": "Fingerstick Blood Glucose STAT",
                "vitalsUpdate": {"hr": 118, "spo2": 94, "bp": "140/90", "gcs": 3}
            },
            {
                "type": "story",
                "question": "قند خون بیمار 110 mg/dL است — هیپوگلیسمی رد شد. تشنج همچنان ادامه دارد. بر اساس گایدلاین AES، خط اول درمان Status Epilepticus باید آغاز شود."
            },
            {
                "type": "question",
                "question": "داروی خط اول برای قطع تشنج در Status Epilepticus چیست؟",
                "options": [
                    {"id": "phenytoin", "text": "Phenytoin IV", "isCorrect": False},
                    {"id": "benzo", "text": "Benzodiazepine — Lorazepam یا Diazepam IV", "isCorrect": True},
                    {"id": "phenobarbital", "text": "Phenobarbital IV", "isCorrect": False},
                    {"id": "valproate", "text": "Valproate IV", "isCorrect": False}
                ],
                "hint": "طبق گایدلاین Neurocritical Care Society، Benzodiazepines خط اول Urgent therapy هستند و باید در 5 دقیقه اول تجویز شوند.",
                "orderText": "Lorazepam 4mg IV over 2min (یا Diazepam 10mg IV)",
                "vitalsUpdate": {"hr": 105, "spo2": 96, "bp": "135/88", "gcs": 5}
            },
            {
                "type": "question",
                "question": "پس از تجویز اول Benzodiazepine، تشنج 5 دقیقه بعد هنوز ادامه دارد. اقدام بعدی شما چیست؟",
                "options": [
                    {"id": "wait", "text": "5 دقیقه دیگر صبر کنید و مشاهده کنید", "isCorrect": False},
                    {"id": "repeat_benzo", "text": "یک دوز دیگر Benzodiazepine تجویز کنید", "isCorrect": True},
                    {"id": "intubate", "text": "فوراً اینتوبه کنید", "isCorrect": False},
                    {"id": "discharge", "text": "بیمار را به ICU منتقل کنید بدون درمان بیشتر", "isCorrect": False}
                ],
                "hint": "اگر دوز اول بی‌اثر بود، می‌توان یک بار دیگر Benzodiazepine تکرار کرد قبل از رفتن به Established therapy.",
                "orderText": "Lorazepam 4mg IV (second dose) — 5 min after first dose",
                "vitalsUpdate": {"hr": 100, "spo2": 96, "bp": "132/85", "gcs": 5}
            },
            {
                "type": "question",
                "question": "تشنج همچنان ادامه دارد (≥20 دقیقه). کدام داروی Established therapy مناسب است؟",
                "options": [
                    {"id": "valproate", "text": "Valproate Sodium IV 40 mg/kg", "isCorrect": True},
                    {"id": "diazepam_po", "text": "Diazepam خوراکی", "isCorrect": False},
                    {"id": "haloperidol", "text": "Haloperidol IM", "isCorrect": False},
                    {"id": "aspirin", "text": "Aspirin 325mg", "isCorrect": False}
                ],
                "hint": "Established therapy شامل Valproate، Levetiracetam یا Fosphenytoin IV است. Valproate در بیماران صرعی با سابقه داروی ضدتشنج ارجح است.",
                "orderText": "Valproate Sodium 40 mg/kg IV در 10 دقیقه | ICU consult",
                "vitalsUpdate": {"hr": 92, "spo2": 97, "bp": "128/82", "gcs": 8}
            },
            {
                "type": "question",
                "question": "چه آزمایش‌های STAT باید همزمان درخواست دهید؟",
                "options": [
                    {"id": "hiv_lipid", "text": "HIV + Lipid Panel", "isCorrect": False},
                    {"id": "stat_labs", "text": "CBC, BMP, Mg, Ca, Phenytoin Level, ABG, Lactate", "isCorrect": True},
                    {"id": "thyroid", "text": "Thyroid Function Tests", "isCorrect": False},
                    {"id": "coag", "text": "فقط PT/PTT", "isCorrect": False}
                ],
                "hint": "در Status Epilepticus باید علل متابولیک (Na، Ca، Mg، Glucose)، سطح داروهای ضدتشنج، و عفونت بررسی شوند. ABG برای ارزیابی اسیدوز ناشی از تشنج ضروری است.",
                "orderText": "STAT: CBC, BMP, Mg, Ca, Phenytoin level, ABG, Lactate, Blood cultures",
                "vitalsUpdate": {"hr": 90, "spo2": 97, "bp": "126/80", "gcs": 10}
            }
        ]
    },
    {
        "case_id": "hypertension",
        "name": "Patient HTN-002",
        "diagnosis": "Hypertensive Emergency",
        "condition": "urgent",
        "position": "semi-fowler",
        "diet": "cardiac",
        "difficulty": "medium",
        "category": "Cardiology",
        "initial_vitals": {
            "hr": 98,
            "spo2": 95,
            "bp": "220/130",
            "gcs": 15
        },
        "stages": [
            {
                "type": "story",
                "question": "زن 62 ساله‌ای با شکایت سردرد شدید پس‌سری، تاری دید، و سرگیجه به اورژانس مراجعه کرده است. BP: 220/130 mmHg. سابقه HTN دارد اما گفته چند هفتی است داروهایش را نگرفته. معاینه: papilledema در فوندوسکوپی مشاهده می‌شود."
            },
            {
                "type": "question",
                "question": "برای تشخیص Hypertensive Emergency، چه شرطی باید وجود داشته باشد؟",
                "options": [
                    {"id": "bp_alone", "text": "BP بالای 180/120 به تنهایی کافی است", "isCorrect": False},
                    {"id": "eod", "text": "BP بالا + شواهد آسیب حاد به ارگان هدف (End-Organ Damage)", "isCorrect": True},
                    {"id": "symptoms", "text": "هر بیمار پرفشاری خون با علائم", "isCorrect": False},
                    {"id": "sbp", "text": "SBP بالای 200 به تنهایی", "isCorrect": False}
                ],
                "hint": "تمایز Hypertensive Emergency از Urgency در وجود آسیب حاد به ارگان‌های هدف (مغز، قلب، کلیه، چشم) است. در این بیمار papilledema نشانه End-Organ Damage است.",
                "orderText": "ECG 12-lead | Fundoscopic exam | Urinalysis | BMP | CBC",
                "vitalsUpdate": {"hr": 96, "spo2": 95, "bp": "218/128", "gcs": 15}
            },
            {
                "type": "question",
                "question": "هدف اولیه کاهش BP در Hypertensive Emergency چیست؟",
                "options": [
                    {"id": "normal", "text": "رساندن فوری BP به حد طبیعی (120/80) در یک ساعت", "isCorrect": False},
                    {"id": "25_percent", "text": "کاهش MAP حداکثر 25% در اولین ساعت", "isCorrect": True},
                    {"id": "diastolic", "text": "فقط کنترل دیاستولیک به زیر 100", "isCorrect": False},
                    {"id": "slow", "text": "کاهش طی 24-48 ساعت در منزل با داروی خوراکی", "isCorrect": False}
                ],
                "hint": "کاهش سریع و شدید BP می‌تواند ایسکمی مغزی، کرونری یا کلیوی ایجاد کند. کاهش ≤25% MAP در ساعت اول و سپس رساندن تدریجی به هدف طی 24-48 ساعت استاندارد است.",
                "orderText": "Target: MAP reduction ≤25% in 1st hour | Continuous BP monitoring",
                "vitalsUpdate": {"hr": 94, "spo2": 96, "bp": "210/125", "gcs": 15}
            },
            {
                "type": "question",
                "question": "کدام داروی IV برای کنترل BP در این بیمار مناسب‌ترین است؟",
                "options": [
                    {"id": "nicardipine", "text": "Nicardipine IV infusion", "isCorrect": True},
                    {"id": "nifedipine_sl", "text": "Nifedipine زیرزبانی", "isCorrect": False},
                    {"id": "oral_captopril", "text": "Captopril خوراکی", "isCorrect": False},
                    {"id": "furosemide", "text": "Furosemide IV به تنهایی", "isCorrect": False}
                ],
                "hint": "داروهای IV با قابلیت تیتراسیون مثل Nicardipine یا Labetalol ارجح هستند. Nifedipine SL ممنوع است زیرا کاهش ناگهانی BP ایجاد می‌کند. Nitroprusside در غیاب ایسکمی مغزی گزینه دیگری است.",
                "orderText": "Nicardipine 5 mg/hr IV (titrate 2.5 mg/hr q5min تا هدف) | ICU admission",
                "vitalsUpdate": {"hr": 90, "spo2": 96, "bp": "188/115", "gcs": 15}
            },
            {
                "type": "question",
                "question": "MRI مغز انجام می‌شود و PRES (Posterior Reversible Encephalopathy Syndrome) مطرح است. بهترین اقدام بعدی کدام است؟",
                "options": [
                    {"id": "continue_bp", "text": "ادامه کنترل BP با هدف MAP reduction ≤25%", "isCorrect": True},
                    {"id": "tpa", "text": "تجویز tPA برای سکته مغزی", "isCorrect": False},
                    {"id": "steroids", "text": "شروع کورتیکواستروئید IV", "isCorrect": False},
                    {"id": "surgery", "text": "جراحی فوری", "isCorrect": False}
                ],
                "hint": "PRES با کنترل BP برگشت‌پذیر است. tPA در PRES کنتراندیکه است. اصلاح BP کلید درمان است — کاهش تدریجی و کنترل‌شده.",
                "orderText": "Continue Nicardipine titration | Neuro ICU admission | Repeat MRI in 24-48h",
                "vitalsUpdate": {"hr": 86, "spo2": 97, "bp": "170/105", "gcs": 15}
            },
            {
                "type": "question",
                "question": "آزمایشات کلیوی نشان می‌دهد Creatinine از 1.1 به 2.8 رسیده (AKI). داروی ضد فشار خون طولانی‌مدت مناسب برای این بیمار پس از پایداری چیست؟",
                "options": [
                    {"id": "acei", "text": "ACE inhibitor (مثل Enalapril)", "isCorrect": True},
                    {"id": "nsaid", "text": "NSAID برای کنترل درد و سردرد", "isCorrect": False},
                    {"id": "aspirin_only", "text": "Aspirin به تنهایی", "isCorrect": False},
                    {"id": "no_drug", "text": "نیازی به داروی بلندمدت نیست", "isCorrect": False}
                ],
                "hint": "ACE inhibitorها در HTN همراه با AKI (به خصوص در بیماران دیابتی) نفروپروتکتیو هستند. باید پس از پایداری و با مانیتورینگ کراتینین شروع شوند.",
                "orderText": "Discharge plan: Enalapril 5mg PO BID | Nephrology follow-up in 1 week | Home BP monitoring",
                "vitalsUpdate": {"hr": 82, "spo2": 97, "bp": "155/95", "gcs": 15}
            }
        ]
    },
    {
        "case_id": "pneumonia",
        "name": "Patient CAP-003",
        "diagnosis": "Community-Acquired Pneumonia",
        "condition": "moderate",
        "position": "semi-fowler",
        "diet": "regular",
        "difficulty": "medium",
        "category": "Infectious Disease",
        "initial_vitals": {
            "hr": 102,
            "spo2": 90,
            "bp": "125/80",
            "gcs": 15
        },
        "stages": [
            {
                "type": "story",
                "question": "مرد 68 ساله‌ای با شکایت تب (38.9°C)، لرز، سرفه با خلط زرد-سبز رنگ، و تنگی نفس از 3 روز پیش به اورژانس آمده است. سابقه: DM type 2، سیگاری 30 pack-year. رادیوگرافی قفسه سینه: Consolidation لوب راست تحتانی."
            },
            {
                "type": "question",
                "question": "برای تصمیم‌گیری درباره بستری یا ترخیص، از کدام ابزار ریسک‌بندی استفاده می‌کنید؟",
                "options": [
                    {"id": "curb65", "text": "CURB-65 Score", "isCorrect": True},
                    {"id": "wells", "text": "Wells Score", "isCorrect": False},
                    {"id": "apacheii", "text": "APACHE II", "isCorrect": False},
                    {"id": "sofa", "text": "SOFA Score", "isCorrect": False}
                ],
                "hint": "CURB-65 (Confusion, Urea >7, RR ≥30, BP <90/60, Age ≥65) ابزار استاندارد ریسک‌بندی پنومونی اکتسابی از جامعه است. نمره ≥2 نشانه بستری است.",
                "orderText": "CURB-65 assessment | CXR PA & Lateral | CBC, BMP, LFTs | Blood cultures ×2",
                "vitalsUpdate": {"hr": 100, "spo2": 91, "bp": "125/80", "gcs": 15}
            },
            {
                "type": "question",
                "question": "محاسبه CURB-65 این بیمار: Confusion: خیر | BUN: 24 mg/dL (Urea ≈8.6 mmol/L) | RR: 26/min | BP: 125/80 | Age: 68. نمره چند است و چه تصمیمی می‌گیرید؟",
                "options": [
                    {"id": "score1_discharge", "text": "نمره 1 — ترخیص با آنتی‌بیوتیک خوراکی", "isCorrect": False},
                    {"id": "score2_admit", "text": "نمره 2 — بستری در بخش", "isCorrect": True},
                    {"id": "score3_icu", "text": "نمره 3 — بستری در ICU", "isCorrect": False},
                    {"id": "score0_home", "text": "نمره 0 — بیمار می‌تواند به خانه برود", "isCorrect": False}
                ],
                "hint": "نمره: BUN >7 mmol/L (+1) + Age ≥65 (+1) = 2. نمره 2 به بستری در بخش عمومی نیاز دارد. RR 26 زیر آستانه 30 است (+0)، BP طبیعی (+0)، بدون Confusion (+0).",
                "orderText": "Admit to General Medicine ward | O₂ via nasal cannula 2-4 L/min | Continuous monitoring",
                "vitalsUpdate": {"hr": 98, "spo2": 93, "bp": "122/78", "gcs": 15}
            },
            {
                "type": "question",
                "question": "آنتی‌بیوتیک امپیریک مناسب برای CAP در بیمار بستری (Non-ICU) بر اساس گایدلاین IDSA/ATS کدام است؟",
                "options": [
                    {"id": "amox", "text": "Amoxicillin خوراکی به تنهایی", "isCorrect": False},
                    {"id": "beta_macro", "text": "Beta-lactam (Ampicillin/Sulbactam) + Macrolide (Azithromycin)", "isCorrect": True},
                    {"id": "vancomycin", "text": "Vancomycin IV به تنهایی", "isCorrect": False},
                    {"id": "metro", "text": "Metronidazole + Clindamycin", "isCorrect": False}
                ],
                "hint": "برای CAP بستری Non-ICU، گایدلاین IDSA/ATS توصیه می‌کند: Beta-lactam + Macrolide یا Respiratory Fluoroquinolone (Levofloxacin). Beta-lactam Atypical را پوشش نمی‌دهد، پس باید با Macrolide ترکیب شود.",
                "orderText": "Ampicillin/Sulbactam 3g IV q6h + Azithromycin 500mg IV q24h",
                "vitalsUpdate": {"hr": 92, "spo2": 95, "bp": "120/76", "gcs": 15}
            },
            {
                "type": "question",
                "question": "بعد از 48 ساعت آنتی‌بیوتیک IV، بیمار بهتر شده: تب کاهش یافته، SpO2: 96% روی هوای اتاق. اقدام بعدی کدام است؟",
                "options": [
                    {"id": "iv_continue", "text": "ادامه آنتی‌بیوتیک IV به مدت 10 روز دیگر", "isCorrect": False},
                    {"id": "switch_oral", "text": "Switch به آنتی‌بیوتیک خوراکی و آماده‌سازی ترخیص", "isCorrect": True},
                    {"id": "bronchoscopy", "text": "برونکوسکوپی تشخیصی", "isCorrect": False},
                    {"id": "ct_scan", "text": "CT Chest فوری برای بررسی بیشتر", "isCorrect": False}
                ],
                "hint": "Switch Therapy از IV به خوراکی پس از پایداری بالینی (تب کمتر، بهبود اکسیژناسیون، توانایی دریافت دارو) توصیه می‌شود و مدت بستری و هزینه را کاهش می‌دهد.",
                "orderText": "Step-down: Amoxicillin/Clavulanate 875mg PO BID + Azithromycin 500mg PO QD | Plan discharge",
                "vitalsUpdate": {"hr": 85, "spo2": 96, "bp": "118/75", "gcs": 15}
            },
            {
                "type": "question",
                "question": "در هنگام ترخیص چه توصیه‌های پیشگیرانه باید ارائه دهید؟",
                "options": [
                    {"id": "nothing", "text": "نیازی به توصیه خاصی نیست", "isCorrect": False},
                    {"id": "vaccine_smoking", "text": "واکسیناسیون Pneumococcal + Influenza + مشاوره ترک سیگار", "isCorrect": True},
                    {"id": "antibiotics_chronic", "text": "آنتی‌بیوتیک پیشگیرانه مزمن", "isCorrect": False},
                    {"id": "isolation", "text": "ایزولاسیون کامل در منزل برای 3 ماه", "isCorrect": False}
                ],
                "hint": "افراد ≥65 ساله یا بیماران با COPD/DM باید واکسن Pneumococcal (PCV20 یا PPSV23) و سالانه واکسن آنفلوانزا دریافت کنند. ترک سیگار خطر عود CAP را کاهش می‌دهد.",
                "orderText": "Discharge: PCV20 vaccine today | Flu vaccine (if season) | Smoking cessation referral | Follow-up GP in 1 week",
                "vitalsUpdate": {"hr": 80, "spo2": 97, "bp": "118/75", "gcs": 15}
            }
        ]
    }
]
