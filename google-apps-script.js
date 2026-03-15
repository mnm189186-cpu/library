/**
 * ========================================
 * Google Apps Script - معالج PDF لجنون العظمة
 * ========================================
 * 
 * هذا السكريبت يقوم بـ:
 * 1. استقبال ملف PDF مرفوع من المستخدم
 * 2. تحويل PDF إلى نص باستخدام OCR من Google Drive
 * 3. تحليل النص واستخراج العناوين والمحتوى
 * 4. توليد HTML منسق مع تصميم عربي
 * 5. نشر المحتوى كمسودة على Blogger
 * 
 * المتطلبات:
 * - تفعيل Drive API
 * - تفعيل Blogger API v3
 * - إعدادات OAuth 2.0
 */

// ============================================
// الإعدادات الأساسية
// ============================================

const CONFIG = {
  // معرف المدونة على Blogger (يمكن الحصول عليه من لوحة تحكم Blogger)
  BLOG_ID: 'YOUR_BLOG_ID_HERE',
  
  // مجلد Google Drive لحفظ الملفات المرفوعة
  UPLOAD_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
  
  // إعدادات OCR
  OCR_LANGUAGE: 'ar', // العربية
  
  // إعدادات HTML
  HTML_TEMPLATE: {
    style: `
      body { 
        font-family: 'Amiri', 'Cairo', serif; 
        line-height: 2; 
        color: #2C2416;
        direction: rtl;
      }
      h1, h2, h3 { 
        font-family: 'Amiri', serif; 
        color: #8B6F47; 
        margin: 2rem 0 1rem;
      }
      h1 { font-size: 2.5rem; border-bottom: 3px solid #D4AF37; padding-bottom: 0.5rem; }
      h2 { font-size: 2rem; }
      h3 { font-size: 1.5rem; }
      p { margin: 1rem 0; text-align: justify; }
      blockquote { 
        border-right: 4px solid #D4AF37; 
        padding-right: 1.5rem; 
        margin: 2rem 0;
        font-style: italic;
        color: #5A4A3A;
        background: #F5E6D3;
        padding: 1rem 1.5rem;
        border-radius: 8px;
      }
      .ornamental-divider {
        text-align: center;
        margin: 3rem 0;
        color: #D4AF37;
        font-size: 1.5rem;
      }
      .toc {
        background: #F5E6D3;
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid #C9A26A;
        margin: 2rem 0;
      }
      .toc h2 {
        margin-top: 0;
        color: #2C5F7E;
      }
      .toc ul {
        list-style: none;
        padding-right: 0;
      }
      .toc li {
        margin: 0.5rem 0;
        padding-right: 1.5rem;
        position: relative;
      }
      .toc li::before {
        content: '◆';
        position: absolute;
        right: 0;
        color: #D4AF37;
      }
      .toc a {
        color: #2C5F7E;
        text-decoration: none;
      }
      .toc a:hover {
        color: #D4AF37;
        text-decoration: underline;
      }
    `
  }
};

// ============================================
// نقطة الدخول الرئيسية
// ============================================

/**
 * نشر Web App للتعامل مع POST requests
 */
