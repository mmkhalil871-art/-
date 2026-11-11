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
  law?: LaborLawInfo | null
): void {
  const activeLaw = law !== undefined ? law : getStoredLaborLaw();
  const safeDecisionsJson = JSON.stringify(decisions).replace(/</g, '\\u003c');
  const safeLawJson = JSON.stringify(activeLaw || {}).replace(/</g, '\\u003c');

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

/**
 * Generates and downloads a dedicated Single-File Mobile Phone Application (HTML5 / PWA)
 * Designed specifically for smartphones (Android & iOS).
 * Allows direct download to phone, works 100% offline, requires ZERO app store or server.
 */
export function downloadMobilePhoneApp(
  decisions: MinisterialDecision[],
  law?: LaborLawInfo | null
): void {
  const activeLaw = law !== undefined ? law : getStoredLaborLaw();
  const safeDecisionsJson = JSON.stringify(decisions).replace(/</g, '\\u003c');
  const safeLawJson = JSON.stringify(activeLaw || {}).replace(/</g, '\\u003c');

  const mobileHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
  <title>تطبيق قانون العمل 14 لسنة 2025 والقرارات الوزارية (نسخة الهاتف المحمول)</title>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="قرارات العمل">
  <meta name="theme-color" content="#18181b">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #09090b;
      --card-bg: #18181b;
      --card-border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #10b981;
      --accent-gold: #f59e0b;
      --dock-bg: rgba(24, 24, 27, 0.95);
      --input-bg: #27272a;
    }
    body.light {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --card-border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --accent: #059669;
      --accent-gold: #d97706;
      --dock-bg: rgba(255, 255, 255, 0.95);
      --input-bg: #f1f5f9;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Cairo, Tahoma, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: calc(75px + env(safe-area-inset-bottom, 16px));
      -webkit-font-smoothing: antialiased;
      user-select: text;
    }
    .app-header {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--dock-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 12px 16px;
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }
    .app-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .app-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
    }
    .app-title {
      font-size: 15px;
      font-weight: 800;
      line-height: 1.2;
    }
    .app-subtitle {
      font-size: 11px;
      color: var(--text-muted);
    }
    .theme-toggle-btn {
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: var(--input-bg);
      color: var(--text);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .search-box {
      position: relative;
      width: 100%;
    }
    .search-input {
      width: 100%;
      padding: 10px 14px 10px 36px;
      border-radius: 12px;
      border: 1px solid var(--card-border);
      background: var(--input-bg);
      color: var(--text);
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent);
    }
    .clear-search-btn {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 14px;
      cursor: pointer;
      display: none;
    }
    .categories-bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 8px 16px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      border-bottom: 1px solid var(--card-border);
      background: var(--bg);
    }
    .categories-bar::-webkit-scrollbar { display: none; }
    .cat-chip {
      white-space: nowrap;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 600;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .cat-chip.active {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 12px 14px;
    }
    .install-banner {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 95, 70, 0.25));
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .install-banner-text {
      font-size: 11.5px;
      line-height: 1.4;
    }
    .install-banner-btn {
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--accent);
      color: white;
      font-size: 11px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }
    .decision-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      transition: transform 0.15s ease;
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .dec-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(245, 158, 11, 0.15);
      color: var(--accent-gold);
      font-size: 12px;
      font-weight: 800;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .status-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .dec-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.45;
      margin-bottom: 8px;
    }
    .law-articles-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 10px;
    }
    .law-art-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.3);
    }
    body.light .law-art-tag {
      color: #0284c7;
    }
    .card-meta {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .card-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      border-top: 1px solid var(--card-border);
      padding-top: 10px;
    }
    .btn-action {
      flex: 1;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--input-bg);
      color: var(--text);
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-action:active {
      transform: scale(0.98);
    }
    .btn-fav.active {
      background: rgba(245, 158, 11, 0.2);
      color: var(--accent-gold);
      border-color: rgba(245, 158, 11, 0.4);
    }
    .articles-accordion {
      display: none;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed var(--card-border);
    }
    .articles-accordion.open {
      display: block;
    }
    .preamble-box {
      font-size: 12px;
      color: var(--text-muted);
      background: var(--input-bg);
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 10px;
      white-space: pre-line;
      line-height: 1.6;
    }
    .article-item {
      padding: 10px;
      background: var(--input-bg);
      border-radius: 10px;
      margin-bottom: 8px;
    }
    .article-num {
      font-weight: 800;
      font-size: 12px;
      color: var(--accent-gold);
      margin-bottom: 4px;
    }
    .article-text {
      font-size: 12.5px;
      line-height: 1.6;
      white-space: pre-line;
    }
    /* Bottom Navigation Dock */
    .bottom-dock {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: var(--dock-bg);
      backdrop-filter: blur(16px);
      border-top: 1px solid var(--card-border);
      padding: 6px 12px calc(6px + env(safe-area-inset-bottom, 10px));
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
    }
    .dock-tab {
      display: flex;
      flex-col;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6px 4px;
      border-radius: 12px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    }
    .dock-tab.active {
      color: var(--accent);
      font-weight: 800;
    }
    .dock-icon {
      font-size: 18px;
      margin-bottom: 2px;
    }
    .dock-label {
      font-size: 10.5px;
    }
    /* Law View Styles */
    .chapter-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .chapter-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 4px;
    }
    .toast {
      position: fixed;
      bottom: 85px;
      left: 50%;
      transform: translateX(-50%);
      background: #18181b;
      color: white;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid #3f3f46;
      z-index: 100;
      display: none;
    }
  </style>
