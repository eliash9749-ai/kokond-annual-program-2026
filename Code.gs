
/************************************************************
 KOKOND ANNUAL PROGRAM 2026
 COMPLETE BACKEND V5
 Registration | Certificate | Controller | Attendance
 Judgment | Scores | Results | KYC | Committee | Donations API
************************************************************/

const CONFIG = {
  MANAGER_EMAIL: 'eliash9749@gmail.com',
  MAIN_SHEET: 'Main Name',
  PHOTO_FOLDER: 'Kokond Annual Program 2026 - Member Photos',
  CERTIFICATE_FOLDER: 'Kokond Annual Program 2026 - Certificates',

  // Deploy করার আগে এই PIN নিজের পছন্দমতো বদলাবে।
  CONTROLLER_PIN: 'KACP786',

  DEADLINE: '2026-12-29T23:59:59+05:30',
  TIMEZONE: 'Asia/Kolkata',
  BEST_COOK: 'কে সেরা রাঁধুনি',
  BEST_COOK_LIMIT: 56
};

const WOMEN_EVENTS = [
  'চেয়ার দখলের লড়াই',
  'কে সেরা রাঁধুনি'
];

const BOYS_EVENTS = [
  'আজান প্রতিযোগিতা',
  'ক্রিকেট টুর্নামেন্ট',
  'দড়ি টানাটানি',
  'হাঁসধরা'
];

const REG_HEADERS = [
  'Registration No',
  'Name',
  'Mobile',
  'Age',
  'Event',
  'Date & Time',
  'Guardian Name',
  'Village',
  'Gender',
  'Guardian Consent',
  'Certificate URL'
];

const ATT_HEADERS = [
  'Registration No',
  'Event',
  'Participant Name',
  'Mobile',
  'Attendance',
  'Marked At',
  'Marked By'
];

const SETTINGS_HEADERS = [
  'Event',
  'Number of Judges',
  'Maximum Score',
  'Updated At'
];

const SCORE_HEADERS = [
  'Registration No',
  'Event',
  'Participant Name',
  'Judge Number',
  'Score',
  'Updated At'
];

const RESULT_HEADERS = [
  'Event',
  'Registration No',
  'Participant Name',
  'Total Score',
  'Average Score',
  'Rank',
  'Tie Status',
  'Finalized At'
];


/************************************************************
 ROUTERS
************************************************************/

function doGet(e) {
  try {
    const action = String(e.parameter.action || '');

    if (action === 'controller') {
      return HtmlService.createHtmlOutput(controllerHTML_())
        .setTitle('Kokond Controller Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    if (action === 'members') return getApprovedMembers_();

    if (action === 'certificate') {
      return certificatePage_(e.parameter.id);
    }

    if (action === 'approve' || action === 'reject') {
      return reviewRequest_(e, action);
    }

    if (action === 'donations') {
      return getDonations_();
    }

    return ContentService.createTextOutput(
      'Kokond Annual Program API is running.'
    );

  } catch (err) {
    return ContentService.createTextOutput(
      'Error: ' + String(err.message || err)
    );
  }
}


function doPost(e) {
  try {
    const p = e.parameter || {};
    const action = String(p.action || 'registration');

    if (action === 'registration') return handleRegistration_(e);

    if (action === 'kyc' || action === 'newMember') {
      return handleMemberRequest_(e, action);
    }

    return json_({
      status: 'error',
      message: 'অজানা Action'
    });

  } catch (err) {
    return json_({
      status: 'error',
      message: String(err.message || err)
    });
  }
}


/************************************************************
 SPREADSHEET HELPERS
************************************************************/

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);

  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
  }

  return sh;
}

function mainSheet_() {
  const ss = ss_();

  let sh = ss.getSheetByName(CONFIG.MAIN_SHEET);

  if (!sh) {
    const old = ss.getSheetByName('Sheet1');

    if (old) {
      old.setName(CONFIG.MAIN_SHEET);
      sh = old;
    } else {
      sh = ss.insertSheet(CONFIG.MAIN_SHEET);
    }
  }

  if (sh.getLastRow() === 0) {
    sh.appendRow(REG_HEADERS.slice(0, 6));
  }

  let last = Math.max(sh.getLastColumn(), 6);
  let headers = sh.getRange(1, 1, 1, last)
    .getValues()[0].map(x => String(x || '').trim());

  REG_HEADERS.forEach(h => {
    if (!headers.includes(h)) {
      last++;
      sh.getRange(1, last).setValue(h);
      headers.push(h);
    }
  });

  return { sh, headers };
}

function col_(headers, name) {
  return headers.indexOf(name);
}

function value_(row, headers, name) {
  const i = col_(headers, name);
  return i < 0 ? '' : row[i];
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(v) {
  return String(v == null ? '' : v).trim();
}

function normGender_(v) {
  const s = clean_(v).toLowerCase();

  if (['পুরুষ', 'ছেলে', 'male', 'boy', 'm'].includes(s)) return 'পুরুষ';
  if (['মহিলা', 'মেয়ে', 'মেয়ে', 'female', 'girl', 'f'].includes(s)) return 'মহিলা';

  return '';
}

function escapeHtml_(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function id_() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 10).toUpperCase();
}

function lock_(fn) {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error('সার্ভার ব্যস্ত। আবার চেষ্টা করুন।');
  }

  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}


/************************************************************
 REGISTRATION
************************************************************/

