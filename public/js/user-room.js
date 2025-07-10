// Script untuk user-room.html: join/leave room, render dinamis

// Script untuk user-room.html: join/leave room, render dinamis, multi-room, sidebar

// State
let allRooms = [];
let activeRoom = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
});

function renderAll() {
  Promise.all([
    fetch('/api/rooms/my/active').then(res => res.json()),
    fetch('/api/rooms/my/rooms').then(res => res.json())
  ]).then(([active, all]) => {
    const container = document.getElementById('room-container');
    if (!container) return;
    container.innerHTML = '';
    activeRoom = (active.active && active.room) ? active.room : null;
    allRooms = (all.success && Array.isArray(all.rooms)) ? all.rooms : [];
    renderJoinForm(container);
    // Hilangkan renderActiveRoom agar tidak tampil box biru di atas
    renderRoomList(container, allRooms, activeRoom);
  });
}

function renderJoinForm(container) {
  // Tombol + Gabung Room
  const div = document.createElement('div');
  div.className = 'mb-4 d-flex justify-content-between align-items-center';
  div.innerHTML = `
    <h5 class="mb-0"><i class="fas fa-list me-2"></i>Daftar Room Anda</h5>
    <button class="btn btn-primary" id="btn-join-room"><i class="fas fa-plus me-1"></i>Gabung Room</button>
  `;
  container.appendChild(div);
  // Modal join room (sekali saja di body)
  if (!document.getElementById('joinRoomModal')) {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal fade" id="joinRoomModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Gabung Room</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="text" class="form-control mb-2" id="kode-room-modal" placeholder="Kode Room">
              <div id="join-result-modal"></div>
              <div id="buat-room-form" style="display:none;">
                <input type="text" class="form-control mb-2" id="nama-room-baru" placeholder="Nama Room Baru">
                <button class="btn btn-success w-100" id="submit-buat-room">Buat Room Baru</button>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" class="btn btn-primary" id="submit-join-room">Gabung</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Event tombol buka modal
  div.querySelector('#btn-join-room').onclick = function() {
    const modal = new bootstrap.Modal(document.getElementById('joinRoomModal'));
    document.getElementById('kode-room-modal').value = '';
    document.getElementById('join-result-modal').innerHTML = '';
    document.getElementById('buat-room-form').style.display = 'none';
    modal.show();
    document.getElementById('submit-join-room').onclick = function() {
      const kode = document.getElementById('kode-room-modal').value.trim();
      if (!kode) {
        document.getElementById('join-result-modal').innerHTML = '<div class="alert alert-danger">Kode room wajib diisi!</div>';
        return;
      }
      // Coba join room
      fetch(`/api/rooms/${encodeURIComponent(kode)}/join`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          const resultDiv = document.getElementById('join-result-modal');
          if (data.success) {
            resultDiv.innerHTML = '<div class="alert alert-success">Berhasil join room!</div>';
            setTimeout(() => {
              modal.hide();
              renderAll();
            }, 700);
          } else if (data.error && data.error.includes('tidak ditemukan')) {
            // Room tidak ditemukan, tawarkan buat room baru
            resultDiv.innerHTML = `<div class='alert alert-warning'>Room tidak ditemukan. Ingin membuat room baru dengan kode ini?</div>`;
            document.getElementById('buat-room-form').style.display = '';
            document.getElementById('submit-buat-room').onclick = function() {
              const nama = document.getElementById('nama-room-baru').value.trim();
              if (!nama) {
                resultDiv.innerHTML = '<div class="alert alert-danger">Nama room wajib diisi!</div>';
                return;
              }
              // Buat room baru (POST ke /api/rooms/ oleh leader, di sini user tidak bisa, jadi tampilkan info)
              resultDiv.innerHTML = '<div class="alert alert-info">Hanya leader yang bisa membuat room baru. Silakan hubungi leader untuk membuat room.</div>';
            };
          } else {
            resultDiv.innerHTML = `<div class='alert alert-danger'>${data.error || 'Gagal join room'}</div>`;
          }
        });
    };
  };
}

