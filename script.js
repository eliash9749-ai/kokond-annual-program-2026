/* =========================================
   KACP 2026 — MAIN JAVASCRIPT
========================================= */

'use strict';

/* GOOGLE APPS SCRIPT API */
const API = 'https://script.google.com/macros/s/AKfycbypbMWRELyljKzlsaQntvjoFJhbz7gsSpGPXi18lJ_E5NHJdFRksykrMzGnQItMkYkt/exec';


/* =========================================
   COMPETITION DATA
========================================= */

const games = [
    {id:'marathon',name:'ম্যারাথন দৌড়',day:'৩০ ডিসেম্বর',time:'১০:০০ AM',icon:'🏃'},
    {id:'football',name:'মাথাঘোরা ফুটবল',day:'৩০ ডিসেম্বর',time:'১১:০০ AM',icon:'⚽'},
    {id:'chairs',name:'চেয়ার দখলের লড়াই',day:'৩০ ডিসেম্বর',time:'০১:৪৫ PM',icon:'🪑'},
    {id:'countdown',name:'১০০ থেকে ১ পর্যন্ত বলা',day:'৩০ ডিসেম্বর',time:'০৩:০০ PM',icon:'🔢'},
    {id:'see-say',name:'চোখে দেখে মুখে বলো',day:'৩০ ডিসেম্বর',time:'০৪:০০ PM',icon:'👀'},
    {id:'cook',name:'কে সেরা রাঁধুনি',day:'৩০ ডিসেম্বর',time:'০৫:০০ PM',icon:'🍳'},
    {id:'qirat',name:'কেরাত প্রতিযোগিতা',day:'৩০ ডিসেম্বর',time:'০৬:০০ PM',icon:'📖'},
    {id:'arabic',name:'আরবি হরফ সাজাও',day:'৩০ ডিসেম্বর',time:'০৭:০০ PM',icon:'🔠'},
    {id:'azan',name:'আজান প্রতিযোগিতা',day:'৩০ ডিসেম্বর',time:'০৮:০০ PM',icon:'🕌'},
    {id:'pot',name:'হাঁড়ি ভাঙা',day:'৩১ ডিসেম্বর',time:'০৯:০০ AM',icon:'🏺'},
    {id:'poetry',name:'কবিতা আবৃত্তি',day:'৩১ ডিসেম্বর',time:'১০:০০ AM',icon:'🎤'},
    {id:'cricket',name:'ক্রিকেট টুর্নামেন্ট',day:'৩১ ডিসেম্বর',time:'১০:৩০ AM',icon:'🏏'},
    {id:'tug',name:'দড়ি টানাটানি',day:'৩১ ডিসেম্বর',time:'১২:০০ PM',icon:'🪢'},
    {id:'duck',name:'হাঁসধরা',day:'৩১ ডিসেম্বর',time:'১২:৩০ PM',icon:'🦆'},
    {id:'freeze',name:'গজল থামলেই স্থির',day:'৩১ ডিসেম্বর',time:'০১:০০ PM',icon:'🎵'},
    {id:'throw',name:'বল ছোঁড়া',day:'৩১ ডিসেম্বর',time:'০৩:০০ PM',icon:'🏐'},
    {id:'ghazal',name:'গজল আবৃত্তি',day:'৩১ ডিসেম্বর',time:'০৪:০০ PM',icon:'🎶'},
    {id:'speech',name:'বক্তৃতা প্রতিযোগিতা',day:'৩১ ডিসেম্বর',time:'০৫:০০ PM',icon:'🗣️'}
];


/* =========================================
   SCHEDULE DATA
========================================= */

const day1 = [
    ['০৯:০০ AM','পবিত্র কোরআন তেলাওয়াত'],
    ['০৯:৩০ AM','জাতীয় পতাকা উত্তোলন'],
    ['০৯:৩০ AM','প্রভাতফেরী'],
    ...games.slice(0,9).map(g => [g.time,g.name]),
    ['ইশার নামাজের পর','বিশেষ ধর্মীয় আলোচনা — মাওলানা জাহাঙ্গীর সাহেব']
];

const day2 = [
    ...games.slice(9).map(g => [g.time,g.name]),
    ['০৫:৩০ PM','আল্লাহ্ আল্লাহ্ প্রতিযোগিতা'],
    ['০৬:০০ PM','পুরস্কার বিতরণী অনুষ্ঠান'],
    ['১০:০০ PM–১২:০০ AM','পীরজাদা উজায়ের সিদ্দিকীর বিশেষ ধর্মীয় আলোচনা']
];


