/**
 * ========================================
 * Books Library Integration JavaScript
 * نظام مكتبة الكتب - جنون العظمة
 * ========================================
 * 
 * هذا الملف يوفر التكامل بين واجهة المكتبة وقاعدة بيانات الكتب
 * يدعم:
 * - Google Sheets API
 * - JSON محلي
 * - Apps Script Web App
 */

class BooksLibraryManager {
  constructor(config) {
    this.config = {
      dataSource: config.dataSource || 'json', // 'json', 'sheets', 'webapp'
      jsonUrl: config.jsonUrl || 'books-database.json',
      sheetsUrl: config.sheetsUrl || null,
      webAppUrl: config.webAppUrl || null,
      cacheEnabled: config.cacheEnabled !== false,
      cacheDuration: config.cacheDuration || 3600000 // 1 hour
    };
    
    this.books = [];
    this.categories = [];
    this.isLoaded = false;
    this.lastUpdate = null;
  }
  
  /**
   * تحميل الكتب من المصدر المحدد
   */
  async loadBooks() {
    // التحقق من الذاكرة المؤقتة
    if (this.config.cacheEnabled && this.isFromCache()) {
      return this.loadFromCache();
    }
    
    try {
      let data;
      
      switch (this.config.dataSource) {
        case 'json':
          data = await this.loadFromJSON();
          break;
        case 'sheets':
          data = await this.loadFromGoogleSheets();
          break;
        case 'webapp':
          data = await this.loadFromWebApp();
          break;
        default:
          throw new Error('مصدر بيانات غير صالح');
      }
      
      this.books = data.books || [];
      this.categories = data.categories || [];
      this.isLoaded = true;
      this.lastUpdate = Date.now();
      
      // حفظ في الذاكرة المؤقتة
      if (this.config.cacheEnabled) {
        this.saveToCache(data);
      }
      
      return this.books;
      
    } catch (error) {
      console.error('خطأ في تحميل الكتب:', error);
      throw error;
    }
  }
  
  /**
   * تحميل من ملف JSON
   */
  async loadFromJSON() {
    const response = await fetch(this.config.jsonUrl);
    if (!response.ok) {
      throw new Error('فشل تحميل ملف JSON');
    }
    return await response.json();
  }
  
  /**
   * تحميل من Google Sheets عبر Apps Script Web App
   */
  async loadFromGoogleSheets() {
    if (!this.config.sheetsUrl) {
      throw new Error('لم يتم تحديد رابط Google Sheets');
    }
    
    const response = await fetch(this.config.sheetsUrl);
    if (!response.ok) {
      throw new Error('فشل تحميل البيانات من Google Sheets');
    }
    
    const data = await response.json();
    
    // تحويل بيانات الجدول إلى تنسيق الكتب
    return this.parseGoogleSheetsData(data);
  }
  
  /**
   * تحميل من Google Apps Script Web App
   */
  async loadFromWebApp() {
    if (!this.config.webAppUrl) {
      throw new Error('لم يتم تحديد رابط Web App');
    }
    
    const response = await fetch(this.config.webAppUrl + '?action=getBooks');
    if (!response.ok) {
      throw new Error('فشل تحميل البيانات من Web App');
    }
    
    return await response.json();
  }
  
  /**
   * تحويل بيانات Google Sheets إلى تنسيق الكتب
   */
  parseGoogleSheetsData(data) {
    const books = [];
    const rows = data.values || [];
    
    // افتراض أن الصف الأول يحتوي على العناوين
    const headers = rows[0];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const book = {};
      
      headers.forEach((header, index) => {
        book[header.toLowerCase()] = row[index] || '';
      });
      
      // تأكد من وجود ID
      if (!book.id) {
        book.id = i;
      }
      
      books.push(book);
    }
    
    // استخراج التصنيفات
    const categories = this.extractCategories(books);
    