</head>
<body>

  <!-- Floating Mobile App Header -->
  <header class="app-header">
    <div class="header-top">
      <div class="app-title-box">
        <div class="app-icon">⚖️</div>
        <div>
          <div class="app-title">قرارات قانون العمل 14 لسنة 2025</div>
          <div class="app-subtitle" id="stats-subtitle">جاري التحميل...</div>
        </div>
      </div>
      <button class="theme-toggle-btn" onclick="toggleTheme()" id="theme-btn">☀️ فاتح</button>
    </div>

    <!-- Live Search Box -->
    <div class="search-box">
      <input type="text" id="searchInput" class="search-input" placeholder="ابحث برقم القرار، عنوانه، المادة (مثال: السلامة، 50، الأجور)..." oninput="handleSearch(this.value)">
      <button id="clearSearch" class="clear-search-btn" onclick="clearSearchInput()">✕</button>
    </div>
  </header>

  <!-- Horizontal Scrollable Category Pills -->
  <div class="categories-bar" id="categoriesBar"></div>

  <!-- Main Content Views -->
  <div class="container">
    <!-- Home Screen Add Helper Banner -->
    <div class="install-banner" id="installBanner">
      <div class="install-banner-text">
        <strong>📲 تثبيت التطبيق على شاشة هاتفك:</strong><br>
        اضغط على خيارات المتصفح (⋮ أو مشاركة) واختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> ليعمل كبرنامج مستقل دائماً.
      </div>
      <button class="install-banner-btn" onclick="dismissBanner()">حسناً</button>
    </div>

    <!-- Tab 1: Decisions View -->
    <div id="decisionsView">
      <div id="decisionsList"></div>
    </div>

    <!-- Tab 2: Labor Law View -->
    <div id="lawView" style="display: none;">
      <div id="lawContent"></div>
    </div>
  </div>

  <!-- Bottom Mobile Dock -->
  <nav class="bottom-dock">
    <button class="dock-tab active" id="tab-decisions" onclick="switchTab('decisions')">
      <div class="dock-icon">📜</div>
      <div class="dock-label">القرارات</div>
    </button>
    <button class="dock-tab" id="tab-law" onclick="switchTab('law')">
      <div class="dock-icon">⚖️</div>
      <div class="dock-label">قانون العمل</div>
    </button>
    <button class="dock-tab" id="tab-search" onclick="focusSearch()">
      <div class="dock-icon">🔍</div>
      <div class="dock-label">بحث سريع</div>
    </button>
    <button class="dock-tab" id="tab-favs" onclick="filterFavorites()">
      <div class="dock-icon">⭐</div>
      <div class="dock-label">المفضلة</div>
    </button>
  </nav>

  <!-- Toast Message -->
  <div class="toast" id="toast"></div>

  <script>
    const DECISIONS = ${safeDecisionsJson};
    const LABOR_LAW = ${safeLawJson};

    let currentCategory = 'جميع التصنيفات';
    let searchQuery = '';
    let showFavoritesOnly = false;
    let activeTab = 'decisions';
    let favorites = JSON.parse(localStorage.getItem('mobile_law14_favs') || '[]');

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2500);
    }

    function toggleTheme() {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      document.getElementById('theme-btn').innerText = isLight ? '🌙 داكن' : '☀️ فاتح';
      localStorage.setItem('mobile_theme', isLight ? 'light' : 'dark');
    }

    function dismissBanner() {
      document.getElementById('installBanner').style.display = 'none';
      localStorage.setItem('mobile_banner_dismissed', 'true');
    }

    function switchTab(tab) {
      activeTab = tab;
      document.getElementById('tab-decisions').classList.toggle('active', tab === 'decisions' && !showFavoritesOnly);
      document.getElementById('tab-law').classList.toggle('active', tab === 'law');
      document.getElementById('tab-favs').classList.toggle('active', showFavoritesOnly);

      if (tab === 'decisions') {
        showFavoritesOnly = false;
        document.getElementById('decisionsView').style.display = 'block';
        document.getElementById('lawView').style.display = 'none';
        renderDecisions();
      } else if (tab === 'law') {
        showFavoritesOnly = false;
        document.getElementById('decisionsView').style.display = 'none';
        document.getElementById('lawView').style.display = 'block';
        renderLaw();
      }
    }

    function filterFavorites() {
      showFavoritesOnly = !showFavoritesOnly;
      activeTab = 'decisions';
      document.getElementById('tab-favs').classList.toggle('active', showFavoritesOnly);
      document.getElementById('tab-decisions').classList.toggle('active', !showFavoritesOnly);
      document.getElementById('decisionsView').style.display = 'block';
      document.getElementById('lawView').style.display = 'none';
      renderDecisions();
      if (showFavoritesOnly) {
        showToast('عرض التشريعات المحفوظة في المفضلة');
      }
    }

    function focusSearch() {
      switchTab('decisions');
      const input = document.getElementById('searchInput');
      input.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleSearch(val) {
      searchQuery = (val || '').trim().toLowerCase();
      document.getElementById('clearSearch').style.display = searchQuery ? 'block' : 'none';
      if (activeTab === 'decisions') {
        renderDecisions();
      } else {
        renderLaw();
      }
    }

    function clearSearchInput() {
      document.getElementById('searchInput').value = '';
      handleSearch('');
    }

    function toggleFavorite(id, e) {
      if (e) e.stopPropagation();
      const idx = favorites.indexOf(id);
      if (idx > -1) {
        favorites.splice(idx, 1);
        showToast('تمت الإزالة من المفضلة');
      } else {
        favorites.push(id);
        showToast('تمت الإضافة إلى المفضلة ⭐');
      }
      localStorage.setItem('mobile_law14_favs', JSON.stringify(favorites));
      renderDecisions();
    }

    function toggleAccordion(id) {
      const el = document.getElementById('acc-' + id);
      const btn = document.getElementById('btn-acc-' + id);
      if (el) {
        const isOpen = el.classList.toggle('open');
        if (btn) btn.innerText = isOpen ? '▲ إخفاء نصوص المواد' : '▼ استعراض نصوص المواد الرسمية';
      }
    }

    function copyDecisionText(dec) {
      let text = 'القرار الوزاري رقم (' + dec.decisionNumber + ') لسنة ' + dec.year + '\\n';
      text += dec.title + '\\n';
      text += 'السند: ' + (dec.legalBasisSummary || '') + '\\n\\n';
      if (dec.preamble) text += dec.preamble + '\\n\\n';
      if (dec.articles && dec.articles.length > 0) {
        dec.articles.forEach(a => {
          text += a.articleNumber + (a.title ? ' (' + a.title + ')' : '') + ':\\n' + a.content + '\\n\\n';
        });
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        showToast('تم نسخ نص القرار بالكامل إلى الحافظة!');
      }
    }

    function filterByLawArticle(art) {
      document.getElementById('searchInput').value = art;
      handleSearch(art);
      switchTab('decisions');
    }

    function renderDecisions() {
      const listEl = document.getElementById('decisionsList');
      const filtered = DECISIONS.filter(d => {
        if (currentCategory !== 'جميع التصنيفات' && d.category !== currentCategory) return false;
        if (showFavoritesOnly && !favorites.includes(d.id)) return false;
        if (searchQuery) {
          const text = (d.decisionNumber + ' ' + d.title + ' ' + (d.relatedLawArticles || []).join(' ') + ' ' + (d.tags || []).join(' ') + ' ' + (d.preamble || '') + ' ' + (d.articles ? d.articles.map(a => a.content).join(' ') : '')).toLowerCase();
          if (!text.includes(searchQuery)) return false;
        }
        return true;
      });

      document.getElementById('stats-subtitle').innerText = filtered.length + ' قرار وزاري موثق رسمي';

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; padding: 40px 10px; opacity: 0.7;">لا توجد قرارات مطابقة لخيارات البحث.</div>';
        return;
      }

      listEl.innerHTML = filtered.map(d => {
        const isFav = favorites.includes(d.id);
        const artPills = (d.relatedLawArticles || []).map(a => 
          '<span class="law-art-tag" onclick="filterByLawArticle(\\'' + a + '\\')">' + a + '</span>'
        ).join('');

        const articlesHtml = (d.articles || []).map(a => 
          '<div class="article-item">' +
            '<div class="article-num">' + a.articleNumber + (a.title ? ' - ' + a.title : '') + '</div>' +
            '<div class="article-text">' + a.content + '</div>' +
          '</div>'
        ).join('');

        return '<div class="decision-card">' +
          '<div class="card-top">' +
            '<div class="dec-badge">قرار ' + d.decisionNumber + ' لسنة ' + d.year + '</div>' +
            '<div class="status-badge">' + (d.status || 'نافذ') + '</div>' +
          '</div>' +
          '<div class="dec-title">' + d.title + '</div>' +
          (artPills ? '<div class="law-articles-row">' + artPills + '</div>' : '') +
          '<div class="card-meta">' +
            '<span>🏛️ ' + (d.issuingAuthority || 'وزير العمل') + '</span>' +
            '<span>📰 ' + (d.gazetteIssue || '') + '</span>' +
            '<span>📅 ' + (d.effectiveDate || d.issueDate || '') + '</span>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="btn-action" id="btn-acc-' + d.id + '" onclick="toggleAccordion(\\'' + d.id + '\\')">▼ استعراض نصوص المواد</button>' +
            '<button class="btn-action" onclick="copyDecisionText(' + JSON.stringify(d).replace(/"/g, '&quot;') + ')">📋 نسخ النص</button>' +
            '<button class="btn-action btn-fav ' + (isFav ? 'active' : '') + '" onclick="toggleFavorite(\\'' + d.id + '\\', event)">' + (isFav ? '★ محفوظة' : '☆ مفضلة') + '</button>' +
          '</div>' +
          '<div class="articles-accordion" id="acc-' + d.id + '">' +
            (d.preamble ? '<div class="preamble-box"><strong>الديباجة:</strong>\\n' + d.preamble + '</div>' : '') +
            articlesHtml +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderLaw() {
      const container = document.getElementById('lawContent');
      if (!LABOR_LAW || !LABOR_LAW.chapters) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">لا تتوفر نصوص لمواد قانون العمل حالياً.</div>';
        return;
      }

      container.innerHTML = '<div class="decision-card" style="margin-bottom: 16px;">' +
        '<div style="font-size: 16px; font-weight: 800; color: var(--accent-gold); margin-bottom: 6px;">' + (LABOR_LAW.title || 'قانون العمل رقم 14 لسنة 2025') + '</div>' +
        '<div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">' + (LABOR_LAW.preamble || '') + '</div>' +
      '</div>' +
      LABOR_LAW.chapters.map(ch => {
        const matchingArts = (ch.articles || []).filter(a => {
          if (!searchQuery) return true;
          return (a.number + ' ' + (a.title || '') + ' ' + a.text).toLowerCase().includes(searchQuery);
        });

        if (searchQuery && matchingArts.length === 0) return '';

        return '<div class="chapter-card">' +
          '<div class="chapter-title">' + ch.chapterNumber + ': ' + ch.title + '</div>' +
          '<div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px;">' + ch.articlesRange + ' - ' + ch.summary + '</div>' +
          matchingArts.map(a => 
            '<div class="article-item">' +
              '<div class="article-num">' + a.number + (a.title ? ' (' + a.title + ')' : '') + '</div>' +
              '<div class="article-text">' + a.text + '</div>' +
            '</div>'
          ).join('') +
        '</div>';
      }).join('');
    }

    function initCategories() {
      const cats = ['جميع التصنيفات', 'عقود العمل والتشغيل', 'السلامة والصحة المهنية', 'الأجور والبدلات', 'تشغيل الفئات الأولى بالرعاية', 'تفتيش العمل والرقابة', 'منازعات العمل والتوفيق', 'التدريب والتأهيل المهني'];
      const bar = document.getElementById('categoriesBar');
      bar.innerHTML = cats.map(c => 
        '<button class="cat-chip ' + (c === currentCategory ? 'active' : '') + '" onclick="selectCategory(\\'' + c + '\\')">' + c + '</button>'
      ).join('');
    }

    function selectCategory(cat) {
      currentCategory = cat;
      initCategories();
      switchTab('decisions');
      renderDecisions();
    }

    // Init App
    window.onload = function() {
      if (localStorage.getItem('mobile_theme') === 'light') {
        toggleTheme();
      }
      if (localStorage.getItem('mobile_banner_dismissed') === 'true') {
        document.getElementById('installBanner').style.display = 'none';
      }
      initCategories();
      renderDecisions();
    };
  </script>
</body>
</html>`;

  downloadBlob(
    mobileHtml,
    'تطبيق_قانون_العمل_14_للهاتف_المحمول.html',
    'text/html;charset=utf-8'
  );
}

