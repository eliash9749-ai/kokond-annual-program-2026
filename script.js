<!-- MEMBER LOGIN & REGISTRATION EDIT -->
<section id="memberPortal" class="section soft">
  <div class="section-head">
    <span>MEMBER PORTAL</span>
    <h2>নিজের নিবন্ধন দেখুন ও পরিবর্তন করুন</h2>
    <p>আগে নিবন্ধন করে থাকলে নিজের নাম ও মোবাইল নম্বর দিয়ে তথ্য খুঁজুন।</p>
  </div>

  <div class="panel form-panel">
    <form id="memberLoginForm">
      <div class="fields">
        <label>নিবন্ধিত নাম
          <input name="name" required>
        </label>
        <label>মোবাইল নম্বর
          <input name="mobile" inputmode="numeric" maxlength="10" required>
        </label>
      </div>
      <button class="btn primary" type="submit">আমার নিবন্ধন খুঁজুন</button>
      <p id="memberLoginMsg" class="form-msg"></p>
    </form>
    <div id="memberDetails"></div>
  </div>
</section>

<!-- ADMIN DASHBOARD ENTRY -->
<section id="adminPortal" class="section">
  <div class="section-head">
    <span>MANAGEMENT</span>
    <h2>প্রশাসনিক প্যানেল</h2>
    <p>অনুষ্ঠানের ব্যবস্থাপনা ও নিয়ন্ত্রণের জন্য।</p>
  </div>
  <div class="panel form-panel">
    <form id="adminLoginForm">
      <label>Admin Email
        <input type="email" name="email" required>
      </label>
      <label>Admin Password
        <input type="password" name="password" required>
      </label>
      <button class="btn primary" type="submit">Admin Login</button>
      <p id="adminLoginMsg" class="form-msg"></p>
    </form>
    <div id="adminDashboard"></div>
  </div>
</section>

<!-- LIVE JUDGING -->
<section id="liveJudging" class="section soft">
  <div class="section-head">
    <span>KACP LIVE</span>
    <h2>লাইভ প্রতিযোগিতা ও ফলাফল</h2>
    <p>প্রতিযোগিতার বর্তমান অবস্থা এবং অনুমোদিত ফলাফল এখানে দেখা যাবে।</p>
  </div>
  <div class="panel form-panel">
    <div id="liveCompetitionStatus">
      <p>বর্তমানে কোনো লাইভ ফলাফল প্রকাশিত হয়নি।</p>
    </div>
    <div id="liveResults"></div>
  </div>
</section>

<!-- CONTROLLER & JUDGE PANELS -->
<section id="judgingAccess" class="section">
  <div class="section-head">
    <span>JUDGING SYSTEM</span>
    <h2>Controller ও Judge প্রবেশ</h2>
  </div>
  <div class="panel form-panel">
    <form id="judgingLoginForm">
      <label>Account ID
        <input name="account" required>
      </label>
      <label>Password
        <input name="password" type="password" required>
      </label>
      <button class="btn primary" type="submit">প্রবেশ করুন</button>
      <p id="judgingLoginMsg" class="form-msg"></p>
    </form>
    <div id="judgingWorkspace"></div>
  </div>
</section>