function handleRegistration_(e) {
  return lock_(() => {
    if (Date.now() > new Date(CONFIG.DEADLINE).getTime()) {
      throw new Error('অনলাইন নিবন্ধনের সময় শেষ হয়েছে।');
    }

    const p = e.parameter || {};
    const name = clean_(p.name);
    const mobile = clean_(p.mobile).replace(/\s/g, '');
    const guardian = clean_(p.guardianName);
    const village = clean_(p.village);
    const age = Number(p.age);
    const gender = normGender_(p.gender);

    if (!name) throw new Error('অংশগ্রহণকারীর নাম লিখুন।');
    if (!/^\d{10}$/.test(mobile)) throw new Error('সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।');
    if (!guardian) throw new Error('অভিভাবকের নাম লিখুন।');
    if (!village) throw new Error('গ্রামের নাম লিখুন।');
    if (!Number.isInteger(age) || age < 1 || age > 100) {
      throw new Error('সঠিক বয়স লিখুন।');
    }
    if (!gender) throw new Error('লিঙ্গ নির্বাচন করুন।');

    const consent = ['true', 'yes', '1', 'on'].includes(
      clean_(p.guardianConsent).toLowerCase()
    );

    if (age < 18 && !consent) {
      throw new Error('১৮ বছরের কম বয়সীদের অভিভাবকের সম্মতি আবশ্যক।');
    }

    let events = [];

    if (e.parameters && e.parameters.events) {
      events = e.parameters.events;
    } else if (p.events) {
      try {
        events = JSON.parse(p.events);
      } catch (err) {
        events = String(p.events).split(',');
      }
    } else if (p.eventNames) {
      try {
        events = JSON.parse(p.eventNames);
      } catch (err) {
        events = [];
      }
    } else if (p.event) {
      events = [p.event];
    }

    events = [...new Set(events.map(clean_).filter(Boolean))];

    if (!events.length) throw new Error('কমপক্ষে একটি প্রতিযোগিতা নির্বাচন করুন।');

    if (events.length > 18) {
      throw new Error('একসঙ্গে সর্বোচ্চ ১৮টি প্রতিযোগিতা নির্বাচন করা যাবে।');
    }

    events.forEach(event => {
      if (WOMEN_EVENTS.includes(event) && gender !== 'মহিলা') {
        throw new Error(event + ' শুধুমাত্র মহিলাদের জন্য।');
      }

      if (BOYS_EVENTS.includes(event) && gender !== 'পুরুষ') {
        throw new Error(event + ' শুধুমাত্র ছেলেদের জন্য।');
      }
    });

    const { sh, headers } = mainSheet_();
    const data = sh.getDataRange().getValues();

    const mobileCol = col_(headers, 'Mobile');
    const nameCol = col_(headers, 'Name');
    const eventCol = col_(headers, 'Event');

    const oldEvents = new Set();

    for (let i = 1; i < data.length; i++) {
      if (
        clean_(data[i][mobileCol]) === mobile &&
        clean_(data[i][nameCol]).toLowerCase() === name.toLowerCase()
      ) {
        oldEvents.add(clean_(data[i][eventCol]));
      }
    }

    const duplicate = events.filter(ev => oldEvents.has(ev));

    if (duplicate.length) {
      throw new Error('আগেই নিবন্ধন করা হয়েছে: ' + duplicate.join(', '));
    }

    if (events.includes(CONFIG.BEST_COOK)) {
      const cookCount = data.slice(1).filter(r =>
        clean_(r[eventCol]) === CONFIG.BEST_COOK
      ).length;

      if (cookCount + (oldEvents.has(CONFIG.BEST_COOK) ? 0 : 1) > CONFIG.BEST_COOK_LIMIT) {
        throw new Error('রাঁধুনি প্রতিযোগিতার ৫৬টি আসন পূর্ণ হয়েছে।');
      }
    }

    const submittedAt = new Date();
    const registrations = [];

    events.forEach(event => {
      const regNo = 'KAC-' + id_();
      const row = new Array(headers.length).fill('');

      row[col_(headers, 'Registration No')] = regNo;
      row[col_(headers, 'Name')] = name;
      row[col_(headers, 'Mobile')] = mobile;
      row[col_(headers, 'Age')] = age;
      row[col_(headers, 'Event')] = event;
      row[col_(headers, 'Date & Time')] = submittedAt;
      row[col_(headers, 'Guardian Name')] = guardian;
      row[col_(headers, 'Village')] = village;
      row[col_(headers, 'Gender')] = gender;
      row[col_(headers, 'Guardian Consent')] = age < 18 ? 'Yes' : 'Not Required';

      sh.appendRow(row);

      let certificateUrl = '';

      try {
        certificateUrl = createCertificate_(regNo);
        const certCol = col_(headers, 'Certificate URL') + 1;
        sh.getRange(sh.getLastRow(), certCol).setValue(certificateUrl);
      } catch (certError) {
        console.error('Certificate error: ' + certError);
      }

      registrations.push({
        event: event,
        registrationNo: regNo,
        certificateUrl: certificateUrl
      });
    });

    return json_({
      status: 'success',
      message: 'নিবন্ধন সফল হয়েছে।',
      registrations: registrations,
      bestCookNotice: events.includes(CONFIG.BEST_COOK)
        ? 'রাঁধুনি প্রতিযোগিতার জন্য আলাদা কাগজের Registration Card আবশ্যক।'
        : ''
    });
  });
}


/************************************************************
 CERTIFICATE PDF
************************************************************/

