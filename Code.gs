
/**
 * KACP ANNUAL PROGRAM 2026
 * Integrated Google Apps Script Backend
 *
 * Features:
 * Registration, Edit Registration, KYC,
 * Admin CMS, Controller Queue, Live Judging,
 * Results, Audit Logs.
 *
 * IMPORTANT:
 * 1. Never delete existing spreadsheet data.
 * 2. Set Script Properties before deployment.
 * 3. Admin/judge/controller passwords are NOT stored in frontend.
 */

const KACP = {
  VERSION: "4.0",
  MANAGER_EMAIL: "eliash9749@gmail.com",
  DRIVE_FOLDER_NAME: "Kokond Annual Program 2026 - Member Photos",
  REGISTRATION_SHEET: "Sheet1",
  KYC_SHEET: "KYC Applications",
  MEMBERS_SHEET: "New Member Applications",
  CMS_SHEET: "KACP CMS",
  USERS_SHEET: "KACP Users",
  QUEUE_SHEET: "KACP Queue",
  SCORES_SHEET: "KACP Scores",
  RESULTS_SHEET: "KACP Results",
  AUDIT_SHEET: "KACP Audit"
};

/* =========================
   WEB APP ENTRY POINTS
========================= */

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const action = String(p.action || "status");

    if (action === "members") {
      return json_(getApprovedMembers_());
    }

    if (action === "status") {
      return json_({
        success: true,
        app: "KACP",
        version: KACP.VERSION,
        message: "KACP Backend is running"
      });
    }

    return json_(routeGet_(action, p));

  } catch (err) {
    return json_({
      success: false,
      message: err.message || String(err)
    });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(20000);

    const body = parseBody_(e);
    const action = String(body.action || "");

    const result = routePost_(action, body);

    return json_(result);

  } catch (err) {
    return json_({
      success: false,
      message: err.message || String(err)
    });

  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

/* =========================
   ROUTING
========================= */

function routeGet_(action, p) {
  switch (action) {
    case "lookupRegistration":
      return lookupRegistration_(p);

    case "getCMS":
      return getCMS_(p);

    case "getQueue":
      return getQueue_(p);

    case "getLiveScores":
      return getLiveScores_(p);

    case "getResults":
      return getResults_(p);

    case "getDashboard":
      requireRole_(p.token, ["admin"]);
      return getDashboard_();

    default:
      throw new Error("Unknown GET action: " + action);
  }
}

function routePost_(action, b) {
  switch (action) {
    case "registration":
      return saveRegistration_(b);

    case "updateRegistration":
      return updateRegistration_(b);

    case "kyc":
      return submitKYC_(b);

    case "newMember":
      return submitNewMember_(b);

    case "adminLogin":
      return login_(b, "admin");

    case "judgeLogin":
      return login_(b, "judge");

    case "controllerLogin":
      return login_(b, "controller");

    case "saveCMS":
      requireRole_(b.token, ["admin"]);
      return saveCMS_(b);

    case "createUser":
      requireRole_(b.token, ["admin"]);
      return createUser_(b);

    case "reviewKYC":
      requireRole_(b.token, ["admin"]);
      return reviewKYC_(b);

    case "createQueue":
      requireRole_(b.token, ["admin"]);
      return createQueue_(b);

    case "controllerAction":
      requireRole_(b.token, ["admin", "controller"]);
      return controllerAction_(b);

    case "submitScore":
      requireRole_(b.token, ["judge"]);
      return submitScore_(b);

    case "publishResults":
      requireRole_(b.token, ["admin"]);
      return publishResults_(b);

    case "resolveTie":
      requireRole_(b.token, ["admin"]);
      return resolveTie_(b);

    case "logout":
      return logout_(b);

    default:
      throw new Error("Unknown POST action: " + action);
  }
}

/* =========================
   SPREADSHEET HELPERS
========================= */

function ss_() {
  const id = PropertiesService.getScriptProperties()
    .getProperty("SPREADSHEET_ID");

  if (id) return SpreadsheetApp.openById(id);

  const active = SpreadsheetApp.getActiveSpreadsheet();

  if (!active) {
    throw new Error(
      "SPREADSHEET_ID Script Property সেট করা নেই।"
    );
  }

  return active;
}

function sheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);

  if (!sh) {
    sh = ss.insertSheet(name);
  }

  if (headers && headers.length) {
    const lastCol = Math.max(sh.getLastColumn(), headers.length);

    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const existing = sh.getRange(1, 1, 1, lastCol)
        .getValues()[0]
        .map(v => String(v).trim());

      headers.forEach((header, i) => {
        if (!existing.includes(header)) {
          const newCol = sh.getLastColumn() + 1;
          sh.getRange(1, newCol).setValue(header);
        }
      });
    }
  }

  return sh;
}

