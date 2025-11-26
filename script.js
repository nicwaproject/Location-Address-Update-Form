/* CONFIG */
const endpointURL = "";

/* -----------------------------
   Cached DOM elements
--------------------------------*/
const updateRadios = document.querySelectorAll('input[name="updateType"]');
const updateOther = document.getElementById('otherExplain');
const correctionsSection = document.getElementById('correctionsSection');
const correctionBoxes = document.querySelectorAll('#correctionItems input[type="checkbox"]');
const corrOther = document.getElementById('corrOther');

const locationSelect = document.getElementById('locationSelect');
const newLocationName = document.getElementById('newLocationName');

const addressSection = document.getElementById('addressSection');

const sqftSection = document.getElementById('sqftSection');
const usageSection = document.getElementById('usageSection');

const usageSelect = document.getElementById('usageSelect');
const usageOther = document.getElementById('usageOther');

const sprinklerSection = document.getElementById('sprinklerSection');
const alarmSection = document.getElementById('alarmSection');

const docsUpload = document.getElementById('docsUpload');
const contractSection = document.getElementById('contractSection');
const contractUpload = document.getElementById('contractUpload');

const aiInfo = document.getElementById('aiInfo');
const notes = document.getElementById('notes');

const agree = document.getElementById('agree');
const fullName = document.getElementById('fullName');
const statusMsg = document.getElementById('statusMsg');

/* Preview modal elements */
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
const previewBtn = document.getElementById('previewBtn');

