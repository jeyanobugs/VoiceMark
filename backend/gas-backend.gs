/**
 * VoiceMark Google Apps Script Backend
 * ------------------------------------
 * Setup Instructions:
 * 1. Create a new Google Sheet named "VoiceMark DB"
 * 2. Create two tabs: "Users" and "Files"
 *    - Users tab columns: Username, Password, CreatedAt
 *    - Files tab columns: ID, FileName, Size, Date, Uploader
 * 3. Go to Extensions > Apps Script
 * 4. Paste this entire code into Code.gs
 * 5. Click "Deploy" > "New Deployment"
 * 6. Select "Web App"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Copy the Web App URL and place it in your React app's API service.
 */

var USERS_SHEET = 'Users';
var FILES_SHEET = 'Files';

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(USERS_SHEET)) {
    var sheet = ss.insertSheet(USERS_SHEET);
    sheet.appendRow(['Username', 'Password', 'CreatedAt']);
  }
  if (!ss.getSheetByName(FILES_SHEET)) {
    var sheet = ss.insertSheet(FILES_SHEET);
    sheet.appendRow(['ID', 'FileName', 'Size', 'Date', 'Uploader']);
  }
}

function doPost(e) {
  var response = { success: false, message: 'Invalid action' };
  
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    if (action === 'signup') {
      response = handleSignup(data.username, data.password);
    } else if (action === 'login') {
      response = handleLogin(data.username, data.password);
    } else if (action === 'saveFile') {
      response = handleSaveFile(data.fileData);
    }
  } catch (error) {
    response = { success: false, message: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var response = { success: false, message: 'Invalid action' };
  
  try {
    var action = e.parameter.action;
    
    if (action === 'getFiles') {
      response = handleGetFiles();
    } else if (action === 'ping') {
      response = { success: true, message: 'API is running' };
    }
  } catch (error) {
    response = { success: false, message: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handlers
function handleSignup(username, password) {
  if (!username || !password) return { success: false, message: 'Missing fields' };
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
  var data = sheet.getDataRange().getValues();
  
  // Check if exists
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      return { success: false, message: 'Username already exists' };
    }
  }
  
  sheet.appendRow([username, password, new Date().toISOString()]);
  return { success: true, message: 'Signup successful' };
}

function handleLogin(username, password) {
  if (!username || !password) return { success: false, message: 'Missing fields' };
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === password) {
      return { success: true, message: 'Login successful', username: username };
    }
  }
  
  return { success: false, message: 'Invalid credentials' };
}

function handleSaveFile(fileData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FILES_SHEET);
  sheet.appendRow([
    fileData.id,
    fileData.fileName,
    fileData.size,
    fileData.date,
    fileData.uploader
  ]);
  return { success: true, message: 'File saved' };
}

function handleGetFiles() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FILES_SHEET);
  var data = sheet.getDataRange().getValues();
  var files = [];
  
  for (var i = 1; i < data.length; i++) {
    files.push({
      id: data[i][0],
      fileName: data[i][1],
      size: data[i][2],
      date: data[i][3],
      uploader: data[i][4]
    });
  }
  
  return { success: true, files: files };
}
