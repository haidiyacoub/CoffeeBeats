// ─────────────────────────────────────────────────────────────
//  Coffee Beats — Email Collector
//  Google Apps Script  |  paste into your Sheet's script editor
// ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add header row on first submission if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Email']);
      sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    }

    const data = JSON.parse(e.postData.contents);
    const email = data.email || '';

    if (!email) {
      return response({ status: 'error', message: 'No email provided' });
    }

    sheet.appendRow([new Date(), email]);

    return response({ status: 'success' });

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  }
}

// Allow browser preflight (CORS OPTIONS request)
function doGet(e) {
  return response({ status: 'ok', message: 'Coffee Beats email collector is live.' });
}

function response(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
