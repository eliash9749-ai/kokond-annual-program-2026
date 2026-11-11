
const API = 'https://script.google.com/macros/s/AKfycbypbMWRELyljKzlsaQntvjoFJhbz7gsSpGPXi18lJ_E5NHJdFRksykrMzGnQItMkYkt/exec';

const TBA = 'সময়সূচি অনুষ্ঠানের দিন প্রকাশ করা হবে';

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
  ['cricket', 'ক্রিকেট টুর্নামেন্ট', '৩১ ডিসেম্বর', TBA],
  ['tug', 'দড়ি টানাটানি', '৩১ ডিসেম্বর', '১২:০০ PM'],
  ['duck', 'হাঁসধরা', '৩১ ডিসেম্বর', TBA],
  ['freeze', 'গজল থামলেই স্থির', '৩১ ডিসেম্বর', TBA],
  ['throw', 'বল ছোঁড়া', '৩১ ডিসেম্বর', '০৩:০০ PM'],
  ['ghazal', 'গজল আবৃত্তি', '৩১ ডিসেম্বর', '০৪:০০ PM'],
  ['speech', 'বক্তৃতা প্রতিযোগিতা', '৩১ ডিসেম্বর', '০৫:০০ PM']
];

const d1 = [
  ['০৯:০০ AM', 'পবিত্র কোরআন তেলাওয়াত'],
  ['০৯:৩০ AM', 'জাতীয় পতাকা উত্তোলন'],
  ['০৯:৩০ AM', 'প্রভাতফেরী'],
  ...games.slice(0, 9).map(g => [g[3], g[1]])
];

const d2 = [
  ...games.slice(9).map(g => [g[3], g[1]]),
  ['০৫:৩০ PM', 'আল্লাহ্ আল্লাহ্ প্রতিযোগিতা'],
  ['০৬:০০ PM', 'পুরস্কার বিতরণী অনুষ্ঠান'],
  ['১০:০০ PM–১২:০০ AM', 'পীরজাদা উজায়ের সিদ্দিকীর বিশেষ ধর্মীয় আলোচনা']
];

const members = [
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

// ===============================
// COMPETITION CARDS & REGISTRATION CHECKBOXES
// ===============================

const grid = document.querySelector('#gameGrid');
const checks = document.querySelector('#eventChecks');

if (grid && checks) {
  grid.innerHTML = '';
  checks.innerHTML = '';

  games.forEach(g => {
    grid.insertAdjacentHTML('beforeend', `
      <article class="game-card">
        <img src="assets/games/${g[0]}.svg" alt="${g[1]}">
        <div class="game-info">
          <h3>${g[1]}</h3>
          <p>📅 ${g[2]} ২০২৬</p>
          <p>🕒 ${g[3]}</p>
          <button class="mini registerGame" data-game="${g[1]}">
            এই প্রতিযোগিতায় নাম দিন →
          </button>
        </div>
      </article>
    `);

    checks.insertAdjacentHTML('beforeend', `
      <label>
        <input type="checkbox" name="events" value="${g[1]}">
        ${g[1]}
      </label>
    `);
  });
}

// ===============================
// EVENT SCHEDULE
// ===============================

function rows(id, data) {
  const element = document.querySelector(id);
  if (!element) return;

  element.innerHTML = data.map(x => `
    <div class="time-row">
      <b>${x[0]}</b>
      <span>${x[1]}</span>
    </div>
  `).join('');
}

rows('#day1', d1);
rows('#day2', d2);

// ===============================
// COMMITTEE MEMBERS
// ===============================

const cgrid = document.querySelector('#committeeGrid');

if (cgrid) {
  members.forEach(n => {
    cgrid.insertAdjacentHTML('beforeend', `
      <article class="member-card">
        <h4>${n}</h4>
        <small>● KYC Required</small>
        <br>
        <button class="mini kycOpen" data-member="${n}">
          Profile Update / KYC
        </button>
      </article>
    `);
  });
}

// ===============================
// COUNTDOWN
// ===============================

function cd() {
  const el = document.querySelector('#countdown');
  if (!el) return;

  const target = new Date('2026-12-30T09:00:00+05:30');
  const t = target - new Date();

  if (t <= 0) {
    el.innerHTML = '<b>অনুষ্ঠান শুরু হয়েছে</b>';
    return;
  }

  const d = Math.floor(t / 864e5);
  const h = Math.floor(t / 36e5) % 24;
  const m = Math.floor(t / 6e4) % 60;
  const s = Math.floor(t / 1e3) % 60;

  el.innerHTML = `
    <b>${d}<small>দিন</small></b>
    <b>${h}<small>ঘণ্টা</small></b>
    <b>${m}<small>মিনিট</small></b>
    <b>${s}<small>সেকেন্ড</small></b>
  `;
}

cd();
setInterval(cd, 1000);

// ===============================
// HERO SLIDER
// ===============================

let si = 0;

setInterval(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.dots i')];

  if (!slides.length || !dots.length) return;

  slides[si]?.classList.remove('active');
  dots[si]?.classList.remove('on');

  si = (si + 1) % slides.length;

  slides[si]?.classList.add('active');
  dots[si]?.classList.add('on');
}, 6500);

