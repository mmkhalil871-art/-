import { MinisterialDecision } from '../types/decision';

/**
 * Downloads a string content as a file with specified filename and mime type.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports decision as a formatted legal text file (.txt)
 */
export function exportDecisionAsText(decision: MinisterialDecision): void {
  const articlesText = decision.articles
    .map(
      (art) =>
        `${art.articleNumber}${art.title ? ` (${art.title})` : ''}\n----------------------------------------\n${art.content}\n`
    )
    .join('\n\n');

  const content = `جمهورية مصر العربية
وزارة العمل
مكتب الوزير
======================================================
قرار وزاري رقم (${decision.decisionNumber}) لسنة ${decision.year}
${decision.title}
تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025
======================================================

[بيانات النشر والسريان]
- جهة الإصدار: ${decision.issuingAuthority}
- تاريخ الصدور: ${decision.issueDate}
- النشر بالجريدة الرسمية: ${decision.gazetteIssue} بتاريخ ${decision.gazetteDate}
- تاريخ بدء السريان: ${decision.effectiveDate}
- الحالة القانونية: ${decision.status}
- التصنيف: ${decision.category}
- المواد المنفذة من قانون العمل 14 لسنة 2025: ${decision.relatedLawArticles.join('، ')}
- المرجع الإداري: ${decision.officialReference}

======================================================
[ الديباجة ]
${decision.preamble}

قرر الآتي:
======================================================

${articlesText}

${
  decision.explanatoryNote
    ? `\n======================================================\n[ المذكرة الإيضاحية والأثر التشريعي ]\n${decision.explanatoryNote}\n`
    : ''
}
وزير العمل
`;

  const filename = `قرار_وزاري_رقم_${decision.decisionNumber}_لسنة_${decision.year}.txt`;
  downloadFile(content, filename, 'text/plain;charset=utf-8');
}

/**
 * Exports decision as a formatted Microsoft Word (.doc) document
 */
