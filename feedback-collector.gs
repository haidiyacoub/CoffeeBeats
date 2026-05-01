// ─────────────────────────────────────────────────────────────
//  Coffee Beats — Feedback Collector
//  Google Apps Script
//
//  HOW TO DEPLOY:
//  1. Go to https://script.google.com and open (or create) the
//     spreadsheet-linked project for your feedback sheet.
//  2. Paste this entire file into the editor (replace any existing code).
//  3. Click Deploy → New deployment → Web app.
//  4. Set "Execute as" = Me, "Who has access" = Anyone.
//  5. Copy the deployment URL and confirm it matches the one in
//     feedback.html → SCRIPT_URL.
//  6. Every form submission will appear as a new row in the
//     "Feedback" sheet tab automatically.
// ─────────────────────────────────────────────────────────────

const FEEDBACK_SHEET_NAME = 'Feedback';
const EMAIL_SHEET_NAME    = 'Email Signups';   // keep the old sheet working too

const FEEDBACK_HEADERS = [
  'Timestamp',
  'Branch',
  'Rating (1–5)',
  'Rating Label',
  'Barista',
  'What Stood Out',
  'Open Feedback',
];

// ─────────────────────────────────────────────────────────────
//  POST handler — routes by payload type
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'feedback') {
      return handleFeedback(data);
    } else if (data.type === 'email' || data.email) {
      return handleEmailSignup(data);
    } else {
      return response({ status: 'error', message: 'Unknown submission type' });
    }

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  }
}

// ─────────────────────────────────────────────────────────────
//  Handle feedback submissions
// ─────────────────────────────────────────────────────────────
function handleFeedback(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME);

  // Create sheet if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(FEEDBACK_SHEET_NAME);
  }

  // Write headers on the very first submission
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(FEEDBACK_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, FEEDBACK_HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#EFBBA3');   // Coffee Beats peach
    headerRange.setFontColor('#333333');
    sheet.setFrozenRows(1);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, FEEDBACK_HEADERS.length);
  }

  sheet.appendRow([
    new Date(data.timestamp || Date.now()),
    data.branch      || '',
    data.rating      !== '' ? Number(data.rating) : '',
    data.ratingLabel || '',
    data.barista     || '',
    data.standout    || '',
    data.feedback    || '',
  ]);

  return response({ status: 'success' });
}

// ─────────────────────────────────────────────────────────────
//  Handle legacy email signup submissions
// ─────────────────────────────────────────────────────────────
function handleEmailSignup(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(EMAIL_SHEET_NAME);

  if (!sheet) {
    // Fall back to the active sheet for backwards compatibility
    sheet = ss.getActiveSheet();
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  const email = data.email || '';
  if (!email) {
    return response({ status: 'error', message: 'No email provided' });
  }

  sheet.appendRow([new Date(), email]);
  return response({ status: 'success' });
}

// ─────────────────────────────────────────────────────────────
//  GET handler — health check
// ─────────────────────────────────────────────────────────────
function doGet(e) {
  return response({
    status:  'ok',
    message: 'Coffee Beats feedback collector is live.',
  });
}

// ─────────────────────────────────────────────────────────────
//  Helper
// ─────────────────────────────────────────────────────────────
function response(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
