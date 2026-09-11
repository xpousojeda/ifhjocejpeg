const HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Shoot Type',
  'Preferred Date',
  'Preferred Time',
  'Location / Venue',
  'Group Size',
  'Budget',
  'Message'
];

function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    if (params.company) {
      return jsonResponse({ success: true });
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);

    try {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
        sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        new Date(),
        safeCell(params.name),
        safeCell(params.email),
        safeCell(params.phone),
        safeCell(params.shootType),
        safeCell(params.preferredDate),
        safeCell(params.preferredTime),
        safeCell(params.location),
        safeCell(params.groupSize),
        safeCell(params.budget),
        safeCell(params.message)
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ success: false, error: 'Unable to save inquiry.' });
  }
}

function safeCell(value) {
  const text = value == null ? '' : String(value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
