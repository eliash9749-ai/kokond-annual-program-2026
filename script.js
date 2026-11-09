/* KACP 2026 - Main JavaScript */

const API_URL = ""; // Apps Script Deploy করার পর এখানে URL বসবে।

const COMPETITIONS = [
  "ম্যারাথন দৌড়",
  "চেয়ার দখল",
  "চোখে দেখে মুখে বলো",
  "কিরাত",
  "আজান",
  "কবিতা আবৃত্তি",
  "গজল",
  "হাঁসধরা"
];

const $ = id => document.getElementById(id);

function showMessage(id, message, success = false) {
  const element = $(id);
  if (!element) return;
  element.textContent = message;
  element.style.color = success ? "#16834a" : "#c0392b";
}

async function api(action, data = {}) {
  if (!API_URL) {
    throw new Error("ওয়েবসাইটের Backend এখনো সংযুক্ত করা হয়নি।");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...data })
  });

  if (!response.ok) throw new Error("সার্ভারের সঙ্গে যোগাযোগ করা যাচ্ছে না।");

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "কাজটি সম্পন্ন হয়নি।");
  }

  return result;
}

/* Mobile Navigation */

$("menuToggle")?.addEventListener("click", () => {
  $("mainNav")?.classList.toggle("open");
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    $("mainNav")?.classList.remove("open");
  });
});

/* Competition List */

function renderCompetitions() {
  const list = $("competitionList");
  const checkboxes = $("registrationEvents");

  if (list) {
    list.innerHTML = COMPETITIONS.map((name, index) => `
      <article class="competition-card">
        <h3>${name}</h3>
        <p>২০২৬ সালের প্রতিযোগিতায় অংশগ্রহণ করুন।</p>
        <a class="btn btn-primary" href="#registration"
           onclick="selectCompetition(${index})">নিবন্ধন করুন</a>
      </article>
    `).join("");
  }

  if (checkboxes) {
    checkboxes.innerHTML = COMPETITIONS.map((name, index) => `
      <label>
        <input type="checkbox" name="events"
               value="${name}" id="event-${index}">
        ${name}
      </label>
    `).join("");
  }
}

function selectCompetition(index) {
  const checkbox = $("event-" + index);
  if (checkbox) checkbox.checked = true;
}

/* Registration */

$("registrationForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());

  data.events = [...form.querySelectorAll(
    'input[name="events"]:checked'
  )].map(input => input.value);

  if (!data.events.length) {
    showMessage("registrationMessage", "অন্তত একটি প্রতিযোগিতা নির্বাচন করুন।");
    return;
  }

  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  button.textContent = "জমা হচ্ছে...";

  try {
    const result = await api("registration", data);
    showMessage(
      "registrationMessage",
      result.message || "নিবন্ধন সফল হয়েছে।",
      true
    );
    form.reset();
  } catch (error) {
    showMessage("registrationMessage", error.message);
  } finally {
    button.disabled = false;
    button.textContent = "নিবন্ধন জমা দিন";
  }
});

/* Member Login */

$("memberLoginForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.currentTarget).entries());

  try {
    const result = await api("lookupRegistration", data);
    $("memberDashboard").hidden = false;
    $("memberDetails").textContent = JSON.stringify(result.data, null, 2);
    showMessage("memberLoginMessage", "লগইন সফল হয়েছে।", true);
  } catch (error) {
    showMessage("memberLoginMessage", error.message);
  }
});

/* Admin Login */

$("adminLoginForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.currentTarget).entries());

  try {
    const result = await api("adminLogin", data);
    $("adminDashboard").hidden = false;
    $("adminDashboardContent").textContent =
      result.message || "Admin Dashboard";
    showMessage("adminLoginMessage", "লগইন সফল হয়েছে।", true);
  } catch (error) {
    showMessage("adminLoginMessage", error.message);
  }
});

/* KYC Submission */

$("kycForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  showMessage("kycMessage",
    "KYC Backend সংযুক্ত হলে নথি জমা দেওয়া যাবে।");
});

/* New Member Application */

$("newMemberForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  showMessage("newMemberMessage",
    "Member Application Backend সংযুক্ত হলে আবেদন জমা দেওয়া যাবে।");
});

/* Judge Login */

$("judgeLoginForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.currentTarget).entries());

  try {
    const result = await api("judgeLogin", data);
    $("judgeWorkspace").hidden = false;
    $("judgeWorkspace").textContent =
      result.message || "Judge Workspace";
    showMessage("judgeLoginMessage", "লগইন সফল হয়েছে।", true);
  } catch (error) {
    showMessage("judgeLoginMessage", error.message);
  }
});

/* Initial Load */

document.addEventListener("DOMContentLoaded", () => {
  renderCompetitions();
});
