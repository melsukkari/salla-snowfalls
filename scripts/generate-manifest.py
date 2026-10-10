#!/usr/bin/env python3
"""
Generates twilight-bundle.json and templates/*.json for the Mawsim bundle.

Run:  python3 scripts/generate-manifest.py

Edit the COMPONENTS and TEMPLATES sections below, then re-run.
Keys are derived from names (uuid5), so they stay identical between runs —
never change a component's `name` after publishing, or merchants lose its settings.
"""
import copy
import json
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NS = uuid.UUID("6f1c2b8e-3d4a-4f5b-9c6d-7e8f9a0b1c2d")
REPO = "https://github.com/melsukkari/salla-snowfalls"
PREVIEW_BASE = "https://raw.githubusercontent.com/melsukkari/salla-snowfalls/master/docs/previews"


def key(name: str) -> str:
    return str(uuid.uuid5(NS, name))


# ---------------------------------------------------------------- field helpers
def ml(id, label, ar, en="", fmt="text", max_len=120, required=False, desc=None):
    f = {
        "id": id,
        "type": "string",
        "format": fmt,
        "multilanguage": True,
        "label": label,
        "required": required,
        "maxLength": max_len,
        "value": {"ar": ar, "en": en},
    }
    if fmt == "textarea":
        f["rows"] = 3
    if desc:
        f["description"] = desc
    return f


def text(id, label, fmt="text", max_len=200, required=False, placeholder=None):
    f = {"id": id, "type": "string", "format": fmt, "label": label, "required": required, "maxLength": max_len}
    if fmt == "textarea":
        f["rows"] = 3
    if placeholder:
        f["placeholder"] = placeholder
    return f


def url(id, label, desc="اتركه فارغاً ليفتح الزر لوحة منتجات العرض فوق الصفحة (أو ينتقل لقسم المنتجات حسب الإعداد التالي)."):
    return {
        "id": id,
        "type": "string",
        "format": "url",
        "label": label,
        "placeholder": "https://",
        "required": False,
        "description": desc,
    }


def image(id, label, desc=None):
    f = {"id": id, "type": "string", "format": "image", "label": label, "required": False}
    if desc:
        f["description"] = desc
    return f


def switch(id, label, value, desc=None):
    f = {"id": id, "type": "boolean", "format": "switch", "label": label, "required": False, "value": value}
    if desc:
        f["description"] = desc
    return f


def opt(label, value):
    return {"label": label, "value": value, "key": value}


def choice(id, label, options, selected, fmt="dropdown-list", desc=None):
    opts = [opt(l, v) for l, v in options]
    sel = [o for o in opts if o["value"] == selected]
    f = {
        "id": id,
        "type": "items",
        "format": fmt,
        "source": "Manual",
        "label": label,
        "required": True,
        "options": opts,
        "selected": sel,
    }
    if desc:
        f["description"] = desc
    return f


def tone(selected="auto"):
    return choice(
        "tone",
        "خلفية القسم",
        [("تلقائي (شفاف)", "auto"), ("لون فاتح من لون المتجر", "tint"), ("لون المتجر الأساسي", "primary"), ("داكن", "dark")],
        selected,
    )


def accent():
    return {
        "id": "accent_color",
        "type": "string",
        "format": "color",
        "inputType": "color",
        "label": "لون مخصص (اختياري)",
        "required": False,
        "description": "يستخدم لون متجرك تلقائياً. اختر لوناً هنا فقط إذا أردت لوناً مختلفاً لهذا القسم.",
    }


SCENE_OPTIONS = [
    ("بدون", "none"),
    ("رمضان: فوانيس معلّقة وهلال ونجوم", "ramadan"),
    ("ثلج: كرات ثلج متساقطة", "snow"),
    ("رمضان + ثلج", "ramadan-snow"),
    ("قصاصات احتفالية ملونة", "confetti"),
    ("نجوم وأهلّة ذهبية متساقطة", "stars"),
]


def cta_action():
    return choice(
        "cta_action",
        "عند الضغط على زر بدون رابط",
        [("افتح لوحة منتجات العرض فوق الصفحة", "board"), ("انتقل إلى قسم المنتجات", "scroll")],
        "board",
        desc="لوحة المنتجات تعرض منتجات عنصر «منتجات الحملة» مع عرض سريع وإضافة للسلة.",
    )


ICONS = [
    ("صح ✓", "check"), ("شحن", "truck"), ("ضمان / حماية", "shield"), ("دفع", "card"),
    ("استرجاع", "return"), ("نجمة", "star"), ("هدية", "gift"), ("وقت", "clock"),
    ("دعم / محادثة", "chat"), ("تميّز", "sparkle"), ("قلب", "heart"), ("طبيعي", "leaf"),
    ("سرعة", "bolt"), ("جودة", "medal"), ("هاتف", "phone"), ("هلال", "moon"), ("عرض / سعر", "tag"),
]


