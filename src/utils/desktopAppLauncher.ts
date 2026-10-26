import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';
import { getStoredLaborLaw } from './lawStorage';

/**
 * Downloads a string content as a file with specified filename and mime type.
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a Windows Batch launcher that starts Chrome or Edge in standalone application window mode.
 * Double-clicking this file on Windows launches the app in a borderless desktop window just like a native app.
 */
export function downloadWindowsDesktopLauncher(): void {
  const targetUrl = window.location.href.split('?')[0];

  const batchContent = `@echo off
title تشغيل قاعدة قرارات قانون العمل رقم 14 لسنة 2025
chcp 65001 > nul
echo ========================================================
echo   قاعدة القرارات الوزارية المنفذة لقانون العمل 14 لسنة 2025
echo   جارٍ تشغيل التطبيق في نافذة مستقلة كبرنامج كمبيوتر...
echo ========================================================

:: 1. محاولة التشغيل عبر Microsoft Edge في وضعية التطبيق المستقل (Standalone Window)
start "" msedge.exe --app="${targetUrl}" 2>nul
if %errorlevel% equ 0 exit

:: 2. محاولة التشغيل عبر Google Chrome في وضعية التطبيق المستقل
start "" chrome.exe --app="${targetUrl}" 2>nul
if %errorlevel% equ 0 exit

:: 3. في حال عدم العثور عليهما يتم الفتح في المتصفح الافتراضي
start "" "${targetUrl}"
exit
`;

  downloadBlob(
    batchContent,
    'تشغيل_قاعدة_قرارات_قانون_العمل_14.bat',
    'application/x-bat;charset=utf-8'
  );
}

/**
 * Generates a Windows .url desktop shortcut file.
 */
export function downloadWindowsShortcut(): void {
  const targetUrl = window.location.href.split('?')[0];
  const shortcutContent = `[InternetShortcut]
URL=${targetUrl}
IconIndex=0
HotKey=0
IDList=
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,11
`;

  downloadBlob(
    shortcutContent,
    'قاعدة_قرارات_قانون_العمل_14.url',
    'application/internet-shortcut'
  );
}

/**
 * Generates an all-in-one Single-File Portable Offline HTML App that runs anywhere on PC without internet.
 * Contains both the complete decisions database AND the complete Egyptian Labor Law No. 14 of 2025 text.
 * Requires ZERO internet connection, zero external scripts, and zero installations.
 */
