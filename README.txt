KOKOND ANNUAL PROGRAM WEBSITE — VERSION 3

V3-তে নতুন:
1) ১৮টি প্রতিযোগিতার বড় visual card + প্রতিটি card থেকে registration.
2) Home hero-তে Kaaba / Masjid an-Nabawi / Kaaba night slideshow (Wikimedia Commons online images).
3) KYC এবং New Member form সম্পূর্ণ front-end.
4) Code.gs-এ KYC photo upload, Google Drive storage, Manager Gmail notification, secure random approval token, Approve/Reject, Committee profile completion backend.
5) Approved member data website-এ dynamic load করার ব্যবস্থা.

KYC চালু করার জন্য অবশ্যই করতে হবে:
A. Google Sheet > Extensions > Apps Script খুলুন।
B. পুরোনো Code.gs পুরো মুছে এই ZIP-এর Code.gs-এর সম্পূর্ণ code paste করুন। Save করুন।
C. Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy.
   Execute as: Me; Who has access: Anyone.
D. নতুন permission চাইলে Allow করুন (Sheets, Drive, Email permissions দরকার)।
E. এরপর website-এর KYC/New Member form test করুন।

Code নিজে থেকেই এই Sheet tabs তৈরি করবে: KYC Requests, New Member Applications, Committee Members.
Program Manager notification email: eliash9749@gmail.com

গুরুত্বপূর্ণ: Approval email-এর link গোপন রাখুন। Random token ছাড়া approval হবে না।
ছবির সীমা: browser form-এ 2.5MB; backend-এ 3MB.

Hero images: Wikimedia Commons. Internet না থাকলে gradient background থাকবে; slideshow photos load হবে না।