/* =========================================
   COMMITTEE DATA
========================================= */

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


/* =========================================
   HELPER FUNCTIONS
========================================= */

const $ = selector => document.querySelector(selector);

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
    }[char]));
}

function showModal() {
    $('#modal').classList.add('open');
    $('#modal').setAttribute('aria-hidden','false');
}

function closeModal() {
    $('#modal').classList.remove('open');
    $('#modal').setAttribute('aria-hidden','true');
}

async function postForm(data) {
    const response = await fetch(API,{
        method:'POST',
        body:data
    });

    return await response.text();
}

function setMessage(element,message,type='normal') {
    element.textContent = message;
    element.style.color =
        type === 'error' ? '#c0392b' :
        type === 'success' ? '#18834b' :
        '#65736b';
}


/* =========================================
   COMPETITION DISPLAY
========================================= */

function renderGames() {

    const grid = $('#gameGrid');
    const checks = $('#eventChecks');

    if (!grid || !checks) return;

    grid.innerHTML = '';
    checks.innerHTML = '';

    games.forEach(game => {

        grid.insertAdjacentHTML('beforeend',`
            <article class="game-card">
                <div class="game-icon">${game.icon}</div>
                <h3>${escapeHtml(game.name)}</h3>
                <p>📅 ${game.day} ২০২৬</p>
                <p>🕒 ${game.time}</p>
                <button
                    class="mini registerGame"
                    type="button"
                    data-game="${escapeHtml(game.name)}"
                >
                    এই প্রতিযোগিতায় নাম দিন →
                </button>
            </article>
        `);

        checks.insertAdjacentHTML('beforeend',`
            <label class="event-option">
                <input
                    type="checkbox"
                    name="events"
                    value="${escapeHtml(game.name)}"
                >
                <span>${game.icon} ${escapeHtml(game.name)}</span>
            </label>
        `);

    });

}


/* =========================================
   SCHEDULE DISPLAY
========================================= */

function renderSchedule(selector,data) {

    const target = $(selector);
    if (!target) return;

    target.innerHTML = data.map(item => `
        <div class="schedule-item">
            <div class="schedule-time">${escapeHtml(item[0])}</div>
            <div class="schedule-info">
                <b>${escapeHtml(item[1])}</b>
            </div>
        </div>
    `).join('');

}


/* =========================================
   COMMITTEE DISPLAY
========================================= */

function renderCommittee() {

    const grid = $('#committeeGrid');
    if (!grid) return;

    grid.innerHTML = members.map(name => `
        <article class="committee-card">
            <div class="avatar" style="margin:0 auto 12px">
                ${escapeHtml(name.charAt(0))}
            </div>
            <h3>${escapeHtml(name)}</h3>
            <p>Committee Member</p>
            <small class="kyc">● KYC Required</small>
            <br>
            <button
                class="mini kycOpen"
                type="button"
                data-member="${escapeHtml(name)}"
            >
                Profile Update / KYC
            </button>
        </article>
    `).join('');

}


/* =========================================
   COUNTDOWN
========================================= */

function countdown() {

    const target = new Date('2026-12-30T09:00:00+05:30').getTime();
    const element = $('#countdown');

    if (!element) return;

    function update() {

        const distance = target - Date.now();

        if (distance <= 0) {
            element.innerHTML = '<b>অনুষ্ঠান শুরু হয়েছে</b>';
            return;
        }

        const values = [
            ['দিন',Math.floor(distance / 86400000)],
            ['ঘণ্টা',Math.floor(distance / 3600000) % 24],
            ['মিনিট',Math.floor(distance / 60000) % 60],
            ['সেকেন্ড',Math.floor(distance / 1000) % 60]
        ];

        element.innerHTML = values.map(item => `
            <div class="countdown-item">
                <b>${item[1]}</b>
                <small>${item[0]}</small>
            </div>
        `).join('');

    }

    update();
    setInterval(update,1000);

}


/* =========================================
   HERO SLIDER
========================================= */

function heroSlider() {

    const slides = [...document.querySelectorAll('.hero-slide')];
    const dots = [...document.querySelectorAll('.dots i')];

    if (slides.length < 2) return;

    let index = 0;

    setInterval(() => {

        slides[index].classList.remove('active');
        if (dots[index]) dots[index].classList.remove('on');

        index = (index + 1) % slides.length;

        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('on');

    },6500);

}


/* =========================================
   MOBILE NAVIGATION
========================================= */

function navigation() {

    const menu = $('#menuBtn');
    const nav = $('#nav');

    if (!menu || !nav) return;

    menu.addEventListener('click',() => {
        nav.classList.toggle('show');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click',() => {
            nav.classList.remove('show');
        });
    });

}


