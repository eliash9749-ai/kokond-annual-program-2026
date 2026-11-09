// KOKOND WEBSITE V3 BACKEND — replace the old Code.gs with this entire file.
const MANAGER_EMAIL = 'eliash9749@gmail.com';
const DRIVE_FOLDER_NAME = 'Kokond Annual Program 2026 - Member Photos';

function doPost(e) {
  try {
    const action = (e.parameter.action || 'registration').trim();
    if (action === 'kyc' || action === 'newMember') return handleMemberRequest_(e, action);
    return handleRegistration_(e);
  } catch (err) { return json_({status:'error', message:String(err)}); }
}

function doGet(e) {
  try {
    const action = (e.parameter.action || '').trim();
    if (action === 'members') return getApprovedMembers_();
    if (action === 'approve' || action === 'reject') return reviewRequest_(e, action);
    return ContentService.createTextOutput('Kokond Annual Program API is running.');
  } catch (err) { return ContentService.createTextOutput('Error: '+err); }
}

function handleRegistration_(e) {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName('Sheet1') || ss.insertSheet('Sheet1');
  if(sh.getLastRow()===0) sh.appendRow(['Registration No','Name','Mobile','Age','Event','Date & Time']);
  const regNo='KAC-'+Utilities.getUuid().substring(0,6).toUpperCase();
  sh.appendRow([regNo,e.parameter.name,e.parameter.mobile,e.parameter.age,e.parameter.event,new Date()]);
  return json_({status:'success',registrationNo:regNo});
}

function handleMemberRequest_(e, action) {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sheetName=action==='kyc'?'KYC Requests':'New Member Applications';
  const sh=ensureSheet_(ss,sheetName,['Request ID','Name','Mobile','Photo URL','Status','Token','Submitted At','Reviewed At']);
  const name=(e.parameter.memberName||'').trim(), mobile=(e.parameter.mobile||'').trim();
  if(!name || !/^\d{10}$/.test(mobile)) throw new Error('নাম বা মোবাইল সঠিক নয়');
  const photoUrl=savePhoto_(e,name);
  const id=(action==='kyc'?'KYC-':'NEW-')+Utilities.getUuid().substring(0,8).toUpperCase();
  const token=Utilities.getUuid()+Utilities.getUuid();
  sh.appendRow([id,name,mobile,photoUrl,'Pending',token,new Date(),'']);
  const base=ScriptApp.getService().getUrl();
  const approve=base+'?action=approve&type='+encodeURIComponent(action)+'&id='+encodeURIComponent(id)+'&token='+encodeURIComponent(token);
  const reject=base+'?action=reject&type='+encodeURIComponent(action)+'&id='+encodeURIComponent(id)+'&token='+encodeURIComponent(token);
  const subject=(action==='kyc'?'KYC Approval: ':'New Committee Member: ')+name;
  const html='<h2>'+subject+'</h2><p><b>মোবাইল:</b> '+mobile+'</p><p><a href="'+photoUrl+'">ছবি দেখুন</a></p><p><a style="padding:10px 16px;background:#08704c;color:white;text-decoration:none" href="'+approve+'">APPROVE</a> &nbsp; <a style="padding:10px 16px;background:#c33;color:white;text-decoration:none" href="'+reject+'">REJECT</a></p><p>এই গোপন approval link অন্য কাউকে forward করবেন না।</p>';
  MailApp.sendEmail({to:MANAGER_EMAIL,subject:subject,htmlBody:html,body:subject+'\n'+approve});
  return json_({status:'success',requestId:id});
}

function reviewRequest_(e, decision) {
  const type=e.parameter.type, id=e.parameter.id, token=e.parameter.token;
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sourceName=type==='kyc'?'KYC Requests':'New Member Applications';
  const sh=ss.getSheetByName(sourceName); if(!sh) return page_('Request sheet পাওয়া যায়নি।');
  const data=sh.getDataRange().getValues(); let row=-1;
  for(let i=1;i<data.length;i++) if(String(data[i][0])===id && String(data[i][5])===token){row=i+1;break}
  if(row<0) return page_('এই approval link সঠিক নয় বা পুরোনো।');
  if(sh.getRange(row,5).getValue()!=='Pending') return page_('এই request ইতিমধ্যে review করা হয়েছে।');
  const name=sh.getRange(row,2).getValue(), mobile=sh.getRange(row,3).getValue(), photo=sh.getRange(row,4).getValue();
  if(decision==='approve') {
    const members=ensureSheet_(ss,'Committee Members',['Name','Role','Mobile','Photo URL','Status','Updated At']);
    const vals=members.getDataRange().getValues(); let mr=-1;
    for(let i=1;i<vals.length;i++) if(String(vals[i][0]).trim()===String(name).trim()){mr=i+1;break}
    if(mr<0){members.appendRow([name,'Member',mobile,photo,'Approved',new Date()]);}
    else {members.getRange(mr,3,1,4).setValues([[mobile,photo,'Approved',new Date()]]);}
    sh.getRange(row,5).setValue('Approved');
  } else sh.getRange(row,5).setValue('Rejected');
  sh.getRange(row,8).setValue(new Date());
  return page_(decision==='approve'?'অনুমোদন সফল হয়েছে। Website-এ Profile Complete দেখাবে।':'আবেদন Reject করা হয়েছে।');
}

function getApprovedMembers_(){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Committee Members');
  if(!sh) return json_({status:'success',members:[]});
  const v=sh.getDataRange().getValues(), out=[];
  for(let i=1;i<v.length;i++) if(v[i][4]==='Approved') out.push({name:v[i][0],role:v[i][1],mobile:v[i][2],photoUrl:driveView_(v[i][3]),status:v[i][4]});
  return json_({status:'success',members:out});
}

function savePhoto_(e,name){
  const b64=e.parameter.photoBase64, type=e.parameter.photoType||'image/jpeg'; if(!b64) throw new Error('ছবি পাওয়া যায়নি');
  const bytes=Utilities.base64Decode(b64); if(bytes.length>3*1024*1024) throw new Error('ছবি খুব বড়');
  const folders=DriveApp.getFoldersByName(DRIVE_FOLDER_NAME); const folder=folders.hasNext()?folders.next():DriveApp.createFolder(DRIVE_FOLDER_NAME);
  const ext=type.includes('png')?'.png':type.includes('webp')?'.webp':'.jpg';
  const file=folder.createFile(Utilities.newBlob(bytes,type,name+'-'+Date.now()+ext));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  return file.getUrl();
}
function driveView_(url){const m=String(url||'').match(/[-\\w]{25,}/);return m?'https://drive.google.com/thumbnail?id='+m[0]+'&sz=w500':''}
function ensureSheet_(ss,n,h){let sh=ss.getSheetByName(n);if(!sh){sh=ss.insertSheet(n);sh.appendRow(h)}return sh}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function page_(msg){return HtmlService.createHtmlOutput('<meta charset="utf-8"><div style="font-family:sans-serif;max-width:600px;margin:80px auto;text-align:center"><h2>'+msg+'</h2><p>এই window বন্ধ করতে পারেন।</p></div>')}