function createCertificate_(registrationNo) {
  const { sh, headers } = mainSheet_();
  const data = sh.getDataRange().getValues();

  let participant = null;

  for (let i = 1; i < data.length; i++) {
    if (clean_(value_(data[i], headers, 'Registration No')) === registrationNo) {
      participant = data[i];
      break;
    }
  }

  if (!participant) throw new Error('নিবন্ধন পাওয়া যায়নি।');

  const name = value_(participant, headers, 'Name');
  const event = value_(participant, headers, 'Event');

  const folder = getFolder_(CONFIG.CERTIFICATE_FOLDER);

  const doc = DocumentApp.create('Certificate-' + registrationNo);
  const body = doc.getBody();

  body.clear();
  body.setMarginTop(55);
  body.setMarginBottom(55);
  body.setMarginLeft(45);
  body.setMarginRight(45);

  const title = body.appendParagraph('KOKOND ANNUAL PROGRAM 2026');
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  title.setBold(true);
  title.setFontSize(20);

  const subtitle = body.appendParagraph('অংশগ্রহণ নিবন্ধন সনদ');
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subtitle.setFontSize(22);
  subtitle.setBold(true);

  body.appendParagraph('');

  const intro = body.appendParagraph('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে');
  intro.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  intro.setFontSize(14);

  const participantName = body.appendParagraph(name);
  participantName.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  participantName.setBold(true);
  participantName.setFontSize(24);

  const eventName = body.appendParagraph(
    'কোকন্দ বাৎসরিক সাংস্কৃতিক অনুষ্ঠান ও জলসা ২০২৬-এর'
  );
  eventName.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  eventName.setFontSize(14);

  const eventTitle = body.appendParagraph(event);
  eventTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  eventTitle.setBold(true);
  eventTitle.setFontSize(19);

  const details = body.appendParagraph(
    'প্রতিযোগিতায় অংশগ্রহণের জন্য নিবন্ধিত হয়েছেন।'
  );
  details.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  details.setFontSize(14);

  body.appendParagraph('');
  const reg = body.appendParagraph('Registration ID: ' + registrationNo);
  reg.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  reg.setBold(true);
  reg.setFontSize(12);

  const date = body.appendParagraph('তারিখ: ৩০–৩১ ডিসেম্বর ২০২৬');
  date.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph('');
  const footer = body.appendParagraph('কোকন্দ বাৎসরিক অনুষ্ঠান পরিচালনা কমিটি');
  footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  footer.setBold(true);

  doc.saveAndClose();

  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs(MimeType.PDF)
    .setName('Certificate-' + registrationNo + '.pdf');

  const pdf = folder.createFile(pdfBlob);

  pdf.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  // Temporary Google Doc সরানো
  docFile.setTrashed(true);

  return pdf.getUrl();
}

function getFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function certificatePage_(id) {
  if (!id) {
    return HtmlService.createHtmlOutput('Registration ID পাওয়া যায়নি।');
  }

  const { sh, headers } = mainSheet_();
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (clean_(value_(data[i], headers, 'Registration No')) === clean_(id)) {
      const url = clean_(value_(data[i], headers, 'Certificate URL'));

      if (url) {
        return HtmlService.createHtmlOutput(
          '<meta charset="utf-8"><p>সার্টিফিকেট তৈরি হয়েছে।</p>' +
          '<a href="' + escapeHtml_(url) + '" target="_blank">সার্টিফিকেট খুলুন / ডাউনলোড করুন</a>'
        );
      }

      return HtmlService.createHtmlOutput('সার্টিফিকেট তৈরি করা যায়নি।');
    }
  }

  return HtmlService.createHtmlOutput('নিবন্ধন পাওয়া যায়নি।');
}


/************************************************************
 CONTROLLER AUTHENTICATION
************************************************************/

function controllerLogin(pin) {
  if (clean_(pin) !== CONFIG.CONTROLLER_PIN) {
    return { status: 'error', message: 'ভুল PIN।' };
  }

  const token = Utilities.getUuid() + Utilities.getUuid();

  CacheService.getScriptCache().put(
    'controller_' + token,
    'authorized',
    21600
  );

  return {
    status: 'success',
    token: token
  };
}

function auth_(token) {
  if (!token || CacheService.getScriptCache().get('controller_' + token) !== 'authorized') {
    throw new Error('সেশন শেষ হয়েছে। আবার লগইন করুন।');
  }
}

function controllerLogout(token) {
  if (token) {
    CacheService.getScriptCache().remove('controller_' + token);
  }
  return { status: 'success' };
}


/************************************************************
 CONTROLLER: EVENT AND PARTICIPANT DATA
************************************************************/

function controllerGetEvents(token) {
  auth_(token);

  const { sh, headers } = mainSheet_();
  const data = sh.getDataRange().getValues();
  const events = [...new Set(
    data.slice(1).map(r => clean_(value_(r, headers, 'Event'))).filter(Boolean)
  )];

  return events;
}

function controllerGetParticipants(token, event) {
  auth_(token);

  const { sh, headers } = mainSheet_();
  const data = sh.getDataRange().getValues();

  const attendance = sheet_('Attendance', ATT_HEADERS)
    .getDataRange().getValues();

  const attended = new Set(
    attendance.slice(1)
      .filter(r => clean_(r[1]) === clean_(event) && r[4] === 'Present')
      .map(r => clean_(r[0]))
  );

  return data.slice(1)
    .filter(r => clean_(value_(r, headers, 'Event')) === clean_(event))
    .map(r => ({
      registrationNo: clean_(value_(r, headers, 'Registration No')),
      name: clean_(value_(r, headers, 'Name')),
      mobile: clean_(value_(r, headers, 'Mobile')),
      age: value_(r, headers, 'Age'),
      village: clean_(value_(r, headers, 'Village')),
      gender: clean_(value_(r, headers, 'Gender')),
      attendance: attended.has(clean_(value_(r, headers, 'Registration No')))
    }));
}