function ensureSheets_() {
  // Existing Sheet1 is preserved. Missing columns are appended.
  sheet_(KACP.REGISTRATION_SHEET, [
    "Registration No",
    "Name",
    "Mobile",
    "Age",
    "Event",
    "Date & Time",
    "Guardian",
    "Gender",
    "Village",
    "Registration Group ID",
    "Updated At"
  ]);

  sheet_(KACP.KYC_SHEET, [
    "Application ID",
    "Name",
    "Mobile",
    "Member ID",
    "Document URL",
    "Status",
    "Submitted At",
    "Reviewed At",
    "Review Note"
  ]);

  sheet_(KACP.MEMBERS_SHEET, [
    "Application ID",
    "Name",
    "Mobile",
    "Photo URL",
    "Status",
    "Submitted At"
  ]);

  sheet_(KACP.CMS_SHEET, [
    "Key",
    "Value",
    "Updated At"
  ]);

  sheet_(KACP.USERS_SHEET, [
    "User ID",
    "Name",
    "Username",
    "Password Hash",
    "Role",
    "Assigned Events",
    "Active",
    "Created At"
  ]);

  sheet_(KACP.QUEUE_SHEET, [
    "Session ID",
    "Event",
    "Position",
    "Registration No",
    "Participant Name",
    "Status",
    "Attempt",
    "Updated At"
  ]);

  sheet_(KACP.SCORES_SHEET, [
    "Score ID",
    "Session ID",
    "Event",
    "Registration No",
    "Participant Name",
    "Judge ID",
    "Score",
    "Submitted At",
    "Status"
  ]);

  sheet_(KACP.RESULTS_SHEET, [
    "Session ID",
    "Event",
    "Registration No",
    "Participant Name",
    "Total Score",
    "Rank",
    "Status",
    "Published At",
    "Tie Note"
  ]);

  sheet_(KACP.AUDIT_SHEET, [
    "Timestamp",
    "Actor",
    "Role",
    "Action",
    "Reference",
    "Details"
  ]);
}

/**
 * Run once manually from Apps Script editor.
 * This only creates missing sheets/columns.
 */
function setupKACP() {
  ensureSheets_();
  return "KACP setup completed. Existing data was not deleted.";
}

function rows_(sh) {
  const values = sh.getDataRange().getValues();

  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map((row, index) => {
    const obj = { _row: index + 2 };

    headers.forEach((h, i) => {
      obj[h] = row[i];
    });

    return obj;
  }).filter(r => Object.keys(r).length > 1);
}

function appendObject_(sh, obj) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn())
    .getValues()[0]
    .map(String);

  const row = headers.map(h =>
    Object.prototype.hasOwnProperty.call(obj, h) ? obj[h] : ""
  );

  sh.appendRow(row);
}

function updateObject_(sh, rowNumber, obj) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn())
    .getValues()[0]
    .map(String);

  headers.forEach((h, i) => {
    if (Object.prototype.hasOwnProperty.call(obj, h)) {
      sh.getRange(rowNumber, i + 1).setValue(obj[h]);
    }
  });
}

