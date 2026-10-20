const API='https://script.google.com/macros/s/AKfycbypbMWRELyljKzlsaQntvjoFJhbz7gsSpGPXi18lJ_E5NHJdFRksykrMzGnQItMkYkt/exec';
const games=[
['marathon','ম্যারাথন দৌড়','৩০ ডিসেম্বর','১০:০০ AM'],['football','মাথাখোরা ফুটবল','৩০ ডিসেম্বর','১১:০০ AM'],['chairs','চেয়ার দখলের লড়াই','৩০ ডিসেম্বর','০১:৪৫ PM'],['countdown','১০০ থেকে ১ পর্যন্ত বলা','৩০ ডিসেম্বর','০৩:০০ PM'],['see-say','চোখে দেখে মুখে বলো','৩০ ডিসেম্বর','০৪:০০ PM'],['cook','কে সেরা রাঁধুনি','৩০ ডিসেম্বর','০৫:০০ PM'],['qirat','কেরাত প্রতিযোগিতা','৩০ ডিসেম্বর','০৬:০০ PM'],['arabic','আরবি হরফ সাজাও','৩০ ডিসেম্বর','০৭:০০ PM'],['azan','আজান প্রতিযোগিতা','৩০ ডিসেম্বর','০৮:০০ PM'],['pot','হাঁড়ি ভাঙা','৩১ ডিসেম্বর','০৯:০০ AM'],['poetry','কবিতা আবৃত্তি','৩১ ডিসেম্বর','১০:০০ AM'],['cricket','ক্রিকেট টুর্নামেন্ট','৩১ ডিসেম্বর','১০:৩০ AM'],['tug','দড়ি টানাটানি','৩১ ডিসেম্বর','১২:০০ PM'],['duck','হাঁসধরা','৩১ ডিসেম্বর','১২:৩০ PM'],['freeze','গজল থামলেই স্থির','৩১ ডিসেম্বর','০১:০০ PM'],['throw','বল ছোঁড়া','৩১ ডিসেম্বর','০৩:০০ PM'],['ghazal','গজল আবৃত্তি','৩১ ডিসেম্বর','০৪:০০ PM'],['speech','বক্তৃতা প্রতিযোগিতা','৩১ ডিসেম্বর','০৫:০০ PM']];
const d1=[['০৯:০০ AM','পবিত্র কোরআন তেলাওয়াত'],['০৯:৩০ AM','জাতীয় পতাকা উত্তোলন'],['০৯:৩০ AM','প্রভাতফেরী'],...games.slice(0,9).map(x=>[x[3],x[1]])];
const d2=[...games.slice(9).map(x=>[x[3],x[1]]),['০৫:৩০ PM','আল্লাহ্ আল্লাহ্ প্রতিযোগিতা'],['০৬:০০ PM','পুরস্কার বিতরণী অনুষ্ঠান'],['১০:০০ PM–১২:০০ AM','পীরজাদা উজায়ের সিদ্দিকীর বিশেষ ধর্মীয় আলোচনা']];
const members=['হাসিকুল মহম্মদ সেক','সমির আলি খান','ফারদিন আক্তার মল্লিক','ইব্রাহিম মল্লিক','সুরোজ মণ্ডল','মিজানুর খন্দকার','রোহিত খান','আজাম আলি খান','ইয়ানুর মণ্ডল','সিরাজুদ্দিন খান','আলমগীর মল্লিক','রিয়াজ খান','ইশা খান','জাহির খান','সাহিদ মল্লিক','সামিম মল্লিক','রাজিবুল খান','আরিফ খান','আসলাম খান','আব্দুল্লা খান','রফিকুল খান','শাহিন খান','মনিরুল ইসলাম খান','বিল্লাল সেক','সুরোজ শা','সারবিন মল্লিক'];
const grid=document.querySelector('#gameGrid'), checks=document.querySelector('#eventChecks');
games.forEach(g=>{grid.insertAdjacentHTML('beforeend',`<article class="game-card"><img src="assets/games/${g[0]}.svg" alt="${g[1]}"><div class="game-info"><h3>${g[1]}</h3><p>📅 ${g[2]} ২০২৬</p><p>🕒 ${g[3]}</p><button class="mini registerGame" data-game="${g[1]}">এই প্রতিযোগিতায় নাম দিন →</button></div></article>`);checks.insertAdjacentHTML('beforeend',`<label><input type="checkbox" name="events" value="${g[1]}"> ${g[1]}</label>`)});
function rows(id,data){document.querySelector(id).innerHTML=data.map(x=>`<div class="time-row"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')} rows('#day1',d1);rows('#day2',d2);
const cgrid=document.querySelector('#committeeGrid');members.forEach(n=>cgrid.insertAdjacentHTML('beforeend',`<article class="member-card"><h4>${n}</h4><small>● KYC Required</small><br><button class="mini kycOpen" data-member="${n}">Profile Update / KYC</button></article>`));
function cd(){let t=new Date('2026-12-30T09:00:00+05:30')-new Date(), el=document.querySelector('#countdown');if(t<=0){el.innerHTML='<b>অনুষ্ঠান শুরু হয়েছে</b>';return}let d=Math.floor(t/864e5),h=Math.floor(t/36e5)%24,m=Math.floor(t/6e4)%60,s=Math.floor(t/1e3)%60;el.innerHTML=`<b>${d}<small>দিন</small></b><b>${h}<small>ঘণ্টা</small></b><b>${m}<small>মিনিট</small></b><b>${s}<small>সেকেন্ড</small></b>`}cd();setInterval(cd,1000);
let si=0;setInterval(()=>{let slides=[...document.querySelectorAll('.hero-slide')],dots=[...document.querySelectorAll('.dots i')];slides[si].classList.remove('active');dots[si].classList.remove('on');si=(si+1)%slides.length;slides[si].classList.add('active');dots[si].classList.add('on')},6500);
document.querySelector('#menuBtn').onclick=()=>document.querySelector('#nav').classList.toggle('open');
document.addEventListener('click',e=>{if(e.target.matches('.registerGame')){document.querySelectorAll('[name=events]').forEach(x=>x.checked=x.value===e.target.dataset.game);location.hash='registration'}if(e.target.matches('.kycOpen'))openKyc(e.target.dataset.member)});
async function postForm(data){const r=await fetch(API,{method:'POST',body:data});return await r.text()}
document.querySelector('#registrationForm').onsubmit=async e=>{e.preventDefault();let fd=new FormData(e.target),selected=[...document.querySelectorAll('[name=events]:checked')].map(x=>x.value);if(!selected.length){document.querySelector('#regMsg').textContent='কমপক্ষে একটি প্রতিযোগিতা নির্বাচন করুন।';return}let msg=document.querySelector('#regMsg');msg.textContent='জমা হচ্ছে...';try{for(const ev of selected){let x=new FormData();x.append('name',fd.get('name'));x.append('mobile',fd.get('mobile'));x.append('age',fd.get('age'));x.append('event',ev);await postForm(x)}msg.textContent='✅ নিবন্ধন সফল হয়েছে। Google Sheet-এ তথ্য পাঠানো হয়েছে।';e.target.reset()}catch(err){msg.textContent='❌ নিবন্ধন পাঠানো যায়নি। ইন্টারনেট/Backend পরীক্ষা করুন।'}};
const modal=document.querySelector('#modal'),body=document.querySelector('#modalBody');document.querySelector('#modalClose').onclick=()=>modal.classList.remove('show');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};
function photoField(){return `<label>নিজের ছবি<input type="file" name="photo" accept="image/*" required></label><img class="upload-preview" alt="preview">`}
function bindPhoto(form){let inp=form.querySelector('[name=photo]'),img=form.querySelector('.upload-preview');inp.onchange=()=>{if(inp.files[0]){img.src=URL.createObjectURL(inp.files[0]);img.style.display='block'}}}
function file64(file){return new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(file)})}
function openKyc(name){body.innerHTML=`<h2>🔴 KYC / Profile Update</h2><p><b>${name}</b>-এর প্রোফাইল সম্পূর্ণ করার অনুরোধ।</p><form id="kycForm"><input type="hidden" name="action" value="kyc"><input type="hidden" name="memberName" value="${name}"><label>নাম<input value="${name}" disabled></label><label>মোবাইল নম্বর<input name="mobile" pattern="[0-9]{10}" required></label>${photoField()}<p class="privacy">তথ্য সরাসরি public হবে না। Program Manager-এর অনুমোদনের পর প্রোফাইল সম্পূর্ণ হবে।</p><button class="btn primary">KYC জমা দিন</button><p class="form-msg"></p></form>`;modal.classList.add('show');let f=document.querySelector('#kycForm');bindPhoto(f);f.onsubmit=submitMemberForm}
document.querySelector('#joinOpen').onclick=()=>{body.innerHTML=`<h2>কমিটির সদস্য হতে আবেদন</h2><form id="joinForm"><input type="hidden" name="action" value="newMember"><label>পূর্ণ নাম<input name="memberName" required></label><label>মোবাইল নম্বর<input name="mobile" pattern="[0-9]{10}" required></label>${photoField()}<p class="privacy">আবেদনটি Pending থাকবে। Program Manager অনুমোদন করলে Committee card তৈরি হবে।</p><button class="btn primary">আবেদন জমা দিন</button><p class="form-msg"></p></form>`;modal.classList.add('show');let f=document.querySelector('#joinForm');bindPhoto(f);f.onsubmit=submitMemberForm};
async function submitMemberForm(e){e.preventDefault();let f=e.target,msg=f.querySelector('.form-msg'),file=f.photo.files[0];if(file.size>2.5*1024*1024){msg.textContent='ছবির size 2.5MB-এর কম রাখুন।';return}msg.textContent='ছবি ও তথ্য পাঠানো হচ্ছে...';let fd=new FormData(f);fd.append('photoBase64',await file64(file));fd.append('photoType',file.type);fd.append('photoName',file.name);fd.delete('photo');try{let txt=await postForm(fd);let data;try{data=JSON.parse(txt)}catch{}if(data?.status==='success'){msg.textContent='✅ জমা হয়েছে। Program Manager অনুমোদন করলে প্রোফাইল আপডেট হবে।';f.querySelector('button').disabled=true}else{msg.textContent='⚠️ '+(data?.message||'KYC request গ্রহণ করা যায়নি। Apps Script deployment পরীক্ষা করুন।')}}catch(err){msg.textContent='❌ পাঠানো যায়নি। V3 Apps Script deploy করা হয়েছে কি না দেখুন।'}}
// Load approved committee profiles from Google Sheet
fetch(API + '?action=members')
  .then(r => r.json())
  .then(data => {
    if (!data.members) return;

    data.members.forEach(m => {
      let cards = [...document.querySelectorAll('.member-card')];
      let card = cards.find(c =>
        c.querySelector('h4')?.textContent.trim() === String(m.name).trim()
      );

      // New approved member: create a new card automatically
      if (!card && m.status === 'Approved') {
        cgrid.insertAdjacentHTML('beforeend', `
          <article class="member-card" style="border-left-color:#0a875c">
            ${m.photoUrl ? `<img src="${m.photoUrl}" style="width:70px;height:70px;object-fit:cover;border-radius:12px" alt="${m.name}">` : ''}
            <h4>${m.name}</h4>
            ${m.role ? `<p>${m.role}</p>` : ''}
            <small style="color:#08704c">✓ Profile Complete</small>
          </article>
        `);
        return;
      }

      // Existing member: update the existing card
      if (card && m.status === 'Approved') {
        card.style.borderLeftColor = '#0a875c';

        card.innerHTML = `
          ${m.photoUrl ? `<img src="${m.photoUrl}" style="width:70px;height:70px;object-fit:cover;border-radius:12px" alt="${m.name}">` : ''}
          <h4>${m.name}</h4>
          ${m.role ? `<p>${m.role}</p>` : ''}
          <small style="color:#08704c">✓ Profile Complete</small>
        `;
      }
    });
  })
  .catch(err => console.error('Committee load error:', err));

  // ===== DONATIONS 2026 =====
const donationList = document.getElementById('donationList');

if (donationList) {
  fetch(API + '?action=donations')
    .then(response => response.json())
    .then(data => {

      // Summary
      document.getElementById('totalPromised').textContent =
        '₹' + Number(data.summary?.promised || 0).toLocaleString('en-IN');

      document.getElementById('totalPaid').textContent =
        '₹' + Number(data.summary?.paid || 0).toLocaleString('en-IN');

      document.getElementById('totalDue').textContent =
        '₹' + Number(data.summary?.due || 0).toLocaleString('en-IN');

      // Clear loading text
      donationList.innerHTML = '';

      if (!data.donations || data.donations.length === 0) {
        donationList.innerHTML =
          '<p class="donation-loading">এখনও কোনো অনুদানের তথ্য যোগ করা হয়নি।</p>';
        return;
      }

      // Create each donation card
      data.donations.forEach(item => {

        const isPaid =
          String(item.status).toLowerCase() === 'paid';

        const card = document.createElement('div');
        card.className =
          'donation-card ' + (isPaid ? 'donation-paid' : 'donation-unpaid');

        card.innerHTML = `
          <div class="donor-info">
            <h3>${item.name}</h3>
            <span>প্রতিশ্রুত অনুদান</span>
          </div>

          

          <div class="donation-amount">
  ${item.promise || ('₹' + Number(item.amount || 0).toLocaleString('en-IN'))}
</div>
        `;

        donationList.appendChild(card);
      });

    })
    .catch(error => {
      console.error('Donation load error:', error);

      donationList.innerHTML =
        '<p class="donation-loading">অনুদানের তথ্য লোড করা যায়নি।</p>';
    });
}