export function exportDecisionAsWord(decision: MinisterialDecision): void {
  const articlesHtml = decision.articles
    .map(
      (art) => `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #0f172a; font-size: 14pt; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
          ${art.articleNumber} ${art.title ? ` - <span style="font-weight: normal; color: #334155;">${art.title}</span>` : ''}
        </h3>
        <p style="font-size: 12pt; line-height: 1.8; color: #1e293b; text-align: justify; margin: 0; white-space: pre-line;">
          ${art.content}
        </p>
      </div>`
    )
    .join('');

  const htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>قرار وزاري رقم (${decision.decisionNumber}) لسنة ${decision.year}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: A4;
        margin: 2.5cm 2cm 2.5cm 2cm;
        mso-page-orientation: portrait;
      }
      body {
        font-family: 'Traditional Arabic', 'Amiri', 'Cairo', serif;
        direction: rtl;
        text-align: right;
        color: #111827;
      }
    </style>
  </head>
  <body style="direction: rtl; font-family: 'Amiri', 'Traditional Arabic', serif;">
    <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px double #000; padding-bottom: 15px;">
      <h3 style="margin: 0; font-size: 14pt;">جمهورية مصر العربية</h3>
      <h2 style="margin: 4px 0; font-size: 16pt;">وزارة العمل</h2>
      <p style="margin: 0; font-size: 11pt; color: #475569;">مكتب السيد الوزير</p>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 18pt; margin: 0 0 10px 0; color: #0f172a;">
        قرار وزاري رقم (${decision.decisionNumber}) لسنة ${decision.year}
      </h1>
      <h2 style="font-size: 15pt; font-weight: normal; color: #1e293b; margin: 0 0 15px 0;">
        ${decision.title}
      </h2>
      <p style="font-size: 11pt; color: #475569; margin: 0;">
        تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025 (${decision.relatedLawArticles.join(' ، ')})
      </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11pt; background-color: #f8fafc; border: 1px solid #cbd5e1;">
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; width: 25%;">تاريخ الصدور:</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${decision.issueDate}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; width: 25%;">الجريدة الرسمية:</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${decision.gazetteIssue} (${decision.gazetteDate})</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">تاريخ السريان:</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${decision.effectiveDate}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">الحالة والتصنيف:</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${decision.status} / ${decision.category}</td>
      </tr>
    </table>

    <div style="margin-bottom: 25px;">
      <h3 style="font-size: 13pt; margin-bottom: 6px;">[ الديباجة ]</h3>
      <p style="font-size: 12pt; line-height: 1.8; text-align: justify; white-space: pre-line; margin: 0; color: #1e293b;">
        ${decision.preamble}
      </p>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <h3 style="font-size: 14pt; margin: 0; text-decoration: underline;">« قرر ما يلي »</h3>
    </div>

    <div style="margin-bottom: 30px;">
      ${articlesHtml}
    </div>

    ${
      decision.explanatoryNote
        ? `
      <div style="margin-top: 30px; padding: 15px; background-color: #f1f5f9; border: 1px solid #cbd5e1;">
        <h4 style="margin: 0 0 8px 0; font-size: 12pt;">المذكرة الإيضاحية:</h4>
        <p style="margin: 0; font-size: 11pt; line-height: 1.6;">${decision.explanatoryNote}</p>
      </div>`
        : ''
    }

    <div style="margin-top: 40px; text-align: left; padding-left: 40px;">
      <p style="font-size: 13pt; font-weight: bold; margin: 0;">${decision.issuingAuthority}</p>
      <p style="font-size: 11pt; color: #64748b; margin: 5px 0 0 0;">خاتم شعار وزارة العمل</p>
    </div>
  </body>
  </html>
  `;

  const filename = `قرار_وزاري_${decision.decisionNumber}_لسنة_${decision.year}.doc`;
  downloadFile(htmlContent, filename, 'application/msword;charset=utf-8');
}

/**
 * Triggers clean print view for the decision
 */
export function printDecision(decision: MinisterialDecision): void {
  window.print();
}

/**
 * Exports decision as an official printable / downloadable PDF document
 */
export function exportDecisionAsPdf(decision: MinisterialDecision): void {
  // If decision has a stored PDF attachment, download or open it directly
  if (decision.pdfAttachment?.dataUrl) {
    const a = document.createElement('a');
    a.href = decision.pdfAttachment.dataUrl;
    a.download = decision.pdfAttachment.filename || `قرار_وزاري_${decision.decisionNumber}_لسنة_${decision.year}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Open official print / PDF rendering popup formatted as Egyptian Official Gazette
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const articlesHtml = decision.articles
    .map(
      (art) => `
      <div style="margin-bottom: 22px; page-break-inside: avoid;">
        <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 6px; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 4px;">
          ${art.articleNumber} ${art.title ? `- ${art.title}` : ''}
        </h3>
        <p style="font-size: 11pt; line-height: 1.85; text-align: justify; white-space: pre-line; margin: 0; color: #1f2937;">
          ${art.content}
        </p>
      </div>`
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>النسخة الرسمية - قرار وزاري رقم (${decision.decisionNumber}) لسنة ${decision.year}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Traditional Arabic', 'Amiri', 'Cairo', serif; direction: rtl; text-align: right; color: #111827; margin: 0; padding: 25px; background: #fff; }
        .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 15px; margin-bottom: 20px; }
        .republic { font-size: 13pt; font-weight: bold; margin-bottom: 2px; }
        .ministry { font-size: 15pt; font-weight: bold; margin-bottom: 4px; }
        .office { font-size: 10pt; color: #4b5563; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
        .meta-table td { border: 1px solid #d1d5db; padding: 6px 10px; }
        .meta-label { font-weight: bold; background: #f9fafb; width: 22%; }
        .title { font-size: 16pt; font-weight: bold; margin: 12px 0 6px 0; color: #0f172a; }
        .subtitle { font-size: 13pt; margin-bottom: 8px; color: #1e293b; font-weight: 600; }
        .mandate { font-size: 10pt; color: #92400e; font-weight: bold; margin-bottom: 12px; }
        .preamble { font-size: 11pt; line-height: 1.85; text-align: justify; white-space: pre-line; margin-bottom: 20px; }
        .decree-tag { text-align: center; font-size: 14pt; font-weight: bold; margin: 25px 0; border-top: 1.5px solid #111827; border-bottom: 1.5px solid #111827; padding: 4px 0; }
        .footer { margin-top: 35px; border-top: 2px solid #111827; padding-top: 15px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; }
        .seal { width: 90px; height: 90px; border: 2px dashed #9ca3af; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8pt; color: #6b7280; transform: rotate(-5deg); margin: 0 auto; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="republic">جمهورية مصر العربية</div>
        <div class="ministry">وزارة العمل</div>
        <div class="office">مكتب السيد الوزير</div>
        <div class="title">قرار وزير العمل رقم (${decision.decisionNumber}) لسنة ${decision.year}</div>
        <div class="subtitle">${decision.title}</div>
        <div class="mandate">تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025 (${decision.relatedLawArticles.join(' · ')})</div>
      </div>

      <table class="meta-table">
        <tr>
          <td class="meta-label">تاريخ الصدور:</td>
          <td>${decision.issueDate}</td>
          <td class="meta-label">الجريدة الرسمية:</td>
          <td>${decision.gazetteIssue} بتاريخ ${decision.gazetteDate}</td>
        </tr>
        <tr>
          <td class="meta-label">تاريخ بدء السريان:</td>
          <td>${decision.effectiveDate}</td>
          <td class="meta-label">الحالة القانونية:</td>
          <td>${decision.status} · ${decision.category}</td>
        </tr>
      </table>

      <div class="preamble">
        <strong>[ الديباجة والسند القانوني ]</strong><br>
        ${decision.preamble}
      </div>

      <div class="decree-tag">( قـــــرّر )</div>

      ${articlesHtml}

      ${decision.explanatoryNote ? `
        <div style="margin-top: 25px; padding: 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 11pt; margin-bottom: 4px; color: #374151;">المذكرة الإيضاحية والأثر التشريعي:</div>
          <div style="font-size: 10pt; line-height: 1.7; color: #4b5563;">${decision.explanatoryNote}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div>
          <div style="font-size: 9.5pt; color: #4b5563;">صدر بديوان عام الوزارة في: ${decision.issueDate}</div>
          <div style="font-size: 9.5pt; color: #6b7280; margin-top: 2px;">الوقائع المصرية / الجريدة الرسمية</div>
        </div>

        <div>
          <div class="seal">
            <span>وزارة العمل</span>
            <span>الخاتم الرسمي</span>
            <span>2025</span>
          </div>
        </div>

        <div style="text-align: left;">
          <div style="font-weight: bold; font-size: 12pt; color: #111827;">${decision.issuingAuthority}</div>
          <div style="font-size: 10pt; color: #4b5563;">وزير العمل</div>
          <div style="font-size: 8.5pt; color: #9ca3af; margin-top: 4px;">[معتمد وموقع رقمياً]</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Formats full plain text representation for copying to clipboard
 */
export function formatDecisionTextForCopy(decision: MinisterialDecision): string {
  const articlesText = decision.articles
    .map(
      (art) =>
        `${art.articleNumber}${art.title ? ` - ${art.title}` : ''}\n${art.content}`
    )
    .join('\n\n');

  return `جمهورية مصر العربية - وزارة العمل
قرار وزاري رقم (${decision.decisionNumber}) لسنة ${decision.year}
بشأن: ${decision.title}
(تنفيذاً لقانون العمل رقم 14 لسنة 2025)

[الديباجة]
${decision.preamble}

قرر الآتي:
${articlesText}

تاريخ الصدور: ${decision.issueDate}
تاريخ السريان: ${decision.effectiveDate}
الجريدة الرسمية: ${decision.gazetteIssue} بتاريخ ${decision.gazetteDate}
الحالة: ${decision.status}
${decision.issuingAuthority}`;
}

import { LaborLawInfo } from '../data/laborLawData';

/**
 * Exports full Labor Law No. 14 of 2025 as a formatted Microsoft Word (.doc) document
 */
export function exportLaborLawAsWord(law: LaborLawInfo): void {
  const promulgationHtml = law.promulgationArticles
    .map(
      (p) => `
      <div style="margin-bottom: 16px;">
        <h4 style="color: #0f172a; font-size: 13pt; margin-bottom: 6px;">${p.number}</h4>
        <p style="font-size: 12pt; line-height: 1.8; color: #1e293b; text-align: justify; margin: 0;">${p.text}</p>
      </div>`
    )
    .join('');

  const chaptersHtml = law.chapters
    .map(
      (ch) => `
      <div style="margin-top: 30px; margin-bottom: 25px; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px;">
        <div style="background-color: #f1f5f9; padding: 10px 14px; border: 1px solid #cbd5e1; margin-bottom: 15px;">
          <h2 style="color: #92400e; font-size: 15pt; margin: 0 0 4px 0;">${ch.chapterNumber}: ${ch.title}</h2>
          <span style="font-size: 10pt; color: #475569;">${ch.articlesRange}</span>
        </div>
        <p style="font-size: 11pt; color: #475569; font-style: italic; margin-bottom: 16px;">${ch.summary}</p>
        ${ch.articles
          .map(
            (art) => `
          <div style="margin-bottom: 20px; padding-right: 10px; border-right: 3px solid #f59e0b;">
            <h3 style="color: #0f172a; font-size: 13pt; margin: 0 0 6px 0;">
              ${art.number} ${art.title ? `- ${art.title}` : ''}
            </h3>
            <p style="font-size: 12pt; line-height: 1.8; color: #1e293b; text-align: justify; margin: 0; white-space: pre-line;">
              ${art.text}
            </p>
          </div>`
          )
          .join('')}
      </div>`
    )
    .join('');

  const highlightsHtml = law.keyHighlights
    .map((h) => `<li style="margin-bottom: 6px; font-size: 11pt;">${h}</li>`)
    .join('');

  const htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${law.title}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: A4;
        margin: 2.5cm 2cm 2.5cm 2cm;
      }
      body {
        font-family: 'Traditional Arabic', 'Amiri', 'Cairo', serif;
        direction: rtl;
        text-align: right;
        color: #111827;
      }
    </style>
  </head>
  <body style="direction: rtl; font-family: 'Amiri', 'Traditional Arabic', serif;">
    <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px double #000; padding-bottom: 15px;">
      <h3 style="margin: 0; font-size: 15pt;">جمهورية مصر العربية</h3>
      <h2 style="margin: 6px 0; font-size: 18pt; color: #0f172a;">الجريدة الرسمية · التشريعات والقوانين</h2>
      <p style="margin: 0; font-size: 11pt; color: #475569;">${law.gazetteIssue} · تاريخ النشر: ${law.gazetteDate}</p>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 22pt; margin: 0 0 10px 0; color: #0f172a;">
        ${law.title}
      </h1>
      <p style="font-size: 12pt; color: #475569; margin: 0;">
        تاريخ الإصدار: ${law.promulgationDate} · تاريخ العمل به: ${law.effectiveDate}
      </p>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 15px; margin-bottom: 25px;">
      <h4 style="margin: 0 0 8px 0; font-size: 13pt; color: #92400e;">أهم الملامح الجوهرية لقانون العمل 14 لسنة 2025:</h4>
      <ul style="margin: 0; padding-right: 20px;">
        ${highlightsHtml}
      </ul>
    </div>

    <div style="margin-bottom: 25px;">
      <h3 style="font-size: 14pt; margin-bottom: 8px; color: #0f172a;">[ الديباجة ]</h3>
      <p style="font-size: 12pt; line-height: 1.8; text-align: justify; white-space: pre-line; margin: 0;">
        ${law.preamble}
      </p>
    </div>

    <div style="margin-bottom: 30px; border-top: 1px solid #cbd5e1; pt-15px;">
      <h3 style="font-size: 14pt; margin-bottom: 12px; color: #0f172a;">( مـــواد الإصـــدار )</h3>
      ${promulgationHtml}
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <h2 style="font-size: 16pt; margin: 0; text-decoration: underline;">« قانون العمل المرافق »</h2>
    </div>

    <div>
      ${chaptersHtml}
    </div>

    <div style="margin-top: 40px; text-align: left; padding-left: 40px; border-top: 1px solid #cbd5e1; pt-20px;">
      <p style="font-size: 14pt; font-weight: bold; margin: 0;">${law.issuingAuthority}</p>
      <p style="font-size: 11pt; color: #64748b; margin: 5px 0 0 0;">خاتم الدولة الرسمي</p>
    </div>
  </body>
  </html>
  `;

  const filename = `قانون_العمل_رقم_14_لسنة_2025_الرسمي.doc`;
  downloadFile(htmlContent, filename, 'application/msword;charset=utf-8');
}

/**
 * Exports full Labor Law No. 14 of 2025 as plain legal text (.txt)
 */
export function exportLaborLawAsText(law: LaborLawInfo): void {
  const promulgationText = law.promulgationArticles
    .map((p) => `${p.number}\n${p.text}`)
    .join('\n\n');

  const chaptersText = law.chapters
    .map((ch) => {
      const artText = ch.articles
        .map((a) => `${a.number} ${a.title ? `- ${a.title}` : ''}\n${a.text}`)
        .join('\n\n');
      return `======================================================
${ch.chapterNumber}: ${ch.title} (${ch.articlesRange})
${ch.summary}
======================================================
${artText}
`;
    })
    .join('\n\n');

  const content = `جمهورية مصر العربية - الجريدة الرسمية
${law.title}
======================================================
تاريخ الإصدار: ${law.promulgationDate}
الجريدة الرسمية: ${law.gazetteIssue} بتاريخ ${law.gazetteDate}
تاريخ السريان: ${law.effectiveDate}
جهة الإصدار: ${law.issuingAuthority}
======================================================

[ الديباجة ]
${law.preamble}

[ مواد الإصدار ]
${promulgationText}

[ قانون العمل المرافق ]
${chaptersText}

${law.issuingAuthority}
خاتم شعار الدولة
`;

  downloadFile(content, 'قانون_العمل_رقم_14_لسنة_2025.txt', 'text/plain;charset=utf-8');
}

