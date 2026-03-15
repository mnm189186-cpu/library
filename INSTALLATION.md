# 🚀 دليل التركيب السريع - جنون العظمة

## المحتويات

1. [التثبيت الأساسي](#1-التثبيت-الأساسي)
2. [إعداد مكتبة الكتب](#2-إعداد-مكتبة-الكتب)
3. [إعداد نظام رفع PDF](#3-إعداد-نظام-رفع-pdf)
4. [إعداد دردشة الذكاء الاصطناعي](#4-إعداد-دردشة-الذكاء-الاصطناعي)
5. [التخصيص النهائي](#5-التخصيص-النهائي)

---

## 1. التثبيت الأساسي

### الخطوة 1.1: رفع قالب Blogger

**الوقت المتوقع:** 5 دقائق

1. **افتح لوحة تحكم Blogger**
   - اذهب إلى [blogger.com](https://www.blogger.com/)
   - اختر مدونتك أو أنشئ مدونة جديدة

2. **الوصول إلى محرر القالب**
   - من القائمة الجانبية، اختر **المظهر (Theme)**
   - اضغط على السهم بجانب **تخصيص (Customize)**
   - اختر **تعديل HTML (Edit HTML)**

3. **استبدال القالب**
   - حدد كل محتوى المحرر (`Ctrl+A`)
   - احذفه (`Delete`)
   - افتح ملف `blogger-template.xml`
   - انسخ كل المحتوى (`Ctrl+A` ثم `Ctrl+C`)
   - الصقه في محرر Blogger (`Ctrl+V`)

4. **حفظ القالب**
   - اضغط **حفظ المظهر (Save theme)** في الأعلى
   - انتظر رسالة التأكيد "تم الحفظ بنجاح"

✅ **تم!** القالب الآن مثبّت

### الخطوة 1.2: إنشاء الصفحات الأساسية

**صفحة 1: مكتبة الكتب**

1. اذهب إلى **الصفحات (Pages)**
2. اضغط **صفحة جديدة (New page)**
3. **العنوان:** مكتبة الكتب
4. **محتوى الصفحة:**
   - انقر على زر **<> HTML** (وضع HTML)
   - افتح ملف `library.html`
   - انسخ **كل** المحتوى والصقه
5. **الرابط الدائم (Permalink):**
   - عدّله إلى: `library`
6. احفظ الصفحة

**صفحة 2: رفع كتاب PDF**

1. أنشئ صفحة جديدة
2. **العنوان:** رفع كتاب
3. **محتوى الصفحة:**
   - وضع HTML
   - انسخ محتوى `upload-pdf.html`
4. **الرابط الدائم:** `upload-pdf`
5. احفظ

**صفحة 3: عن الموقع**

1. أنشئ صفحة جديدة
2. **العنوان:** من نحن
3. **محتوى:** اكتب نبذة عن موقعك
4. **الرابط الدائم:** `about`
5. احفظ

---

## 2. إعداد مكتبة الكتب

### الطريقة 1: استخدام JSON محلي (الأسرع)

**الوقت المتوقع:** 10 دقائق

#### الخطوة 2.1: رفع ملف JSON

**الخيار A: استخدام Google Drive**

1. افتح [Google Drive](https://drive.google.com/)
2. ارفع ملف `books-database.json`
3. انقر بزر الماوس الأيمن على الملف > **مشاركة (Share)**
4. غيّر الوصول إلى **أي شخص لديه الرابط (Anyone with the link)**
5. احصل على رابط المشاركة
6. حوّل الرابط من:
   ```
   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   ```
   إلى:
   ```
   https://drive.google.com/uc?export=download&id=FILE_ID
   ```

**الخيار B: استخدام GitHub Pages (مستحسن)**

1. أنشئ repository جديد في GitHub
2. ارفع ملف `books-database.json`
3. فعّل GitHub Pages من إعدادات Repository
4. احصل على الرابط:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/books-database.json
   ```

#### الخطوة 2.2: تحديث الكود

1. افتح صفحة "مكتبة الكتب" في Blogger
2. ابحث عن هذا السطر في الكود:

```javascript
// استبدل هذا بـ URL من Google Sheets API أو Apps Script Web App
// const sheetURL = 'YOUR_GOOGLE_SHEET_JSON_URL';
```

3. حدّثه إلى:

```javascript
const sheetURL = 'رابط_ملف_JSON_الذي_حصلت_عليه';
```

4. أو حدّث دالة `loadBooksFromGoogleSheet`:

```javascript
async function loadBooksFromGoogleSheet() {
  try {
    const sheetURL = 'رابط_ملف_JSON_هنا';
    const response = await fetch(sheetURL);
    const data = await response.json();
    
    booksDatabase = data.books || [];
    filteredBooks = booksDatabase;
    
    displayBooks(filteredBooks);
  } catch (error) {
    console.error('خطأ في تحميل الكتب:', error);
  }
}
```

5. احفظ الصفحة

✅ **تم!** مكتبة الكتب الآن تعمل

### الطريقة 2: استخدام Google Sheets (للتحديث الديناميكي)

**الوقت المتوقع:** 30 دقيقة

#### الخطوة 2.3: إنشاء Google Sheet

1. افتح [Google Sheets](https://sheets.google.com/)
2. أنشئ جدول جديد: "Books Database"
3. أنشئ ورقة باسم "Books"
4. أضف العناوين في الصف الأول:

| id | title | author | category | year | pages | description | readUrl | downloadUrl | license | source | coverImage |
|----|-------|--------|----------|------|-------|-------------|---------|-------------|---------|--------|------------|

5. املأ البيانات من ملف `books-database.json`

#### الخطوة 2.4: إنشاء Apps Script للنشر

1. في Google Sheet، اذهب إلى **Extensions > Apps Script**
2. احذف الكود الموجود والصق هذا:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Books');
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const books = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const book = {};
    
    headers.forEach((header, index) => {
      book[header] = row[index] || '';
    });
    
    books.push(book);
  }
  
  const output = {
    books: books,
    metadata: {
      totalBooks: books.length,
      lastUpdated: new Date().toISOString()
    }
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. احفظ المشروع: `Ctrl+S`
4. **انشر كـ Web App:**
   - اضغط **Deploy > New deployment**
   - **نوع:** Web app
   - **Execute as:** Me
   - **Who has access:** Anyone
   - اضغط **Deploy**
   - انسخ رابط Web App

5. **حدّث الكود في صفحة المكتبة:**

```javascript
async function loadBooksFromGoogleSheet() {
  try {
    const sheetURL = 'رابط_Web_App_من_الخطوة_4';
    const response = await fetch(sheetURL);
    const data = await response.json();
    
    booksDatabase = data.books || [];
    filteredBooks = booksDatabase;
    
    displayBooks(filteredBooks);
  } catch (error) {
    console.error('خطأ:', error);
  }
}
```

---

## 3. إعداد نظام رفع PDF

**الوقت المتوقع:** 45 دقيقة

### الخطوة 3.1: إنشاء Google Cloud Project

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد:
   - اضغط **Select a project** في الأعلى
   - **New Project**
   - **اسم المشروع:** Jonoun-al-Azama
   - اضغط **Create**

3. **تفعيل APIs:**
   - من القائمة، اختر **APIs & Services > Library**
   - ابحث عن "Drive API" وفعّله
   - ابحث عن "Blogger API" وفعّله

### الخطوة 3.2: إنشاء Google Drive Folder

1. افتح [Google Drive](https://drive.google.com/)
2. أنشئ مجلد جديد: "جنون_العظمة_كتب_مرفوعة"
3. افتح المجلد
4. انسخ **Folder ID** من الرابط:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### الخطوة 3.3: الحصول على Blog ID

1. افتح مدونتك في Blogger
2. من رابط المتصفح، انسخ الرقم بعد `blogID=`:
   ```
   https://www.blogger.com/blogger.g?blogID=1234567890123456789
   ```
   Blog ID هو: `1234567890123456789`

### الخطوة 3.4: إعداد Google Apps Script

1. افتح [Google Apps Script](https://script.google.com/)
2. أنشئ مشروع جديد: **New project**
3. **اسم المشروع:** Jonoun PDF Processor
4. احذف الكود الموجود
5. انسخ محتوى ملف `google-apps-script.js` بالكامل
6. الصقه في المحرر

7. **تحديث الإعدادات:**
   ابحث عن هذا القسم:
   
```javascript
const CONFIG = {
  BLOG_ID: 'YOUR_BLOG_ID_HERE',
  UPLOAD_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
  OCR_LANGUAGE: 'ar',
  // ...
};
```

   حدّثه إلى:
   
```javascript
const CONFIG = {
  BLOG_ID: 'Blog_ID_من_الخطوة_3.3',
  UPLOAD_FOLDER_ID: 'Folder_ID_من_الخطوة_3.2',
  OCR_LANGUAGE: 'ar',
  // ...
};
```

8. احفظ: `Ctrl+S`

### الخطوة 3.5: تفعيل Advanced Services

1. في Apps Script، اذهب إلى **Resources > Advanced Google Services** (أو **Services +** في الشريط الجانبي)
2. فعّل:
   - ✅ **Drive API** (v3)
   - ✅ **Blogger API** (v3)
3. اضغط **Save**

### الخطوة 3.6: نشر Web App

1. اضغط **Deploy > New deployment**
2. **نوع:** Web app
3. **الإعدادات:**
   - **Description:** PDF Processor v1
   - **Execute as:** Me (your_email@gmail.com)
   - **Who has access:** **Anyone**
4. اضغط **Deploy**
5. **منح الأذونات:**
   - اضغط **Authorize access**
   - اختر حسابك
   - اضغط **Advanced**
   - اضغط **Go to PROJECT_NAME (unsafe)**
   - اضغط **Allow**
6. **انسخ Web App URL**

### الخطوة 3.7: ربط الموقع بـ Web App

1. في Blogger، افتح صفحة "رفع كتاب"
2. ابحث عن:

```javascript
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

3. حدّثه:

```javascript
const APPS_SCRIPT_URL = 'رابط_Web_App_من_الخطوة_3.6';
```

4. احفظ الصفحة

✅ **تم!** نظام رفع PDF الآن جاهز

### اختبار النظام:

1. اذهب إلى صفحة "رفع كتاب" في موقعك
2. اختر ملف PDF تجريبي
3. اضغط "معالجة"
4. انتظر حتى يكتمل
5. تحقق من المسودات في Blogger

---

## 4. إعداد دردشة الذكاء الاصطناعي

**الوقت المتوقع:** 20 دقيقة

### الطريقة 1: استخدام Gemini API مباشرة (أسرع)

#### الخطوة 4.1: الحصول على Gemini API Key

1. اذهب إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. اضغط **Create API Key**
3. اختر مشروع Google Cloud الخاص بك
4. انسخ المفتاح

⚠️ **تحذير:** لا تشارك هذا المفتاح علناً!

#### الخطوة 4.2: إنشاء Proxy باستخدام Apps Script

**لحماية المفتاح، استخدم Apps Script كوسيط:**

1. افتح [Apps Script](https://script.google.com/)
2. أنشئ مشروع جديد: "Gemini AI Proxy"
3. الصق هذا الكود:

```javascript
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const userMessage = requestData.message;
    
    // احصل على المفتاح من Properties
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('API Key غير مُعرّف');
    }
    
    // استدعاء Gemini API
    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
    const payload = {
      contents: [{
        parts: [{
          text: userMessage
        }]
      }]
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    
    if (data.candidates && data.candidates[0]) {
      const reply = data.candidates[0].content.parts[0].text;
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        reply: reply
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error('لم يتم الحصول على رد من Gemini');
    }
    
  } catch (error) {
    Logger.log('خطأ: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. احفظ المشروع

#### الخطوة 4.3: حفظ API Key بشكل آمن

1. في Apps Script، اذهب إلى **Project Settings** (أيقونة الترس)
2. اذهب إلى **Script Properties**
3. اضغط **Add script property**
4. **Property:** `GEMINI_API_KEY`
5. **Value:** `مفتاح_API_من_الخطوة_4.1`
6. احفظ

#### الخطوة 4.4: نشر Proxy

1. **Deploy > New deployment**
2. **نوع:** Web app
3. **Execute as:** Me
4. **Who has access:** **Anyone**
5. **Deploy**
6. انسخ Web App URL

#### الخطوة 4.5: ربط الموقع بالـ Proxy

1. في قالب Blogger، ابحث عن دالة `sendChatMessage`:

```javascript
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // إضافة رسالة المستخدم
  addChatMessage(message, 'user');
  input.value = '';
  
  // استدعاء Proxy
  fetch('رابط_Web_App_من_الخطوة_4.4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      addChatMessage(data.reply, 'bot');
    } else {
      addChatMessage('عذراً، حدث خطأ: ' + data.error, 'bot');
    }
  })
  .catch(error => {
    addChatMessage('عذراً، فشل الاتصال بالمساعد الذكي', 'bot');
    console.error('خطأ:', error);
  });
}
```

2. حدّث الرابط
3. احفظ القالب

✅ **تم!** الدردشة الذكية الآن تعمل

---

## 5. التخصيص النهائي

### الخطوة 5.1: تخصيص معلومات الموقع

1. في Blogger، اذهب إلى **الإعدادات (Settings)**
2. **العنوان:** جنون العظمة
3. **الوصف:** رحلة في عمق التاريخ والثقافة الإسلامية
4. احفظ

### الخطوة 5.2: تخصيص الألوان (اختياري)

إذا أردت تغيير ألوان الموقع:

1. افتح محرر القالب (تعديل HTML)
2. ابحث عن `:root {`
3. عدّل المتغيرات:

```css
:root {
  --primary-color: #8B6F47;        /* اللون الأساسي */
  --secondary-color: #2C5F7E;      /* اللون الثانوي */
  --accent-gold: #D4AF37;          /* الذهبي */
  /* ... */
}
```

4. احفظ

### الخطوة 5.3: إضافة محتوى تجريبي

1. **أنشئ مقالات تجريبية:**
   - اذهب إلى **المقالات (Posts)**
   - اضغط **مقال جديد (New post)**
   - اكتب مقال عن موضوع إسلامي
   - **أضف تصنيفات (Labels):** مثل `حديث`, `قرآن`, `سيرة`
   - انشر

2. **كرر العملية** لإنشاء 3-5 مقالات

### الخطوة 5.4: التحقق النهائي

✅ تحقق من:
- [ ] القالب يظهر بشكل صحيح
- [ ] القائمة الرئيسية تعمل
- [ ] صفحة مكتبة الكتب تعرض الكتب
- [ ] صفحة رفع PDF تعمل
- [ ] الدردشة الذكية ترد على الرسائل
- [ ] البحث يعمل
- [ ] الموقع متجاوب على الموبايل

---

## 🎉 تهانينا!

موقعك **جنون العظمة** الآن جاهز بالكامل!

### الخطوات التالية:

1. **أضف محتوى:** ابدأ بنشر مقالات عن التراث الإسلامي
2. **شارك الموقع:** شارك رابط موقعك مع الأصدقاء
3. **راقب الأداء:** استخدم Google Analytics لتتبع الزوار
4. **طوّر المحتوى:** أضف المزيد من الكتب والأقسام

---

## ⚠️ مشاكل شائعة وحلولها

### المشكلة: "Access Denied" عند نشر Apps Script

**الحل:**
- تأكد من اختيار "Anyone" في Who has access
- امنح الأذونات المطلوبة عند النشر

### المشكلة: OCR لا يعمل

**الحل:**
- تأكد من تفعيل Drive API
- تحقق من صلاحيات الوصول للمجلد
- جرّب PDF آخر بجودة أعلى

### المشكلة: Gemini API يرجع خطأ

**الحل:**
- تحقق من صحة API Key
- تأكد من حفظه في Script Properties
- تحقق من حد الاستخدام المجاني

---

## 📞 هل تحتاج مساعدة؟

- **راجع README.md** للتوثيق الكامل
- **افتح Issue** على GitHub
- **راسلنا:** support@example.com

---

**آخر تحديث:** 15 مارس 2026