/* Helpers */
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function escapeHtml(str){ return (str+'').replace(/[&<>"]/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

/* ---------------------------------
   BRANCHING LOGIC (unchanged)
----------------------------------*/
function updateUpdateType(){
  const sel = Array.from(updateRadios).find(r=>r.checked)?.value;

  if(sel === 'other') show(updateOther); else hide(updateOther);
  if(sel === 'correct') show(correctionsSection); else hide(correctionsSection);

  evaluateAddressVisibility();

  if(sel === 'sqft') show(sqftSection);
  else if(!isCorrectionChecked('sqft')) hide(sqftSection);

  if(sel === 'add'){
    show(usageSection);
    show(sqftSection);
  }
}

function isCorrectionChecked(val){
  return Array.from(correctionBoxes).some(cb=>cb.checked && cb.value===val);
}

Array.from(correctionBoxes).forEach(cb=>{
  cb.addEventListener('change', ()=>{
    if(cb.value === 'other'){
      cb.checked ? show(corrOther) : hide(corrOther);
    }
    evaluateAddressVisibility();

    if(cb.value === 'sqft'){
      cb.checked ? show(sqftSection) :
      Array.from(updateRadios).find(r=>r.checked && r.value==='add') ? null : hide(sqftSection);
    }

    if(cb.value === 'usage'){
      cb.checked ? show(usageSection) :
      Array.from(updateRadios).find(r=>r.checked && r.value==='add') ? null : hide(usageSection);
    }

    if(cb.value === 'sprinklers'){ cb.checked ? show(sprinklerSection) : hide(sprinklerSection);}
    if(cb.value === 'alarm'){ cb.checked ? show(alarmSection) : hide(alarmSection);}
  });
});

/* LOCATION */
locationSelect.addEventListener('change', ()=>{
  locationSelect.value === 'new' ? show(newLocationName) : hide(newLocationName);
  evaluateAddressVisibility();
});

/* ADDRESS VISIBILITY RULE */
function evaluateAddressVisibility(){
  const sel = Array.from(updateRadios).find(r=>r.checked)?.value;
  const addrRelated =
    isCorrectionChecked('street') ||
    isCorrectionChecked('city') ||
    isCorrectionChecked('state') ||
    isCorrectionChecked('zip');

  if(addrRelated || sel === 'add' || locationSelect.value === 'new'){
    show(addressSection);
  } else hide(addressSection);
}

/* USAGE OTHER */
usageSelect.addEventListener('change', ()=>{
  usageSelect.value === 'other' ? show(usageOther) : hide(usageOther);
});

/* AI INFO → show contract upload */
aiInfo.addEventListener('input', ()=>{
  if(aiInfo.value.trim()) show(contractSection);
  else { hide(contractSection); contractUpload.value = ''; }
});

/* RADIO UpdateType */
Array.from(updateRadios).forEach(r=>r.addEventListener('change', updateUpdateType));
updateUpdateType();

/* File constraints */
function checkFiles(input){
  const files = Array.from(input.files || []);
  const maxFiles = 5;
  const maxSize = 8 * 1024 * 1024;

  if(files.length > maxFiles){
    alert(`Please select up to ${maxFiles} files only.`);
    input.value = '';
    return false;
  }
  for(const f of files){
    if(f.size > maxSize){
      alert(`The file "${f.name}" exceeds the maximum size of 8MB.`);
      input.value = '';
      return false;
    }
  }
  return true;
}

docsUpload.addEventListener('change',(e)=>checkFiles(e.target));
contractUpload.addEventListener('change',(e)=>checkFiles(e.target));

/* ---------------------------------
   URL PREFILL (unchanged)
----------------------------------*/
function prefillFromURL(){
  const params = new URLSearchParams(window.location.search);

  if(params.get('orgName')) orgName.value = params.get('orgName');

  if(params.get('location')){
    const v = params.get('location');
    const opt = Array.from(locationSelect.options).find(o=>o.value===v || o.text===v);
    if(opt){
      locationSelect.value = opt.value;
    } else {
      locationSelect.value = 'new';
      newLocationName.value = v;
      show(newLocationName);
    }
  }

  if(params.get('addrStreet')) addrStreet.value = params.get('addrStreet');
  if(params.get('addrCity')) addrCity.value = params.get('addrCity');
  if(params.get('addrState')) addrState.value = params.get('addrState');
  if(params.get('addrZip')) addrZip.value = params.get('addrZip');

  if(params.get('sqft')){
    const s = params.get('sqft');
    const match = Array.from(sqftSelect.options).find(o=>o.text===s || o.value===s);
    if(match) sqftSelect.value = match.value;
  }

  if(params.get('usage')){
    const u = params.get('usage');
    const match = Array.from(usageSelect.options).find(o=>o.text===u || o.value===u);
    if(match) usageSelect.value = match.value;
  }
}

prefillFromURL();

/* ========================================================
   STORE ORIGINAL LABEL (run once on load)
======================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section-title").forEach(t => {
    // Ambil HTML lengkap, lalu buang nomor lama yang berbentuk <span class="q-number">...</span> di depan (jika ada)
    const raw = t.innerHTML.trim();

    // Hapus leading q-number span jika ada (kasus: <span class="q-number">1.</span> ...)
    const cleanHtml = raw.replace(/^\s*<span\s+class=["']q-number["'][^>]*>.*?<\/span>\s*/i, '');

    // Simpan HTML bersih (termasuk <span class="required-star"> jika ada) ke data-label
    t.setAttribute("data-label", cleanHtml);
  });

  // panggil renumber setelah data-label tersimpan
  renumberVisibleQuestions();
});

/* ========================================================
   DYNAMIC NUMBERING BASED ON VISIBLE SECTIONS
======================================================== */
// --- Generate data-label ---
document.querySelectorAll('.section-title').forEach(t=>{
  const clean = t.innerHTML.replace(/^\s*<span class="q-number">.*?<\/span>\s*/,'');
  t.setAttribute('data-label', clean);
});

function renumberVisibleQuestions() {
  const secs = document.querySelectorAll(".section");
  let counter = 1;

  secs.forEach(sec => {
    const title = sec.querySelector(".section-title");
    if (!title) return;

    const cleanLabel = title.getAttribute("data-label");

    if (!sec.classList.contains("hidden")) {
      title.innerHTML = `<span class="q-number">${counter}.</span> ${cleanLabel}`;
      counter++;
    } else {
      // KEEP HTML (not text)
      title.innerHTML = cleanLabel;
    }
  });
}