def icon_field(selected="check"):
    return choice("icon", "الأيقونة", ICONS, selected)


def icon_val(v):
    label = next(l for l, val in ICONS if val == v)
    return [opt(label, v)]


def collection(id, label, item_label, fields, value, min_len=1, max_len=12, desc=None):
    f = {
        "id": id,
        "type": "collection",
        "format": "collection",
        "label": label,
        "item_label": item_label,
        "required": True,
        "minLength": min_len,
        "maxLength": max_len,
        "fields": fields,
        "value": value,
    }
    if desc:
        f["description"] = desc
    return f


def component(name, title, icon, fields):
    return {
        "title": title,
        "icon": icon,
        "name": name,
        "key": key(name),
        "image": f"{PREVIEW_BASE}/{name}.png",
        "fields": fields,
    }


# ---------------------------------------------------------------- components (default = product launch copy)
COMPONENTS = [
    component("mawsim-festive-layer", "موسم · أجواء احتفالية للصفحة", "sicon-star", [
        choice("effect", "التأثير", [
            ("كرات ثلج متساقطة", "snow"),
            ("نجوم وأهلّة ذهبية (رمضان)", "stars"),
            ("قصاصات احتفالية ملونة", "confetti"),
        ], "snow", desc="تتساقط فوق الصفحة كلها ولا تمنع الضغط على الأزرار. اللمس أو النقر يطلق شرارات ذهبية."),
        choice("density", "الكثافة", [("خفيفة", "0.6"), ("متوسطة", "1"), ("كثيفة", "1.6")], "1", fmt="radio-list"),
        {"id": "duration", "type": "number", "format": "slider", "inputType": "range", "label": "مدة التأثير بالثواني (0 = دائماً)", "required": False, "minimum": 0, "maximum": 120, "step": 5, "value": 0},
        switch("show_toggle", "زر صغير لإيقاف/تشغيل التأثير", True),
        switch("desktop_only", "الشاشات الكبيرة فقط", False, desc="فعّلها إذا أردت توفير البطارية على الجوال."),
        accent(),
    ]),
    component("mawsim-hero", "موسم · الواجهة الرئيسية", "sicon-rocket", [
        ml("eyebrow", "نص صغير فوق العنوان", "إطلاق جديد", "New launch", max_len=40),
        ml("title", "العنوان الرئيسي", "منتج واحد يغيّر روتينك اليومي", "One product that changes your daily routine", max_len=90, required=True),
        ml("subtitle", "الوصف", "صمّمناه بعناية ليوفر وقتك ويمنحك نتيجة تلاحظها من أول استخدام.", "Carefully designed to save your time and give you results from the first use.", fmt="textarea", max_len=240),
        ml("cta_label", "نص الزر الرئيسي", "اطلبه الآن", "Order now", max_len=30),
        url("cta_link", "رابط الزر الرئيسي"),
        cta_action(),
        ml("secondary_label", "نص الزر الثانوي (اختياري)", "", "", max_len=30),
        url("secondary_link", "رابط الزر الثانوي", desc="يظهر الزر الثانوي فقط عند إضافة نص ورابط."),
        ml("note", "ملاحظة أسفل الأزرار", "شحن سريع لجميع مناطق المملكة", "Fast shipping across the Kingdom", max_len=80),
        image("image", "صورة المنتج / الحملة", desc="المقاس المقترح 1200×1000. بدون صورة يظهر القسم بتصميم مركزي مع زخرفة."),
        ml("image_alt", "وصف الصورة (لمحركات البحث)", "", "", max_len=120),
        ml("badge", "شارة على الصورة", "خصم 20% لفترة محدودة", "20% off — limited time", max_len=40),
        choice("layout", "تخطيط القسم", [("النص ثم الصورة", "split"), ("الصورة ثم النص", "split-reverse"), ("الصورة كخلفية", "cover")], "split"),
        choice("decor", "زخرفة (عند عدم وجود صورة)", [("بدون", "none"), ("هلال ونجوم", "crescent"), ("نقش هندسي", "geometric"), ("لمعات", "sparkle"), ("أمواج", "waves")], "waves"),
        choice("scene", "خلفية تفاعلية متحركة", SCENE_OPTIONS, "none",
               desc="فوانيس تتأرجح عند تمرير الماوس أو اللمس، وكرات ثلج تتطاير بعيداً عن المؤشر. تظهر أفضل مع خلفية «لون المتجر» أو «داكن»."),
        choice("scene_density", "كثافة الحركة", [("خفيفة", "0.6"), ("متوسطة", "1"), ("كثيفة", "1.5")], "1", fmt="radio-list"),
        tone("tint"),
        accent(),
    ]),
    component("mawsim-countdown", "موسم · عداد العرض", "sicon-bell", [
        ml("title", "العنوان", "العرض ينتهي خلال", "Offer ends in", max_len=60, required=True),
        ml("subtitle", "سطر توضيحي", "الكمية محدودة والسعر يعود بعد انتهاء العداد", "Limited stock — price goes back up when the timer ends", max_len=100),
        {"id": "end_datetime", "type": "string", "format": "datetime", "inputType": "date", "label": "تاريخ ووقت نهاية العرض", "required": True, "value": "2026-12-31T23:59:00"},
        ml("expired_text", "النص بعد انتهاء العرض", "انتهى العرض — تابعنا للعروض القادمة", "Offer ended — follow us for the next one", max_len=80),
        switch("hide_when_expired", "إخفاء القسم بعد انتهاء العرض", False),
        switch("arabic_digits", "أرقام عربية (٠١٢٣)", False),
        ml("cta_label", "نص الزر", "الحق العرض", "Grab the deal", max_len=30),
        url("cta_link", "رابط الزر"),
        cta_action(),
        tone("primary"),
        accent(),
    ]),
    component("mawsim-product-spotlight", "موسم · منتجات الحملة", "sicon-tag", [
        ml("eyebrow", "نص صغير فوق العنوان", "الأكثر طلباً", "Best sellers", max_len=40),
        ml("title", "العنوان", "اختيارات الحملة", "Campaign picks", max_len=80),
        ml("subtitle", "الوصف", "منتجات مختارة بأسعار خاصة لفترة محدودة", "Hand-picked products at special prices for a limited time", max_len=160),
        {"id": "products", "type": "items", "format": "dropdown-list", "source": "products", "label": "المنتجات", "description": "اختر حتى 8 منتجات.", "multichoice": True, "searchable": True, "required": True, "maxLength": 8, "options": [], "selected": []},
        ml("ribbon", "شارة على كل منتج (اختياري)", "", "", max_len=24),
        switch("show_add_to_cart", "زر الإضافة للسلة", True, desc="المنتجات التي لها خيارات (مقاس/لون) تفتح العرض السريع ثم صفحة المنتج."),
        choice("open_mode", "عند الضغط على المنتج", [("عرض سريع في لوحة فوق الصفحة", "board"), ("الانتقال لصفحة المنتج", "page")], "board"),
        ml("board_title", "عنوان لوحة المنتجات", "", "", max_len=60, desc="يُستخدم عنوان القسم إذا تُرك فارغاً."),
        ml("board_subtitle", "وصف لوحة المنتجات", "", "", max_len=120),
        choice("board_scene", "خلفية لوحة المنتجات المتحركة", SCENE_OPTIONS, "confetti"),
        choice("columns", "عدد الأعمدة على الشاشات الكبيرة", [("2", "2"), ("3", "3"), ("4", "4")], "4", fmt="radio-list"),
        ml("more_label", "زر عرض المزيد (اختياري)", "", "", max_len=30),
        url("more_link", "رابط عرض المزيد", desc="يظهر الزر فقط عند إضافة نص ورابط."),
        tone("auto"),
        accent(),
    ]),
    component("mawsim-problem-solution", "موسم · المشكلة والحل", "sicon-check-circle", [
        ml("title", "العنوان", "لماذا يحتاجه عملاؤنا؟", "Why our customers need it", max_len=80),
        ml("subtitle", "الوصف", "", "", max_len=160),
        ml("problem_title", "عنوان المشكلة", "قبل", "Before", max_len=40),
        collection("problems", "نقاط المشكلة", "نقطة", [text("text", "النص", max_len=140, required=True)], [
            {"text": "تضيع وقتك في حلول مؤقتة لا تدوم"},
            {"text": "نتائج غير واضحة رغم كثرة التجارب"},
            {"text": "أسعار مرتفعة مقابل جودة متوسطة"},
        ], max_len=6),
        ml("solution_title", "عنوان الحل", "بعد", "After", max_len=40),
        collection("solutions", "نقاط الحل", "نقطة", [text("text", "النص", max_len=140, required=True)], [
            {"text": "حل واحد متكامل يغنيك عن البدائل"},
            {"text": "نتيجة ملحوظة من الاستخدام الأول"},
            {"text": "جودة عالية بسعر عادل وضمان حقيقي"},
        ], max_len=6),
        image("image", "صورة توضيحية (اختياري)"),
        ml("cta_label", "نص الزر (اختياري)", "", "", max_len=30),
        url("cta_link", "رابط الزر"),
        cta_action(),
        tone("auto"),
        accent(),
    ]),
    component("mawsim-benefits", "موسم · المميزات", "sicon-layout-grid-rearrange", [
        ml("eyebrow", "نص صغير فوق العنوان", "", "", max_len=40),
        ml("title", "العنوان", "مميزات تفرق معك", "Benefits you will feel", max_len=80),
        ml("subtitle", "الوصف", "", "", max_len=160),
        collection("items", "المميزات", "ميزة", [icon_field("check"), text("title", "العنوان", max_len=60, required=True), text("text", "الوصف", fmt="textarea", max_len=180)], [
            {"icon": icon_val("medal"), "title": "جودة مضمونة", "text": "خامات مختارة واختبارات جودة قبل الشحن."},
            {"icon": icon_val("bolt"), "title": "نتيجة سريعة", "text": "تلاحظ الفرق من أول استخدام."},
            {"icon": icon_val("leaf"), "title": "مكونات آمنة", "text": "مناسب للاستخدام اليومي لكل أفراد العائلة."},
            {"icon": icon_val("truck"), "title": "شحن سريع", "text": "توصيل خلال 1-3 أيام عمل."},
        ], max_len=12),
        choice("columns", "عدد الأعمدة", [("2", "2"), ("3", "3"), ("4", "4")], "4", fmt="radio-list"),
        choice("align", "محاذاة النص", [("بداية السطر", "start"), ("وسط", "center")], "center", fmt="radio-list"),
        tone("auto"),
        accent(),
    ]),
    component("mawsim-testimonials", "موسم · آراء العملاء", "sicon-star", [
        ml("eyebrow", "نص صغير فوق العنوان", "آراء حقيقية", "Real reviews", max_len=40),
        ml("title", "العنوان", "عملاؤنا جرّبوا وقالوا", "Our customers tried it", max_len=80),
        ml("subtitle", "الوصف", "", "", max_len=160),
        switch("show_summary", "إظهار متوسط التقييم", True),
        ml("summary_text", "نص بجانب التقييم", "من تقييمات عملائنا", "from our customers' reviews", max_len=50),
        collection("items", "التقييمات", "تقييم", [
            text("name", "اسم العميل", max_len=40, required=True),
            text("city", "المدينة (اختياري)", max_len=30),
            text("text", "نص التقييم", fmt="textarea", max_len=300),
            {"id": "rating", "type": "number", "format": "slider", "inputType": "range", "label": "التقييم", "required": False, "minimum": 1, "maximum": 5, "step": 1, "value": 5},
            image("avatar", "صورة العميل (اختياري)"),
        ], [
            {"name": "نورة", "city": "الرياض", "text": "وصلني الطلب بسرعة والجودة أفضل مما توقعت. صار من مشترياتي الثابتة.", "rating": 5},
            {"name": "عبدالله", "city": "جدة", "text": "تعامل راقٍ وتغليف ممتاز، والمنتج نفس الوصف تماماً.", "rating": 5},
            {"name": "ريم", "city": "الدمام", "text": "جربته بعد تردد، والنتيجة فعلاً واضحة. أنصح فيه.", "rating": 4},
        ], max_len=12),
        tone("tint"),
        accent(),
    ]),
    component("mawsim-comparison", "موسم · جدول المقارنة", "sicon-paragraph", [
        ml("eyebrow", "نص صغير فوق العنوان", "", "", max_len=40),
        ml("title", "العنوان", "ليش تختارنا؟", "Why choose us?", max_len=80),
        ml("subtitle", "الوصف", "", "", max_len=160),
        ml("us_label", "عنوان عمودك", "متجرنا", "Us", max_len=24),
        ml("them_label", "عنوان عمود المقارنة", "البدائل الأخرى", "Others", max_len=24),
        collection("rows", "صفوف المقارنة", "صف", [
            text("feature", "الميزة", max_len=80, required=True),
            switch("us", "متوفرة لدينا", True),
            switch("them", "متوفرة لدى الآخرين", False),
        ], [
            {"feature": "ضمان استبدال حقيقي", "us": True, "them": False},
            {"feature": "شحن خلال 1-3 أيام", "us": True, "them": False},
            {"feature": "دفع عند الاستلام وتقسيط", "us": True, "them": True},
            {"feature": "دعم مباشر عبر واتساب", "us": True, "them": False},
        ], max_len=12),
        ml("cta_label", "نص الزر (اختياري)", "", "", max_len=30),
        url("cta_link", "رابط الزر"),
        cta_action(),
        tone("auto"),
        accent(),
    ]),
    component("mawsim-faq", "موسم · الأسئلة الشائعة", "sicon-mail", [
        ml("eyebrow", "نص صغير فوق العنوان", "", "", max_len=40),
        ml("title", "العنوان", "أسئلة متكررة", "Frequently asked questions", max_len=80),
        ml("subtitle", "الوصف", "", "", max_len=160),
        collection("items", "الأسئلة", "سؤال", [
            text("question", "السؤال", max_len=140, required=True),
            text("answer", "الإجابة", fmt="textarea", max_len=800),
        ], [
            {"question": "كم يستغرق التوصيل؟", "answer": "من 1 إلى 3 أيام عمل داخل المدن الرئيسية، ومن 3 إلى 5 أيام لباقي المناطق."},
            {"question": "هل يمكنني الاسترجاع أو الاستبدال؟", "answer": "نعم، خلال 7 أيام من الاستلام بشرط أن يكون المنتج بحالته الأصلية."},
            {"question": "ما طرق الدفع المتاحة؟", "answer": "مدى، فيزا، ماستركارد، Apple Pay، والتقسيط عبر تابي وتمارا، والدفع عند الاستلام."},
        ], max_len=20),
        switch("open_first", "فتح أول سؤال تلقائياً", True),
        switch("single_open", "فتح سؤال واحد فقط في كل مرة", True),
        ml("contact_text", "نص التواصل أسفل الأسئلة", "ما لقيت إجابتك؟", "Didn't find your answer?", max_len=80),
        ml("contact_label", "نص زر التواصل", "تواصل معنا", "Contact us", max_len=30),
        url("contact_link", "رابط التواصل", desc="مثال: رابط واتساب https://wa.me/9665XXXXXXXX"),
        tone("auto"),
        accent(),
    ]),
    component("mawsim-trust-badges", "موسم · شارات الثقة", "sicon-lock", [
        ml("title", "العنوان (اختياري)", "", "", max_len=60),
        collection("items", "الشارات", "شارة", [icon_field("shield"), text("title", "العنوان", max_len=40, required=True), text("text", "الوصف", max_len=80)], [
            {"icon": icon_val("truck"), "title": "شحن سريع", "text": "لجميع مناطق المملكة"},
            {"icon": icon_val("card"), "title": "دفع آمن", "text": "مدى، Apple Pay، تقسيط"},
            {"icon": icon_val("return"), "title": "استرجاع سهل", "text": "خلال 7 أيام"},
            {"icon": icon_val("chat"), "title": "دعم مباشر", "text": "نرد عليك بسرعة"},
        ], max_len=6),
        tone("tint"),
        accent(),
    ]),
    component("mawsim-sticky-cta", "موسم · الدعوة النهائية والشريط الثابت", "sicon-link", [
        ml("eyebrow", "نص صغير فوق العنوان", "", "", max_len=40),
        ml("title", "العنوان", "جاهز تبدأ؟", "Ready to start?", max_len=80, required=True),
        ml("subtitle", "الوصف", "اطلب الآن واستلم خلال أيام — الكمية محدودة.", "Order now and receive it within days — limited stock.", max_len=180),
        ml("cta_label", "نص الزر", "اطلب الآن", "Order now", max_len=30),
        url("cta_link", "رابط الزر"),
        cta_action(),
        ml("note", "ملاحظة أسفل الزر", "", "", max_len=80),
        choice("mode", "طريقة العرض", [("قسم ختامي + شريط ثابت", "both"), ("القسم الختامي فقط", "banner"), ("الشريط الثابت فقط", "bar")], "both"),
        switch("sticky_bar", "تفعيل الشريط الثابت أسفل الشاشة", True),
        ml("bar_text", "نص الشريط الثابت", "العرض لفترة محدودة", "Limited-time offer", max_len=60),
        {"id": "show_after", "type": "number", "format": "slider", "inputType": "range", "label": "يظهر الشريط بعد التمرير (بكسل)", "required": False, "minimum": 0, "maximum": 2000, "step": 100, "value": 600},
        switch("dismissible", "السماح بإغلاق الشريط", True),
        tone("primary"),
        accent(),
    ]),
]