/************************************************************
 ATTENDANCE
************************************************************/

function controllerMarkAttendance(token, registrationNo, present) {
  auth_(token);

  return lock_(() => {
    const { sh, headers } = mainSheet_();
    const data = sh.getDataRange().getValues();

    let participant = null;

    for (let i = 1; i < data.length; i++) {
      if (clean_(value_(data[i], headers, 'Registration No')) === clean_(registrationNo)) {
        participant = data[i];
        break;
      }
    }

    if (!participant) throw new Error('নিবন্ধন নম্বর পাওয়া যায়নি।');

    const event = clean_(value_(participant, headers, 'Event'));
    const name = clean_(value_(participant, headers, 'Name'));
    const mobile = clean_(value_(participant, headers, 'Mobile'));

    const att = sheet_('Attendance', ATT_HEADERS);
    const values = att.getDataRange().getValues();

    let row = -1;

    for (let i = 1; i < values.length; i++) {
      if (
        clean_(values[i][0]) === clean_(registrationNo) &&
        clean_(values[i][1]) === event
      ) {
        row = i + 1;
        break;
      }
    }

    const status = present ? 'Present' : 'Absent';
    const record = [
      registrationNo,
      event,
      name,
      mobile,
      status,
      new Date(),
      'Controller'
    ];

    if (row < 0) {
      att.appendRow(record);
    } else {
      att.getRange(row, 1, 1, record.length).setValues([record]);
    }

    return { status: 'success', attendance: status };
  });
}


/************************************************************
 JUDGMENT SETTINGS
************************************************************/

function controllerSaveSettings(token, event, judgeCount, maxScore) {
  auth_(token);

  event = clean_(event);
  judgeCount = Number(judgeCount);
  maxScore = Number(maxScore);

  if (!event) throw new Error('প্রতিযোগিতা নির্বাচন করুন।');
  if (!Number.isInteger(judgeCount) || judgeCount < 1 || judgeCount > 20) {
    throw new Error('বিচারকের সংখ্যা ১ থেকে ২০-এর মধ্যে হতে হবে।');
  }
  if (!Number.isFinite(maxScore) || maxScore <= 0 || maxScore > 10000) {
    throw new Error('সর্বোচ্চ নম্বর সঠিক নয়।');
  }

  const sh = sheet_('Judgment Settings', SETTINGS_HEADERS);
  const data = sh.getDataRange().getValues();

  let row = -1;

  for (let i = 1; i < data.length; i++) {
    if (clean_(data[i][0]) === event) {
      row = i + 1;
      break;
    }
  }

  const values = [event, judgeCount, maxScore, new Date()];

  if (row < 0) sh.appendRow(values);
  else sh.getRange(row, 1, 1, 4).setValues([values]);

  return { status: 'success' };
}

function controllerGetSettings(token, event) {
  auth_(token);

  const sh = sheet_('Judgment Settings', SETTINGS_HEADERS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (clean_(data[i][0]) === clean_(event)) {
      return {
        event: data[i][0],
        judgeCount: Number(data[i][1]),
        maxScore: Number(data[i][2])
      };
    }
  }

  return { event: event, judgeCount: 0, maxScore: 0 };
}


/************************************************************
 JUDGMENT: SAVE / EDIT SCORE
************************************************************/

function controllerSaveScore(token, registrationNo, judgeNumber, score) {
  auth_(token);

  return lock_(() => {
    registrationNo = clean_(registrationNo);
    judgeNumber = Number(judgeNumber);
    score = Number(score);

    const { sh, headers } = mainSheet_();
    const data = sh.getDataRange().getValues();

    let participant = null;

    for (let i = 1; i < data.length; i++) {
      if (clean_(value_(data[i], headers, 'Registration No')) === registrationNo) {
        participant = data[i];
        break;
      }
    }

    if (!participant) throw new Error('অংশগ্রহণকারী পাওয়া যায়নি।');

    const event = clean_(value_(participant, headers, 'Event'));
    const name = clean_(value_(participant, headers, 'Name'));

    const settings = controllerGetSettings(token, event);

    if (!settings.judgeCount || !settings.maxScore) {
      throw new Error('আগে Judgment Settings নির্ধারণ করুন।');
    }

    if (
      !Number.isInteger(judgeNumber) ||
      judgeNumber < 1 ||
      judgeNumber > settings.judgeCount
    ) {
      throw new Error('বিচারকের নম্বর সঠিক নয়।');
    }

    if (!Number.isFinite(score) || score < 0 || score > settings.maxScore) {
      throw new Error('নম্বর নির্ধারিত সীমার মধ্যে দিন।');
    }

    const results = sheet_('Competition Results', RESULT_HEADERS)
      .getDataRange().getValues();

    const finalized = results.slice(1).some(r =>
      clean_(r[0]) === event && r[7]
    );

    if (finalized) {
      throw new Error('ফলাফল চূড়ান্ত হয়েছে। নম্বর পরিবর্তন করা যাবে না।');
    }

    const scoreSheet = sheet_('Judgment Scores', SCORE_HEADERS);
    const values = scoreSheet.getDataRange().getValues();

    let row = -1;

    for (let i = 1; i < values.length; i++) {
      if (
        clean_(values[i][0]) === registrationNo &&
        Number(values[i][3]) === judgeNumber
      ) {
        row = i + 1;
        break;
      }
    }

    const record = [
      registrationNo,
      event,
      name,
      judgeNumber,
      score,
      new Date()
    ];

    if (row < 0) scoreSheet.appendRow(record);
    else scoreSheet.getRange(row, 1, 1, 6).setValues([record]);

    return { status: 'success', message: 'নম্বর সংরক্ষিত হয়েছে।' };
  });
}


