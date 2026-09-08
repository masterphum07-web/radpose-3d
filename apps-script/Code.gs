/** OrbitNotes storage bridge: Google Drive + Google Sheets.
 * Deploy as Web app: Execute as Me, Who has access: Anyone with the link.
 * Set SCRIPT_ID, DRIVE_FOLDER_ID and SHEET_ID in Script properties, then run setupSheet().
 */
const CONFIG = { sheetName: 'Recordings', alertSheet: 'ExamAlerts', subjectSheet: 'Subjects' };

function setupSheet() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  const folder = DriveApp.getFolderById(props.getProperty('DRIVE_FOLDER_ID'));
  const tabs = {
    Recordings: ['recording_id','user_id','subject_id','title','duration_seconds','drive_file_id','drive_url','status','created_at','completed_at'],
    ExamAlerts: ['alert_id','recording_id','keyword','context','importance','timestamp','created_at'],
    Subjects: ['subject_id','user_id','name','color','icon','created_at']
  };
  Object.keys(tabs).forEach(name => {
    let sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.clear(); sheet.getRange(1, 1, 1, tabs[name].length).setValues([tabs[name]]);
    sheet.setFrozenRows(1); sheet.getRange(1,1,1,tabs[name].length).setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, tabs[name].length);
  });
  folder.setDescription('OrbitNotes audio storage');
  return { ok: true, spreadsheet: ss.getUrl(), folder: folder.getUrl() };
}

function doGet() { return json_({ ok: true, service: 'OrbitNotes Storage Bridge', time: new Date().toISOString() }); }

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action === 'health') return json_({ ok: true });
    if (body.action === 'saveRecording') return saveRecording_(body);
    if (body.action === 'saveAlert') return saveAlert_(body);
    return json_({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) { return json_({ ok: false, error: String(err) }, 500); }
}

function saveRecording_(body) {
  if (!body.audioBase64 || !body.fileName) throw new Error('audioBase64 and fileName are required');
  const props = PropertiesService.getScriptProperties();
  const folder = DriveApp.getFolderById(props.getProperty('DRIVE_FOLDER_ID'));
  const bytes = Utilities.base64Decode(body.audioBase64);
  const blob = Utilities.newBlob(bytes, body.mimeType || 'audio/webm', body.fileName);
  const file = folder.createFile(blob);
  const id = body.recordingId || Utilities.getUuid();
  const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  ss.getSheetByName(CONFIG.sheetName).appendRow([id, body.userId || '', body.subjectId || '', body.title || body.fileName, Number(body.durationSeconds || 0), file.getId(), file.getUrl(), body.status || 'uploaded', new Date(), '']);
  return json_({ ok: true, recordingId: id, fileId: file.getId(), url: file.getUrl() });
}

function saveAlert_(body) {
  const props = PropertiesService.getScriptProperties(); const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  ss.getSheetByName(CONFIG.alertSheet).appendRow([body.alertId || Utilities.getUuid(), body.recordingId || '', body.keyword || '', body.context || '', body.importance || 'medium', body.timestamp || '', new Date()]);
  return json_({ ok: true });
}

function json_(value, code) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