BY_NAME = {c["name"]: c for c in COMPONENTS}


# ---------------------------------------------------------------- templates
def set_val(comp, field_id, value):
    for f in comp["fields"]:
        if f["id"] == field_id:
            if f["type"] == "items" and f.get("source") == "Manual":
                f["selected"] = [o for o in f["options"] if o["value"] == value]
            elif f.get("multilanguage"):
                f["value"] = value if isinstance(value, dict) else {"ar": value, "en": ""}
            else:
                f["value"] = value
            return
    raise KeyError(f"{comp['name']}.{field_id}")


def build_template(order, overrides, accent_color):
    comps = []
    for name in order:
        c = copy.deepcopy(BY_NAME[name])
        for fid, val in overrides.get(name, {}).items():
            set_val(c, fid, val)
        if accent_color:
            set_val(c, "accent_color", accent_color)
        comps.append(c)
    return comps


FULL = [
    "mawsim-festive-layer", "mawsim-hero", "mawsim-countdown", "mawsim-product-spotlight", "mawsim-problem-solution",
    "mawsim-benefits", "mawsim-testimonials", "mawsim-comparison", "mawsim-trust-badges",
    "mawsim-faq", "mawsim-sticky-cta",
]

TEMPLATES = {
    "product-launch": {
        "primary_color": "",
        "is_default": True,
        "order": ["mawsim-hero", "mawsim-trust-badges", "mawsim-problem-solution", "mawsim-benefits",
                  "mawsim-product-spotlight", "mawsim-testimonials", "mawsim-comparison", "mawsim-faq",
                  "mawsim-sticky-cta"],
        "overrides": {},
    },
    "ramadan": {
        "primary_color": "#5b3d8f",
        "is_default": False,
        "order": FULL,
        "overrides": {
            "mawsim-hero": {
                "eyebrow": {"ar": "رمضان كريم", "en": "Ramadan Kareem"},
                "title": {"ar": "استعد لرمضان بعروض تليق بالشهر الفضيل", "en": "Get ready for Ramadan with offers worthy of the holy month"},
                "subtitle": {"ar": "كل ما تحتاجه لسفرتك وهداياك وأجواء بيتك، بأسعار خاصة طوال الشهر.", "en": "Everything for your table, gifts and home, at special prices all month."},
                "cta_label": {"ar": "تسوّق عروض رمضان", "en": "Shop Ramadan offers"},
                "note": {"ar": "توصيل قبل الإفطار للطلبات المبكرة*", "en": "Delivery before iftar for early orders*"},
                "badge": {"ar": "عروض رمضان", "en": "Ramadan deals"},
                "decor": "crescent",
                "scene": "ramadan-snow",
                "tone": "primary",
            },
            "mawsim-festive-layer": {"effect": "snow", "density": "0.6", "duration": 45},
            "mawsim-countdown": {
                "title": {"ar": "عروض العشر الأواخر تنتهي خلال", "en": "Last-ten-nights offers end in"},
                "subtitle": {"ar": "أسعار خاصة لفترة محدودة", "en": "Special prices for a limited time"},
                "end_datetime": "2027-03-08T23:59:00",
                "arabic_digits": True,
                "tone": "dark",
            },
            "mawsim-product-spotlight": {
                "eyebrow": {"ar": "سفرة رمضان", "en": "Ramadan table"},
                "title": {"ar": "مختارات رمضان", "en": "Ramadan picks"},
                "subtitle": {"ar": "منتجات اخترناها لتكمّل أجواء الشهر", "en": "Products chosen to complete the spirit of the month"},
                "ribbon": {"ar": "رمضاني", "en": "Ramadan"},
                "board_title": {"ar": "سوق رمضان", "en": "Ramadan market"},
                "board_subtitle": {"ar": "اضغط على أي منتج للعرض السريع والإضافة للسلة", "en": "Tap any product for a quick view and add to cart"},
                "board_scene": "ramadan-snow",
            },
            "mawsim-problem-solution": {
                "title": {"ar": "رمضان بدون زحمة اللحظة الأخيرة", "en": "Ramadan without last-minute rush"},
                "problem_title": {"ar": "كل سنة", "en": "Every year"},
                "problems": [{"text": "زحمة الأسواق قبل الإفطار"}, {"text": "هدايا العيد تتأخر وتُشترى على عجل"}, {"text": "أسعار ترتفع مع اقتراب العيد"}],
                "solution_title": {"ar": "هالسنة", "en": "This year"},
                "solutions": [{"text": "اطلب من بيتك ويوصلك قبل الإفطار"}, {"text": "جهّز هداياك من الآن بتغليف جاهز"}, {"text": "أسعار ثابتة طوال الشهر"}],
            },
            "mawsim-benefits": {
                "title": {"ar": "ليش تطلب رمضانك منّا؟", "en": "Why order your Ramadan from us?"},
                "items": [
                    {"icon": icon_val("moon"), "title": "تشكيلة رمضانية", "text": "منتجات مختارة لأجواء الشهر الفضيل."},
                    {"icon": icon_val("gift"), "title": "تغليف هدايا", "text": "تغليف أنيق جاهز للإهداء مع بطاقة."},
                    {"icon": icon_val("clock"), "title": "توصيل بمواعيد مرنة", "text": "اختر وقت التوصيل المناسب لك."},
                    {"icon": icon_val("tag"), "title": "أسعار رمضان", "text": "خصومات حقيقية طوال الشهر."},
                ],
            },
            "mawsim-testimonials": {"title": {"ar": "عملاؤنا في رمضان الماضي", "en": "Our customers last Ramadan"}},
            "mawsim-comparison": {"title": {"ar": "طلبك من عندنا… فرق واضح", "en": "Ordering from us makes a clear difference"}},
            "mawsim-sticky-cta": {
                "title": {"ar": "رمضان مبارك، جهّز طلبك الآن", "en": "Ramadan Mubarak — get your order ready now"},
                "subtitle": {"ar": "العروض لفترة محدودة والكميات تنفد بسرعة.", "en": "Offers are limited and stock runs out fast."},
                "cta_label": {"ar": "تسوّق الآن", "en": "Shop now"},
                "bar_text": {"ar": "عروض رمضان لفترة محدودة", "en": "Ramadan offers for a limited time"},
            },
        },
    },
    "white-friday": {
        "primary_color": "#111111",
        "is_default": False,
        "order": ["mawsim-countdown", "mawsim-hero", "mawsim-product-spotlight", "mawsim-trust-badges",
                  "mawsim-benefits", "mawsim-testimonials", "mawsim-faq", "mawsim-sticky-cta"],
        "overrides": {
            "mawsim-countdown": {
                "title": {"ar": "الجمعة البيضاء تنتهي خلال", "en": "White Friday ends in"},
                "subtitle": {"ar": "أكبر خصومات السنة — لا تفوتها", "en": "The biggest discounts of the year — don't miss out"},
                "end_datetime": "2026-11-30T23:59:00",
                "cta_label": {"ar": "تسوّق العروض", "en": "Shop deals"},
                "tone": "dark",
            },
            "mawsim-hero": {
                "eyebrow": {"ar": "الجمعة البيضاء", "en": "White Friday"},
                "title": {"ar": "خصومات تصل إلى 50% على منتجات مختارة", "en": "Up to 50% off selected products"},
                "subtitle": {"ar": "أسعار ما تتكرر إلا مرة في السنة. الكميات محدودة.", "en": "Once-a-year prices. Limited quantities."},
                "cta_label": {"ar": "شوف العروض", "en": "See the deals"},
                "badge": {"ar": "حتى 50%", "en": "Up to 50%"},
                "note": {"ar": "العرض ساري حتى نفاد الكمية", "en": "While stocks last"},
                "decor": "sparkle",
                "scene": "confetti",
                "tone": "dark",
            },
            "mawsim-product-spotlight": {
                "eyebrow": {"ar": "أقوى العروض", "en": "Top deals"},
                "title": {"ar": "عروض الجمعة البيضاء", "en": "White Friday deals"},
                "subtitle": {"ar": "أسعار خاصة لفترة محدودة جداً", "en": "Special prices for a very limited time"},
                "ribbon": {"ar": "خصم", "en": "Sale"},
                "board_scene": "confetti",
            },
            "mawsim-trust-badges": {"tone": "auto"},
            "mawsim-benefits": {
                "title": {"ar": "تسوّق براحة في موسم التخفيضات", "en": "Shop with confidence this sale season"},
                "items": [
                    {"icon": icon_val("tag"), "title": "خصومات حقيقية", "text": "السعر قبل وبعد واضح على كل منتج."},
                    {"icon": icon_val("card"), "title": "تقسيط بدون فوائد", "text": "قسّم مشترياتك عبر تابي وتمارا."},
                    {"icon": icon_val("return"), "title": "استرجاع مضمون", "text": "حتى على منتجات العروض."},
                    {"icon": icon_val("bolt"), "title": "شحن سريع", "text": "نجهّز طلبك في نفس اليوم."},
                ],
            },
            "mawsim-sticky-cta": {
                "title": {"ar": "العروض تنتهي قريباً", "en": "Deals end soon"},
                "subtitle": {"ar": "أضف منتجاتك للسلة قبل نفاد الكمية.", "en": "Add your products to cart before they sell out."},
                "cta_label": {"ar": "تسوّق الآن", "en": "Shop now"},
                "bar_text": {"ar": "الجمعة البيضاء: خصومات حتى 50%", "en": "White Friday: up to 50% off"},
                "tone": "dark",
            },
        },
    },
    "national-day": {
        "primary_color": "#0b7a3e",
        "is_default": False,
        "order": ["mawsim-hero", "mawsim-countdown", "mawsim-product-spotlight", "mawsim-benefits",
                  "mawsim-testimonials", "mawsim-trust-badges", "mawsim-faq", "mawsim-sticky-cta"],
        "overrides": {
            "mawsim-hero": {
                "eyebrow": {"ar": "اليوم الوطني السعودي", "en": "Saudi National Day"},
                "title": {"ar": "نحتفل معكم بعروض اليوم الوطني", "en": "Celebrating National Day with you"},
                "subtitle": {"ar": "خصومات خاصة احتفاءً بالوطن، لفترة محدودة.", "en": "Special discounts to celebrate the nation, for a limited time."},
                "cta_label": {"ar": "تسوّق عروض اليوم الوطني", "en": "Shop National Day offers"},
                "badge": {"ar": "عروض اليوم الوطني", "en": "National Day offers"},
                "note": {"ar": "", "en": ""},
                "decor": "geometric",
                "scene": "confetti",
                "tone": "primary",
            },
            "mawsim-countdown": {
                "title": {"ar": "عروض اليوم الوطني تنتهي خلال", "en": "National Day offers end in"},
                "end_datetime": "2027-09-25T23:59:00",
                "tone": "tint",
            },
            "mawsim-product-spotlight": {
                "eyebrow": {"ar": "صُنع بفخر", "en": "Made with pride"},
                "title": {"ar": "مختارات اليوم الوطني", "en": "National Day picks"},
                "subtitle": {"ar": "", "en": ""},
                "ribbon": {"ar": "عرض وطني", "en": "National offer"},
                "board_scene": "confetti",
            },
            "mawsim-benefits": {
                "title": {"ar": "عرض بطعم الوطن", "en": "An offer with national pride"},
                "items": [
                    {"icon": icon_val("tag"), "title": "خصومات حصرية", "text": "على منتجات مختارة طوال أيام الاحتفال."},
                    {"icon": icon_val("gift"), "title": "هدية مع كل طلب", "text": "لفترة محدودة وحتى نفاد الكمية."},
                    {"icon": icon_val("truck"), "title": "شحن لكل المملكة", "text": "نوصلك أينما كنت."},
                    {"icon": icon_val("heart"), "title": "دعم المحلي", "text": "متجر سعودي يخدمكم بفخر."},
                ],
            },
            "mawsim-sticky-cta": {
                "title": {"ar": "دام عزك يا وطن", "en": "Long live our nation"},
                "subtitle": {"ar": "احتفل معنا واستفد من عروض اليوم الوطني قبل انتهائها.", "en": "Celebrate with us and enjoy National Day offers before they end."},
                "cta_label": {"ar": "تسوّق الآن", "en": "Shop now"},
                "bar_text": {"ar": "عروض اليوم الوطني لفترة محدودة", "en": "National Day offers for a limited time"},
            },
        },
    },
}


