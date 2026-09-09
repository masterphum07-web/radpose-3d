let items = [], active = 'All';
let isAdmin = localStorage.getItem('radpose_is_admin') === 'true';

const $ = id => document.getElementById(id);
const categories = ['All', 'Upper Extremity', 'Lower Extremity', 'Spine', 'Chest/Abdomen', 'Skull/Facial'];

function esc(v = '') {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function renderNav() {
  $('categoryContainer').innerHTML = categories.map(c => 
    `<button class="${c === active ? 'active' : ''}" data-cat="${c}">${c === 'All' ? 'ทั้งหมด' : c}</button>`
  ).join('');

  document.querySelectorAll('nav button').forEach(b => {
    b.onclick = () => {
      active = b.dataset.cat;
      renderNav();
      filter();
    };
  });
}

function filter() {
  const q = $('searchInput').value.trim().toLowerCase();
  const found = items.filter(x => 
    (active === 'All' || x.category === active) &&
    (!q || [x.name_en, x.name_th, x.category, x.clinical_indication, ...(x.aliases || [])].join(' ').toLowerCase().includes(q))
  );

  $('status').textContent = found.length ? `${found.length} ท่า` : 'ไม่พบข้อมูล';
  $('positionsGrid').innerHTML = found.length ? found.map(x => `
    <article class="card" tabindex="0" data-id="${esc(x.id)}">
      <div class="card-top">
        <span class="tag">${esc(x.category)}</span>
        <span class="arrow">↗</span>
      </div>
      <h3>${esc(x.name_en)}</h3>
      <p class="thai">${esc(x.name_th)}</p>
      <p>${esc(x.clinical_indication)}</p>
      <footer>
        <span><span class="status-dot"></span>${x.model_url ? 'โมเดล 3D และพารามิเตอร์' : 'ภาพและพารามิเตอร์'}</span>
        <b>→</b>
      </footer>
    </article>
  `).join('') : `
    <div class="empty">
      <div>⌕</div>
      <h3>ยังไม่พบรายการ</h3>
      <p>ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น</p>
    </div>
  `;

  document.querySelectorAll('.card').forEach(c => {
    c.onclick = () => open(items.find(x => x.id === c.dataset.id));
    c.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(items.find(x => x.id === c.dataset.id));
      }
    };
  });
}

let currentItem = null;

function renderHotspots(item) {
  const viewer = $('modelViewer');
  // Remove existing dynamic hotspots
  viewer.querySelectorAll('.hotspot-cr, .xray-beam-container').forEach(el => el.remove());

  if (!item || !item.hotspots) return;

  item.hotspots.forEach(h => {
    const wrapper = document.createElement('div');
    wrapper.className = 'xray-beam-container';
    wrapper.slot = h.slot || 'hotspot-cr';
    wrapper.dataset.position = h.position;
    wrapper.dataset.normal = h.normal || '0m 1m 0m';

    const tubeHead = document.createElement('div');
    tubeHead.className = 'xray-tube-head';
    tubeHead.textContent = '☢ X-RAY TUBE';

    const beam = document.createElement('div');
    beam.className = 'xray-beam-laser';

    const targetBtn = document.createElement('button');
    targetBtn.className = 'hotspot-cr';
    targetBtn.textContent = h.text || '⚡ Central Ray (CR)';

    wrapper.appendChild(tubeHead);
    wrapper.appendChild(beam);
    wrapper.appendChild(targetBtn);

    viewer.appendChild(wrapper);
  });
}