function joinRoom(kode, form, cb) {
  fetch(`/api/rooms/${encodeURIComponent(kode)}/join`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      let result = null;
      if (form && form.querySelector) {
        result = form.querySelector('#join-result');
      } else if (document.getElementById('join-result-modal')) {
        result = document.getElementById('join-result-modal');
      }
      if (data.success) {
        if (result) result.innerHTML = '<div class="alert alert-success">Berhasil join room!</div>';
        setTimeout(() => {
          if (cb) cb();
          renderAll();
        }, 700);
      } else {
        if (result) result.innerHTML = `<div class='alert alert-danger'>${data.error || 'Gagal join room'}</div>`;
        if (form) form.reset();
      }
    });
}

function renderActiveRoom(container, room) {
  if (!room) return;
  const div = document.createElement('div');
  div.className = 'mb-4';
  div.innerHTML = `
    <div class="alert alert-info mb-2">
      <b>Room Aktif:</b> ${room.name} <span class="badge bg-secondary ms-2">${room.code}</span><br>
      <span>Status: <b>${room.ended ? 'Sesi Berakhir' : 'Aktif'}</b></span>
      <button class="btn btn-sm btn-danger float-end" id="keluar-room">Keluar</button>
    </div>
  `;
  div.querySelector('#keluar-room').onclick = function() {
    leaveRoom(room.code);
  };
  container.appendChild(div);
}

function leaveRoom(kode) {
  fetch(`/api/rooms/${encodeURIComponent(kode)}/leave`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      renderAll();
    });
}