function doPost(e) {
  try {
    const fileBlob = e.parameter.file;
    const fileName = e.parameter.fileName || 'uploaded_book.pdf';
    
    if (!fileBlob) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'لم يتم إرفاق ملف'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // معالجة الملف
    const result = processPDFFile(fileBlob, fileName);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('خطأ في doPost: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'حدث خطأ: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * نشر Web App للتعامل مع GET requests
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>رفع كتاب PDF - جنون العظمة</title>
      <style>
        body {
          font-family: 'Cairo', sans-serif;
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: #F5E6D3;
        }
        h1 {
          color: #8B6F47;
          text-align: center;
        }
        .upload-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        input[type="file"] {
          width: 100%;
          padding: 1rem;
          margin: 1rem 0;
          border: 2px dashed #C9A26A;
          border-radius: 8px;
        }
        button {
          width: 100%;
          padding: 1rem;
          background: #2C5F7E;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
        }
        button:hover {
          background: #8B6F47;
        }
        #result {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <h1>📚 رفع كتاب PDF</h1>
      <div class="upload-form">
        <form id="uploadForm">
          <input type="file" id="pdfFile" accept=".pdf" required />
          <button type="submit">معالجة وتحليل الكتاب</button>
        </form>
        <div id="result"></div>
      </div>
      
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const fileInput = document.getElementById('pdfFile');
          const file = fileInput.files[0];
          const resultDiv = document.getElementById('result');
          
          if (!file) {
            resultDiv.className = 'error';
            resultDiv.textContent = 'الرجاء اختيار ملف';
            return;
          }
          
          resultDiv.textContent = 'جاري المعالجة...';
          resultDiv.className = '';
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', file.name);
          
          try {
            const response = await fetch(window.location.href, {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
              resultDiv.className = 'success';
              resultDiv.innerHTML = \`
                <h3>✅ تم بنجاح!</h3>
                <p>\${result.message}</p>
                \${result.blogPostUrl ? \`<a href="\${result.blogPostUrl}" target="_blank">عرض المسودة</a>\` : ''}
              \`;
            } else {
              resultDiv.className = 'error';
              resultDiv.textContent = '❌ ' + result.message;
            }
          } catch (error) {
            resultDiv.className = 'error';
            resultDiv.textContent = '❌ خطأ في الاتصال: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
}

// ============================================
// معالجة ملف PDF
// ============================================

/**
 * معالجة ملف PDF كامل
 */
function processPDFFile(fileBlob, fileName) {
  try {
    Logger.log('بدء معالجة الملف: ' + fileName);
    
    // 1. رفع الملف إلى Google Drive
    const uploadedFile = uploadToDrive(fileBlob, fileName);
    Logger.log('تم الرفع إلى Drive: ' + uploadedFile.getId());
    
    // 2. استخراج النص باستخدام OCR
    const extractedText = extractTextFromPDF(uploadedFile);
    Logger.log('تم استخراج النص: ' + extractedText.substring(0, 100) + '...');
    
    // 3. تحليل وتنسيق النص
    const formattedHTML = generateFormattedHTML(extractedText, fileName);
    Logger.log('تم توليد HTML');
    
    // 4. نشر على Blogger كمسودة
    const blogPost = createBloggerDraft(formattedHTML, fileName);
    Logger.log('تم إنشاء مسودة Blogger');
    
    return {
      success: true,
      message: 'تمت معالجة الكتاب بنجاح وإنشاء مسودة',
      fileId: uploadedFile.getId(),
      blogPostId: blogPost.id,
      blogPostUrl: blogPost.url
    };
    
  } catch (error) {
    Logger.log('خطأ في processPDFFile: ' + error.message);
    throw error;
  }
}

/**
 * رفع ملف إلى Google Drive
 */
function uploadToDrive(fileBlob, fileName) {
  try {
    const folder = DriveApp.getFolderById(CONFIG.UPLOAD_FOLDER_ID);
    
    // إنشاء الملف
    const file = folder.createFile(fileBlob);
    file.setName(fileName);
    file.setDescription('تم الرفع عبر نظام جنون العظمة');
    
    // جعل الملف قابل للمشاركة
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file;
    
  } catch (error) {
    Logger.log('خطأ في uploadToDrive: ' + error.message);
    throw new Error('فشل رفع الملف إلى Drive');
  }
}

/**
 * استخراج النص من PDF باستخدام OCR
 */
function extractTextFromPDF(file) {
  try {
    const fileId = file.getId();
    const fileName = file.getName().replace(/\.pdf$/i, '');
    
    // استخدام Drive API لتحويل PDF إلى Google Doc مع OCR
    const resource = {
      title: fileName + '_OCR',
      mimeType: MimeType.GOOGLE_DOCS
    };
    
    const options = {
      ocr: true,
      ocrLanguage: CONFIG.OCR_LANGUAGE
    };
    
    // تحويل PDF إلى Google Doc
    const doc = Drive.Files.copy(resource, fileId, options);
    
    // قراءة النص من Google Doc
    const docFile = DocumentApp.openById(doc.id);
    const text = docFile.getBody().getText();
    
    // حذف Google Doc المؤقت
    Drive.Files.remove(doc.id);
    
    return text;
    
  } catch (error) {
    Logger.log('خطأ في extractTextFromPDF: ' + error.message);
    throw new Error('فشل استخراج النص من PDF');
  }
}

// ============================================
// تحليل وتنسيق النص
// ============================================

/**
 * توليد HTML منسق من النص المستخرج
 */
function generateFormattedHTML(text, fileName) {
  try {
    // تنظيف النص
    let cleanText = text.trim();
    
    // استخراج العنوان (أول سطر عادة)
    const lines = cleanText.split('\n').filter(line => line.trim());
    const bookTitle = lines[0] || fileName.replace(/\.pdf$/i, '');
    
    // تحليل البنية
    const structure = analyzeTextStructure(cleanText);
    
    // بناء HTML
    let html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${bookTitle}</title>
  <style>${CONFIG.HTML_TEMPLATE.style}</style>
</head>
<body>
  <article class="book-content">
`;
    
    // العنوان الرئيسي
    html += `    <h1 class="book-main-title">${bookTitle}</h1>\n`;
    html += `    <div class="ornamental-divider">✦ ✦ ✦</div>\n\n`;
    
    // جدول المحتويات
    if (structure.chapters.length > 0) {
      html += generateTableOfContents(structure.chapters);
      html += `    <div class="ornamental-divider">✦ ✦ ✦</div>\n\n`;
    }
    
    // المحتوى الرئيسي
    html += formatContent(cleanText, structure);
    
    html += `  </article>
</body>
</html>`;
    
    return html;
    
  } catch (error) {
    Logger.log('خطأ في generateFormattedHTML: ' + error.message);
    throw new Error('فشل توليد HTML');
  }
}

/**
 * تحليل بنية النص (عناوين، فصول، إلخ)
 */
function analyzeTextStructure(text) {
  const structure = {
    chapters: [],
    sections: [],
    paragraphs: []
  };
  
  const lines = text.split('\n');
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return;
    
    // اكتشاف العناوين (سطور قصيرة نسبياً في بداية الأسطر)
    if (trimmedLine.length < 100 && trimmedLine.length > 5) {
      // محاولة اكتشاف إذا كان عنواناً
      const isChapter = /^(الباب|الفصل|الجزء|القسم|المبحث)\s+/i.test(trimmedLine);
      const isSection = /^(المطلب|الفرع|المسألة|الموضوع)\s+/i.test(trimmedLine);
      
      if (isChapter) {
        structure.chapters.push({
          title: trimmedLine,
          lineNumber: index
        });
      } else if (isSection) {
        structure.sections.push({
          title: trimmedLine,
          lineNumber: index
        });
      }
    }
    
    // الفقرات
    if (trimmedLine.length > 100) {
      structure.paragraphs.push({
        text: trimmedLine,
        lineNumber: index
      });
    }
  });
  
  return structure;
}

/**
 * توليد جدول المحتويات
 */
function generateTableOfContents(chapters) {
  let toc = `    <div class="toc">
      <h2>📖 جدول المحتويات</h2>
      <ul>\n`;
  
  chapters.forEach((chapter, index) => {
    const chapterId = `chapter-${index + 1}`;
    toc += `        <li><a href="#${chapterId}">${chapter.title}</a></li>\n`;
  });
  
  toc += `      </ul>
    </div>\n\n`;
  
  return toc;
}

/**
 * تنسيق المحتوى
 */
function formatContent(text, structure) {
  let content = '';
  const lines = text.split('\n');
  let chapterIndex = 0;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      content += '\n';
      return;
    }
    
    // التحقق إذا كان عنوان فصل
    const chapter = structure.chapters.find(ch => ch.lineNumber === index);
    if (chapter) {
      const chapterId = `chapter-${chapterIndex + 1}`;
      content += `    <h2 id="${chapterId}">${trimmedLine}</h2>\n`;
      content += `    <div class="ornamental-divider">✧ ✧ ✧</div>\n\n`;
      chapterIndex++;
      return;
    }
    
    // التحقق إذا كان عنوان قسم
    const section = structure.sections.find(sec => sec.lineNumber === index);
    if (section) {
      content += `    <h3>${trimmedLine}</h3>\n\n`;
      return;
    }
    
    // اكتشاف الاقتباسات (سطور تبدأ بعلامات معينة)
    if (/^[«"'"]/.test(trimmedLine) || /^قال/.test(trimmedLine)) {
      content += `    <blockquote>${trimmedLine}</blockquote>\n\n`;
      return;
    }
    
    // فقرات عادية
    if (trimmedLine.length > 50) {
      content += `    <p>${trimmedLine}</p>\n\n`;
    }
  });
  
  return content;
}