    return { books, categories };
  }
  
  /**
   * استخراج التصنيفات من الكتب
   */
  extractCategories(books) {
    const categoriesMap = new Map();
    
    books.forEach(book => {
      const category = book.category || 'عام';
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, {
          id: category,
          name: category,
          count: 0
        });
      }
      categoriesMap.get(category).count++;
    });
    
    return Array.from(categoriesMap.values());
  }
  
  /**
   * البحث في الكتب
   */
  searchBooks(query) {
    if (!query || !query.trim()) {
      return this.books;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.books.filter(book => {
      return (
        (book.title && book.title.toLowerCase().includes(searchTerm)) ||
        (book.author && book.author.toLowerCase().includes(searchTerm)) ||
        (book.category && book.category.toLowerCase().includes(searchTerm)) ||
        (book.description && book.description.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  /**
   * فلترة الكتب حسب الفئة
   */
  filterByCategory(category) {
    if (!category || category === 'all') {
      return this.books;
    }
    
    return this.books.filter(book => book.category === category);
  }
  
  /**
   * الحصول على كتاب بواسطة ID
   */
  getBookById(id) {
    return this.books.find(book => book.id == id);
  }
  
  /**
   * الحصول على كتب عشوائية
   */
  getRandomBooks(count = 5) {
    const shuffled = [...this.books].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  /**
   * الحصول على كتب مميزة (يمكن تخصيصها)
   */
  getFeaturedBooks(count = 6) {
    // يمكن تحديدها بناءً على معايير معينة
    // هنا نستخدم أول X كتب
    return this.books.slice(0, count);
  }
  
  /**
   * ترتيب الكتب
   */
  sortBooks(books, sortBy = 'title', order = 'asc') {
    return [...books].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '', 'ar');
          break;
        case 'author':
          comparison = (a.author || '').localeCompare(b.author || '', 'ar');
          break;
        case 'year':
          comparison = (a.year || '') - (b.year || '');
          break;
        case 'pages':
          comparison = (a.pages || 0) - (b.pages || 0);
          break;
        default:
          comparison = 0;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  }
  
  /**
   * الحصول على إحصائيات المكتبة
   */
  getStatistics() {
    return {
      totalBooks: this.books.length,
      totalCategories: this.categories.length,
      totalAuthors: new Set(this.books.map(b => b.author)).size,
      categoriesBreakdown: this.categories.map(cat => ({
        name: cat.name,
        count: cat.count
      }))
    };
  }
  
  // ============================================
  // إدارة الذاكرة المؤقتة
  // ============================================
  
  isFromCache() {
    const cached = localStorage.getItem('booksLibraryCache');
    if (!cached) return false;
    
    const { timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    return (now - timestamp) < this.config.cacheDuration;
  }
  
  saveToCache(data) {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem('booksLibraryCache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('فشل حفظ البيانات في الذاكرة المؤقتة:', error);
    }
  }
  
  loadFromCache() {
    try {
      const cached = localStorage.getItem('booksLibraryCache');
      if (!cached) return null;
      
      const { data } = JSON.parse(cached);
      this.books = data.books || [];
      this.categories = data.categories || [];
      this.isLoaded = true;
      
      return this.books;
    } catch (error) {
      console.warn('فشل تحميل البيانات من الذاكرة المؤقتة:', error);
      return null;
    }
  }
  
  clearCache() {
    localStorage.removeItem('booksLibraryCache');
  }
}

// ============================================
// UI Helper Functions
// ============================================

/**
 * عرض الكتب في الواجهة
 */
function renderBooks(books, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (books.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--accent-gold); margin-bottom: 1rem;"></i>
        <p>لا توجد كتب تطابق البحث</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = books.map(book => createBookCard(book)).join('');
}

/**
 * إنشاء بطاقة كتاب
 */
function createBookCard(book) {
  return `
    <div class="book-card" data-book-id="${book.id}">
      <div class="book-cover-container">
        ${book.coverImage 
          ? `<img src="${book.coverImage}" alt="${book.title}" />`
          : `<i class="fas fa-book book-cover-icon"></i>`
        }
      </div>
      <div class="book-card-body">
        <span class="book-category">${book.category || 'عام'}</span>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author"><i class="fas fa-user"></i> ${book.author}</p>
        <div class="book-meta">
          ${book.year ? `<span><i class="far fa-calendar"></i> ${book.year}</span>` : ''}
          ${book.pages ? `<span><i class="fas fa-file"></i> ${book.pages} صفحة</span>` : ''}
        </div>
        <div class="book-actions">
          <button class="book-btn book-btn-read" onclick="openBookReader('${escapeHtml(book.title)}', '${book.readUrl}')">
            <i class="fas fa-book-reader"></i> قراءة
          </button>
          <button class="book-btn book-btn-download" onclick="window.open('${book.downloadUrl}', '_blank')">
            <i class="fas fa-download"></i> تحميل
          </button>
        </div>
        <p style="font-size: 0.75rem; color: #888; margin-top: 0.8rem;">
          <i class="fas fa-copyright"></i> ${book.license || 'Public Domain'} | ${book.source || 'Internet Archive'}
        </p>
      </div>
    </div>
  `;
}

/**
 * فتح قارئ الكتب
 */
function openBookReader(title, url) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    flex-direction: column;
  `;
  
  modal.innerHTML = `
    <div style="background: #8B6F47; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; font-size: 1.3rem;">${title}</h3>
      <button onclick="this.closest('div').parentElement.remove()" style="background: white; color: #8B6F47; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 1.2rem;">
        <i class="fas fa-times"></i> إغلاق
      </button>
    </div>
    <iframe src="${url}" style="flex: 1; border: none; width: 100%;"></iframe>
  `;
  
  document.body.appendChild(modal);
}

/**
 * Escape HTML لمنع XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// استخدام المكتبة - مثال
// ============================================

// مثال على الاستخدام في الصفحة:
/*
const libraryManager = new BooksLibraryManager({
  dataSource: 'json',
  jsonUrl: 'books-database.json',
  cacheEnabled: true
});

// تحميل الكتب
libraryManager.loadBooks()
  .then(books => {
    console.log('تم تحميل', books.length, 'كتاب');
    renderBooks(books, 'booksGrid');
  })
  .catch(error => {
    console.error('خطأ:', error);
  });

// البحث
document.getElementById('searchInput').addEventListener('input', (e) => {
  const results = libraryManager.searchBooks(e.target.value);
  renderBooks(results, 'booksGrid');
});

// الفلترة حسب الفئة
function filterByCategory(category) {
  const filtered = libraryManager.filterByCategory(category);
  renderBooks(filtered, 'booksGrid');
}
*/

// ============================================
// Google Sheets Integration Example
// ============================================

/**
 * إنشاء Web App للتكامل مع Google Sheets
 * 
 * في Google Apps Script:
 * 
 * function doGet(e) {
 *   const action = e.parameter.action;
 *   
 *   if (action === 'getBooks') {
 *     return getBooksData();
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify({
 *     error: 'Invalid action'
 *   })).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function getBooksData() {
 *   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Books');
 *   const data = sheet.getDataRange().getValues();
 *   
 *   // تحويل إلى JSON
 *   const headers = data[0];
 *   const books = [];
 *   
 *   for (let i = 1; i < data.length; i++) {
 *     const book = {};
 *     headers.forEach((header, index) => {
 *       book[header] = data[i][index];
 *     });
 *     books.push(book);
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify({
 *     books: books,
 *     metadata: {
 *       totalBooks: books.length,
 *       lastUpdated: new Date().toISOString()
 *     }
 *   })).setMimeType(ContentService.MimeType.JSON);
 * }
 */

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BooksLibraryManager, renderBooks, createBookCard, openBookReader };
}