/************************************************************
 JUDGMENT: VIEW SCORES
************************************************************/

function controllerGetScores(token, event) {
  auth_(token);

  const scoreSheet = sheet_('Judgment Scores', SCORE_HEADERS);
  const values = scoreSheet.getDataRange().getValues();

  return values.slice(1)
    .filter(r => clean_(r[1]) === clean_(event))
    .map(r => ({
      registrationNo: r[0],
      name: r[2],
      judgeNumber: Number(r[3]),
      score: Number(r[4])
    }));
}


/************************************************************
 FINALIZE RESULTS
************************************************************/

function controllerFinalizeResults(token, event) {
  auth_(token);

  return lock_(() => {
    event = clean_(event);

    const settings = controllerGetSettings(token, event);

    if (!settings.judgeCount || !settings.maxScore) {
      throw new Error('Judgment Settings আগে নির্ধারণ করুন।');
    }

    const participants = controllerGetParticipants(token, event);

    const scores = controllerGetScores(token, event);

    if (!participants.length) {
      throw new Error('এই প্রতিযোগিতায় কোনো নিবন্ধিত প্রতিযোগী নেই।');
    }

    const resultRows = [];

    participants.forEach(p => {
      const personScores = scores.filter(s =>
        clean_(s.registrationNo) === clean_(p.registrationNo)
      );

      if (personScores.length !== settings.judgeCount) {
        throw new Error(
          p.name + ' (' + p.registrationNo + ')-এর সব বিচারকের নম্বর দেওয়া হয়নি।'
        );
      }

      const total = personScores.reduce((sum, s) => sum + s.score, 0);
      const average = total / settings.judgeCount;

      resultRows.push({
        event: event,
        registrationNo: p.registrationNo,
        name: p.name,
        total: total,
        average: average
      });
    });

    resultRows.sort((a, b) => b.total - a.total);

    const groups = {};

    resultRows.forEach(r => {
      const key = String(r.total);
      groups[key] = (groups[key] || 0) + 1;
    });

    let previousTotal = null;
    let rank = 0;

    resultRows.forEach((r, index) => {
      if (previousTotal === null || r.total < previousTotal) {
        rank = index + 1;
      }

      r.rank = rank;
      r.tie = groups[String(r.total)] > 1;
      previousTotal = r.total;
    });

    const resultSheet = sheet_('Competition Results', RESULT_HEADERS);
    const existing = resultSheet.getDataRange().getValues();

    // Remove previous unfinalized results for this event only.
    for (let i = existing.length - 1; i >= 1; i--) {
      if (clean_(existing[i][0]) === event) {
        resultSheet.deleteRow(i + 1);
      }
    }

    const finalizedAt = new Date();

    resultRows.forEach(r => {
      resultSheet.appendRow([
        r.event,
        r.registrationNo,
        r.name,
        r.total,
        r.average,
        r.rank,
        r.tie ? 'Tie - Extra Round Required' : 'No Tie',
        finalizedAt
      ]);
    });

    return {
      status: 'success',
      message: 'ফলাফল চূড়ান্ত হয়েছে।',
      results: resultRows
    };
  });
}


/************************************************************
 VIEW FINAL RESULTS
************************************************************/

function controllerGetResults(token, event) {
  auth_(token);

  const sh = sheet_('Competition Results', RESULT_HEADERS);
  const data = sh.getDataRange().getValues();

  return data.slice(1)
    .filter(r => clean_(r[0]) === clean_(event))
    .map(r => ({
      event: r[0],
      registrationNo: r[1],
      name: r[2],
      total: Number(r[3]),
      average: Number(r[4]),
      rank: Number(r[5]),
      tie: r[6],
      finalizedAt: r[7]
    }));
}


/************************************************************
 CONTROLLER DASHBOARD HTML
************************************************************/

