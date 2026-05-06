/**
 * Opens a formatted print window. The user can Print → Save as PDF.
 * No external dependencies required.
 */
export function printAsPdf(title: string, bodyHtml: string) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: "Times New Roman", serif;
      font-size: 11pt;
      color: #111;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .page {
      max-width: 780px;
      margin: 0 auto;
      padding: 28mm 22mm 22mm;
    }
    .govt-header {
      text-align: center;
      border-bottom: 2px solid #1a3a6b;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .govt-header h1 { font-size: 15pt; font-weight: bold; margin: 0 0 2px; color: #1a3a6b; }
    .govt-header h2 { font-size: 11pt; font-weight: normal; margin: 0 0 2px; color: #333; }
    .govt-header .sub { font-size: 9pt; color: #555; }
    .doc-title {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 16px 0 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10pt;
    }
    th {
      background: #1a3a6b;
      color: #fff;
      padding: 6px 8px;
      text-align: left;
      font-size: 9pt;
      font-weight: bold;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #bbb;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: #f5f7fa; }
    .section-head {
      font-weight: bold;
      font-size: 10pt;
      background: #e8ecf2;
      padding: 5px 8px;
      margin-top: 14px;
      border-left: 4px solid #1a3a6b;
    }
    .kv { display: flex; gap: 6px; margin: 3px 0; font-size: 10pt; }
    .kv .k { font-weight: bold; min-width: 180px; color: #333; }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #bbb;
      padding-top: 8px;
      font-size: 8pt;
      color: #666;
      display: flex;
      justify-content: space-between;
    }
    .stamp {
      margin-top: 36px;
      text-align: right;
      font-size: 10pt;
    }
    .stamp p { margin: 2px 0; }
    .highlight { color: #c0392b; font-weight: bold; }
    .badge {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 3px;
      font-size: 8.5pt;
      font-weight: bold;
    }
    .badge-open    { background: #d4edda; color: #155724; }
    .badge-awarded { background: #d1ecf1; color: #0c5460; }
    .badge-closed  { background: #f8d7da; color: #721c24; }
    .badge-review  { background: #fff3cd; color: #856404; }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="govt-header">
      <h1>Government of Andhra Pradesh</h1>
      <h2>e-Procurement Portal — AP Tender Management System</h2>
      <div class="sub">AP Secretariat, Velagapudi, Amaravati — 522238 &nbsp;|&nbsp; helpdesk@apeprocurement.gov.in</div>
    </div>
    ${bodyHtml}
    <div class="footer">
      <span>Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
      <span>AP e-Procurement Portal v4.2.1 — CONFIDENTIAL</span>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`);
  win.document.close();
}

/**
 * Triggers a text/CSV blob download.
 */
export function downloadBlob(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