/* =========================================
   REGISTRATION FORM
========================================= */

function registration() {

    const form = $('#registrationForm');
    if (!form) return;

    form.addEventListener('submit',async event => {

        event.preventDefault();

        const message = $('#regMsg');

        const selected = [
            ...document.querySelectorAll('[name="events"]:checked')
        ].map(item => item.value);

        if (!selected.length) {
            setMessage(message,'কমপক্ষে একটি প্রতিযোগিতা নির্বাচন করুন।','error');
            return;
        }

        const data = new FormData(form);

        data.set('action','registration');
        data.set('events',selected.join('|'));

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        setMessage(message,'নিবন্ধন জমা হচ্ছে...');

        try {

            const result = JSON.parse(await postForm(data));

            if (result.status === 'success') {

                let ids = result.registrationNumbers || [];

                setMessage(
                    message,
                    '✅ নিবন্ধন সফল! Registration ID: ' + ids.join(', '),
                    'success'
                );

                form.reset();

            } else {

                setMessage(
                    message,
                    '⚠️ ' + (result.message || 'নিবন্ধন করা যায়নি।'),
                    'error'
                );

            }

        } catch(error) {

            setMessage(
                message,
                '❌ সার্ভারের সঙ্গে যোগাযোগ করা যায়নি। আবার চেষ্টা করুন।',
                'error'
            );

        } finally {

            button.disabled = false;

        }

    });

}


/* =========================================
   REGISTRATION MODAL
========================================= */

function openRegistrationLookup() {

    const body = $('#modalBody');

    body.innerHTML = `
        <h2>আমার রেজিস্ট্রেশন</h2>

        <p>নিবন্ধনের সময় দেওয়া নাম ও মোবাইল নম্বর লিখুন।</p>

        <form id="lookupForm">

            <label>নিবন্ধিত নাম
                <input name="name" required>
            </label>

            <label>মোবাইল নম্বর
                <input
                    name="mobile"
                    type="tel"
                    inputmode="numeric"
                    pattern="[0-9]{10}"
                    maxlength="10"
                    required
                >
            </label>

            <button class="btn primary">রেজিস্ট্রেশন খুঁজুন</button>

            <p class="form-msg"></p>

        </form>

        <p class="privacy">
            সতর্কতা: নাম ও মোবাইল নম্বর দিয়ে যাচাই করা হচ্ছে।
            OTP যাচাই চালু না হওয়া পর্যন্ত অন্যের সঙ্গে
            এই তথ্য শেয়ার করবেন না।
        </p>
    `;

    showModal();

    $('#lookupForm').addEventListener('submit',lookupRegistration);

}


async function lookupRegistration(event) {

    event.preventDefault();

    const form = event.target;
    const message = form.querySelector('.form-msg');

    setMessage(message,'রেজিস্ট্রেশন খোঁজা হচ্ছে...');

    const data = new FormData(form);
    data.set('action','lookupRegistration');

    try {

        const result = JSON.parse(await postForm(data));

        if (result.status !== 'success') {
            setMessage(message,result.message || 'রেজিস্ট্রেশন পাওয়া যায়নি।','error');
            return;
        }

        renderEditForm(result.participant);

    } catch(error) {

        setMessage(message,'সার্ভার সংযোগে সমস্যা হয়েছে।','error');

    }

}


/* =========================================
   REGISTRATION EDIT FORM
========================================= */