// ============================================
// النشر على Blogger
// ============================================

/**
 * إنشاء مسودة على Blogger
 */
function createBloggerDraft(htmlContent, fileName) {
  try {
    const title = extractTitleFromHTML(htmlContent) || fileName.replace(/\.pdf$/i, '');
    
    const postData = {
      kind: 'blogger#post',
      blog: {
        id: CONFIG.BLOG_ID
      },
      title: title,
      content: htmlContent,
      labels: ['كتب', 'مكتبة', 'تراث']
    };
    
    // إنشاء مسودة
    const post = Blogger.Posts.insert(postData, CONFIG.BLOG_ID, {
      isDraft: true
    });
    
    return post;
    
  } catch (error) {
    Logger.log('خطأ في createBloggerDraft: ' + error.message);
    throw new Error('فشل إنشاء مسودة Blogger');
  }
}

/**
 * استخراج العنوان من HTML
 */
function extractTitleFromHTML(html) {
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : null;
}

// ============================================
// دوال مساعدة
// ============================================

/**
 * تنظيف وتهيئة النص العربي
 */
function normalizeArabicText(text) {
  // إزالة التشكيل (اختياري)
  // text = text.replace(/[\u064B-\u065F]/g, '');
  
  // توحيد علامات الترقيم
  text = text.replace(/[،؛]/g, '،');
  text = text.replace(/[؟]/g, '؟');
  
  // إزالة المسافات الزائدة
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
}