/* ========================================================
   DYNAMIC PREVIEW (reads only visible sections)
======================================================== */
function showPreviewModalDynamic() {
  const rows = [];
  const visibleSections = document.querySelectorAll(".section:not(.hidden)");

  visibleSections.forEach(sec => {
    const titleEl = sec.querySelector(".section-title");
    if (!titleEl) return;

    const label = titleEl.textContent.trim();
    let value = "";

    // input text/date
    const input = sec.querySelector("input:not([type='checkbox']):not([type='radio']):not([type='file'])");
    if (input) value = input.value.trim();

    // textarea
    const textarea = sec.querySelector("textarea");
    if (textarea) value = textarea.value.trim();

    // select
    const select = sec.querySelector("select");
    if (select) {
      value = select.options[select.selectedIndex]?.text || "";

      // custom "other" field
      if (select.value === "other") {
        const other = sec.querySelector("input.answer:not([type='file'])");
        if (other) value = other.value.trim();
      }
    }

    // radio group
    const radios = sec.querySelectorAll("input[type='radio']");
    if (radios.length) {
      const checked = Array.from(radios).find(r => r.checked);
      if (checked) {
        value = checked.parentElement.textContent.trim();
      }
    }

    // checkbox group
    const checks = sec.querySelectorAll("input[type='checkbox']");
    if (checks.length && !radios.length) {
      const checked = Array.from(checks)
        .filter(cb => cb.checked)
        .map(cb => cb.parentElement.textContent.trim());
      if (checked.length) value = checked.join(", ");
    }

    // file upload
    const fileInput = sec.querySelector("input[type='file']");
    if (fileInput && fileInput.files.length) {
      value = Array.from(fileInput.files).map(f => f.name).join(", ");
    }

    if (!value) value = "(not provided)";

    rows.push(`
      <div class="preview-row">
        <div class="preview-label">${label}</div>
        <div class="preview-value">${value}</div>
      </div>
    `);
  });

  previewBody.innerHTML = rows.join("");
  previewModal.classList.remove("hidden");
}

/* ========================================================
   TRIGGER PREVIEW BUTTON
======================================================== */
document.getElementById("previewBtn").addEventListener("click", () => {
  showPreviewModalDynamic();
});

/* ========================================================
   AUTO-RENUMBER ON ANY CHANGE
======================================================== */
document.body.addEventListener("change", () => {
  setTimeout(() => renumberVisibleQuestions(), 10);
});

function closePreviewModal(){
  previewModal.classList.add('hidden');
  previewModal.setAttribute('aria-hidden','true');
  // restore focus to preview button
  if(previewBtn) previewBtn.focus();
  if(modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler);
  modalKeyHandler = null;
}

/* Preview button — minimal validation so preview shows */
previewBtn.addEventListener('click', (ev)=>{
  ev.preventDefault();
  // minimal checks for preview: ensure orgName and updateType exist so preview is informative
  const orgFilled = !!(typeof orgName !== 'undefined' && orgName.value && orgName.value.trim());
  const updateSelected = Array.from(updateRadios).some(r=>r.checked);
  if(!orgFilled){
    if(!confirm('Organization name is empty. Show preview anyway?')) return;
  }
  if(!updateSelected){
    if(!confirm('Update type not selected. Show preview anyway?')) return;
  }
  showPreviewModalDynamic();
});

/* Close / edit buttons */
closePreview.addEventListener('click', closePreviewModal);
editBtn.addEventListener('click', closePreviewModal);