function renderEditForm(person) {

    const currentEvents = Array.isArray(person.events) ? person.events : [];

    $('#modalBody').innerHTML = `
        <h2>রেজিস্ট্রেশন সম্পাদনা</h2>

        <p>আপনার আগের নিবন্ধন পাওয়া গেছে।</p>

        <form id="editRegForm">

            <label>নাম
                <input name="name" value="${escapeHtml(person.name)}" readonly>
            </label>

            <label>অভিভাবকের নাম
                <input name="guardian" value="${escapeHtml(person.guardian)}" required>
            </label>

            <label>মোবাইল নম্বর
                <input name="mobile" value="${escapeHtml(person.mobile)}" readonly>
            </label>

            <label>বয়স
                <input
                    name="age"
                    type="number"
                    min="4"
                    max="100"
                    value="${escapeHtml(person.age)}"
                    required
                >
            </label>

            <label>লিঙ্গ
                <select name="gender" required>
                    <option value="পুরুষ" ${person.gender === 'পুরুষ' ? 'selected':''}>পুরুষ</option>
                    <option value="মহিলা" ${person.gender === 'মহিলা' ? 'selected':''}>মহিলা</option>
                </select>
            </label>

            <label>গ্রাম / পাড়া
                <input name="village" value="${escapeHtml(person.village)}" required>
            </label>

            <h3>প্রতিযোগিতা</h3>

            <p>বর্তমান প্রতিযোগিতা নির্বাচন করা থাকবে। নতুন প্রতিযোগিতা যোগ করতে পারবেন।</p>

            <div class="check-grid">

                ${games.map(game => `
                    <label class="event-option">
                        <input
                            type="checkbox"
                            name="events"
                            value="${escapeHtml(game.name)}"
                            ${currentEvents.includes(game.name) ? 'checked':''}
                        >
                        ${game.icon} ${escapeHtml(game.name)}
                    </label>
                `).join('')}

            </div>

            <button class="btn primary">তথ্য সংরক্ষণ করুন</button>

            <p class="form-msg"></p>

        </form>

        <p class="privacy">
            পুরোনো প্রতিযোগিতা এই সংস্করণে মুছে ফেলা হবে না,
            যাতে বিচার ও Queue-এর রেকর্ড অক্ষত থাকে।
        </p>
    `;

    $('#editRegForm').addEventListener('submit',updateRegistration);

}


async function updateRegistration(event) {

    event.preventDefault();

    const form = event.target;
    const message = form.querySelector('.form-msg');

    const selected = [
        ...form.querySelectorAll('[name="events"]:checked')
    ].map(item => item.value);

    if (!selected.length) {
        setMessage(message,'কমপক্ষে একটি প্রতিযোগিতা নির্বাচন করুন।','error');
        return;
    }

    const data = new FormData(form);

    data.set('action','updateRegistration');
    data.set('events',selected.join('|'));

    setMessage(message,'তথ্য আপডেট হচ্ছে...');

    try {

        const result = JSON.parse(await postForm(data));

        if (result.status === 'success') {
            setMessage(message,'✅ '+result.message,'success');
        } else {
            setMessage(message,'⚠️ '+result.message,'error');
        }

    } catch(error) {

        setMessage(message,'❌ তথ্য আপডেট করা যায়নি।','error');

    }

}


/* =========================================
   IMAGE UPLOAD HELPERS
========================================= */

function photoField() {

    return `
        <label>নিজের ছবি
            <input
                type="file"
                name="photo"
                accept="image/*"
                required
            >
        </label>

        <img
            class="upload-preview"
            alt="ছবির Preview"
            style="display:none;max-width:150px;border-radius:12px;margin-top:12px"
        >
    `;

}


function bindPhoto(form) {

    const input = form.querySelector('[name="photo"]');
    const preview = form.querySelector('.upload-preview');

    input.addEventListener('change',() => {

        const file = input.files[0];

        if (!file) return;

        if (preview.dataset.url) {
            URL.revokeObjectURL(preview.dataset.url);
        }

        preview.dataset.url = URL.createObjectURL(file);
        preview.src = preview.dataset.url;
        preview.style.display = 'block';

    });

}