/* =========================
   REGISTRATION
========================= */

function clean_(v) {
  return String(v == null ? "" : v).trim();
}

function normalizeMobile_(v) {
  return clean_(v).replace(/\D/g, "");
}

function events_(v) {
  let list = [];

  if (Array.isArray(v)) {
    list = v;
  } else {
    list = clean_(v).split("|");
  }

  return [...new Set(
    list.map(x => clean_(x)).filter(Boolean)
  )];
}

function makeId_(prefix) {
  return prefix + "-" +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyyMMdd-HHmmss"
    ) + "-" +
    Math.floor(1000 + Math.random() * 9000);
}

function saveRegistration_(b) {
  ensureSheets_();

  const name = clean_(b.name);
  const mobile = normalizeMobile_(b.mobile);
  const age = Number(b.age);
  const selectedEvents = events_(b.events || b.event);

  if (!name || mobile.length < 10 || !age || age < 1) {
    throw new Error("নাম, সঠিক মোবাইল নম্বর ও বয়স দিন।");
  }

  if (!selectedEvents.length) {
    throw new Error("অন্তত একটি প্রতিযোগিতা নির্বাচন করুন।");
  }

  const sh = sheet_(KACP.REGISTRATION_SHEET);
  const existing = rows_(sh);

  // Prevent same person registering twice for the same event.
  const duplicate = existing.find(r =>
    normalizeMobile_(r.Mobile) === mobile &&
    clean_(r.Name).toLowerCase() === name.toLowerCase() &&
    selectedEvents.some(ev =>
      events_(r.Event).includes(ev)
    )
  );

  if (duplicate) {
    throw new Error(
      "এই নাম ও মোবাইল নম্বরে নির্বাচিত প্রতিযোগিতার রেজিস্ট্রেশন আগে থেকেই আছে।"
    );
  }

  const groupId = makeId_("KACP");
  const now = new Date();
  const created = [];

  selectedEvents.forEach(eventName => {
    const regNo = makeId_("REG");

    appendObject_(sh, {
      "Registration No": regNo,
      "Name": name,
      "Mobile": mobile,
      "Age": age,
      "Event": eventName,
      "Date & Time": now,
      "Guardian": clean_(b.guardian),
      "Gender": clean_(b.gender),
      "Village": clean_(b.village),
      "Registration Group ID": groupId,
      "Updated At": now
    });

    created.push(regNo);
  });

  audit_("Public", "registration", groupId, {
    name: name,
    eventCount: created.length
  });

  return {
    success: true,
    message: "Registration successful",
    groupId: groupId,
    registrationNumbers: created
  };
}

function lookupRegistration_(p) {
  const name = clean_(p.name).toLowerCase();
  const mobile = normalizeMobile_(p.mobile);

  if (!name || mobile.length < 10) {
    throw new Error("নাম ও মোবাইল নম্বর দিন।");
  }

  const sh = sheet_(KACP.REGISTRATION_SHEET);
  const matches = rows_(sh).filter(r =>
    clean_(r.Name).toLowerCase() === name &&
    normalizeMobile_(r.Mobile) === mobile
  );

  if (!matches.length) {
    return {
      success: false,
      message: "কোনো Registration পাওয়া যায়নি।"
    };
  }

  return {
    success: true,
    participant: {
      name: matches[0].Name,
      mobile: matches[0].Mobile,
      age: matches[0].Age,
      guardian: matches[0].Guardian || "",
      gender: matches[0].Gender || "",
      village: matches[0].Village || ""
    },
    registrations: matches.map(r => ({
      registrationNo: r["Registration No"],
      event: r.Event,
      date: r["Date & Time"]
    }))
  };
}