function setView(mode) {
  if (!currentItem) return;
  const image = $('positioningPhoto');
  const viewer = $('modelViewer');
  const empty = $('viewerEmpty');
  const photoStage = $('photoStage');

  const hasImage = Boolean(currentItem.image_url) && !image.classList.contains('image-failed');
  const hasModel = Boolean(currentItem.model_url);

  $('imageTab').classList.toggle('active', mode === 'image');
  $('modelTab').classList.toggle('active', mode === 'model');
  $('imageTab').textContent = hasImage ? '▧ ภาพการจัดท่า' : '▧ ภาพการจัดท่า (รออัปโหลด)';
  $('modelTab').textContent = hasModel ? '◇ โมเดล 3D' : '◇ โมเดล 3D (ไม่มี)';

  if (mode === 'image') {
    viewer.classList.add('hidden');
    if (hasImage) {
      photoStage.classList.remove('hidden');
      image.classList.remove('hidden');
      empty.classList.add('hidden');
      $('modelBadge').textContent = 'IMAGE GUIDE';
    } else {
      photoStage.classList.add('hidden');
      image.classList.add('hidden');
      empty.classList.remove('hidden');
      empty.querySelector('strong').textContent = 'ยังไม่มีภาพประกอบสำหรับท่านี้';
      empty.querySelector('span').textContent = isAdmin ? 'กดปุ่ม "✏️ แก้ไขท่านี้" ด้านบนเพื่ออัปโหลดภาพ' : 'สามารถดูพารามิเตอร์และจุดสำคัญด้านล่าง';
      $('modelBadge').textContent = 'INFO ONLY';
    }
  } else if (mode === 'model') {
    photoStage.classList.add('hidden');
    image.classList.add('hidden');
    if (hasModel) {
      empty.classList.add('hidden');
      viewer.classList.remove('hidden');

      // Set camera angle and target focused on the specific anatomical area
      if (currentItem.camera_orbit) {
        viewer.setAttribute('camera-orbit', currentItem.camera_orbit);
      } else {
        viewer.removeAttribute('camera-orbit');
      }
      if (currentItem.camera_target) {
        viewer.setAttribute('camera-target', currentItem.camera_target);
      } else {
        viewer.removeAttribute('camera-target');
      }

      renderHotspots(currentItem);

      if (viewer.getAttribute('src') !== currentItem.model_url) {
        viewer.setAttribute('src', currentItem.model_url);
      }
      $('modelBadge').textContent = '3D READY';
    } else {
      viewer.classList.add('hidden');
      empty.classList.remove('hidden');
      empty.querySelector('strong').textContent = 'ยังไม่มีโมเดล 3D สำหรับท่านี้';
      empty.querySelector('span').textContent = 'กำลังพัฒนาและจัดเตรียมโมเดล 3D เพิ่มเติม';
      $('modelBadge').textContent = 'MODEL PENDING';
    }
  }
}

function open(x) {
  if (!x) return;
  currentItem = x;
  $('modalTitle').textContent = x.name_en;
  $('modalCategory').textContent = `${x.category} • ${x.name_th}`;

  const viewer = $('modelViewer');
  const image = $('positioningPhoto');

  viewer.removeAttribute('src');
  image.removeAttribute('src');
  image.classList.remove('image-failed');

  if (isAdmin) {
    $('editCurrentPositionBtn').classList.remove('hidden');
  } else {
    $('editCurrentPositionBtn').classList.add('hidden');
  }

  const p = x.parameters || {};
  $('crBarText').textContent = p.central_ray || 'ดูรายละเอียดด้านล่าง';

  image.onerror = () => {
    image.classList.add('image-failed');
    image.removeAttribute('src');
    if ($('imageTab').classList.contains('active')) {
      setView('image');
    }
  };

  image.onload = () => {
    image.classList.remove('image-failed');
    if ($('imageTab').classList.contains('active')) {
      setView('image');
    }
  };

  if (x.image_credit) {
    $('sourceCredit').classList.remove('hidden');
    $('sourceCredit').textContent = x.image_credit;
  } else {
    $('sourceCredit').classList.add('hidden');
    $('sourceCredit').textContent = '';
  }

  if (x.image_url) {
    image.src = x.image_url;
    image.alt = `ภาพการจัดท่า ${x.name_en}`;
  }

  // Render clinical parameters table
  $('details').innerHTML = `
    <div class="detail highlight">
      <strong>SID / IR</strong>
      <span>${esc(p.sid || '-')}<br>${esc(p.ir_size || '-')}</span>
    </div>
    <div class="detail highlight">
      <strong>TUBE / GRID</strong>
      <span>${esc(p.tube_angle || '-')}<br>${esc(p.grid || '-')}</span>
    </div>
    <div class="detail highlight">
      <strong>EXPOSURE</strong>
      <span>${esc(p.kvp_range || '-')}<br>${esc(p.mas_range || '-')}</span>
    </div>
    <div class="detail wide highlight">
      <strong>CENTRAL RAY · จุดสำคัญ</strong>
      <span>${esc(p.central_ray || '-')}</span>
    </div>
    <div class="detail wide">
      <strong>การจัดท่าผู้ป่วย</strong>
      <span>${esc(x.patient_position || '-')}</span>
    </div>
    <div class="detail wide">
      <strong>เกณฑ์ภาพที่ดี · เช็กก่อนกดถ่าย</strong>
      <ul>${(x.image_criteria || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
    <div class="detail wide tip">
      <strong>PRO TIP · จุดที่ควรปรับ/ระวัง</strong>
      <span>${esc(x.pro_tips || '-')}</span>
    </div>
  `;

  $('detailModal').classList.remove('hidden');
  document.body.classList.add('modal-open');

  // Default to model view if available, otherwise image
  if (x.model_url) {
    setView('model');
  } else {
    setView('image');
  }
}

function closeModal() {
  $('detailModal').classList.add('hidden');
  document.body.classList.remove('modal-open');
  $('modelViewer').removeAttribute('src');
  $('positioningPhoto').removeAttribute('src');
  currentItem = null;
}

$('closeModalBtn').onclick = closeModal;
$('detailModal').onclick = e => {
  if (e.target.id === 'detailModal') closeModal();
};