function controllerHTML_() {
  return `
<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kokond Controller</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f4f7f5;color:#17382c;margin:0;padding:18px}
.wrap{max-width:1100px;margin:auto}
header{background:#08704c;color:white;padding:20px;border-radius:14px;margin-bottom:18px}
h1{font-size:23px;margin:0 0 6px}
.panel{background:white;border:1px solid #dce8e0;border-radius:12px;padding:18px;margin:14px 0}
input,select,button{padding:11px;border:1px solid #ccd8d0;border-radius:8px;font-size:15px;max-width:100%}
button{background:#08704c;color:white;border:0;cursor:pointer}
button.secondary{background:#52665c}
button.danger{background:#a52c2c}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.row>*{flex:1}
table{width:100%;border-collapse:collapse;margin-top:12px}
td,th{padding:10px;border-bottom:1px solid #e4eae5;text-align:left;font-size:14px}
th{background:#edf5ef}
.small{font-size:12px;color:#64756b}
.hidden{display:none}
.status{padding:10px;background:#edf5ef;border-radius:8px;margin-top:10px}
.card{border:1px solid #dce8e0;border-radius:9px;padding:12px;margin:8px 0}
@media(max-width:650px){body{padding:8px}.panel{padding:12px}td,th{font-size:12px;padding:7px}}
</style>
</head>
<body>
<div class="wrap">
<header>
<h1>কোকন্দ অনুষ্ঠান ২০২৬</h1>
<p>Controller Dashboard — Attendance & Judgment</p>
</header>

<div id="login" class="panel">
<h2>Controller Login</h2>
<div class="row">
<input id="pin" type="password" placeholder="Controller PIN">
<button onclick="login()">Login</button>
</div>
<div id="loginMsg" class="status"></div>
</div>

<div id="app" class="hidden">
<div class="panel">
<div class="row">
<h2>Dashboard</h2>
<button class="secondary" onclick="logout()">Logout</button>
</div>
<label>প্রতিযোগিতা নির্বাচন করুন</label>
<div class="row">
<select id="eventSelect" onchange="loadEvent()"></select>
<button onclick="loadEvent()">তথ্য লোড</button>
</div>
<div id="eventMsg" class="status"></div>
</div>

<div class="panel">
<h2>১. উপস্থিতি (Attendance)</h2>
<p class="small">প্রতিযোগীর Registration ID অনুযায়ী উপস্থিতি চিহ্নিত করুন।</p>
<div class="row">
<input id="attendanceId" placeholder="Registration ID">
<button onclick="markAttendance(true)">Present</button>
<button class="danger" onclick="markAttendance(false)">Absent</button>
</div>
<div id="attendanceMsg" class="status"></div>
</div>

<div class="panel">
<h2>২. Judgment Settings</h2>
<div class="row">
<input id="judgeCount" type="number" min="1" max="20" placeholder="বিচারকের সংখ্যা">
<input id="maxScore" type="number" min="1" placeholder="সর্বোচ্চ নম্বর">
<button onclick="saveSettings()">Settings Save</button>
</div>
<div id="settingsMsg" class="status"></div>
</div>

<div class="panel">
<h2>৩. নম্বর প্রদান / সম্পাদনা</h2>
<div class="row">
<input id="scoreId" placeholder="Registration ID">
<input id="judgeNo" type="number" min="1" placeholder="বিচারক নম্বর">
<input id="scoreValue" type="number" min="0" placeholder="প্রাপ্ত নম্বর">
<button onclick="saveScore()">নম্বর Save</button>
</div>
<div id="scoreMsg" class="status"></div>
</div>

<div class="panel">
<h2>৪. প্রতিযোগীদের তালিকা</h2>
<div id="participants"></div>
</div>

<div class="panel">
<h2>৫. নম্বরের তালিকা</h2>
<button class="secondary" onclick="loadScores()">Scores Refresh</button>
<div id="scores"></div>
</div>

<div class="panel">
<h2>৬. ফলাফল চূড়ান্তকরণ</h2>
<p class="small">সব প্রতিযোগীর সব বিচারকের নম্বর দেওয়ার পর এই বোতাম ব্যবহার করবে। চূড়ান্ত করার পর নম্বর পরিবর্তন বন্ধ হবে। সমান নম্বর হলে অতিরিক্ত রাউন্ডের জন্য চিহ্নিত হবে।</p>
<button onclick="finalize()">Finalize Results</button>
<div id="finalMsg" class="status"></div>
<div id="results"></div>
</div>
</div>
</div>

<script>
let token = '';
const $ = id => document.getElementById(id);

function msg(id,text){$(id).textContent=text}

function call(fn,args,success,error){
  google.script.run
    .withSuccessHandler(success)
    .withFailureHandler(e=>error(e.message || String(e)))[fn](...args);
}

function login(){
  msg('loginMsg','লগইন হচ্ছে...');
  call('controllerLogin',[$('pin').value],r=>{
    if(r.status!=='success'){msg('loginMsg',r.message);return}
    token=r.token;
    $('login').classList.add('hidden');
    $('app').classList.remove('hidden');
    loadEvents();
  },e=>msg('loginMsg',e));
}

function logout(){
  call('controllerLogout',[token],()=>{},()=>{});
  token='';
  $('app').classList.add('hidden');
  $('login').classList.remove('hidden');
  $('pin').value='';
}

function loadEvents(){
  call('controllerGetEvents',[token],events=>{
    $('eventSelect').innerHTML='';
    events.forEach(e=>{
      const o=document.createElement('option');
      o.value=e;o.textContent=e;
      $('eventSelect').appendChild(o);
    });
    loadEvent();
  },e=>msg('eventMsg',e));
}

function eventName(){return $('eventSelect').value}

function loadEvent(){
  if(!eventName())return;
  msg('eventMsg','তথ্য লোড হচ্ছে...');
  call('controllerGetParticipants',[token,eventName()],list=>{
    msg('eventMsg','মোট নিবন্ধিত প্রতিযোগী: '+list.length);
    $('participants').innerHTML='';
    list.forEach(p=>{
      const div=document.createElement('div');
      div.className='card';
      div.textContent=p.name+' | '+p.registrationNo+' | '+p.mobile+' | '+(p.attendance?'Present':'Not Marked');
      $('participants').appendChild(div);
    });
  },e=>msg('eventMsg',e));

  call('controllerGetSettings',[token,eventName()],s=>{
    $('judgeCount').value=s.judgeCount||'';
    $('maxScore').value=s.maxScore||'';
  },e=>msg('settingsMsg',e));

  loadScores();
  loadResults();
}

function markAttendance(present){
  const id=$('attendanceId').value.trim();
  if(!id){msg('attendanceMsg','Registration ID লিখুন।');return}
  call('controllerMarkAttendance',[token,id,present],r=>{
    msg('attendanceMsg','Attendance: '+r.attendance);
    loadEvent();
  },e=>msg('attendanceMsg',e));
}

function saveSettings(){
  call('controllerSaveSettings',[
    token,eventName(),$('judgeCount').value,$('maxScore').value
  ],r=>{
    msg('settingsMsg','Judgment Settings সংরক্ষিত হয়েছে।');
  },e=>msg('settingsMsg',e));
}

function saveScore(){
  call('controllerSaveScore',[
    token,$('scoreId').value.trim(),
    $('judgeNo').value,$('scoreValue').value
  ],r=>{
    msg('scoreMsg',r.message);
    loadScores();
  },e=>msg('scoreMsg',e));
}

function loadScores(){
  if(!eventName())return;
  call('controllerGetScores',[token,eventName()],list=>{
    $('scores').innerHTML='';
    if(!list.length){$('scores').textContent='এখনও কোনো নম্বর দেওয়া হয়নি।';return}
    const table=document.createElement('table');
    table.innerHTML='<tr><th>নাম</th><th>Registration ID</th><th>বিচারক</th><th>নম্বর</th></tr>';
    list.forEach(s=>{
      const tr=document.createElement('tr');
      [s.name,s.registrationNo,s.judgeNumber,s.score].forEach(v=>{
        const td=document.createElement('td');td.textContent=v;tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    $('scores').appendChild(table);
  },e=>msg('scoreMsg',e));
}

function finalize(){
  if(!confirm('এই প্রতিযোগিতার ফলাফল চূড়ান্ত করবেন? পরে নম্বর সম্পাদনা করা যাবে না।'))return;
  msg('finalMsg','ফলাফল তৈরি হচ্ছে...');
  call('controllerFinalizeResults',[token,eventName()],r=>{
    msg('finalMsg',r.message);
    showResults(r.results||[]);
  },e=>msg('finalMsg',e));
}

function loadResults(){
  if(!eventName())return;
  call('controllerGetResults',[token,eventName()],showResults,e=>msg('finalMsg',e));
}

function showResults(list){
  $('results').innerHTML='';
  if(!list.length){$('results').textContent='এখনও ফলাফল চূড়ান্ত হয়নি।';return}
  const table=document.createElement('table');
  table.innerHTML='<tr><th>স্থান</th><th>নাম</th><th>ID</th><th>মোট</th><th>গড়</th><th>অবস্থা</th></tr>';
  list.forEach(r=>{
    const tr=document.createElement('tr');
    [r.rank,r.name,r.registrationNo,r.total,r.average,r.tie||'No Tie'].forEach(v=>{
      const td=document.createElement('td');td.textContent=v;tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  $('results').appendChild(table);
}
</script>
</body>
</html>`;
}


