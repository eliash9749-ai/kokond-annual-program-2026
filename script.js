
/************************************************************
 KOKOND ANNUAL PROGRAM 2026
 COMPLETE FRONTEND JAVASCRIPT V5

 Compatible with:
 - index.html V5
 - Code.gs V5

 Features:
 Registration | Multiple Events | Certificates
 Schedule | Committee | KYC | Donations | Countdown
************************************************************/


/* =========================================================
   1. API CONFIGURATION
========================================================= */

const API_URL =
  'https://script.google.com/macros/s/AKfycbypbMWRELyljKzlsaQntvjoFJhbz7gsSpGPXi18lJ_E5NHJdFRksykrMzGnQItMkYkt/exec';


/* =========================================================
   2. COMPETITION DATA
========================================================= */

const games = [
  ['marathon', 'ম্যারাথন দৌড়', '৩০ ডিসেম্বর', '১০:০০ AM'],
  ['football', 'মাথাখোরা ফুটবল', '৩০ ডিসেম্বর', '১১:০০ AM'],
  ['chairs', 'চেয়ার দখলের লড়াই', '৩০ ডিসেম্বর', '০১:৪৫ PM'],
  ['countdown', '১০০ থেকে ১ পর্যন্ত বলা', '৩০ ডিসেম্বর', '০৩:০০ PM'],
  ['see-say', 'চোখে দেখে মুখে বলো', '৩০ ডিসেম্বর', '০৪:০০ PM'],
  ['cook', 'কে সেরা রাঁধুনি', '৩০ ডিসেম্বর', '০৫:০০ PM'],
  ['qirat', 'কেরাত প্রতিযোগিতা', '৩০ ডিসেম্বর', '০৬:০০ PM'],
  ['arabic', 'আরবি হরফ সাজাও', '৩০ ডিসেম্বর', '০৭:০০ PM'],
  ['azan', 'আজান প্রতিযোগিতা', '৩০ ডিসেম্বর', '০৮:০০ PM'],

  ['pot', 'হাঁড়ি ভাঙা', '৩১ ডিসেম্বর', '০৯:০০ AM'],
  ['poetry', 'কবিতা আবৃত্তি', '৩১ ডিসেম্বর', '১০:০০ AM'],
  ['cricket', 'ক্রিকেট টুর্নামেন্ট', '৩১ ডিসেম্বর', 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'],
  ['tug', 'দড়ি টানাটানি', '৩১ ডিসেম্বর', '১২:০০ PM'],
  ['duck', 'হাঁসধরা', '৩১ ডিসেম্বর', 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'],
  ['freeze', 'গজল থামলেই স্থির', '৩১ ডিসেম্বর', 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'],
  ['throw', 'বল ছোঁড়া', '৩১ ডিসেম্বর', '০৩:০০ PM'],
  ['ghazal', 'গজল আবৃত্তি', '৩১ ডিসেম্বর', '০৪:০০ PM'],
  ['speech', 'বক্তৃতা প্রতিযোগিতা', '৩১ ডিসেম্বর', '০৫:০০ PM']
];


/* =========================================================
   3. ELIGIBILITY DATA
========================================================= */

const WOMEN_ONLY_EVENTS = [
  'চেয়ার দখলের লড়াই',
  'কে সেরা রাঁধুনি'
];

const BOYS_ONLY_EVENTS = [
  'আজান প্রতিযোগিতা',
  'ক্রিকেট টুর্নামেন্ট',
  'দড়ি টানাটানি',
  'হাঁসধরা'
];

const BEST_COOK_EVENT = 'কে সেরা রাঁধুনি';


/* =========================================================
   4. INITIAL COMMITTEE MEMBERS
========================================================= */

const initialMembers = [
  'হাসিকুল মহম্মদ সেক',
  'সমির আলি খান',
  'ফারদিন আক্তার মল্লিক',
  'ইব্রাহিম মল্লিক',
  'সুরোজ মণ্ডল',
  'মিজানুর খন্দকার',
  'রোহিত খান',
  'আজাম আলি খান',
  'ইয়ানুর মণ্ডল',
  'সিরাজুদ্দিন খান',
  'আলমগীর মল্লিক',
  'রিয়াজ খান',
  'ইশা খান',
  'জাহির খান',
  'সাহিদ মল্লিক',
  'সামিম মল্লিক',
  'রাজিবুল খান',
  'আরিফ খান',
  'আসলাম খান',
  'আব্দুল্লা খান',
  'রফিকুল খান',
  'শাহিন খান',
  'মনিরুল ইসলাম খান',
  'বিল্লাল সেক',
  'সুরোজ শা',
  'সারবিন মল্লিক'
];


/* =========================================================
   5. COMMON HELPERS
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showMessage(element, message, type = 'info') {
  if (!element) return;

  element.textContent = message;
  element.className = 'registration-message ' + type;
}

function formatMoney(value) {
  return '₹' + Number(value || 0).toLocaleString('en-IN');
}

function apiPost(data) {
  const body = new URLSearchParams();

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (Array.isArray(value)) {
      value.forEach(item => body.append(key, item));
    } else {
      body.append(key, value == null ? '' : value);
    }
  });

  return fetch(API_URL, {
    method: 'POST',
    body: body
  }).then(async response => {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি।');
    }
  });
}

function apiGet(action) {
  const url = API_URL + '?action=' + encodeURIComponent(action);

  return fetch(url, {
    method: 'GET',
    cache: 'no-store'
  }).then(async response => {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('তথ্য লোড করা যায়নি।');
    }
  });
}


/* =========================================================
   6. COMPETITION CARDS
========================================================= */

function renderGames() {
  const grid = getElement('gameGrid');

  if (!grid) return;

  grid.innerHTML = '';

  games.forEach((game, index) => {
    const id = game[0];
    const name = game[1];
    const date = game[2];
    const time = game[3];

    const isTBA = time.includes('অনুষ্ঠানের দিন');

    const card = document.createElement('div');

    card.className = 'game-card';

    card.innerHTML = `
      <div class="game-number">
        ${String(index + 1).padStart(2, '0')}
      </div>

      <div class="game-card-content">
        <h3>${escapeHTML(name)}</h3>

        <p class="game-date">
          ${escapeHTML(date)} ২০২৬
        </p>

        <p class="game-time">
          ${isTBA
            ? escapeHTML(time)
            : 'সময়: ' + escapeHTML(time)}
        </p>
      </div>
    `;

    grid.appendChild(card);
  });
}


/* =========================================================
   7. REGISTRATION CHECKBOXES
========================================================= */

function renderEventCheckboxes() {
  const container = getElement('eventChecks');

  if (!container) return;

  container.innerHTML = '';

  games.forEach(game => {
    const eventName = game[1];
    const eventId = game[0];

    const wrapper = document.createElement('label');

    wrapper.className = 'event-option';

    wrapper.innerHTML = `
      <input
        type="checkbox"
        name="events"
        value="${escapeHTML(eventName)}"
        id="event-${escapeHTML(eventId)}"
      >

      <span>${escapeHTML(eventName)}</span>
    `;

    container.appendChild(wrapper);
  });
}


/* =========================================================
   8. SCHEDULE
========================================================= */

function renderSchedule() {
  const day1 = getElement('day1');
  const day2 = getElement('day2');

  if (!day1 || !day2) return;

  day1.innerHTML = '';
  day2.innerHTML = '';

  const firstDayEvents = games.slice(0, 9);
  const secondDayEvents = games.slice(9);

  const day1Opening = [
    {
      name: 'অনুষ্ঠানের উদ্বোধন',
      time: 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'
    }
  ];

  const day2Special = [
    {
      name: 'বিশেষ Quiz প্রতিযোগিতা',
      time: 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'
    },
    {
      name: 'আল্লাহু আল্লাহু পরিবেশনা',
      time: 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'
    },
    {
      name: 'পুরস্কার বিতরণী',
      time: 'সময় অনুষ্ঠানের দিন প্রকাশ করা হবে'
    },
    {
      name: 'বিশেষ বক্তব্য — পিরজাদা উজায়ের সিদ্দিকী',
      time: 'রাত ১০টা থেকে ১২টা'
    }
  ];

  [...day1Opening, ...firstDayEvents.map(g => ({
    name: g[1],
    time: g[3]
  }))].forEach(item => {
    day1.appendChild(createScheduleItem(item));
  });

  [...secondDayEvents.map(g => ({
    name: g[1],
    time: g[3]
  })), ...day2Special].forEach(item => {
    day2.appendChild(createScheduleItem(item));
  });
}

function createScheduleItem(item) {
  const div = document.createElement('div');

  div.className = 'schedule-item';

  const timeIsTBA = String(item.time).includes('অনুষ্ঠানের দিন');

  div.innerHTML = `
    <div class="schedule-time">
      ${timeIsTBA
        ? 'সময় পরে ঘোষণা করা হবে'
        : escapeHTML(item.time)}
    </div>

    <div class="schedule-event">
      ${escapeHTML(item.name)}
    </div>
  `;

  return div;
}


/* =========================================================
   9. REGISTRATION FORM
========================================================= */

function getSelectedEvents() {
  return Array.from(
    document.querySelectorAll('#eventChecks input[name="events"]:checked')
  ).map(input => input.value);
}

function validateRegistration(data) {
  if (!data.name.trim()) {
    return 'অংশগ্রহণকারীর নাম লিখুন।';
  }

  if (!/^[0-9]{10}$/.test(data.mobile)) {
    return 'সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।';
  }

  if (!data.guardianName.trim()) {
    return 'অভিভাবকের নাম লিখুন।';
  }

  if (!data.village.trim()) {
    return 'গ্রামের নাম লিখুন।';
  }

  const age = Number(data.age);

  if (!Number.isInteger(age) || age < 1 || age > 100) {
    return 'সঠিক বয়স লিখুন।';
  }

  if (!data.gender) {
    return 'লিঙ্গ নির্বাচন করুন।';
  }

  if (age < 18 && !data.guardianConsent) {
    return '১৮ বছরের কম বয়সীদের অভিভাবকের সম্মতি আবশ্যক।';
  }

  if (!data.events.length) {
    return 'কমপক্ষে একটি প্রতিযোগিতা নির্বাচন করুন।';
  }

  if (data.events.length > 18) {
    return 'সর্বোচ্চ ১৮টি প্রতিযোগিতা নির্বাচন করতে পারবেন।';
  }

  for (const event of data.events) {
    if (
      WOMEN_ONLY_EVENTS.includes(event) &&
      data.gender !== 'মহিলা'
    ) {
      return event + ' শুধুমাত্র মহিলাদের জন্য।';
    }

    if (
      BOYS_ONLY_EVENTS.includes(event) &&
      data.gender !== 'পুরুষ'
    ) {
      return event + ' শুধুমাত্র ছেলেদের জন্য।';
    }
  }

  return '';
}


function displayCertificates(registrations) {
  const container = getElement('certificateLinks');

  if (!container) return;

  container.innerHTML = '';

  if (!registrations || !registrations.length) return;

  const heading = document.createElement('h3');
  heading.textContent = 'আপনার নিবন্ধন সম্পন্ন হয়েছে';

  container.appendChild(heading);

  const description = document.createElement('p');
  description.textContent =
    'প্রতিটি প্রতিযোগিতার জন্য আলাদা Registration ID এবং Certificate PDF নিচে দেওয়া হলো।';

  container.appendChild(description);

  registrations.forEach(reg => {
    const card = document.createElement('div');

    card.className = 'certificate-card';

    const name = document.createElement('strong');
    name.textContent = reg.event;

    const id = document.createElement('p');
    id.textContent = 'Registration ID: ' + reg.registrationNo;

    card.appendChild(name);
    card.appendChild(id);

    if (reg.certificateUrl) {
      const link = document.createElement('a');

      link.href = reg.certificateUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Certificate PDF খুলুন / Download করুন';

      card.appendChild(link);
    } else {
      const warning = document.createElement('p');

      warning.textContent =
        'Certificate তৈরি করা যায়নি। আপনার Registration ID সংরক্ষণ করুন।';

      card.appendChild(warning);
    }

    container.appendChild(card);
  });
}


function setupRegistration() {
  const form = getElement('registrationForm');

  if (!form) return;

  const ageInput = getElement('participantAge');
  const consentBox = getElement('guardianConsentBox');
  const consentInput = getElement('guardianConsent');
  const genderInput = getElement('participantGender');

  // Under 18 consent field visibility
  function updateConsentVisibility() {
    const age = Number(ageInput.value);

    if (consentBox) {
      consentBox.style.display = age > 0 && age < 18 ? 'block' : 'none';
    }

    if (consentInput && (age >= 18 || !age)) {
      consentInput.checked = false;
    }
  }

  if (ageInput) {
    ageInput.addEventListener('input', updateConsentVisibility);
    updateConsentVisibility();
  }

  // Clear selection warning when gender changes
  if (genderInput) {
    genderInput.addEventListener('change', function () {
      const gender = genderInput.value;

      document.querySelectorAll('#eventChecks input:checked')
        .forEach(input => {
          const event = input.value;

          if (
            (WOMEN_ONLY_EVENTS.includes(event) && gender !== 'মহিলা') ||
            (BOYS_ONLY_EVENTS.includes(event) && gender !== 'পুরুষ')
          ) {
            input.checked = false;
          }
        });
    });
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const message = getElement('regMsg');
    const button = getElement('registrationSubmit');
    const certificateContainer = getElement('certificateLinks');

    if (certificateContainer) {
      certificateContainer.innerHTML = '';
    }

    const data = {
      name: getElement('participantName').value.trim(),
      mobile: getElement('participantMobile').value.trim(),
      guardianName: getElement('guardianName').value.trim(),
      age: getElement('participantAge').value,
      village: getElement('participantVillage').value.trim(),
      gender: getElement('participantGender').value,
      guardianConsent: getElement('guardianConsent').checked,
      events: getSelectedEvents()
    };

    const validationError = validateRegistration(data);

    if (validationError) {
      showMessage(message, validationError, 'error');
      return;
    }

    const declaration = getElement('registrationDeclaration');

    if (!declaration || !declaration.checked) {
      showMessage(
        message,
        'নিবন্ধনের আগে ঘোষণায় সম্মতি দিন।',
        'error'
      );
      return;
    }

    const confirmation = confirm(
      'আপনি কি নিচের তথ্য দিয়ে নিবন্ধন সম্পন্ন করতে চান?\n\n' +
      'নাম: ' + data.name + '\n' +
      'মোবাইল: ' + data.mobile + '\n' +
      'প্রতিযোগিতা: ' + data.events.join(', ') + '\n\n' +
      'নিবন্ধনের পর তথ্য পরিবর্তন করা যাবে না।'
    );

    if (!confirmation) return;

    button.disabled = true;
    button.textContent = 'নিবন্ধন হচ্ছে...';

    showMessage(
      message,
      'আপনার নিবন্ধন প্রক্রিয়াধীন। অনুগ্রহ করে অপেক্ষা করুন...',
      'info'
    );

    try {
      const response = await apiPost({
        action: 'registration',
        name: data.name,
        mobile: data.mobile,
        guardianName: data.guardianName,
        age: data.age,
        village: data.village,
        gender: data.gender,
        guardianConsent: data.guardianConsent ? 'yes' : 'no',
        events: data.events
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'নিবন্ধন সম্পন্ন হয়নি।');
      }

      showMessage(
        message,
        response.message || 'নিবন্ধন সফল হয়েছে।',
        'success'
      );

      displayCertificates(response.registrations);

      if (response.bestCookNotice) {
        const notice = document.createElement('p');
        notice.className = 'best-cook-notice';
        notice.textContent = response.bestCookNotice;

        if (certificateContainer) {
          certificateContainer.appendChild(notice);
        }
      }

      // Clear form only after successful registration
      form.reset();
      updateConsentVisibility();

    } catch (error) {
      showMessage(
        message,
        error.message || 'নিবন্ধন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        'error'
      );

    } finally {
      button.disabled = false;
      button.textContent = 'নিবন্ধন সম্পন্ন করুন';
    }
  });
}


/* =========================================================
   10. COMMITTEE MEMBERS
========================================================= */

function renderInitialMembers() {
  const grid = getElement('committeeGrid');

  if (!grid) return;

  grid.innerHTML = '';

  initialMembers.forEach((name, index) => {
    const card = document.createElement('div');

    card.className = 'committee-card';

    card.innerHTML = `
      <div class="committee-avatar">
        ${escapeHTML(name.charAt(0))}
      </div>

      <h3>${escapeHTML(name)}</h3>

      <p>কমিটির সদস্য</p>
    `;

    if (index === 0) {
      card.classList.add('featured-member');
    }

    grid.appendChild(card);
  });

  const manager = document.createElement('div');

  manager.className = 'committee-card featured-member';

  manager.innerHTML = `
    <div class="committee-avatar">E</div>
    <h3>Eliash Khan</h3>
    <p>Program Manager</p>
  `;

  grid.prepend(manager);
}


async function loadApprovedMembers() {
  try {
    const response = await apiGet('members');

    if (
      response.status !== 'success' ||
      !Array.isArray(response.members)
    ) {
      return;
    }

    const grid = getElement('committeeGrid');

    if (!grid) return;

    response.members.forEach(member => {
      const exists = Array.from(
        grid.querySelectorAll('h3')
      ).some(h => h.textContent.trim() === member.name);

      if (exists) return;

      const card = document.createElement('div');

      card.className = 'committee-card';

      if (member.photoUrl) {
        const image = document.createElement('img');

        image.src = member.photoUrl;
        image.alt = member.name;
        image.loading = 'lazy';

        card.appendChild(image);
      } else {
        const avatar = document.createElement('div');

        avatar.className = 'committee-avatar';
        avatar.textContent = member.name.charAt(0);

        card.appendChild(avatar);
      }

      const heading = document.createElement('h3');
      heading.textContent = member.name;

      const role = document.createElement('p');
      role.textContent = member.role || 'কমিটির সদস্য';

      card.appendChild(heading);
      card.appendChild(role);

      grid.appendChild(card);
    });

  } catch (error) {
    console.warn('Committee loading failed:', error);
  }
}


/* =========================================================
   11. MODAL SYSTEM
========================================================= */

function openModal(content) {
  const modal = getElement('modal');
  const body = getElement('modalBody');

  if (!modal || !body) return;

  body.innerHTML = content;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = getElement('modal');

  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function setupModal() {
  const modal = getElement('modal');
  const closeButton = getElement('modalClose');

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}


/* =========================================================
   12. KYC / NEW MEMBER FORM
========================================================= */

function openMemberForm(type) {
  const isKYC = type === 'kyc';

  const title = isKYC
    ? 'KYC তথ্য সম্পূর্ণ করুন'
    : 'নতুন সদস্য হওয়ার আবেদন';

  const content = `
    <h2>${title}</h2>

    <form id="memberRequestForm">

      <div class="form-group">
        <label for="memberName">সম্পূর্ণ নাম *</label>

        <input
          type="text"
          id="memberName"
          name="memberName"
          required
          placeholder="আপনার নাম"
        >
      </div>

      <div class="form-group">
        <label for="memberMobile">মোবাইল নম্বর *</label>

        <input
          type="tel"
          id="memberMobile"
          name="mobile"
          maxlength="10"
          pattern="[0-9]{10}"
          required
          placeholder="১০ সংখ্যার মোবাইল নম্বর"
        >
      </div>

      <div class="form-group">
        <label for="memberPhoto">ছবি আপলোড করুন *</label>

        <input
          type="file"
          id="memberPhoto"
          accept="image/jpeg,image/png,image/webp"
          required
        >

        <small>সর্বোচ্চ ৩ MB। JPG, PNG অথবা WEBP।</small>
      </div>

      <button type="submit" id="memberSubmit" class="btn btn-primary">
        আবেদন জমা দিন
      </button>

      <div id="memberMsg" class="registration-message"></div>

    </form>
  `;

  openModal(content);

  const form = getElement('memberRequestForm');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = getElement('memberName').value.trim();
    const mobile = getElement('memberMobile').value.trim();
    const file = getElement('memberPhoto').files[0];

    const msg = getElement('memberMsg');
    const button = getElement('memberSubmit');

    if (!name) {
      showMessage(msg, 'নাম লিখুন।', 'error');
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      showMessage(msg, 'সঠিক মোবাইল নম্বর দিন।', 'error');
      return;
    }

    if (!file) {
      showMessage(msg, 'ছবি নির্বাচন করুন।', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showMessage(msg, 'ছবির আকার ৩ MB-এর বেশি হতে পারবে না।', 'error');
      return;
    }

    button.disabled = true;
    button.textContent = 'জমা হচ্ছে...';

    try {
      const base64 = await readFileAsBase64(file);

      const response = await apiPost({
        action: type,
        memberName: name,
        mobile: mobile,
        photoBase64: base64,
        photoType: file.type
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'আবেদন জমা হয়নি।');
      }

      showMessage(
        msg,
        'আবেদন সফলভাবে জমা হয়েছে। পরিচালকের অনুমোদনের জন্য অপেক্ষা করুন।',
        'success'
      );

      form.reset();

    } catch (error) {
      showMessage(
        msg,
        error.message || 'আবেদন জমা দিতে সমস্যা হয়েছে।',
        'error'
      );

    } finally {
      button.disabled = false;
      button.textContent = 'আবেদন জমা দিন';
    }
  });
}


function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function () {
      const result = String(reader.result);
      const base64 = result.split(',')[1];

      if (!base64) {
        reject(new Error('ছবি পড়া যায়নি।'));
        return;
      }

      resolve(base64);
    };

    reader.onerror = function () {
      reject(new Error('ছবি পড়তে সমস্যা হয়েছে।'));
    };

    reader.readAsDataURL(file);
  });
}