def main():
    bundle = {
        "name": {"ar": "موسم — صفحات هبوط الحملات", "en": "Mawsim — Campaign Landing Kit"},
        "description": {
            "ar": "عناصر صفحات هبوط عربية أولاً للحملات الموسمية وإطلاق المنتجات: رمضان، الجمعة البيضاء، اليوم الوطني، وإطلاق منتج جديد.",
            "en": "Arabic-first landing page components for seasonal campaigns and product launches: Ramadan, White Friday, National Day and new product launches.",
        },
        "author": {"name": "Sukkari", "email": "melsukkari@gmail.com", "url": "https://tholth.com"},
        "repository": REPO,
        "components": COMPONENTS,
        "templates": [],
    }

    tpl_dir = ROOT / "templates"
    tpl_dir.mkdir(exist_ok=True)
    for name, t in TEMPLATES.items():
        tid = key(f"template:{name}")
        data = {"id": tid, "components": build_template(t["order"], t["overrides"], t["primary_color"])}
        (tpl_dir / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        bundle["templates"].append({
            "id": tid,
            "path": f"templates.{name}",
            "category_id": "",
            "primary_color": t["primary_color"],
            "thumbnail": f"{PREVIEW_BASE}/template-{name}.png",
            "is_default": t["is_default"],
        })

    (ROOT / "twilight-bundle.json").write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote twilight-bundle.json with {len(COMPONENTS)} components and {len(TEMPLATES)} templates")


if __name__ == "__main__":
    main()