/************************************************************
 KYC AND NEW MEMBER APPLICATIONS
************************************************************/

function handleMemberRequest_(e, action) {
  const ss = ss_();
  const name = clean_(e.parameter.memberName);
  const mobile = clean_(e.parameter.mobile);

  if (!name || !/^\d{10}$/.test(mobile)) {
    throw new Error('নাম অথবা মোবাইল নম্বর সঠিক নয়।');
  }

  const sheetName = action === 'kyc' ? 'KYC Requests' : 'New Member Applications';

  const sh = sheet_(sheetName, [
    'Request ID','Name','Mobile','Photo URL',
    'Status','Token','Submitted At','Reviewed At'
  ]);

  const photoUrl = savePhoto_(e, name);
  const requestId = (action === 'kyc' ? 'KYC-' : 'NEW-') + id_();
  const token = Utilities.getUuid() + Utilities.getUuid();

  sh.appendRow([
    requestId,name,mobile,photoUrl,'Pending',token,new Date(),''
  ]);

  const base = ScriptApp.getService().getUrl();

  const approve = base + '?action=approve&type=' + encodeURIComponent(action) +
    '&id=' + encodeURIComponent(requestId) + '&token=' + encodeURIComponent(token);

  const reject = base + '?action=reject&type=' + encodeURIComponent(action) +
    '&id=' + encodeURIComponent(requestId) + '&token=' + encodeURIComponent(token);

  const subject = (action === 'kyc' ? 'KYC Approval: ' : 'New Committee Member: ') + name;

  MailApp.sendEmail({
    to: CONFIG.MANAGER_EMAIL,
    subject: subject,
    htmlBody: '<h2>' + escapeHtml_(subject) + '</h2>' +
      '<p>মোবাইল: ' + escapeHtml_(mobile) + '</p>' +
      '<p><a href="' + photoUrl + '">ছবি দেখুন</a></p>' +
      '<p><a href="' + approve + '">APPROVE</a> | ' +
      '<a href="' + reject + '">REJECT</a></p>',
    body: subject + '\n' + approve
  });

  return json_({ status:'success', requestId:requestId });
}