// ===============================
// MOBILE MENU
// ===============================

const menuBtn = document.querySelector('#menuBtn');
const nav = document.querySelector('#nav');

if (menuBtn && nav) {
  menuBtn.onclick = () => nav.classList.toggle('open');
}

// ===============================
// API HELPER
// ===============================

async function postForm(data) {
  const response = await fetch(API, {
    method: 'POST',
    body: data
  });

  if (!response.ok) {
    throw new Error('Server response error');
  }

  return await response.text();
}

// ===============================
// MODAL
// ===============================

const modal = document.querySelector('#modal');
const body = document.querySelector('#modalBody');
const modalClose = document.querySelector('#modalClose');

if (modalClose && modal) {
  modalClose.onclick = () => modal.classList.remove('show');
}

if (modal) {
  modal.onclick = e => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  };
}

// ===============================
// PHOTO UPLOAD HELPERS
// ===============================

function photoField() {
  return `
    <label>
      নিজের ছবি
      <input type="file" name="photo" accept="image/*" required>
    </label>
    <img class="upload-preview" alt="preview">
  `;
}

function bindPhoto(form) {
  const inp = form.querySelector('[name=photo]');
  const img = form.querySelector('.upload-preview');

  if (!inp || !img) return;

  inp.onchange = () => {
    if (inp.files[0]) {
      img.src = URL.createObjectURL(inp.files[0]);
      img.style.display = 'block';
    }
  };
}