/**
 * اختبار السكريبت
 */
function testScript() {
  // اختبار بملف PDF موجود
  const testFileId = 'YOUR_TEST_PDF_FILE_ID';
  const testFile = DriveApp.getFileById(testFileId);
  
  const result = processPDFFile(testFile.getBlob(), 'test_book.pdf');
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * إعداد المشروع
 */
function setupProject() {
  Logger.log('=== إعداد المشروع ===');
  
  // إنشاء مجلد للملفات المرفوعة
  try {
    const folder = DriveApp.createFolder('جنون_العظمة_كتب_مرفوعة');
    Logger.log('تم إنشاء المجلد: ' + folder.getId());
    Logger.log('استبدل UPLOAD_FOLDER_ID في الإعدادات بـ: ' + folder.getId());
  } catch (error) {
    Logger.log('خطأ في إنشاء المجلد: ' + error.message);
  }
  
  Logger.log('\n=== الخطوات التالية ===');
  Logger.log('1. تفعيل Drive API من Resources > Advanced Google Services');
  Logger.log('2. تفعيل Blogger API v3 من Resources > Advanced Google Services');
  Logger.log('3. تحديث CONFIG.BLOG_ID بمعرف مدونتك');
  Logger.log('4. نشر السكريبت كـ Web App من Deploy > New deployment');
  Logger.log('5. اختيار "Anyone" للوصول');
  Logger.log('6. نسخ رابط Web App واستخدامه في موقع Blogger');
}