function reviewRequest_(e, decision) {
  const type = clean_(e.parameter.type);

  if (!['kyc','newMember'].includes(type)) {
    return HtmlService.createHtmlOutput('Request type ভুল।');
  }

  const name = type === 'kyc' ? 'KYC Requests' : 'New Member Applications';
  const sh = ss_().getSheetByName(name);

  if (!sh) return HtmlService.createHtmlOutput('Request sheet পাওয়া যায়নি।');

  const data = sh.getDataRange().getValues();
  let row = -1;

  for (let i=1;i<data.length;i++) {
    if (
      clean_(data[i][0]) === clean_(e.parameter.id) &&
      clean_(data[i][5]) === clean_(e.parameter.token)
    ) { row=i+1; break; }
  }

  if (row < 0) return HtmlService.createHtmlOutput('Approval link সঠিক নয়।');
  if (sh.getRange(row,5).getValue() !== 'Pending') {
    return HtmlService.createHtmlOutput('এই আবেদন ইতিমধ্যে review হয়েছে।');
  }

  if (decision === 'approve') {
    const nameValue=sh.getRange(row,2).getValue();
    const mobile=sh.getRange(row,3).getValue();
    const photo=sh.getRange(row,4).getValue();

    const members=sheet_('Committee Members',[
      'Name','Role','Mobile','Photo URL','Status','Updated At'
    ]);

    const values=members.getDataRange().getValues();
    let existing=-1;

    for(let i=1;i<values.length;i++){
      if(clean_(values[i][0])===clean_(nameValue)){existing=i+1;break;}
    }

    if(existing<0){
      members.appendRow([nameValue,'Member',mobile,photo,'Approved',new Date()]);
    }else{
      members.getRange(existing,3,1,4).setValues([[mobile,photo,'Approved',new Date()]]);
    }

    sh.getRange(row,5).setValue('Approved');
  }else{
    sh.getRange(row,5).setValue('Rejected');
  }

  sh.getRange(row,8).setValue(new Date());

  return HtmlService.createHtmlOutput(
    decision === 'approve' ? 'অনুমোদন সফল হয়েছে।' : 'আবেদন Reject করা হয়েছে।'
  );
}

function getApprovedMembers_() {
  const sh=ss_().getSheetByName('Committee Members');

  if(!sh)return json_({status:'success',members:[]});

  const data=sh.getDataRange().getValues();
  const members=[];

  for(let i=1;i<data.length;i++){
    if(data[i][4]==='Approved'){
      members.push({
        name:data[i][0],
        role:data[i][1],
        mobile:data[i][2],
        photoUrl:driveView_(data[i][3]),
        status:data[i][4]
      });
    }
  }

  return json_({status:'success',members:members});
}

function savePhoto_(e,name) {
  const b64=e.parameter.photoBase64;
  const type=e.parameter.photoType||'image/jpeg';

  if(!b64)throw new Error('ছবি পাওয়া যায়নি।');
  if(!/^image\/(jpeg|png|webp)$/.test(type))throw new Error('ছবির ফরম্যাট সঠিক নয়।');

  const bytes=Utilities.base64Decode(b64);
  if(bytes.length>3*1024*1024)throw new Error('ছবি ৩ MB-এর মধ্যে রাখুন।');

  const folder=getFolder_(CONFIG.PHOTO_FOLDER);
  const ext=type.includes('png')?'.png':type.includes('webp')?'.webp':'.jpg';

  const file=folder.createFile(
    Utilities.newBlob(bytes,type,name+'-'+Date.now()+ext)
  );

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  return file.getUrl();
}

function driveView_(url) {
  const m=String(url||'').match(/[-\w]{25,}/);
  return m?'https://drive.google.com/thumbnail?id='+m[0]+'&sz=w500':'';
}


/************************************************************
 DONATIONS API
************************************************************/

function getDonations_() {
  const sh=ss_().getSheetByName('Donations');

  if(!sh){
    return json_({
      status:'success',
      summary:{promised:0,paid:0,due:0},
      donations:[]
    });
  }

  const data=sh.getDataRange().getValues();

  if(data.length<2){
    return json_({
      status:'success',
      summary:{promised:0,paid:0,due:0},
      donations:[]
    });
  }

  const headers=data[0].map(x=>clean_(x));
  const idx=n=>headers.indexOf(n);

  const donations=[];
  let promised=0,paid=0;

  for(let i=1;i<data.length;i++){
    const name=data[i][idx('Name')];
    const amount=Number(data[i][idx('Amount')]||0);
    const status=clean_(data[i][idx('Status')]);
    const promise=data[i][idx('Promise')]||'';

    if(!name)continue;

    promised+=amount;
    if(status.toLowerCase()==='paid')paid+=amount;

    donations.push({
      name:name,
      amount:amount,
      status:status,
      promise:promise
    });
  }

  return json_({
    status:'success',
    summary:{
      promised:promised,
      paid:paid,
      due:promised-paid
    },
    donations:donations
  });
}


/************************************************************
 SETUP
************************************************************/

function setupKokondSystem() {
  const ss=ss_();

  mainSheet_();

  sheet_('Attendance',ATT_HEADERS);
  sheet_('Judgment Settings',SETTINGS_HEADERS);
  sheet_('Judgment Scores',SCORE_HEADERS);
  sheet_('Competition Results',RESULT_HEADERS);
  sheet_('KYC Requests',[
    'Request ID','Name','Mobile','Photo URL',
    'Status','Token','Submitted At','Reviewed At'
  ]);
  sheet_('New Member Applications',[
    'Request ID','Name','Mobile','Photo URL',
    'Status','Token','Submitted At','Reviewed At'
  ]);
  sheet_('Committee Members',[
    'Name','Role','Mobile','Photo URL','Status','Updated At'
  ]);

  return 'Kokond System setup complete.';
}