export function downloadPortableOfflineApp(
  decisions: MinisterialDecision[],
  law?: LaborLawInfo
): void {
  const activeLaw = law || getStoredLaborLaw();
  const safeDecisionsJson = JSON.stringify(decisions).replace(/</g, '\\u003c');
  const safeLawJson = JSON.stringify(activeLaw).replace(/</g, '\\u003c');

  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المنظومة المحمولة للقرارات الوزارية وقانون العمل 14 لسنة 2025 (بدون إنترنت)</title>
  <style>
    /* أنماط مدمجة بالكامل لتعمل دون أي اتصال بالإنترنت أو ملقمات خارجية */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Cairo, Tahoma, Arial, sans-serif;
      background-color: #f7f7f6;
      color: #1c1917;
      line-height: 1.6;
      direction: rtl;
    }
    header {
      background-color: #1c1917;
      color: #fafaf9;
      padding: 1rem 1.5rem;
      border-bottom: 2px solid #b45309;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .brand-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #ffffff;
    }
    .brand-sub {
      font-size: 0.75rem;
      color: #fbbf24;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .offline-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: #047857;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: bold;
    }
    .nav-tabs {
      display: flex;
      gap: 0.5rem;
    }
    .nav-tab-btn {
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      background: #292524;
      color: #d6d3d1;
      transition: all 0.2s;
    }
    .nav-tab-btn:hover { background: #44403c; color: #fff; }
    .nav-tab-btn.active {
      background: #f59e0b;
      color: #1c1917;
      border-color: #d97706;
    }
    .main-container {
      max-width: 1200px;
      margin: 1.5rem auto;
      padding: 0 1rem 3rem 1rem;
    }
    .offline-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .controls-card {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .search-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 260px;
      padding: 0.6rem 0.9rem;
      border: 1px solid #d6d3d1;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      direction: rtl;
    }
    .search-input:focus {
      border-color: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    }
    .categories-bar {
      display: flex;
      gap: 0.4rem;
      overflow-x: auto;
      padding-bottom: 0.3rem;
      white-space: nowrap;
    }
    .cat-pill {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: #f5f5f4;
      border: 1px solid #e7e5e4;
      font-size: 0.75rem;
      color: #57534e;
      cursor: pointer;
      font-weight: 600;
    }
    .cat-pill:hover { background: #e7e5e4; }
    .cat-pill.active {
      background: #1c1917;
      color: #f59e0b;
      border-color: #1c1917;
    }
    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1rem;
    }
    .decision-card {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.15s, border-color 0.15s;
    }
    .decision-card:hover {
      border-color: #f59e0b;
      transform: translateY(-2px);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .card-dec-number {
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: bold;
      color: #92400e;
      background: #fef3c7;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .card-category {
      font-size: 0.75rem;
      color: #57534e;
      background: #f5f5f4;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1c1917;
      margin-bottom: 0.5rem;
      cursor: pointer;
      line-height: 1.4;
    }
    .card-title:hover { color: #b45309; }
    .card-basis-badge {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 0.45rem 0.65rem;
      font-size: 0.75rem;
      color: #78350f;
      margin-bottom: 0.75rem;
    }
    .card-actions {
      border-top: 1px solid #f5f5f4;
      padding-top: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .btn {
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }
    .btn-primary { background: #f59e0b; color: #1c1917; }
    .btn-primary:hover { background: #d97706; }
    .btn-secondary { background: #f5f5f4; color: #44403c; border: 1px solid #d6d3d1; }
    .btn-secondary:hover { background: #e7e5e4; }
    .btn-dark { background: #1c1917; color: #fff; }
    .btn-dark:hover { background: #292524; }

    /* Law Articles View Styles */
    .chapter-card {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .chapter-header {
      background: #292524;
      color: #ffffff;
      padding: 0.9rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f59e0b;
    }
    .chapter-title { font-size: 1rem; font-weight: bold; }
    .chapter-range { font-size: 0.75rem; color: #fbbf24; font-family: monospace; }
    .chapter-body { padding: 1.25rem; }
    .chapter-summary {
      font-size: 0.85rem;
      color: #57534e;
      margin-bottom: 1rem;
      background: #fafaf9;
      padding: 0.75rem;
      border-radius: 8px;
      border-right: 3px solid #b45309;
    }
    .law-article-box {
      border: 1px solid #f0eeed;
      border-radius: 8px;
      padding: 0.85rem;
      margin-bottom: 0.75rem;
      background: #ffffff;
    }
    .law-article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }
    .law-article-number { font-weight: bold; font-size: 0.9rem; color: #92400e; }
    .law-article-exec-badge {
      font-size: 0.7rem;
      background: #fef3c7;
      color: #78350f;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #fde68a;
    }
    .law-article-text {
      font-size: 0.88rem;
      line-height: 1.6;
      color: #292524;
      white-space: pre-line;
    }

    /* Modal for View & Print */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(12, 10, 9, 0.75);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-overlay.active { display: flex; }
    .modal-container {
      background: #ffffff;
      border-radius: 14px;
      max-width: 850px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .modal-header {
      background: #1c1917;
      color: #fafaf9;
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #292524;
    }
    .modal-body {
      padding: 1.5rem 2rem;
      overflow-y: auto;
      line-height: 1.8;
      font-size: 0.95rem;
    }
    .modal-footer {
      background: #fafaf9;
      border-top: 1px solid #e7e5e4;
      padding: 0.75rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Print Styles */
    @media print {
      header, .no-print, .offline-banner, .controls-card, .nav-tabs, .btn {
        display: none !important;
      }
      body { background: #fff !important; color: #000 !important; }
      .main-container { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
      .modal-overlay {
        position: static !important;
        display: block !important;
        background: transparent !important;
        padding: 0 !important;
      }
      .modal-container {
        max-width: 100% !important;
        max-height: none !important;
        box-shadow: none !important;
        border: none !important;
      }
      .modal-header, .modal-footer { display: none !important; }
      .modal-body { padding: 0 !important; }
      .decision-card, .chapter-card { break-inside: avoid; border: 1px solid #ccc !important; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="header-content">
      <div class="brand">
        <div class="brand-icon">⚖️</div>
        <div>
          <div class="brand-title">قاعدة القرارات الوزارية · قانون العمل 14 لسنة 2025</div>
          <div class="brand-sub">
            <span>النسخة المحمولة المستقلة للكمبيوتر</span>
            <span class="offline-badge">تعمل 100% بدون إنترنت</span>
          </div>
        </div>
      </div>
      <div class="nav-tabs no-print">
        <button id="tabDecisionsBtn" class="nav-tab-btn active" onclick="switchTab('decisions')">القرارات الوزارية (<span id="decCountBadge">17</span>)</button>
        <button id="tabLawBtn" class="nav-tab-btn" onclick="switchTab('law')">متن قانون العمل 14 (الـ 6 أبواب)</button>
        <button id="tabMatrixBtn" class="nav-tab-btn" onclick="switchTab('matrix')">دليل الربط والمطابقة</button>
        <button class="nav-tab-btn" onclick="window.print()" style="background:#b45309;color:#fff;">🖨️ طباعة</button>
      </div>
    </div>
  </header>

  <main class="main-container">
    <!-- Offline status badge -->
    <div class="offline-banner no-print">
      <div>
        <strong>✅ تشغيل مستقل كامل دون الحاجة للإنترنت:</strong> تم تضمين كافة نصوص القرارات الوزارية الصادرة عن وزير العمل، بالإضافة إلى النص التشريعي المعتمد لقانون العمل رقم 14 لسنة 2025.
      </div>
      <div>
        <button class="btn btn-secondary" onclick="exportDataJson()">💾 تصدير نسخة احتياطية</button>
      </div>
    </div>

    <!-- Section 1: Decisions Tab -->
    <section id="sectionDecisions">
      <div class="controls-card no-print">
        <div class="search-row">
          <input type="text" id="searchInput" class="search-input" oninput="renderDecisions()" placeholder="بحث برقم القرار، الموضوع، نص المادة، أو السند التشريعي...">
          <button class="btn btn-secondary" onclick="resetFilters()">إلغاء التصفية</button>
        </div>
        <div class="categories-bar" id="categoriesBar"></div>
      </div>

      <div id="decisionsGrid" class="grid-cards"></div>
    </section>

    <!-- Section 2: Law Text Tab -->
    <section id="sectionLaw" style="display:none;">
      <div class="controls-card no-print">
        <div class="search-row">
          <input type="text" id="lawSearchInput" class="search-input" oninput="renderLaw()" placeholder="ابحث في نصوص مواد قانون العمل رقم 14 لسنة 2025...">
        </div>
      </div>
      <div id="lawContent"></div>
    </section>

    <!-- Section 3: Statutory Matrix Tab -->
    <section id="sectionMatrix" style="display:none;">
      <div class="controls-card">
        <h2 style="font-size:1.1rem;font-weight:bold;margin-bottom:0.5rem;">جدول مطابقة القرارات الوزارية بمواد قانون العمل 14 لسنة 2025</h2>
        <p style="font-size:0.85rem;color:#57534e;">يوضح هذا الجدول أي من القرارات الوزارية جاء تنفيذاً لأي مواد في القانون وموضوع التفويض التشريعي المنفذ.</p>
      </div>
      <div id="matrixContent"></div>
    </section>
  </main>

  <!-- View Decision Modal -->
  <div id="decisionModal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <div id="modalDecTitle" style="font-weight:bold;font-size:1rem;"></div>
        <button onclick="closeModal()" style="background:none;border:none;color:#fff;font-size:1.25rem;cursor:pointer;">✕</button>
      </div>
      <div class="modal-footer no-print" style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:space-between;">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn" style="background:#0284c7;color:#fff;" onclick="exportWordDecision(currentOpenDecisionId)">📄 تحميل نسخة Word (.doc)</button>
          <button class="btn btn-primary" onclick="window.print()">📕 استعراض وطباعة PDF</button>
        </div>
        <button class="btn btn-secondary" onclick="closeModal()">إغلاق</button>
      </div>
    </div>
  </div>

  <script>
    // Embedded Complete Datasets (Zero Internet Required)
    const SEED_DECISIONS = ${safeDecisionsJson};
    const LABOR_LAW = ${safeLawJson};
    let activeCategory = 'الكل';
    let currentOpenDecisionId = null;

    // Tabs logic
    function switchTab(tab) {
      document.getElementById('sectionDecisions').style.display = tab === 'decisions' ? 'block' : 'none';
      document.getElementById('sectionLaw').style.display = tab === 'law' ? 'block' : 'none';
      document.getElementById('sectionMatrix').style.display = tab === 'matrix' ? 'block' : 'none';

      document.getElementById('tabDecisionsBtn').className = 'nav-tab-btn ' + (tab === 'decisions' ? 'active' : '');
      document.getElementById('tabLawBtn').className = 'nav-tab-btn ' + (tab === 'law' ? 'active' : '');
      document.getElementById('tabMatrixBtn').className = 'nav-tab-btn ' + (tab === 'matrix' ? 'active' : '');

      if (tab === 'law') renderLaw();
      if (tab === 'matrix') renderMatrix();
    }

    // Categories setup
    function setupCategories() {
      const cats = ['الكل', ...new Set(SEED_DECISIONS.map(d => d.category))];
      const bar = document.getElementById('categoriesBar');
      bar.innerHTML = cats.map(c => \`
        <button class="cat-pill \${c === activeCategory ? 'active' : ''}" onclick="selectCategory('\${c}')">\${c}</button>
      \`).join('');
    }

    function selectCategory(cat) {
      activeCategory = cat;
      setupCategories();
      renderDecisions();
    }

    function resetFilters() {
      document.getElementById('searchInput').value = '';
      activeCategory = 'الكل';
      setupCategories();
      renderDecisions();
    }

    // Render Decisions
    function renderDecisions() {
      const query = (document.getElementById('searchInput').value || '').trim().toLowerCase();
      const grid = document.getElementById('decisionsGrid');

      const filtered = SEED_DECISIONS.filter(d => {
        if (activeCategory !== 'الكل' && d.category !== activeCategory) return false;
        if (!query) return true;
        return d.decisionNumber.includes(query) ||
               d.title.toLowerCase().includes(query) ||
               (d.legalBasisSummary && d.legalBasisSummary.toLowerCase().includes(query)) ||
               (d.executingSubject && d.executingSubject.toLowerCase().includes(query)) ||
               (d.preamble && d.preamble.toLowerCase().includes(query)) ||
               (d.articles && d.articles.some(a => a.content.toLowerCase().includes(query)));
      });

      document.getElementById('decCountBadge').innerText = filtered.length;

      grid.innerHTML = filtered.map(d => \`
        <div class="decision-card">
          <div>
            <div class="card-top">
              <span class="card-dec-number">قرار \${d.decisionNumber} لسنة \${d.year}</span>
              <span class="card-category">\${d.category}</span>
            </div>
            <h3 class="card-title" onclick="openDecision('\${d.id}')">\${d.title}</h3>
            
            \${d.legalBasisSummary ? \`
              <div class="card-basis-badge">
                <strong>⚡ السند التشريعي المباشر:</strong> \${d.legalBasisSummary}
              </div>
            \` : ''}

            \${d.executingSubject ? \`
              <div style="font-size:0.75rem;color:#44403c;margin-bottom:0.5rem;">
                <strong>🎯 موضوع التنفيذ:</strong> \${d.executingSubject}
              </div>
            \` : ''}

            <p style="font-size:0.8rem;color:#78716c;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:0.75rem;">
              \${d.preamble}
            </p>
          </div>

          <div class="card-actions">
            <span style="font-size:0.75rem;color:#78716c;">السريان: \${d.effectiveDate}</span>
            <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
              <button class="btn btn-secondary" onclick="openDecision('\${d.id}')">ملخص احكام القرار</button>
              <button class="btn" style="background:#0284c7;color:#fff;" onclick="exportWordDecision('\${d.id}')" title="تحميل النسخة المكتوبة Word (.doc) لتيسير النقل">📄 Word مكتوب</button>
              <button class="btn" style="background:#e11d48;color:#fff;" onclick="openDecision('\${d.id}', true)" title="استعراض وطباعة النسخة الرسمية PDF">📕 النسخة الرسمية (PDF)</button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    // Modal View
    function openDecision(id, printImmediately = false) {
      const d = SEED_DECISIONS.find(item => item.id === id);
      if (!d) return;

      currentOpenDecisionId = id;
      document.getElementById('modalDecTitle').innerText = 'ملخص أحكام القرار الوزاري رقم (' + d.decisionNumber + ') لسنة ' + d.year;
      
      let articlesHtml = (d.articles || []).map(a => \`
        <div style="margin-top:1.25rem;padding-top:0.75rem;border-top:1px solid #e7e5e4;">
          <h4 style="font-weight:bold;font-size:1rem;color:#1c1917;margin-bottom:0.35rem;">\${a.articleNumber} \${a.title ? ' - ' + a.title : ''}</h4>
          <p style="white-space:pre-line;color:#292524;font-size:0.95rem;">\${a.content}</p>
        </div>
      \`).join('');

      let basisHtml = '';
      if (d.legalBasisSummary || d.executingSubject) {
        basisHtml = \`
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:0.85rem;margin:1rem 0;">
            \${d.legalBasisSummary ? \`<div><strong>⚡ السند التشريعي المباشر:</strong> \${d.legalBasisSummary}</div>\` : ''}
            \${d.executingSubject ? \`<div style="margin-top:0.35rem;"><strong>🎯 نطاق التفويض وموضوع التنفيذ:</strong> \${d.executingSubject}</div>\` : ''}
          </div>
        \`;
      }

      document.getElementById('modalDecBody').innerHTML = \`
        <div style="background:#0f172a;color:#fff;border-radius:8px;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;" class="no-print">
          <div>
            <div style="font-size:0.85rem;font-weight:bold;">النسخة الرسمية (PDF) والنسخة المكتوبة (Word)</div>
            <div style="font-size:0.75rem;color:#94a3b8;">تتوفر نسخة مكتوبة بصيغة Word لتيسير النقل والاقتباس دون الحاجة لإعادة كتابة النص</div>
          </div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
            <button class="btn" style="background:#0284c7;color:#fff;font-size:0.75rem;padding:0.35rem 0.65rem;" onclick="exportWordDecision('\${d.id}')">📄 تحميل Word المكتوب</button>
            <button class="btn" style="background:#e11d48;color:#fff;font-size:0.75rem;padding:0.35rem 0.65rem;" onclick="window.print()">📕 النسخة الرسمية PDF</button>
          </div>
        </div>

        <div style="text-align:center;border-bottom:2px solid #1c1917;padding-bottom:1rem;margin-bottom:1rem;">
          <div style="font-size:0.8rem;color:#78716c;">جمهورية مصر العربية · وزارة العمل</div>
          <h2 style="font-size:1.35rem;font-weight:bold;margin:0.25rem 0;">قرار وزير العمل رقم (\${d.decisionNumber}) لسنة \${d.year}</h2>
          <h3 style="font-size:1.05rem;font-weight:600;color:#44403c;">\${d.title}</h3>
          <div style="font-size:0.8rem;color:#b45309;margin-top:0.25rem;">الجريدة الرسمية: \${d.gazetteIssue} · تاريخ السريان: \${d.effectiveDate}</div>
        </div>

        \${basisHtml}

        <div style="margin:1rem 0;">
          <h4 style="font-weight:bold;font-size:0.9rem;color:#57534e;">الديباجة والسند القانوني:</h4>
          <p style="white-space:pre-line;font-size:0.9rem;color:#292524;margin-top:0.25rem;">\${d.preamble}</p>
        </div>

        <div style="text-align:center;font-weight:bold;font-size:1.1rem;margin:1.5rem 0;">( قــــــرّر )</div>

        \${articlesHtml}

        <div style="margin-top:2rem;padding-top:1rem;border-top:2px solid #1c1917;display:flex;justify-content:space-between;font-size:0.85rem;">
          <div>تاريخ الصدور: \${d.issueDate}<br>تاريخ العمل به: \${d.effectiveDate}</div>
          <div style="text-align:left;font-weight:bold;">\${d.issuingAuthority}<br><span style="font-weight:normal;color:#78716c;">رسمي ومعتمد</span></div>
        </div>
      \`;

      document.getElementById('decisionModal').classList.add('active');
      if (printImmediately) {
        setTimeout(() => window.print(), 350);
      }
    }

    function exportWordDecision(id) {
      const d = SEED_DECISIONS.find(item => item.id === id);
      if (!d) return;

      const articlesHtml = (d.articles || []).map(a => \`
        <div style="margin-bottom:20px;">
          <h3 style="font-size:13pt;border-bottom:1px solid #cbd5e1;padding-bottom:4px;">\${a.articleNumber} \${a.title ? ' - ' + a.title : ''}</h3>
          <p style="font-size:12pt;line-height:1.8;white-space:pre-line;">\${a.content}</p>
        </div>
      \`).join('');

      const html = \`
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset="utf-8"><title>قرار وزاري رقم (\${d.decisionNumber}) لسنة \${d.year}</title></head>
        <body style="direction:rtl;text-align:right;font-family:'Traditional Arabic','Amiri',serif;padding:30px;">
          <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:20px;">
            <h3>جمهورية مصر العربية · وزارة العمل</h3>
            <h2>قرار وزير العمل رقم (\${d.decisionNumber}) لسنة \${d.year}</h2>
            <h3>\${d.title}</h3>
            <p>تنفيذاً لقانون العمل رقم 14 لسنة 2025 (\${(d.relatedLawArticles || []).join(' ، ')})</p>
          </div>
          <div style="margin-bottom:20px;"><strong>[ الديباجة ]</strong><br>\${d.preamble}</div>
          <div style="text-align:center;font-weight:bold;margin:20px 0;">( قــــرّر )</div>
          \${articlesHtml}
          \${d.explanatoryNote ? \`<div style="margin-top:25px;padding:12px;background:#f1f5f9;"><strong>المذكرة الإيضاحية:</strong><br>\${d.explanatoryNote}</div>\` : ''}
          <div style="margin-top:35px;border-top:2px solid #000;padding-top:15px;display:flex;justify-content:space-between;">
            <div>تاريخ الصدور: \${d.issueDate}<br>تاريخ العمل: \${d.effectiveDate}</div>
            <div style="text-align:left;font-weight:bold;">\${d.issuingAuthority}<br>وزير العمل</div>
          </div>
        </body></html>
      \`;
      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`قرار_وزاري_\${d.decisionNumber}_لسنة_\${d.year}.doc\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function closeModal() {
      document.getElementById('decisionModal').classList.remove('active');
    }

    // Render Law Tab
    function renderLaw() {
      const query = (document.getElementById('lawSearchInput').value || '').trim().toLowerCase();
      const container = document.getElementById('lawContent');

      // Promulgation Articles
      let promHtml = '';
      if (!query || 'مواد الاصدار'.includes(query)) {
        promHtml = \`
          <div class="chapter-card">
            <div class="chapter-header">
              <span class="chapter-title">مواد إصدار قانون العمل رقم 14 لسنة 2025 (7 مواد)</span>
              <span class="chapter-range">المواد 1 إلى 7 من قانون الإصدار</span>
            </div>
            <div class="chapter-body">
              \${(LABOR_LAW.promulgationArticles || []).map(p => \`
                <div class="law-article-box">
                  <div class="law-article-header">
                    <span class="law-article-number">\${p.number}</span>
                  </div>
                  <div class="law-article-text">\${p.text}</div>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      }

      // Chapters
      let chaptersHtml = (LABOR_LAW.chapters || []).map(ch => {
        const matchingArticles = ch.articles.filter(a => {
          if (!query) return true;
          return a.number.toLowerCase().includes(query) ||
                 (a.title && a.title.toLowerCase().includes(query)) ||
                 a.text.toLowerCase().includes(query) ||
                 (a.executingDecisions && a.executingDecisions.some(ed => ed.toLowerCase().includes(query)));
        });

        if (matchingArticles.length === 0) return '';

        return \`
          <div class="chapter-card">
            <div class="chapter-header">
              <span class="chapter-title">\${ch.chapterNumber}: \${ch.title}</span>
              <span class="chapter-range">\${ch.articlesRange}</span>
            </div>
            <div class="chapter-body">
              <div class="chapter-summary">\${ch.summary}</div>
              \${matchingArticles.map(a => \`
                <div class="law-article-box">
                  <div class="law-article-header">
                    <span class="law-article-number">\${a.number} \${a.title ? ' - ' + a.title : ''}</span>
                    \${a.executingDecisions && a.executingDecisions.length > 0 ? \`
                      <span class="law-article-exec-badge">⚡ الصادر تنفيذاً لها: \${a.executingDecisions.join('، ')}</span>
                    \` : ''}
                  </div>
                  <div class="law-article-text">\${a.text}</div>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      }).join('');

      container.innerHTML = promHtml + chaptersHtml;
    }

    // Render Matrix Tab
    function renderMatrix() {
      const container = document.getElementById('matrixContent');
      let tableRows = SEED_DECISIONS.map(d => \`
        <tr style="border-bottom:1px solid #e7e5e4;">
          <td style="padding:0.75rem;font-weight:bold;font-family:monospace;color:#92400e;">قرار \${d.decisionNumber} لسنة \${d.year}</td>
          <td style="padding:0.75rem;font-weight:600;">\${d.title}</td>
          <td style="padding:0.75rem;color:#b45309;font-weight:bold;">\${d.legalBasisSummary || (d.relatedLawArticles || []).join('، ')}</td>
          <td style="padding:0.75rem;color:#44403c;">\${d.executingSubject || d.category}</td>
          <td style="padding:0.75rem;text-align:center;">
            <button class="btn btn-secondary" style="font-size:0.7rem;padding:3px 8px;" onclick="openDecision('\${d.id}')">استعراض</button>
          </td>
        </tr>
      \`).join('');

      container.innerHTML = \`
        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem;text-align:right;">
            <thead>
              <tr style="background:#292524;color:#fff;">
                <th style="padding:0.75rem;">رقم القرار</th>
                <th style="padding:0.75rem;">عنوان وموضوع القرار</th>
                <th style="padding:0.75rem;">السند التشريعي المباشر بالقانون</th>
                <th style="padding:0.75rem;">موضوع ومجال التنفيذ</th>
                <th style="padding:0.75rem;text-align:center;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              \${tableRows}
            </tbody>
          </table>
        </div>
      \`;
    }

    // Export backup JSON
    function exportDataJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        decisions: SEED_DECISIONS,
        law: LABOR_LAW,
        exportedAt: new Date().toISOString()
      }, null, 2));
      const dl = document.createElement('a');
      dl.setAttribute("href", dataStr);
      dl.setAttribute("download", "نسخة_احتياطية_شاملة_قانون_العمل_14.json");
      dl.click();
    }

    // Init on load
    window.onload = function() {
      setupCategories();
      renderDecisions();
    };
  </script>
</body>
</html>`;

  downloadBlob(
    htmlContent,
    'تطبيق_قاعدة_قرارات_قانون_العمل_14_المكتبي_بدون_إنترنت.html',
    'text/html;charset=utf-8'
  );
}
