let items = [], active = 'All';
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
  $('imageTab').textContent = hasImage ? '▧ ภาพการจัดท่า' : '▧ ภาพการจัดท่า (ไม่มีรูป)';
  $('modelTab').textContent = hasModel ? '◇ โมเดล 3D' : '◇ โมเดล 3D · รอไฟล์';

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
      empty.querySelector('span').textContent = 'สามารถดูรายละเอียดพารามิเตอร์และการจัดท่าด้านล่าง';
      $('modelBadge').textContent = 'INFO ONLY';
    }
  } else if (mode === 'model') {
    photoStage.classList.add('hidden');
    image.classList.add('hidden');
    if (hasModel) {
      empty.classList.add('hidden');
      viewer.classList.remove('hidden');
      if (viewer.src !== currentItem.model_url) {
        viewer.src = currentItem.model_url;
      }
      $('modelBadge').textContent = '3D READY';
    } else {
      viewer.classList.add('hidden');
      empty.classList.remove('hidden');
      empty.querySelector('strong').textContent = 'ยังไม่มีโมเดล 3D เฉพาะท่านี้';
      empty.querySelector('span').textContent = 'กำลังเพิ่มโมเดลกระดูกและข้อต่อในระบบ';
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

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    $('searchInput').focus();
  }
  if (e.key === 'Escape') closeModal();
});

async function init() {
  try {
    const res = await fetch('data/positions.json');
    if (!res.ok) throw new Error('Cannot load positions.json');
    items = await res.json();
    renderNav();
    filter();
  } catch (e) {
    console.error(e);
    $('status').textContent = 'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบ data/positions.json';
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js?build=15').catch(console.warn);
}

init();