function updateRegistration_(b) {
  ensureSheets_();

  const name = clean_(b.name);
  const mobile = normalizeMobile_(b.mobile);

  if (!name || mobile.length < 10) {
    throw new Error("নাম ও মোবাইল নম্বর সঠিকভাবে দিন।");
  }

  const sh = sheet_(KACP.REGISTRATION_SHEET);
  const all = rows_(sh);

  const mine = all.filter(r =>
    clean_(r.Name).toLowerCase() === name.toLowerCase() &&
    normalizeMobile_(r.Mobile) === mobile
  );

  if (!mine.length) {
    throw new Error("Registration পাওয়া যায়নি।");
  }

  const selected = events_(b.events || b.event);

  if (!selected.length) {
    throw new Error("অন্তত একটি প্রতিযোগিতা নির্বাচন করুন।");
  }

  const mineRows = new Set(mine.map(r => r._row));
  const now = new Date();

  // Existing events are retained. New events are appended.
  const currentEvents = new Set(
    mine.map(r => clean_(r.Event))
  );

  const added = selected.filter(ev => !currentEvents.has(ev));

  added.forEach(ev => {
    const duplicate = all.some(r =>
      !mineRows.has(r._row) &&
      normalizeMobile_(r.Mobile) === mobile &&
      clean_(r.Name).toLowerCase() === name.toLowerCase() &&
      clean_(r.Event) === ev
    );

    if (!duplicate) {
      appendObject_(sh, {
        "Registration No": makeId_("REG"),
        "Name": name,
        "Mobile": mobile,
        "Age": Number(b.age || mine[0].Age),
        "Event": ev,
        "Date & Time": now,
        "Guardian": clean_(b.guardian || mine[0].Guardian),
        "Gender": clean_(b.gender || mine[0].Gender),
        "Village": clean_(b.village || mine[0].Village),
        "Registration Group ID": mine[0]["Registration Group ID"] || "",
        "Updated At": now
      });
    }
  });

  // Update participant information on all their existing rows.
  mine.forEach(r => {
    updateObject_(sh, r._row, {
      "Age": Number(b.age || r.Age),
      "Guardian": clean_(b.guardian || r.Guardian),
      "Gender": clean_(b.gender || r.Gender),
      "Village": clean_(b.village || r.Village),
      "Updated At": now
    });
  });

  audit_("Public", "updateRegistration", name, {
    addedEvents: added
  });

  return {
    success: true,
    message: "Registration updated",
    addedEvents: added
  };
}

/* =========================
   KYC / MEMBER APPLICATION
========================= */

function submitKYC_(b) {
  ensureSheets_();

  const name = clean_(b.name);
  const mobile = normalizeMobile_(b.mobile);

  if (!name || mobile.length < 10) {
    throw new Error("নাম ও মোবাইল নম্বর দিন।");
  }

  const id = makeId_("KYC");

  appendObject_(sheet_(KACP.KYC_SHEET), {
    "Application ID": id,
    "Name": name,
    "Mobile": mobile,
    "Member ID": clean_(b.memberId),
    "Document URL": clean_(b.documentUrl),
    "Status": "Pending",
    "Submitted At": new Date(),
    "Reviewed At": "",
    "Review Note": ""
  });

  audit_("Public", "KYC submitted", id, {});

  return {
    success: true,
    applicationId: id,
    status: "Pending"
  };
}

function submitNewMember_(b) {
  ensureSheets_();

  const name = clean_(b.name);
  const mobile = normalizeMobile_(b.mobile);

  if (!name || mobile.length < 10) {
    throw new Error("নাম ও মোবাইল নম্বর দিন।");
  }

  const id = makeId_("MEM");

  appendObject_(sheet_(KACP.MEMBERS_SHEET), {
    "Application ID": id,
    "Name": name,
    "Mobile": mobile,
    "Photo URL": clean_(b.photoUrl),
    "Status": "Pending",
    "Submitted At": new Date()
  });

  audit_("Public", "New member application", id, {});

  return {
    success: true,
    applicationId: id,
    status: "Pending"
  };
}