function file64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result).split(',')[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===============================
// KYC FORM
// ===============================

function openKyc(name) {
  if (!body || !modal) return;

  body.innerHTML = `
    <h2>🔴 KYC / Profile Update</h2>
    <p><b>${name}</b>-এর প্রোফাইল সম্পূর্ণ করার অনুরোধ।</p>

    <form id="kycForm">
      <input type="hidden" name="action" value="kyc">
      <input type="hidden" name="memberName" value="${name}">

      <label>
        নাম
        <input value="${name}" disabled>
      </label>

      <label>
        মোবাইল নম্বর
        <input name="mobile" pattern="[0-9]{10}" required>
      </label>

      ${photoField()}

      <p class="privacy">
        তথ্য সরাসরি public হবে না। Program Manager-এর অনুমোদনের পর
        প্রোফাইল সম্পূর্ণ হবে।
      </p>

      <button class="btn primary">KYC জমা দিন</button>
      <p class="form-msg"></p>
    </form>
  `;

  modal.classList.add('show');

  const form = document.querySelector('#kycForm');
  bindPhoto(form);
  form.onsubmit = submitMemberForm;
}

// ===============================
// NEW COMMITTEE MEMBER APPLICATION
// ===============================

const joinOpen = document.querySelector('#joinOpen');

if (joinOpen) {
  joinOpen.onclick = () => {
    if (!body || !modal) return;

    body.innerHTML = `
      <h2>কমিটির সদস্য হতে আবেদন</h2>

      <form id="joinForm">
        <input type="hidden" name="action" value="newMember">

        <label>
          পূর্ণ নাম
          <input name="memberName" required>
        </label>

        <label>
          মোবাইল নম্বর
          <input name="mobile" pattern="[0-9]{10}" required>
        </label>

        ${photoField()}

        <p class="privacy">
          আবেদনটি Pending থাকবে। Program Manager অনুমোদন করলে
          Committee card তৈরি হবে।
        </p>

        <button class="btn primary">আবেদন জমা দিন</button>
        <p class="form-msg"></p>
      </form>
    `;

    modal.classList.add('show');

    const form = document.querySelector('#joinForm');
    bindPhoto(form);
    form.onsubmit = submitMemberForm;
  };
}

// ===============================
// KYC / MEMBER APPLICATION SUBMISSION
// ===============================

async function submitMemberForm(e) {
  e.preventDefault();

  const form = e.target;
  const msg = form.querySelector('.form-msg');
  const file = form.querySelector('[name=photo]')?.files[0];

  if (!file) {
    msg.textContent = 'অনুগ্রহ করে নিজের ছবি নির্বাচন করুন।';
    return;
  }

  if (file.size > 2.5 * 1024 * 1024) {
    msg.textContent = 'ছবির size 2.5MB-এর কম রাখুন।';
    return;
  }

  msg.textContent = 'ছবি ও তথ্য পাঠানো হচ্ছে...';

  try {
    const fd = new FormData(form);

    fd.append('photoBase64', await file64(file));
    fd.append('photoType', file.type);
    fd.append('photoName', file.name);
    fd.delete('photo');

    const txt = await postForm(fd);

    let data;

    try {
      data = JSON.parse(txt);
    } catch (error) {
      data = null;
    }

    if (data?.status === 'success') {
      msg.textContent =
        '✅ জমা হয়েছে। Program Manager অনুমোদন করলে প্রোফাইল আপডেট হবে।';

      form.querySelector('button').disabled = true;
    } else {
      msg.textContent =
        '⚠️ ' + (data?.message ||
        'KYC request গ্রহণ করা যায়নি। Apps Script deployment পরীক্ষা করুন।');
    }
  } catch (error) {
    console.error('Member form error:', error);

    msg.textContent =
      '❌ পাঠানো যায়নি। ইন্টারনেট অথবা Apps Script পরীক্ষা করুন।';
  }
}

// ===============================
// CLICK EVENTS
// ===============================

document.addEventListener('click', e => {
  const registerButton = e.target.closest('.registerGame');

  if (registerButton) {
    const selectedGame = registerButton.dataset.game;

    document.querySelectorAll('[name=events]').forEach(input => {
      input.checked = input.value === selectedGame;
    });

    location.hash = 'registration';
  }

  const kycButton = e.target.closest('.kycOpen');

  if (kycButton) {
    openKyc(kycButton.dataset.member);
  }
});

// ===============================
// REGISTRATION FORM
// ===============================

const registrationForm = document.querySelector('#registrationForm');

if (registrationForm) {
  registrationForm.onsubmit = async e => {
    e.preventDefault();

    const form = e.target;
    const fd = new FormData(form);

    const selected = [
      ...document.querySelectorAll('[name=events]:checked')
    ].map(input => input.value);

    const msg = document.querySelector('#regMsg');

    if (!selected.length) {
      msg.textContent = 'কমপক্ষে একটি প্রতিযোগিতা নির্বাচন করুন।';
      return;
    }

    msg.textContent = 'নিবন্ধন জমা হচ্ছে...';

    const submitButton = form.querySelector('[type=submit]');

    if (submitButton) submitButton.disabled = true;

    try {
      // বর্তমান Backend-এর সঙ্গে সামঞ্জস্য রেখে
      // প্রতিটি প্রতিযোগিতার জন্য আলাদা request পাঠানো হচ্ছে।
      for (const eventName of selected) {
        const data = new FormData();

        data.append('name', fd.get('name') || '');
        data.append('mobile', fd.get('mobile') || '');
        data.append('age', fd.get('age') || '');
        data.append('event', eventName);

        await postForm(data);
      }

      msg.textContent =
        '✅ নিবন্ধন সফল হয়েছে। Google Sheet-এ তথ্য পাঠানো হয়েছে।';

      form.reset();

    } catch (error) {
      console.error('Registration error:', error);

      msg.textContent =
        '❌ নিবন্ধন সম্পূর্ণ করা যায়নি। Backend অথবা ইন্টারনেট পরীক্ষা করুন।';

    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };
}

// ===============================
// LOAD APPROVED COMMITTEE PROFILES
// ===============================

fetch(API + '?action=members')
  .then(response => {
    if (!response.ok) throw new Error('Members API error');
    return response.json();
  })
  .then(data => {
    if (!data.members || !cgrid) return;

    data.members.forEach(m => {
      const cards = [...document.querySelectorAll('.member-card')];

      let card = cards.find(c =>
        c.querySelector('h4')?.textContent.trim() ===
        String(m.name).trim()
      );

      if (!card && m.status === 'Approved') {
        cgrid.insertAdjacentHTML('beforeend', `
          <article class="member-card" style="border-left-color:#0a875c">
            ${m.photoUrl ? `
              <img src="${m.photoUrl}"
                style="width:70px;height:70px;object-fit:cover;border-radius:12px"
                alt="${m.name}">
            ` : ''}

            <h4>${m.name}</h4>
            ${m.role ? `<p>${m.role}</p>` : ''}
            <small style="color:#08704c">✓ Profile Complete</small>
          </article>
        `);

        return;
      }

      if (card && m.status === 'Approved') {
        card.style.borderLeftColor = '#0a875c';

        card.innerHTML = `
          ${m.photoUrl ? `
            <img src="${m.photoUrl}"
              style="width:70px;height:70px;object-fit:cover;border-radius:12px"
              alt="${m.name}">
          ` : ''}

          <h4>${m.name}</h4>
          ${m.role ? `<p>${m.role}</p>` : ''}
          <small style="color:#08704c">✓ Profile Complete</small>
        `;
      }
    });
  })
  .catch(error => {
    console.error('Committee load error:', error);
  });

// ===============================
// DONATIONS 2026
// ===============================

const donationList = document.getElementById('donationList');

if (donationList) {
  fetch(API + '?action=donations')
    .then(response => {
      if (!response.ok) throw new Error('Donation API error');
      return response.json();
    })
    .then(data => {
      const promised = document.getElementById('totalPromised');
      const paid = document.getElementById('totalPaid');
      const due = document.getElementById('totalDue');

      if (promised) {
        promised.textContent =
          '₹' + Number(data.summary?.promised || 0)
            .toLocaleString('en-IN');
      }

      if (paid) {
        paid.textContent =
          '₹' + Number(data.summary?.paid || 0)
            .toLocaleString('en-IN');
      }

      if (due) {
        due.textContent =
          '₹' + Number(data.summary?.due || 0)
            .toLocaleString('en-IN');
      }

      donationList.innerHTML = '';

      if (!data.donations || data.donations.length === 0) {
        donationList.innerHTML =
          '<p class="donation-loading">এখনও কোনো অনুদানের তথ্য যোগ করা হয়নি।</p>';
        return;
      }

      data.donations.forEach(item => {
        const isPaid =
          String(item.status).toLowerCase() === 'paid';

        const card = document.createElement('div');

        card.className =
          'donation-card ' +
          (isPaid ? 'donation-paid' : 'donation-unpaid');

        const donor = document.createElement('div');
        donor.className = 'donor-info';

        const donorName = document.createElement('h3');
        donorName.textContent = item.name || '';

        const donorLabel = document.createElement('span');
        donorLabel.textContent = 'প্রতিশ্রুত অনুদান';

        donor.appendChild(donorName);
        donor.appendChild(donorLabel);

        const amount = document.createElement('div');
        amount.className = 'donation-amount';

        amount.textContent =
          item.promise ||
          ('₹' + Number(item.amount || 0).toLocaleString('en-IN'));

        card.appendChild(donor);
        card.appendChild(amount);

        donationList.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Donation load error:', error);

      donationList.innerHTML =
        '<p class="donation-loading">অনুদানের তথ্য লোড করা যায়নি।</p>';
    });
}