/* =========================================================
   13. COMMITTEE BUTTONS
========================================================= */

function setupCommitteeButtons() {
  const joinButton = getElement('joinCommitteeBtn');

  if (joinButton) {
    joinButton.addEventListener('click', function () {
      openMemberForm('newMember');
    });
  }

  // Delegated KYC button support
  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-kyc]');

    if (button) {
      openMemberForm('kyc');
    }
  });
}


/* =========================================================
   14. DONATIONS
========================================================= */

async function loadDonations() {
  try {
    const response = await apiGet('donations');

    if (response.status !== 'success') return;

    const summary = response.summary || {};

    const promised = Number(summary.promised || 0);
    const paid = Number(summary.paid || 0);
    const due = Number(summary.due || 0);

    const promisedElement = getElement('totalPromised');
    const paidElement = getElement('totalPaid');
    const dueElement = getElement('totalDue');

    if (promisedElement) {
      promisedElement.textContent = formatMoney(promised);
    }

    if (paidElement) {
      paidElement.textContent = formatMoney(paid);
    }

    if (dueElement) {
      dueElement.textContent = formatMoney(due);
    }

    renderDonationList(response.donations || []);

  } catch (error) {
    console.warn('Donation data could not be loaded:', error);
  }
}


function renderDonationList(donations) {
  const container = getElement('donationList');

  if (!container) return;

  container.innerHTML = '';

  if (!donations.length) {
    container.textContent = 'এখনও কোনো তথ্য পাওয়া যায়নি।';
    return;
  }

  const table = document.createElement('table');

  table.innerHTML = `
    <thead>
      <tr>
        <th>নাম</th>
        <th>প্রতিশ্রুত অর্থ</th>
        <th>অবস্থা</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  donations.forEach(item => {
    const tr = document.createElement('tr');

    const name = document.createElement('td');
    name.textContent = item.name || '';

    const amount = document.createElement('td');
    amount.textContent = formatMoney(item.amount);

    const status = document.createElement('td');
    status.textContent = item.status || 'Pending';

    tr.appendChild(name);
    tr.appendChild(amount);
    tr.appendChild(status);

    tbody.appendChild(tr);
  });

  container.appendChild(table);
}


/* =========================================================
   15. COUNTDOWN
========================================================= */

function setupCountdown() {
  const targetDate = new Date('2026-12-30T09:00:00+05:30').getTime();

  function update() {
    const now = Date.now();
    let distance = targetDate - now;

    if (distance <= 0) {
      const countdown = getElement('countdown');

      if (countdown) {
        countdown.textContent = 'অনুষ্ঠান শুরু হয়েছে';
      }

      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    distance %= (1000 * 60 * 60 * 24);

    const hours = Math.floor(distance / (1000 * 60 * 60));
    distance %= (1000 * 60 * 60);

    const minutes = Math.floor(distance / (1000 * 60));
    distance %= (1000 * 60);

    const seconds = Math.floor(distance / 1000);

    if (getElement('countDays')) {
      getElement('countDays').textContent = String(days).padStart(2, '0');
    }

    if (getElement('countHours')) {
      getElement('countHours').textContent = String(hours).padStart(2, '0');
    }

    if (getElement('countMinutes')) {
      getElement('countMinutes').textContent = String(minutes).padStart(2, '0');
    }

    if (getElement('countSeconds')) {
      getElement('countSeconds').textContent = String(seconds).padStart(2, '0');
    }
  }

  update();
  setInterval(update, 1000);
}


/* =========================================================
   16. HERO SLIDER
========================================================= */

function setupHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');

  if (!slides.length) return;

  let current = 0;

  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === 0);
  });

  if (slides.length < 2) return;

  setInterval(() => {
    slides[current].classList.remove('active');

    current = (current + 1) % slides.length;

    slides[current].classList.add('active');

  }, 6500);
}


/* =========================================================
   17. MOBILE NAVIGATION
========================================================= */

function setupNavigation() {
  const toggle = getElement('menuToggle');
  const nav = getElement('mainNav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('active');

    const expanded = nav.classList.contains('active');

    toggle.setAttribute('aria-expanded', String(expanded));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* =========================================================
   18. REGISTRATION DEADLINE
========================================================= */

function checkRegistrationDeadline() {
  const deadline = new Date('2026-12-29T23:59:59+05:30').getTime();

  if (Date.now() <= deadline) return;

  const button = getElement('registrationSubmit');

  if (button) {
    button.disabled = true;
    button.textContent = 'নিবন্ধনের সময় শেষ';
  }

  const message = getElement('regMsg');

  if (message) {
    showMessage(
      message,
      'অনলাইন নিবন্ধনের সময় শেষ হয়েছে।',
      'error'
    );
  }
}


/* =========================================================
   19. INITIALIZE WEBSITE
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  renderGames();

  renderEventCheckboxes();

  renderSchedule();

  renderInitialMembers();

  setupRegistration();

  setupModal();

  setupCommitteeButtons();

  setupCountdown();

  setupHeroSlider();

  setupNavigation();

  checkRegistrationDeadline();

  loadApprovedMembers();

  loadDonations();

});


/************************************************************
 END OF KOKOND FRONTEND JAVASCRIPT V5
************************************************************/