function reviewKYC_(b) {
  const id = clean_(b.applicationId);
  const status = clean_(b.status);

  if (!["Verified", "Rejected", "Pending"].includes(status)) {
    throw new Error("Invalid KYC status");
  }

  const sh = sheet_(KACP.KYC_SHEET);
  const record = rows_(sh).find(r =>
    clean_(r["Application ID"]) === id
  );

  if (!record) throw new Error("KYC application not found");

  updateObject_(sh, record._row, {
    "Status": status,
    "Reviewed At": new Date(),
    "Review Note": clean_(b.note)
  });

  audit_("Admin", "KYC review", id, {
    status: status
  });

  return {
    success: true,
    status: status
  };
}

function getApprovedMembers_() {
  const sh = sheet_(KACP.MEMBERS_SHEET);

  return {
    success: true,
    members: rows_(sh)
      .filter(r => clean_(r.Status) === "Approved")
      .map(r => ({
        name: r.Name,
        photoUrl: r["Photo URL"]
      }))
  };
}

/* =========================
   AUTHENTICATION
========================= */

function hashPassword_(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password),
    Utilities.Charset.UTF_8
  );

  return bytes.map(b => {
    const v = (b + 256) % 256;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function login_(b, role) {
  ensureSheets_();

  const username = clean_(b.username);
  const password = clean_(b.password);

  if (!username || !password) {
    throw new Error("Username ও password দিন।");
  }

  const users = rows_(sheet_(KACP.USERS_SHEET));

  const user = users.find(u =>
    clean_(u.Username) === username &&
    clean_(u.Role) === role &&
    String(u.Active).toLowerCase() !== "false" &&
    clean_(u["Password Hash"]) === hashPassword_(password)
  );

  if (!user) {
    throw new Error("Login failed");
  }

  const token = Utilities.getUuid() + Utilities.getUuid();
  const session = {
    userId: user["User ID"],
    name: user.Name,
    role: user.Role,
    events: clean_(user["Assigned Events"])
  };

  CacheService.getScriptCache().put(
    "KACP_SESSION_" + token,
    JSON.stringify(session),
    21600
  );

  audit_(username, role + " login", user["User ID"], {});

  return {
    success: true,
    token: token,
    user: session
  };
}

function requireRole_(token, allowedRoles) {
  token = clean_(token);

  if (!token) throw new Error("Authentication required");

  const raw = CacheService.getScriptCache().get(
    "KACP_SESSION_" + token
  );

  if (!raw) throw new Error("Session expired. Login again.");

  const session = JSON.parse(raw);

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Permission denied");
  }

  return session;
}

function logout_(b) {
  const token = clean_(b.token);

  if (token) {
    CacheService.getScriptCache().remove(
      "KACP_SESSION_" + token
    );
  }

  return { success: true };
}

function createUser_(b) {
  const role = clean_(b.role);
  const username = clean_(b.username);
  const password = clean_(b.password);

  if (!["admin", "judge", "controller"].includes(role)) {
    throw new Error("Invalid role");
  }

  if (!username || password.length < 10) {
    throw new Error("Username দিন এবং অন্তত ১০ অক্ষরের password ব্যবহার করুন।");
  }

  const sh = sheet_(KACP.USERS_SHEET);
  const duplicate = rows_(sh).some(u =>
    clean_(u.Username) === username
  );

  if (duplicate) throw new Error("Username already exists");

  const id = makeId_("USER");

  appendObject_(sh, {
    "User ID": id,
    "Name": clean_(b.name),
    "Username": username,
    "Password Hash": hashPassword_(password),
    "Role": role,
    "Assigned Events": events_(b.events).join("|"),
    "Active": true,
    "Created At": new Date()
  });

  audit_("Admin", "create user", id, { role: role });

  return {
    success: true,
    userId: id
  };
}

/* =========================
   CMS / NOTICES / GALLERY
========================= */

function getCMS_(p) {
  const sh = sheet_(KACP.CMS_SHEET);
  const data = {};

  rows_(sh).forEach(r => {
    data[clean_(r.Key)] = r.Value;
  });

  return {
    success: true,
    content: data
  };
}

function saveCMS_(b) {
  const key = clean_(b.key);

  if (!key) throw new Error("CMS key required");

  const sh = sheet_(KACP.CMS_SHEET);
  const existing = rows_(sh).find(r =>
    clean_(r.Key) === key
  );

  if (existing) {
    updateObject_(sh, existing._row, {
      "Value": b.value == null ? "" : String(b.value),
      "Updated At": new Date()
    });
  } else {
    appendObject_(sh, {
      "Key": key,
      "Value": b.value == null ? "" : String(b.value),
      "Updated At": new Date()
    });
  }

  audit_("Admin", "CMS update", key, {});

  return {
    success: true,
    key: key
  };
}

/* =========================
   CONTROLLER QUEUE
========================= */

function createQueue_(b) {
  const eventName = clean_(b.event);

  if (!eventName) throw new Error("Competition name required");

  const registrations = rows_(
    sheet_(KACP.REGISTRATION_SHEET)
  ).filter(r => clean_(r.Event) === eventName);

  if (!registrations.length) {
    throw new Error("এই প্রতিযোগিতায় কোনো participant নেই।");
  }

  const sessionId = makeId_("SESSION");
  const sh = sheet_(KACP.QUEUE_SHEET);

  // Preserve registration order from Sheet1.
  registrations.forEach((r, index) => {
    appendObject_(sh, {
      "Session ID": sessionId,
      "Event": eventName,
      "Position": index + 1,
      "Registration No": r["Registration No"],
      "Participant Name": r.Name,
      "Status": "Waiting",
      "Attempt": 1,
      "Updated At": new Date()
    });
  });

  audit_("Admin", "queue created", sessionId, {
    event: eventName,
    participants: registrations.length
  });

  return {
    success: true,
    sessionId: sessionId,
    total: registrations.length
  };
}

function getQueue_(p) {
  const sessionId = clean_(p.sessionId);

  if (!sessionId) throw new Error("Session ID required");

  const queue = rows_(sheet_(KACP.QUEUE_SHEET))
    .filter(r => clean_(r["Session ID"]) === sessionId)
    .sort((a, b) => Number(a.Position) - Number(b.Position));

  const current = queue.find(r => r.Status === "Present");
  const next = queue.find(r => r.Status === "Waiting");

  return {
    success: true,
    queue: queue,
    current: current || null,
    next: next || null
  };
}

function controllerAction_(b) {
  const session = requireRole_(
    b.token,
    ["admin", "controller"]
  );

  const sessionId = clean_(b.sessionId);
  const registrationNo = clean_(b.registrationNo);
  const action = clean_(b.controllerAction);

  const sh = sheet_(KACP.QUEUE_SHEET);
  const queue = rows_(sh).filter(r =>
    clean_(r["Session ID"]) === sessionId
  );

  const participant = queue.find(r =>
    clean_(r["Registration No"]) === registrationNo
  );

  if (!participant) throw new Error("Participant not found");

  const now = new Date();
  let newStatus = "";

  if (action === "present") {
    if (participant.Status !== "Waiting" &&
        participant.Status !== "Repeated") {
      throw new Error("Participant is not waiting");
    }
    newStatus = "Present";

  } else if (action === "absent") {
    if (participant.Status !== "Waiting") {
      throw new Error("Only waiting participant can be absent");
    }
    newStatus = "Absent";

  } else if (action === "repeat") {
    if (participant.Status !== "Absent") {
      throw new Error("Only absent participant can be repeated");
    }
    if (Number(participant.Attempt) >= 2) {
      throw new Error("Repeat already used");
    }
    newStatus = "Repeated";

  } else if (action === "next") {
    if (participant.Status !== "Present") {
      throw new Error("Current participant is not present");
    }
    newStatus = "Completed";

  } else {
    throw new Error("Invalid controller action");
  }

  updateObject_(sh, participant._row, {
    "Status": newStatus,
    "Attempt": action === "repeat"
      ? Number(participant.Attempt) + 1
      : participant.Attempt,
    "Updated At": now
  });

  audit_(session.userId, "controller " + action,
    registrationNo, {
      sessionId: sessionId,
      oldStatus: participant.Status,
      newStatus: newStatus
    });

  return {
    success: true,
    status: newStatus
  };
}

/* =========================
   JUDGING / SCORES
========================= */

function submitScore_(b) {
  const judge = requireRole_(b.token, ["judge"]);

  const sessionId = clean_(b.sessionId);
  const registrationNo = clean_(b.registrationNo);
  const eventName = clean_(b.event);
  const score = Number(b.score);

  const min = Number(b.minScore == null ? 0 : b.minScore);
  const max = Number(b.maxScore == null ? 100 : b.maxScore);

  if (!Number.isFinite(score) || score < min || score > max) {
    throw new Error("Score সীমার বাইরে।");
  }

  const assigned = events_(judge.events);

  if (!assigned.includes(eventName)) {
    throw new Error("এই প্রতিযোগিতায় আপনার অনুমতি নেই।");
  }

  const queue = rows_(sheet_(KACP.QUEUE_SHEET));

  const participant = queue.find(r =>
    clean_(r["Session ID"]) === sessionId &&
    clean_(r["Registration No"]) === registrationNo
  );

  if (!participant || participant.Status !== "Present") {
    throw new Error("Controller Present না করা পর্যন্ত score দেওয়া যাবে না।");
  }

  const scoreSheet = sheet_(KACP.SCORES_SHEET);
  const oldScore = rows_(scoreSheet).find(r =>
    clean_(r["Session ID"]) === sessionId &&
    clean_(r["Registration No"]) === registrationNo &&
    clean_(r["Judge ID"]) === clean_(judge.userId) &&
    clean_(r.Status) === "Submitted"
  );

  if (oldScore) {
    throw new Error("আপনি ইতিমধ্যে এই participant-এর score জমা দিয়েছেন।");
  }

  const scoreId = makeId_("SCORE");

  appendObject_(scoreSheet, {
    "Score ID": scoreId,
    "Session ID": sessionId,
    "Event": eventName,
    "Registration No": registrationNo,
    "Participant Name": participant["Participant Name"],
    "Judge ID": judge.userId,
    "Score": score,
    "Submitted At": new Date(),
    "Status": "Submitted"
  });

  audit_(judge.userId, "score submitted", registrationNo, {
    score: score,
    event: eventName
  });

  return {
    success: true,
    scoreId: scoreId
  };
}

function getLiveScores_(p) {
  const sessionId = clean_(p.sessionId);

  const scores = rows_(sheet_(KACP.SCORES_SHEET))
    .filter(r =>
      clean_(r["Session ID"]) === sessionId &&
      clean_(r.Status) === "Submitted"
    );

  const grouped = {};

  scores.forEach(s => {
    const id = clean_(s["Registration No"]);

    if (!grouped[id]) {
      grouped[id] = {
        registrationNo: id,
        name: s["Participant Name"],
        scores: [],
        total: 0
      };
    }

    grouped[id].scores.push(Number(s.Score));
    grouped[id].total += Number(s.Score);
  });

  return {
    success: true,
    participants: Object.values(grouped)
  };
}

function publishResults_(b) {
  const sessionId = clean_(b.sessionId);

  const queue = rows_(sheet_(KACP.QUEUE_SHEET))
    .filter(r => clean_(r["Session ID"]) === sessionId);

  const pending = queue.some(r =>
    ["Waiting", "Present", "Repeated"].includes(
      clean_(r.Status)
    )
  );

  if (pending) {
    throw new Error("Queue শেষ না হওয়া পর্যন্ত ফলাফল প্রকাশ করা যাবে না।");
  }

  const scores = rows_(sheet_(KACP.SCORES_SHEET))
    .filter(r =>
      clean_(r["Session ID"]) === sessionId &&
      clean_(r.Status) === "Submitted"
    );

  const totals = {};

  scores.forEach(s => {
    const id = clean_(s["Registration No"]);

    if (!totals[id]) {
      totals[id] = {
        id: id,
        name: s["Participant Name"],
        total: 0,
        judgeCount: 0
      };
    }

    totals[id].total += Number(s.Score);
    totals[id].judgeCount++;
  });

  const resultRows = Object.values(totals)
    .sort((a, b) => b.total - a.total);

  if (!resultRows.length) {
    throw new Error("কোনো score জমা পড়েনি।");
  }

  const sh = sheet_(KACP.RESULTS_SHEET);
  const eventName = queue.length ? queue[0].Event : "";

  resultRows.forEach((r, index) => {
    appendObject_(sh, {
      "Session ID": sessionId,
      "Event": eventName,
      "Registration No": r.id,
      "Participant Name": r.name,
      "Total Score": r.total,
      "Rank": index + 1,
      "Status": "Published",
      "Published At": new Date(),
      "Tie Note": ""
    });
  });

  audit_("Admin", "results published", sessionId, {
    participants: resultRows.length
  });

  return {
    success: true,
    results: resultRows
  };
}

function getResults_(p) {
  const eventName = clean_(p.event);
  const sessionId = clean_(p.sessionId);

  let result = rows_(sheet_(KACP.RESULTS_SHEET))
    .filter(r => clean_(r.Status) === "Published");

  if (eventName) {
    result = result.filter(r => clean_(r.Event) === eventName);
  }

  if (sessionId) {
    result = result.filter(r => clean_(r["Session ID"]) === sessionId);
  }

  return {
    success: true,
    results: result
  };
}

function resolveTie_(b) {
  const sessionId = clean_(b.sessionId);
  const registrationNo = clean_(b.registrationNo);
  const newRank = Number(b.rank);
  const reason = clean_(b.reason);

  if (!registrationNo || !newRank || !reason) {
    throw new Error("Participant, rank ও কারণ দিতে হবে।");
  }

  const sh = sheet_(KACP.RESULTS_SHEET);
  const r = rows_(sh).find(x =>
    clean_(x["Session ID"]) === sessionId &&
    clean_(x["Registration No"]) === registrationNo
  );

  if (!r) throw new Error("Result not found");

  updateObject_(sh, r._row, {
    "Rank": newRank,
    "Tie Note": reason
  });

  audit_("Admin", "tie resolved", registrationNo, {
    rank: newRank,
    reason: reason
  });

  return { success: true };
}

/* =========================
   ADMIN DASHBOARD
========================= */

function getDashboard_() {
  const registrations = rows_(
    sheet_(KACP.REGISTRATION_SHEET)
  );

  const kycs = rows_(sheet_(KACP.KYC_SHEET));
  const members = rows_(sheet_(KACP.MEMBERS_SHEET));

  return {
    success: true,
    registrationCount: registrations.length,
    participantCount: new Set(
      registrations.map(r => normalizeMobile_(r.Mobile))
    ).size,
    kycPending: kycs.filter(r => r.Status === "Pending").length,
    memberPending: members.filter(r => r.Status === "Pending").length
  };
}

/* =========================
   AUDIT LOG
========================= */

function audit_(actor, action, reference, details) {
  try {
    const sh = sheet_(KACP.AUDIT_SHEET);

    appendObject_(sh, {
      "Timestamp": new Date(),
      "Actor": clean_(actor),
      "Role": "",
      "Action": clean_(action),
      "Reference": clean_(reference),
      "Details": JSON.stringify(details || {})
    });

  } catch (err) {
    console.error("Audit error: " + err.message);
  }
}

/* =========================
   UTILITIES
========================= */

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  const raw = e.postData.contents;

  try {
    return JSON.parse(raw);
  } catch (_) {
    return e.parameter || {};
  }
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
