# جنون العظمة - قالب Blogger احترافي بتصميم عربي تراثي

![جنون العظمة](https://img.shields.io/badge/%D8%AC%D9%86%D9%88%D9%86%20%D8%A7%D9%84%D8%B9%D8%B8%D9%85%D8%A9-v1.0-8B6F47?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Arabic](https://img.shields.io/badge/language-%D8%B9%D8%B1%D8%A8%D9%8A-D4AF37?style=for-the-badge)

## 📖 نظرة عامة

**جنون العظمة** هو قالب Blogger احترافي متكامل بتصميم عربي تراثي مستوحى من الطابع الإسلامي. يتميز بواجهة أنيقة مع زخارف هندسية إسلامية وألوان هادئة تعكس الأصالة العربية.

### ✨ الميزات الرئيسية

- 🎨 **تصميم RTL عربي كامل** مع خطوط عربية احترافية (Cairo, Amiri, Tajawal)
- 🕌 **زخارف إسلامية متحركة** مع أنيميشن خفيف واحترافي
- 📚 **مكتبة كتب ضخمة** تحتوي على 50+ كتاب من مصادر موثوقة
- 🔍 **بحث متقدم** مع فلترة حسب التصنيفات
- 📖 **قارئ PDF مدمج** لقراءة الكتب مباشرة في الموقع
- 🤖 **دردشة ذكاء اصطناعي** قابلة للتخصيص
- 📤 **نظام رفع وتحليل PDF** تلقائي باستخدام OCR
- 🎯 **Mega Menu** يدعم 90+ قسم مع تصنيفات منظمة
- 🎭 **قوالب جاهزة** لقصص الأنبياء، الثقافات، والتاريخ الإسلامي
- 📱 **تصميم متجاوب** يعمل على جميع الأجهزة

---

## 📁 هيكل الملفات

```
جنون-العظمة/
│
├── blogger-template.xml          # قالب Blogger الرئيسي (XML)
├── library.html                  # صفحة مكتبة الكتب
├── upload-pdf.html               # صفحة رفع وتحليل PDF
├── books-database.json           # قاعدة بيانات الكتب (50 كتاب)
├── books-library.js              # كود JavaScript للمكتبة
├── google-apps-script.js         # كود Apps Script للـ OCR والنشر
├── INSTALLATION.md               # دليل التركيب السريع
└── README.md                     # هذا الملف
```

---

## 🚀 التركيب السريع

### الخطوة 1: تثبيت قالب Blogger

1. افتح لوحة تحكم Blogger
2. اذهب إلى **المظهر (Theme)**
3. اضغط على **تخصيص (Customize)** ثم **تعديل HTML**
4. احذف كل الكود القديم
5. انسخ محتوى ملف `blogger-template.xml` والصقه
6. احفظ التغييرات ✅

### الخطوة 2: إضافة صفحة مكتبة الكتب

1. في Blogger، اذهب إلى **الصفحات (Pages)**
2. أنشئ صفحة جديدة بعنوان "مكتبة الكتب"
3. اختر وضع **HTML**
4. انسخ محتوى ملف `library.html` والصقه
5. احفظ الصفحة

### الخطوة 3: إضافة صفحة رفع PDF

1. أنشئ صفحة جديدة بعنوان "رفع كتاب"
2. اختر وضع **HTML**
3. انسخ محتوى ملف `upload-pdf.html` والصقه
4. احفظ الصفحة

### الخطوة 4: إعداد Google Apps Script

راجع ملف `INSTALLATION.md` للحصول على دليل مفصل لإعداد Apps Script.

---

## 📚 قاعدة بيانات الكتب

### استخدام ملف JSON المحلي

1. ارفع ملف `books-database.json` إلى:
   - Google Drive (مشاركة عامة)
   - GitHub Pages
   - أي استضافة ثابتة

2. في ملف `library.html`، حدث رابط JSON:

```javascript
const libraryManager = new BooksLibraryManager({
  dataSource: 'json',
  jsonUrl: 'رابط_ملف_JSON_الخاص_بك',
  cacheEnabled: true
});
```

### استخدام Google Sheets

1. أنشئ Google Sheet جديد
2. أنشئ ورقة باسم "Books" مع الأعمدة التالية:
   - id, title, author, category, year, pages, description
   - readUrl, downloadUrl, license, source, coverImage

3. استخدم Google Apps Script لنشر البيانات:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Books');
  const data = sheet.getDataRange().getValues();
  
  // تحويل إلى JSON
  const headers = data[0];
  const books = [];
  
  for (let i = 1; i < data.length; i++) {
    const book = {};
    headers.forEach((header, index) => {
      book[header] = data[i][index];
    });
    books.push(book);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    books: books
  })).setMimeType(ContentService.MimeType.JSON);
}
```

4. انشر كـ Web App واحصل على الرابط

5. في `library.html`، استخدم:

```javascript
const libraryManager = new BooksLibraryManager({
  dataSource: 'webapp',
  webAppUrl: 'رابط_Web_App_الخاص_بك'
});
```

---

## 🤖 إعداد دردشة الذكاء الاصطناعي

القالب يتضمن واجهة دردشة جاهزة، لكنها تحتاج إلى ربطها بـ API للذكاء الاصطناعي.

### خيارات الربط:

#### 1. استخدام Gemini API (مجاني)

```javascript
async function sendChatMessage() {
  const message = document.getElementById('chatInput').value;
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': 'YOUR_GEMINI_API_KEY'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: message
        }]
      }]
    })
  });
  
  const data = await response.json();
  const reply = data.candidates[0].content.parts[0].text;
  
  addChatMessage(reply, 'bot');
}
```

#### 2. استخدام Google Apps Script كـ Proxy

لحماية مفاتيح API، استخدم Apps Script:

```javascript
// في Google Apps Script
function doPost(e) {
  const userMessage = JSON.parse(e.postData.contents).message;
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  const response = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    payload: JSON.stringify({
      contents: [{
        parts: [{ text: userMessage }]
      }]
    })
  });
  
  const data = JSON.parse(response.getContentText());
  const reply = data.candidates[0].content.parts[0].text;
  
  return ContentService.createTextOutput(JSON.stringify({
    reply: reply
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🎨 التخصيص

### تعديل الألوان

في ملف `blogger-template.xml`، ابحث عن `:root` وعدّل المتغيرات:

```css
:root {
  --primary-color: #8B6F47;        /* بني ذهبي */
  --secondary-color: #2C5F7E;      /* أزرق تراثي */
  --accent-gold: #D4AF37;          /* ذهبي */
  --parchment-bg: #F5E6D3;         /* خلفية ورق رق */
  /* ... */
}
```

### إضافة أقسام جديدة في Mega Menu

في الكود HTML، ابحث عن `.nav-menu` وأضف:

```html
<li class='nav-item'>
  <a class='nav-link' href='/p/your-page.html'>
    <i class='fas fa-icon'></i> اسم القسم
  </a>
  <div class='mega-menu'>
    <!-- محتوى القائمة المنسدلة -->
  </div>
</li>
```

### تخصيص الخطوط

لتغيير الخطوط، عدّل رابط Google Fonts في `<head>`:

```html
<link href='https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap' rel='stylesheet'/>
```

ثم حدّث المتغيرات:

```css
:root {
  --font-primary: 'YOUR_FONT', sans-serif;
}
```

---

## 📤 نظام رفع وتحليل PDF

### المتطلبات:

1. Google Drive API (مُفعّل)
2. Blogger API v3 (مُفعّل)
3. حساب Google Cloud Project

### خطوات الإعداد:

#### 1. إنشاء Google Cloud Project

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد
3. فعّل **Google Drive API**
4. فعّل **Blogger API v3**

#### 2. إعداد Google Apps Script

1. افتح [Google Apps Script](https://script.google.com/)
2. أنشئ مشروع جديد
3. انسخ كود `google-apps-script.js`
4. في **Resources > Advanced Google Services**:
   - فعّل Drive API
   - فعّل Blogger API v3

5. حدّث الإعدادات في الكود:

```javascript
const CONFIG = {
  BLOG_ID: 'معرف_مدونتك_على_Blogger',
  UPLOAD_FOLDER_ID: 'معرف_مجلد_Drive_للرفع'
};
```

#### 3. الحصول على Blog ID

1. افتح Blogger
2. في رابط المدونة، ستجد الـ ID مثل:
   `https://www.blogger.com/blogger.g?blogID=1234567890123456789`

#### 4. الحصول على Folder ID

1. افتح Google Drive
2. أنشئ مجلد جديد
3. افتح المجلد وانسخ الـ ID من الرابط:
   `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

#### 5. نشر كـ Web App

1. في Apps Script، اضغط **Deploy > New deployment**
2. اختر **Web app**
3. إعدادات:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. انشر واحصل على رابط Web App

#### 6. ربط الموقع بـ Web App

في `upload-pdf.html`، حدّث الرابط:

```javascript
const APPS_SCRIPT_URL = 'رابط_Web_App_الخاص_بك';
```

### كيفية الاستخدام:

1. اذهب إلى صفحة "رفع كتاب"
2. اختر ملف PDF
3. املأ الحقول الاختيارية (العنوان، المؤلف، إلخ)
4. اضغط "معالجة وتحليل"
5. انتظر حتى يكتمل التحليل
6. ستجد المسودة في Blogger تلقائياً!

---

## 🎭 الأقسام الجاهزة

القالب يحتوي على قوالب جاهزة للأقسام التالية:

### 1. قصص الأنبياء
- أولو العزم (نوح، إبراهيم، موسى، عيسى، محمد ﷺ)
- أنبياء آخرون (آدم، يوسف، سليمان، إلخ)
- دروس وعبر

### 2. الثقة بالله
- تزكية النفس
- الأخلاق والسلوك
- طريق النجاة

### 3. ثقافات وقصص تاريخية
- الحضارات الإسلامية
- القصص التاريخية الموثوقة
- المصادر والمراجع

### إضافة محتوى للأقسام:

1. أنشئ مقال جديد في Blogger
2. أضف التصنيف (Label) المناسب، مثل:
   - `قصص الأنبياء`
   - `الثقة بالله`
   - `تاريخ إسلامي`
3. سيظهر تلقائياً في القسم المناسب

---

## 🔧 استكشاف الأخطاء

### المشكلة: القالب لا يظهر بشكل صحيح

**الحل:**
- تأكد من أن المتصفح يدعم CSS3 و HTML5
- امسح ذاكرة التخزين المؤقت (Cache)
- تأكد من عدم وجود إضافات تحجب JavaScript

### المشكلة: مكتبة الكتب فارغة

**الحل:**
- تأكد من رفع ملف `books-database.json`
- تحقق من رابط JSON في الكود
- افتح Console في المتصفح وتحقق من الأخطاء

### المشكلة: رفع PDF لا يعمل

**الحل:**
- تأكد من نشر Apps Script كـ Web App
- تحقق من تفعيل Drive API و Blogger API
- تأكد من صحة Blog ID و Folder ID
- تحقق من صلاحيات الوصول (Anyone)

### المشكلة: OCR لا يستخرج النص بشكل صحيح

**الحل:**
- تأكد من أن PDF يحتوي على نص قابل للبحث
- استخدم PDF بجودة عالية
- حدد اللغة الصحيحة في إعدادات OCR:

```javascript
const CONFIG = {
  OCR_LANGUAGE: 'ar', // للعربية
};
```

---

## 📖 الدليل المفصل

لمزيد من التفاصيل، راجع الملفات التالية:

- `INSTALLATION.md` - دليل التركيب خطوة بخطوة
- `CUSTOMIZATION.md` - دليل التخصيص الشامل
- `API-INTEGRATION.md` - دليل ربط الـ APIs

---

## 🎯 الميزات القادمة

- [ ] دعم التعليقات المتقدمة
- [ ] نظام تقييم الكتب
- [ ] قارئ قرآن مدمج
- [ ] تكامل مع المزيد من APIs
- [ ] نسخة Dark Mode
- [ ] تطبيق Progressive Web App (PWA)

---

## 📜 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف `LICENSE` للتفاصيل.

### المصادر المستخدمة:

- **الكتب**: جميع الكتب من مصادر عامة:
  - [Internet Archive](https://archive.org/) (Public Domain)
  - [Wikisource](https://ar.wikisource.org/) (CC BY-SA)
  - [Tanzil Quran Text](https://tanzil.net/) (CC BY 3.0)

- **الأيقونات**: [Font Awesome](https://fontawesome.com/) (Free License)
- **الخطوط**: [Google Fonts](https://fonts.google.com/) (Open Font License)

---

## 🤝 المساهمة

نرحب بمساهماتكم! إذا كان لديك اقتراح أو تحسين:

1. Fork المشروع
2. أنشئ فرع للميزة: `git checkout -b feature/AmazingFeature`
3. Commit التغييرات: `git commit -m 'Add some AmazingFeature'`
4. Push للفرع: `git push origin feature/AmazingFeature`
5. افتح Pull Request

---

## 📞 الدعم والتواصل

- **GitHub Issues**: [افتح Issue](https://github.com/your-repo/issues)
- **Email**: support@example.com
- **التوثيق**: [docs.example.com](https://docs.example.com)

---

## 🙏 شكر وتقدير

شكراً لكل من ساهم في هذا المشروع، وشكراً لجميع المصادر المفتوحة التي استفدنا منها.

**صُمم بـ ❤️ للحفاظ على التراث الإسلامي والثقافة العربية**

---

## 📊 الإحصائيات

- ✅ 50+ كتاب جاهز
- ✅ 8 تصنيفات رئيسية
- ✅ 90+ قسم في القائمة
- ✅ نظام OCR متقدم
- ✅ تصميم RTL كامل
- ✅ متجاوب 100%

---

*آخر تحديث: 15 مارس 2026*