$('themeBtn').onclick = () => {
  document.body.classList.toggle('light');
  $('themeBtn').textContent = document.body.classList.contains('light') ? '☾' : '☼';
};

$('imageTab').onclick = () => setView('image');
$('modelTab').onclick = () => setView('model');
$('searchInput').oninput = filter;

/* Admin functionality */
function toggleAdminMode() {
  if (!isAdmin) {
    const pwd = prompt('กรุณาใส่รหัสผ่านแอดมิน: (ค่าเริ่มต้นคือ rad123)');
    if (pwd === 'rad123' || pwd === 'admin') {
      isAdmin = true;
      localStorage.setItem('radpose_is_admin', 'true');
      alert('เข้าสู่โหมดแอดมินเรียบร้อย! คุณสามารถคลิกท่าแล้วกด "✏️ แก้ไขท่านี้" เพื่ออัปโหลดรูปภาพหรือแก้ไขค่าได้');
      $('adminBtn').textContent = '✅ แอดมิน (ON)';
      if (currentItem) $('editCurrentPositionBtn').classList.remove('hidden');
    } else if (pwd !== null) {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  } else {
    if (confirm('ต้องการออกจากโหมดแอดมินหรือไม่?')) {
      isAdmin = false;
      localStorage.setItem('radpose_is_admin', 'false');
      $('adminBtn').textContent = '⚙️ แอดมิน';
      $('editCurrentPositionBtn').classList.add('hidden');
    }
  }
}

$('adminBtn').onclick = toggleAdminMode;
if (isAdmin) $('adminBtn').textContent = '✅ แอดมิน (ON)';

function openAdminEdit(item) {
  if (!item) return;
  $('editId').value = item.id;
  $('editNameEn').value = item.name_en || '';
  $('editNameTh').value = item.name_th || '';
  $('editIndication').value = item.clinical_indication || '';
  $('editPatientPosition').value = item.patient_position || '';

  const p = item.parameters || {};
  $('editSid').value = p.sid || '';
  $('editIrSize').value = p.ir_size || '';
  $('editTubeAngle').value = p.tube_angle || '';
  $('editGrid').value = p.grid || '';
  $('editKvp').value = p.kvp_range || '';
  $('editMas').value = p.mas_range || '';
  $('editCr').value = p.central_ray || '';

  $('editImageUrl').value = item.image_url || '';
  $('editModelUrl').value = item.model_url || '';
  $('editImageFile').value = '';

  $('adminModal').classList.remove('hidden');
}

function closeAdminModal() {
  $('adminModal').classList.add('hidden');
}

$('editCurrentPositionBtn').onclick = () => {
  openAdminEdit(currentItem);
};

$('closeAdminBtn').onclick = closeAdminModal;
$('adminModal').onclick = e => {
  if (e.target.id === 'adminModal') closeAdminModal();
};

// Handle Image File upload (Convert to Base64 data URL)
$('editImageFile').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    $('editImageUrl').value = evt.target.result;
  };
  reader.readAsDataURL(file);
};

// Save edits
$('adminForm').onsubmit = e => {
  e.preventDefault();
  const id = $('editId').value;
  const item = items.find(x => x.id === id);
  if (!item) return;

  item.name_en = $('editNameEn').value;
  item.name_th = $('editNameTh').value;
  item.clinical_indication = $('editIndication').value;
  item.patient_position = $('editPatientPosition').value;

  item.parameters = item.parameters || {};
  item.parameters.sid = $('editSid').value;
  item.parameters.ir_size = $('editIrSize').value;
  item.parameters.tube_angle = $('editTubeAngle').value;
  item.parameters.grid = $('editGrid').value;
  item.parameters.kvp_range = $('editKvp').value;
  item.parameters.mas_range = $('editMas').value;
  item.parameters.central_ray = $('editCr').value;

  item.image_url = $('editImageUrl').value || null;
  item.model_url = $('editModelUrl').value || null;

  // Save to LocalStorage so edits persist immediately in browser
  localStorage.setItem('radpose_custom_positions', JSON.stringify(items));

  closeAdminModal();
  filter();
  if (currentItem && currentItem.id === id) {
    open(item);
  }
  alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
};

// Export JSON
$('exportDataBtn').onclick = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "positions.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    $('searchInput').focus();
  }
  if (e.key === 'Escape') {
    closeModal();
    closeAdminModal();
  }
});

async function init() {
  try {
    const res = await fetch('data/positions.json');
    if (!res.ok) throw new Error('Cannot load positions.json');
    const defaultItems = await res.json();
    
    // Check if user has saved custom data in localStorage
    const saved = localStorage.getItem('radpose_custom_positions');
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (err) {
        items = defaultItems;
      }
    } else {
      items = defaultItems;
    }

    renderNav();
    filter();
  } catch (e) {
    console.error(e);
    $('status').textContent = 'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบ data/positions.json';
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js?build=17').catch(console.warn);
}

init();