function renderRoomList(container, rooms, activeRoom) {
  // Pisahkan room yang sedang di-join dan riwayat
  const joinedRooms = rooms.filter(r => r.is_joined);
  const historyRooms = rooms.filter(r => !r.is_joined);

  // Bagian: Room yang sedang diikuti (tanpa judul, langsung list putih)
  const divJoined = document.createElement('div');
  if (!joinedRooms.length) {
    const empty = document.createElement('div');
    empty.innerHTML = `<div class="alert alert-warning">Anda belum join room apapun.</div>`;
    divJoined.appendChild(empty);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'list-group mb-2';
    joinedRooms.forEach(room => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      // Format waktu join
      let waktuJoin = '-';
      if (room.joined_at) {
        const tgl = new Date(room.joined_at);
        waktuJoin = tgl.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      }
      // Status room
      const statusRoom = room.ended ? '<span class="badge bg-secondary">Selesai</span>' : '<span class="badge bg-success">Berlangsung</span>';
      // Tombol Masuk (hanya jika belum di-end)
      const btnMasuk = !room.ended ? `<button class="btn btn-sm btn-primary masuk-btn">Masuk</button>` : '';
      // Hilangkan tombol Statistik User
      const btnStatUser = '';
      // Tombol Salin Kode
      const btnKode = `<button class="btn btn-sm btn-outline-secondary ms-2 kode-btn" title="Salin kode room"><i class="fas fa-copy"></i></button>`;
      // Tombol Keluar (hanya jika belum di-end)
      const btnKeluar = !room.ended ? `<button class="btn btn-sm btn-outline-danger ms-2 keluar-btn">Keluar</button>` : '';
      li.innerHTML = `
        <div class="d-flex flex-column flex-md-row w-100 justify-content-between align-items-md-center">
          <div>
            <b>${room.name}</b>
            <span class="ms-2 small text-muted">Join: ${waktuJoin}</span>
            <div class="mt-1">${statusRoom}</div>
          </div>
          <div class="mt-2 mt-md-0">
            ${btnMasuk}
            ${btnKode}
            ${btnKeluar}
          </div>
        </div>
      `;
      // Event tombol salin kode
      const kodeBtn = li.querySelector('.kode-btn');
      if (kodeBtn) {
        kodeBtn.onclick = () => {
          navigator.clipboard.writeText(room.code);
          kodeBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => kodeBtn.innerHTML = '<i class="fas fa-copy"></i>', 1200);
        };
      }
      // Event tombol masuk
      const masukBtn = li.querySelector('.masuk-btn');
      if (masukBtn) {
        masukBtn.onclick = () => {
          window.location.href = `/chat.html?room=${encodeURIComponent(room.code)}`;
        };
      }
      // Tidak perlu event handler JS untuk tombol statistik user (langsung link)


function renderUserRoomStatsAverages(counts, total) {
  const container = document.getElementById('userRoomEmotionAverages');
  if (!container) return;
  total = total || 1;
  const averages = {
    happy: ((counts.happy / total) * 100).toFixed(1),
    sad: ((counts.sad / total) * 100).toFixed(1),
    angry: ((counts.angry / total) * 100).toFixed(1),
    neutral: ((counts.neutral / total) * 100).toFixed(1)
  };
  let html = `<div style='margin-bottom:12px;'><b>Rangkuman Emosi Anda:</b></div>`;
  html += `<ul style='list-style:none;padding:0;'>`;
  Object.entries(averages).forEach(([em, val]) => {
    const color = em === 'happy' ? '#4caf50' : em === 'sad' ? '#2196f3' : em === 'angry' ? '#f44336' : '#9e9e9e';
    const label = em === 'happy' ? 'Senang' : em === 'sad' ? 'Sedih' : em === 'angry' ? 'Marah' : 'Netral';
    html += `<li style='margin-bottom:7px;'><span style='display:inline-block;width:80px;'>${label}</span> <span style='color:${color};font-weight:bold;'>${val}%</span> <span style='font-size:12px;color:#888;'>(${counts[em]} pesan)</span></li>`;
  });
  html += `</ul>`;
  container.innerHTML = html;
}
      // Event tombol keluar
      const keluarBtn = li.querySelector('.keluar-btn');
      if (keluarBtn) {
        keluarBtn.onclick = () => leaveRoom(room.code);
      }
      ul.appendChild(li);
    });
    divJoined.appendChild(ul);
  }
  container.appendChild(divJoined);

  // Bagian: Riwayat Room
  if (historyRooms.length) {
    const divHistory = document.createElement('div');
    const titleHistory = document.createElement('h6');
    titleHistory.textContent = 'Riwayat Room';
    divHistory.appendChild(titleHistory);
    const ul = document.createElement('ul');
    ul.className = 'list-group mb-2';
    historyRooms.forEach(room => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      // Format waktu join
      let waktuJoin = '-';
      if (room.joined_at) {
        const tgl = new Date(room.joined_at);
        waktuJoin = tgl.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      }
      // Status room
      const statusRoom = room.ended ? '<span class="badge bg-secondary">Selesai</span>' : '<span class="badge bg-success">Berlangsung</span>';
      // Tombol Statistik
      const btnStat = `<button class="btn btn-sm btn-outline-info ms-2 statistik-btn">Statistik</button>`;
      // Tombol Salin Kode
      const btnKode = `<button class="btn btn-sm btn-outline-secondary ms-2 kode-btn" title="Salin kode room"><i class="fas fa-copy"></i></button>`;
      li.innerHTML = `
        <div class="d-flex flex-column flex-md-row w-100 justify-content-between align-items-md-center">
          <div>
            <b>${room.name}</b> <span class="badge bg-secondary ms-2">${room.code}</span>
            <span class="ms-2 small text-muted">Join: ${waktuJoin}</span>
            <span class="ms-2">${statusRoom}</span>
          </div>
          <div class="mt-2 mt-md-0">
            ${btnStat}
            ${btnKode}
          </div>
        </div>
      `;
      // Event tombol salin kode
      const kodeBtn = li.querySelector('.kode-btn');
      if (kodeBtn) {
        kodeBtn.onclick = () => {
          navigator.clipboard.writeText(room.code);
          kodeBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => kodeBtn.innerHTML = '<i class="fas fa-copy"></i>', 1200);
        };
      }
      // Event tombol statistik (statistik user POV)
      const statBtn = li.querySelector('.statistik-btn');
      if (statBtn) {
        statBtn.onclick = () => {
          window.location.href = '/user/stats';
        };
      }
      ul.appendChild(li);
    });
    divHistory.appendChild(ul);
    container.appendChild(divHistory);
  }
}