/* Confirm submit */
confirmSubmitBtn.addEventListener("click", async () => {
  closePreviewModal();

  // Validasi lagi sebelum kirim
  if (!validateForm()) return;

  const payload = buildPayload();

  try {
    const res = await fetch(endpointURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server error");

    statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
    statusMsg.style.borderLeftColor = "var(--green)";
    statusMsg.classList.remove("hidden");

  } catch (err) {
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
    statusMsg.style.borderLeftColor = "var(--red)";
    statusMsg.classList.remove("hidden");
  }
});

/* ---------------------------------
   BUILD PAYLOAD (unchanged)
----------------------------------*/
function buildPayload(){
  const payload = {};

  payload.orgName = orgName.value.trim();
  payload.updateType = Array.from(updateRadios).find(r=>r.checked)?.value || '';
  payload.corrections = Array.from(correctionBoxes).filter(cb=>cb.checked).map(cb=>cb.value);
  payload.correctionsOther = corrOther.value.trim();

  payload.location = locationSelect.value === 'new'
    ? (newLocationName.value.trim() || 'New location')
    : locationSelect.value;

  payload.address = {
    street: addrStreet.value.trim(),
    city: addrCity.value.trim(),
    state: addrState.value.trim(),
    zip: addrZip.value.trim()
  };

  payload.sqft = sqftSelect.value;
  payload.usage = usageSelect.value === 'other' ? usageOther.value.trim() : usageSelect.value;

  payload.sprinkler =
    Array.from(document.querySelectorAll('input[name="sprinkler"]')).find(r=>r.checked)?.value || '';

  payload.alarm =
    Array.from(document.querySelectorAll('input[name="alarm"]')).find(r=>r.checked)?.value || '';

  payload.effectiveDate = document.getElementById('effDate').value;
  payload.aiInfo = aiInfo.value.trim();
  payload.notes = notes.value.trim();
  payload.agree = agree.checked;
  payload.fullName = fullName.value.trim();

  payload.submittedAt = new Date().toISOString();

  payload.files = Array.from(docsUpload.files || []).map(f=>({name:f.name,size:f.size}));
  if(contractUpload.files.length){
    payload.contract = Array.from(contractUpload.files).map(f=>({name:f.name,size:f.size}));
  }

  return payload;
}

/* ---------------------------------
   VALIDATION & SUBMIT (unchanged)
----------------------------------*/
function validateForm(quiet=false){
  if(!orgName.value.trim()){ if(!quiet) alert("Please enter Organization Name."); return false; }
  if(!Array.from(updateRadios).some(r=>r.checked)){ if(!quiet) alert("Select update type."); return false; }
  if(locationSelect.value==="" ){ if(!quiet) alert("Select location."); return false; }
  if(locationSelect.value==="new" && !newLocationName.value.trim()){ if(!quiet) alert("Enter new location name."); return false; }

  const sel = Array.from(updateRadios).find(r=>r.checked).value;

  if(sel==="correct" && !Array.from(correctionBoxes).some(cb=>cb.checked)){
    if(!quiet) alert("Please select at least one correction."); return false;
  }

  const needsEffDate =
    isCorrectionChecked('street') ||
    isCorrectionChecked('city') ||
    isCorrectionChecked('state') ||
    isCorrectionChecked('zip') ||
    sel==="add" ||
    locationSelect.value==='new';

  if(needsEffDate && !effDate.value){
    if(!quiet) alert("Please provide Effective Date of Change.");
    return false;
  }

  if(aiInfo.value.trim() && !contractUpload.files.length){
    if(!quiet) alert("Please upload contract when Additional Insured info is provided.");
    return false;
  }

  if(!agree.checked){ if(!quiet) alert("Please confirm accuracy."); return false; }
  if(!fullName.value.trim()){ if(!quiet) alert("Please provide signature."); return false; }

  if(!checkFiles(docsUpload)) return false;
  if(contractUpload.files.length && !checkFiles(contractUpload)) return false;

  return true;
}

/* Submit handler (demo-mode) */
document.getElementById('locForm').addEventListener('submit', (ev)=>{
  ev.preventDefault();

  if(!validateForm()) return;

  const payload = buildPayload();

  statusMsg.innerHTML = `
    <strong>No endpoint configured.</strong>
    <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload,null,2))}</pre>
  `;
  statusMsg.classList.remove('hidden');
  statusMsg.setAttribute('aria-hidden','false');
  window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
});

/* initial evaluate */
evaluateAddressVisibility();
updateUpdateType();