function fileToBase64(file) {

    return new Promise((resolve,reject) => {

        const reader = new FileReader();

        reader.onload = () => {
            resolve(String(reader.result).split(',')[1]);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}


/* =========================================
   KYC FORM
========================================= */

function openKyc(name) {

    $('#modalBody').innerHTML = `
        <h2>🔐 KYC / Profile Update</h2>

        <p><b>${escapeHtml(name)}</b>-এর প্রোফাইল সম্পূর্ণ করুন।</p>

        <form id="kycForm">

            <input type="hidden" name="action" value="kyc">

            <input
                type="hidden"
                name="memberName"
                value="${escapeHtml(name)}"
            >

            <label>নাম
                <input value="${escapeHtml(name)}" disabled>
            </label>

            <label>মোবাইল নম্বর
                <input
                    name="mobile"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxlength="10"
                    required
                >
            </label>

            ${photoField()}

            <p>তথ্য যাচাইয়ের পর অনুমোদন করা হবে।</p>

            <button class="btn primary">KYC জমা দিন</button>

            <p class="form-msg"></p>

        </form>
    `;

    showModal();

    const form = $('#kycForm');

    bindPhoto(form);
    form.addEventListener('submit',submitMemberForm);

}


/* =========================================
   NEW MEMBER APPLICATION
========================================= */

function openJoinForm() {

    $('#modalBody').innerHTML = `
        <h2>কমিটির সদস্য হতে আবেদন</h2>

        <form id="joinForm">

            <input type="hidden" name="action" value="newMember">

            <label>সম্পূর্ণ নাম
                <input name="memberName" required>
            </label>

            <label>মোবাইল নম্বর
                <input
                    name="mobile"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxlength="10"
                    required
                >
            </label>

            ${photoField()}

            <p>আবেদনটি যাচাই ও অনুমোদনের জন্য পাঠানো হবে।</p>

            <button class="btn primary">আবেদন জমা দিন</button>

            <p class="form-msg"></p>

        </form>
    `;

    showModal();

    const form = $('#joinForm');

    bindPhoto(form);
    form.addEventListener('submit',submitMemberForm);

}


/* =========================================
   KYC AND MEMBER SUBMISSION
========================================= */

async function submitMemberForm(event) {

    event.preventDefault();

    const form = event.target;
    const message = form.querySelector('.form-msg');
    const file = form.querySelector('[name="photo"]').files[0];

    if (!file) {
        setMessage(message,'একটি ছবি নির্বাচন করুন।','error');
        return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
        setMessage(message,'ছবির সাইজ ২.৫ MB-এর কম রাখুন।','error');
        return;
    }

    setMessage(message,'তথ্য ও ছবি পাঠানো হচ্ছে...');

    try {

        const data = new FormData(form);

        data.append('photoBase64',await fileToBase64(file));
        data.append('photoType',file.type);
        data.append('photoName',file.name);

        data.delete('photo');

        const result = JSON.parse(await postForm(data));

        if (result.status === 'success') {

            setMessage(
                message,
                '✅ আবেদন জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।',
                'success'
            );

            form.querySelector('button').disabled = true;

        } else {

            setMessage(
                message,
                '⚠️ '+(result.message || 'আবেদন জমা করা যায়নি।'),
                'error'
            );

        }

    } catch(error) {

        setMessage(message,'❌ সার্ভারের সঙ্গে যোগাযোগ করা যায়নি।','error');

    }

}


/* =========================================
   LOAD APPROVED COMMITTEE
========================================= */

async function loadCommittee() {

    try {

        const response = await fetch(API + '?action=members');
        const result = await response.json();

        if (!Array.isArray(result.members)) return;

        const grid = $('#committeeGrid');

        result.members.forEach(member => {

            if (member.status !== 'Approved') return;

            const existing = [...grid.children].find(card =>
                card.querySelector('h3')?.textContent.trim() ===
                String(member.name).trim()
            );

            const html = `
                ${member.photoUrl ? `
                    <img src="${escapeHtml(member.photoUrl)}" alt="${escapeHtml(member.name)}">
                ` : `
                    <div class="avatar" style="margin:0 auto 12px">
                        ${escapeHtml(String(member.name).charAt(0))}
                    </div>
                `}

                <h3>${escapeHtml(member.name)}</h3>

                <p>${escapeHtml(member.role || 'Committee Member')}</p>

                <small class="verified">✓ Profile Verified</small>
            `;

            if (existing) {
                existing.innerHTML = html;
            } else {
                const card = document.createElement('article');
                card.className = 'committee-card';
                card.innerHTML = html;
                grid.appendChild(card);
            }

        });

    } catch(error) {

        console.error('Committee loading failed:',error);

    }

}


/* =========================================
   CLICK EVENTS
========================================= */

function bindEvents() {

    document.addEventListener('click',event => {

        const registerButton = event.target.closest('.registerGame');

        if (registerButton) {

            const selectedGame = registerButton.dataset.game;

            document.querySelectorAll('[name="events"]').forEach(item => {
                item.checked = item.value === selectedGame;
            });

            location.hash = 'registration';

        }

        const kycButton = event.target.closest('.kycOpen');

        if (kycButton) {
            openKyc(kycButton.dataset.member);
        }

    });

    $('#myRegOpen')?.addEventListener('click',openRegistrationLookup);

    $('#joinOpen')?.addEventListener('click',openJoinForm);

    $('#modalClose')?.addEventListener('click',closeModal);

    $('#modal')?.addEventListener('click',event => {
        if (event.target.id === 'modal') closeModal();
    });

    document.addEventListener('keydown',event => {
        if (event.key === 'Escape') closeModal();
    });

}


/* =========================================
   INITIALIZE WEBSITE
========================================= */

function initializeWebsite() {

    renderGames();

    renderSchedule('#day1',day1);

    renderSchedule('#day2',day2);

    renderCommittee();

    countdown();

    heroSlider();

    navigation();

    registration();

    bindEvents();

    loadCommittee();

}

document.addEventListener('DOMContentLoaded',initializeWebsite);
