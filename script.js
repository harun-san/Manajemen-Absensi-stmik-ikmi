// Aplikasi Sistem Manajemen Absensi Mahasiswa STMIK IKMI Cirebon

// Data dummy untuk simulasi jika Supabase belum diatur
const dummyUsers = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { username: 'dosen', password: 'dosen123', role: 'dosen', name: 'Dr. Ahmad S.T., M.Kom.' },
    { username: '202101001', password: 'mhs123', role: 'mahasiswa', name: 'Ahmad Fauzi', nim: '202101001' }
];

const dummyMahasiswa = [
    { id: 1, nim: '202101001', nama: 'Ahmad Fauzi', kelas: 'TI-1A', prodi: 'Teknik Informatika', semester: '3', email: 'ahmad@email.com', telepon: '081234567890', status: 'Aktif' },
    { id: 2, nim: '202101002', nama: 'Siti Nurhaliza', kelas: 'TI-1A', prodi: 'Teknik Informatika', semester: '3', email: 'siti@email.com', telepon: '081234567891', status: 'Aktif' },
    { id: 3, nim: '202101003', nama: 'Budi Santoso', kelas: 'TI-1B', prodi: 'Teknik Informatika', semester: '3', email: 'budi@email.com', telepon: '081234567892', status: 'Aktif' },
    { id: 4, nim: '202102001', nama: 'Dewi Anggraini', kelas: 'SI-1A', prodi: 'Sistem Informasi', semester: '3', email: 'dewi@email.com', telepon: '081234567893', status: 'Aktif' },
    { id: 5, nim: '202102002', nama: 'Rudi Hartono', kelas: 'SI-1A', prodi: 'Sistem Informasi', semester: '3', email: 'rudi@email.com', telepon: '081234567894', status: 'Aktif' },
    { id: 6, nim: '202101004', nama: 'Maya Sari', kelas: 'TI-1B', prodi: 'Teknik Informatika', semester: '3', email: 'maya@email.com', telepon: '081234567895', status: 'Aktif' },
    { id: 7, nim: '202103001', nama: 'Joko Widodo', kelas: 'MI-1A', prodi: 'Manajemen Informatika', semester: '3', email: 'joko@email.com', telepon: '081234567896', status: 'Aktif' },
    { id: 8, nim: '202103002', nama: 'Ani Wijaya', kelas: 'MI-1A', prodi: 'Manajemen Informatika', semester: '3', email: 'ani@email.com', telepon: '081234567897', status: 'Aktif' }
];

const dummyAbsensi = [
    { id: 1, nim: '202101001', nama: 'Ahmad Fauzi', kelas: 'TI-1A', matkul: 'Pemrograman Web', tanggal: '2023-10-10', status: 'Hadir', keterangan: '' },
    { id: 2, nim: '202101002', nama: 'Siti Nurhaliza', kelas: 'TI-1A', matkul: 'Pemrograman Web', tanggal: '2023-10-10', status: 'Hadir', keterangan: '' },
    { id: 3, nim: '202101003', nama: 'Budi Santoso', kelas: 'TI-1B', matkul: 'Basis Data', tanggal: '2023-10-10', status: 'Izin', keterangan: 'Acara keluarga' },
    { id: 4, nim: '202102001', nama: 'Dewi Anggraini', kelas: 'SI-1A', matkul: 'Algoritma', tanggal: '2023-10-10', status: 'Sakit', keterangan: 'Flu' },
    { id: 5, nim: '202101004', nama: 'Maya Sari', kelas: 'TI-1B', matkul: 'Basis Data', tanggal: '2023-10-10', status: 'Alpha', keterangan: '' }
];

// State aplikasi
let currentUser = null;
let mahasiswaData = [];
let absensiData = [];
let currentMahasiswaPage = 1;
let mahasiswaPerPage = 10;
let kelasList = ['TI-1A', 'TI-1B', 'TI-2A', 'TI-2B', 'TI-3A', 'TI-3B', 'SI-1A', 'SI-1B', 'SI-2A', 'SI-2B', 'MI-1A', 'MI-1B'];
let currentAbsensiSession = {
    kelas: '',
    matkul: '',
    tanggal: new Date().toISOString().split('T')[0]
};

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Fungsi inisialisasi aplikasi
async function initApp() {
    // Atur tanggal hari ini
    document.getElementById('absensi-tanggal').value = currentAbsensiSession.tanggal;
    document.getElementById('current-date').textContent = getCurrentDateFormatted();
    
    // Inisialisasi tahun untuk laporan
    initTahunLaporan();
    
    // Inisialisasi kelas untuk dropdown
    initKelasDropdowns();
    
    // Setup event listeners
    setupEventListeners();
    
    // Cek status login
    checkLoginStatus();
    
    // Cek koneksi database
    checkDatabaseConnection();
}

// Setup semua event listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigasi sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Data Mahasiswa
    document.getElementById('add-mahasiswa-btn').addEventListener('click', showAddMahasiswaModal);
    document.getElementById('refresh-mahasiswa-btn').addEventListener('click', loadMahasiswaData);
    document.getElementById('search-mahasiswa').addEventListener('input', filterMahasiswaTable);
    document.getElementById('filter-kelas').addEventListener('change', filterMahasiswaTable);
    
    // Absensi
    document.getElementById('take-absensi-btn').addEventListener('click', showQRModal);
    document.getElementById('load-absensi-btn').addEventListener('click', loadAbsensiData);
    document.getElementById('save-absensi-btn').addEventListener('click', saveAbsensi);
    document.getElementById('reset-absensi-btn').addEventListener('click', resetAbsensiForm);
    
    // Laporan
    document.getElementById('generate-laporan-btn').addEventListener('click', generateLaporan);
    document.getElementById('export-laporan-btn').addEventListener('click', exportLaporan);
    document.getElementById('print-laporan-btn').addEventListener('click', printLaporan);
    
    // Pengaturan
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            showSettingsTab(tab);
            
            // Update active state
            document.querySelectorAll('.tab-btn').forEach(tabBtn => tabBtn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.getElementById('save-account-btn').addEventListener('click', saveAccountSettings);
    document.getElementById('save-system-btn').addEventListener('click', saveSystemSettings);
    
    // Modal
    document.getElementById('cancel-mahasiswa-btn').addEventListener('click', closeMahasiswaModal);
    document.getElementById('save-mahasiswa-btn').addEventListener('click', saveMahasiswa);
    
    // Konfirmasi modal
    document.getElementById('confirm-cancel').addEventListener('click', closeConfirmModal);
    document.getElementById('confirm-ok').addEventListener('click', confirmAction);
    
    // QR Modal
    document.getElementById('generate-qr-btn').addEventListener('click', generateQRCode);
    document.getElementById('close-qr-btn').addEventListener('click', closeQRModal);
    
    // Tutup modal dengan klik di luar
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
        
        // Tutup modal dengan tombol close
        modal.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        });
    });
}

// Fungsi untuk mengecek status login
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('absensi_user'));
    
    if (user) {
        currentUser = user;
        showApp();
    } else {
        showLogin();
    }
}

// Fungsi untuk mengecek koneksi database
async function checkDatabaseConnection() {
    const statusElement = document.getElementById('db-status');
    const statusDot = document.querySelector('.status-dot');
    
    try {
        // Coba koneksi ke Supabase
        if (typeof supabase !== 'undefined') {
            const { data, error } = await supabase.from('mahasiswa').select('count').limit(1);
            
            if (error) throw error;
            
            statusElement.textContent = 'Terhubung ke Database';
            statusDot.classList.add('connected');
            statusDot.classList.remove('disconnected');
        } else {
            statusElement.textContent = 'Mode Demo (Tanpa Database)';
            statusDot.classList.remove('connected');
            statusDot.classList.add('disconnected');
        }
    } catch (error) {
        console.log('Mode demo aktif:', error);
        statusElement.textContent = 'Mode Demo (Tanpa Database)';
        statusDot.classList.remove('connected');
        statusDot.classList.add('disconnected');
        
        // Load data dummy
        loadDummyData();
    }
}

// Load data dummy
function loadDummyData() {
    mahasiswaData = [...dummyMahasiswa];
    absensiData = [...dummyAbsensi];
    
    // Update dashboard
    updateDashboard();
    
    // Load tabel mahasiswa
    loadMahasiswaData();
    
    // Load tabel absensi terbaru
    loadRecentAbsensi();
    
    // Load mahasiswa baru
    loadNewMahasiswa();
}

// Fungsi untuk handle login
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    
    if (!username || !password) {
        showToast('Username dan password harus diisi!', 'error');
        return;
    }
    
    // Cek di data dummy
    const user = dummyUsers.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        currentUser = user;
        localStorage.setItem('absensi_user', JSON.stringify(user));
        showApp();
        showToast(`Selamat datang, ${user.name}!`, 'success');
    } else {
        showToast('Username, password, atau peran salah!', 'error');
    }
}

// Fungsi untuk handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('absensi_user');
    showLogin();
    showToast('Anda telah logout', 'info');
}

// Tampilkan halaman login
function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    
    // Reset form login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Tampilkan aplikasi utama
function showApp() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    
    // Tampilkan nama pengguna
    document.getElementById('username-display').textContent = currentUser.name;
    
    // Set role di pengaturan
    document.getElementById('setting-role').value = currentUser.role;
    document.getElementById('setting-username').value = currentUser.username;
    
    // Batasi akses berdasarkan role
    restrictAccessByRole();
    
    // Load data
    loadDummyData();
    showPage('dashboard');
}

// Batasi akses berdasarkan role
function restrictAccessByRole() {
    const role = currentUser.role;
    const navItems = document.querySelectorAll('.nav-item');
    
    // Reset semua item
    navItems.forEach(item => item.style.display = 'flex');
    
    if (role === 'mahasiswa') {
        // Mahasiswa hanya bisa melihat dashboard dan absensi
        document.querySelector('.nav-item[data-page="mahasiswa"]').style.display = 'none';
        document.querySelector('.nav-item[data-page="laporan"]').style.display = 'none';
        document.querySelector('.nav-item[data-page="pengaturan"]').style.display = 'none';
        
        // Sembunyikan tombol tambah mahasiswa
        document.getElementById('add-mahasiswa-btn').style.display = 'none';
    } else if (role === 'dosen') {
        // Dosen tidak bisa mengelola data mahasiswa
        document.querySelector('.nav-item[data-page="mahasiswa"]').style.display = 'none';
        document.getElementById('add-mahasiswa-btn').style.display = 'none';
    }
}

// Tampilkan halaman tertentu
function showPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Jika halaman mahasiswa, load data
    if (pageId === 'mahasiswa') {
        loadMahasiswaData();
    }
    
    // Jika halaman laporan, generate laporan bulan ini
    if (pageId === 'laporan') {
        const now = new Date();
        document.getElementById('laporan-bulan').value = now.getMonth() + 1;
        document.getElementById('laporan-tahun').value = now.getFullYear();
        generateLaporan();
    }
}

// Update dashboard
function updateDashboard() {
    document.getElementById('total-mahasiswa').textContent = mahasiswaData.length;
    document.getElementById('absensi-hari-ini').textContent = absensiData.filter(a => a.tanggal === new Date().toISOString().split('T')[0]).length;
    document.getElementById('total-kelas').textContent = [...new Set(mahasiswaData.map(m => m.kelas))].length;
    
    // Hitung rata-rata kehadiran
    const totalHadir = absensiData.filter(a => a.status === 'Hadir').length;
    const totalAbsensi = absensiData.length;
    const rataKehadiran = totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0;
    document.getElementById('rata-kehadiran').textContent = `${rataKehadiran}%`;
}

// Load data mahasiswa
function loadMahasiswaData() {
    const tbody = document.getElementById('mahasiswa-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Filter data jika ada pencarian
    const searchTerm = document.getElementById('search-mahasiswa').value.toLowerCase();
    const filterKelas = document.getElementById('filter-kelas').value;
    
    let filteredData = mahasiswaData;
    
    if (searchTerm) {
        filteredData = filteredData.filter(m => 
            m.nim.toLowerCase().includes(searchTerm) || 
            m.nama.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterKelas) {
        filteredData = filteredData.filter(m => m.kelas === filterKelas);
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredData.length / mahasiswaPerPage);
    const startIndex = (currentMahasiswaPage - 1) * mahasiswaPerPage;
    const endIndex = startIndex + mahasiswaPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // Isi tabel
    pageData.forEach((mahasiswa, index) => {
        const row = document.createElement('tr');
        const no = startIndex + index + 1;
        
        row.innerHTML = `
            <td>${no}</td>
            <td>${mahasiswa.nim}</td>
            <td>${mahasiswa.nama}</td>
            <td>${mahasiswa.kelas}</td>
            <td>${mahasiswa.prodi}</td>
            <td>${mahasiswa.semester}</td>
            <td>
                <button class="btn-action btn-edit" data-id="${mahasiswa.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" data-id="${mahasiswa.id}" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Setup event listeners untuk tombol aksi
    setupMahasiswaActionButtons();
    
    // Update pagination
    updateMahasiswaPagination(totalPages);
}

// Setup tombol aksi di tabel mahasiswa
function setupMahasiswaActionButtons() {
    // Tombol edit
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editMahasiswa(id);
        });
    });
    
    // Tombol hapus
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteMahasiswa(id);
        });
    });
}

// Update pagination mahasiswa
function updateMahasiswaPagination(totalPages) {
    const paginationContainer = document.getElementById('mahasiswa-pagination');
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Tombol sebelumnya
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentMahasiswaPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentMahasiswaPage > 1) {
            currentMahasiswaPage--;
            loadMahasiswaData();
        }
    });
    paginationContainer.appendChild(prevBtn);
    
    // Tombol halaman
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.toggle('active', i === currentMahasiswaPage);
        pageBtn.addEventListener('click', () => {
            currentMahasiswaPage = i;
            loadMahasiswaData();
        });
        paginationContainer.appendChild(pageBtn);
    }
    
    // Tombol berikutnya
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentMahasiswaPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentMahasiswaPage < totalPages) {
            currentMahasiswaPage++;
            loadMahasiswaData();
        }
    });
    paginationContainer.appendChild(nextBtn);
}

// Filter tabel mahasiswa
function filterMahasiswaTable() {
    currentMahasiswaPage = 1;
    loadMahasiswaData();
}

// Tampilkan modal tambah mahasiswa
function showAddMahasiswaModal() {
    document.getElementById('modal-title').textContent = 'Tambah Mahasiswa';
    document.getElementById('mahasiswa-form').reset();
    document.getElementById('mahasiswa-id').value = '';
    document.getElementById('mahasiswa-modal').classList.add('active');
}

// Edit mahasiswa
function editMahasiswa(id) {
    const mahasiswa = mahasiswaData.find(m => m.id === id);
    
    if (!mahasiswa) return;
    
    document.getElementById('modal-title').textContent = 'Edit Mahasiswa';
    document.getElementById('mahasiswa-id').value = mahasiswa.id;
    document.getElementById('modal-nim').value = mahasiswa.nim;
    document.getElementById('modal-nama').value = mahasiswa.nama;
    document.getElementById('modal-kelas').value = mahasiswa.kelas;
    document.getElementById('modal-prodi').value = mahasiswa.prodi;
    document.getElementById('modal-semester').value = mahasiswa.semester;
    document.getElementById('modal-email').value = mahasiswa.email || '';
    document.getElementById('modal-telepon').value = mahasiswa.telepon || '';
    document.getElementById('modal-status').value = mahasiswa.status || 'Aktif';
    
    document.getElementById('mahasiswa-modal').classList.add('active');
}

// Tutup modal mahasiswa
function closeMahasiswaModal() {
    document.getElementById('mahasiswa-modal').classList.remove('active');
}

// Simpan mahasiswa (tambah/edit)
function saveMahasiswa() {
    const id = document.getElementById('mahasiswa-id').value;
    const nim = document.getElementById('modal-nim').value.trim();
    const nama = document.getElementById('modal-nama').value.trim();
    const kelas = document.getElementById('modal-kelas').value;
    const prodi = document.getElementById('modal-prodi').value;
    const semester = document.getElementById('modal-semester').value;
    const email = document.getElementById('modal-email').value.trim();
    const telepon = document.getElementById('modal-telepon').value.trim();
    const status = document.getElementById('modal-status').value;
    
    // Validasi
    if (!nim || !nama || !kelas || !prodi || !semester) {
        showToast('Harap isi semua field yang wajib diisi!', 'error');
        return;
    }
    
    // Cek NIM duplikat (kecuali untuk edit)
    const isDuplicateNIM = mahasiswaData.some(m => m.nim === nim && m.id !== parseInt(id));
    if (isDuplicateNIM) {
        showToast('NIM sudah terdaftar!', 'error');
        return;
    }
    
    if (id) {
        // Edit mahasiswa
        const index = mahasiswaData.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            mahasiswaData[index] = {
                ...mahasiswaData[index],
                nim, nama, kelas, prodi, semester, email, telepon, status
            };
            
            showToast('Data mahasiswa berhasil diupdate!', 'success');
        }
    } else {
        // Tambah mahasiswa baru
        const newId = mahasiswaData.length > 0 ? Math.max(...mahasiswaData.map(m => m.id)) + 1 : 1;
        mahasiswaData.push({
            id: newId,
            nim, nama, kelas, prodi, semester, email, telepon, status: status || 'Aktif'
        });
        
        showToast('Mahasiswa baru berhasil ditambahkan!', 'success');
    }
    
    // Update dashboard
    updateDashboard();
    
    // Reload tabel mahasiswa
    loadMahasiswaData();
    
    // Tutup modal
    closeMahasiswaModal();
}

// Hapus mahasiswa
function deleteMahasiswa(id) {
    const mahasiswa = mahasiswaData.find(m => m.id === id);
    
    if (!mahasiswa) return;
    
    // Tampilkan modal konfirmasi
    document.getElementById('confirm-message').textContent = `Apakah Anda yakin ingin menghapus mahasiswa ${mahasiswa.nama} (NIM: ${mahasiswa.nim})?`;
    document.getElementById('confirm-ok').setAttribute('data-id', id);
    document.getElementById('confirm-ok').setAttribute('data-action', 'delete-mahasiswa');
    document.getElementById('confirm-modal').classList.add('active');
}

// Load absensi terbaru untuk dashboard
function loadRecentAbsensi() {
    const tbody = document.getElementById('recent-absensi-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Ambil 5 absensi terbaru
    const recentAbsensi = [...absensiData]
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
        .slice(0, 5);
    
    recentAbsensi.forEach(absensi => {
        const row = document.createElement('tr');
        
        // Format waktu
        const date = new Date(absensi.tanggal);
        const waktu = date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
        
        // Warna status
        let statusClass = '';
        switch(absensi.status) {
            case 'Hadir': statusClass = 'status-hadir'; break;
            case 'Izin': statusClass = 'status-izin'; break;
            case 'Sakit': statusClass = 'status-sakit'; break;
            case 'Alpha': statusClass = 'status-alpha'; break;
        }
        
        row.innerHTML = `
            <td>${absensi.nim}</td>
            <td>${absensi.nama}</td>
            <td>${absensi.kelas}</td>
            <td><span class="status-badge ${statusClass}">${absensi.status}</span></td>
            <td>${waktu}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Load mahasiswa baru untuk dashboard
function loadNewMahasiswa() {
    const tbody = document.getElementById('new-mahasiswa-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Ambil 5 mahasiswa terbaru (dummy, asumsi id terbesar = terbaru)
    const newMahasiswa = [...mahasiswaData]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
    
    newMahasiswa.forEach(mahasiswa => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${mahasiswa.nim}</td>
            <td>${mahasiswa.nama}</td>
            <td>${mahasiswa.kelas}</td>
            <td>${mahasiswa.prodi}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Load data absensi berdasarkan filter
function loadAbsensiData() {
    const kelas = document.getElementById('absensi-kelas').value;
    const matkul = document.getElementById('absensi-mata-kuliah').value;
    const tanggal = document.getElementById('absensi-tanggal').value;
    
    if (!kelas || !matkul || !tanggal) {
        showToast('Harap pilih kelas, mata kuliah, dan tanggal!', 'error');
        return;
    }
    
    // Simpan sesi absensi
    currentAbsensiSession = { kelas, matkul, tanggal };
    
    const tbody = document.getElementById('absensi-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Filter mahasiswa berdasarkan kelas
    const mahasiswaKelas = mahasiswaData.filter(m => m.kelas === kelas);
    
    // Cari absensi yang sudah ada untuk kombinasi ini
    const existingAbsensi = absensiData.filter(a => 
        a.kelas === kelas && 
        a.matkul === matkul && 
        a.tanggal === tanggal
    );
    
    mahasiswaKelas.forEach((mahasiswa, index) => {
        const row = document.createElement('tr');
        
        // Cek apakah sudah ada absensi untuk mahasiswa ini
        const existing = existingAbsensi.find(a => a.nim === mahasiswa.nim);
        const status = existing ? existing.status : 'Hadir';
        const keterangan = existing ? existing.keterangan : '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${mahasiswa.nim}</td>
            <td>${mahasiswa.nama}</td>
            <td>
                <select class="status-select" data-nim="${mahasiswa.nim}">
                    <option value="Hadir" ${status === 'Hadir' ? 'selected' : ''}>Hadir</option>
                    <option value="Izin" ${status === 'Izin' ? 'selected' : ''}>Izin</option>
                    <option value="Sakit" ${status === 'Sakit' ? 'selected' : ''}>Sakit</option>
                    <option value="Alpha" ${status === 'Alpha' ? 'selected' : ''}>Alpha</option>
                </select>
            </td>
            <td>
                <input type="text" class="keterangan-input" data-nim="${mahasiswa.nim}" value="${keterangan}" placeholder="Keterangan (opsional)">
            </td>
            <td>
                <button class="btn-action btn-reset" data-nim="${mahasiswa.nim}" title="Reset ke Hadir">
                    <i class="fas fa-redo"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Setup event listeners untuk tombol reset
    document.querySelectorAll('.btn-reset').forEach(btn => {
        btn.addEventListener('click', function() {
            const nim = this.getAttribute('data-nim');
            resetAbsensiMahasiswa(nim);
        });
    });
}

// Reset absensi untuk mahasiswa tertentu
function resetAbsensiMahasiswa(nim) {
    const row = document.querySelector(`.status-select[data-nim="${nim}"]`).closest('tr');
    const statusSelect = row.querySelector('.status-select');
    const keteranganInput = row.querySelector('.keterangan-input');
    
    statusSelect.value = 'Hadir';
    keteranganInput.value = '';
}

// Reset form absensi
function resetAbsensiForm() {
    document.getElementById('absensi-kelas').value = '';
    document.getElementById('absensi-mata-kuliah').value = '';
    document.getElementById('absensi-tanggal').value = new Date().toISOString().split('T')[0];
    
    const tbody = document.getElementById('absensi-table').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Pilih kelas, mata kuliah, dan tanggal untuk menampilkan data</td></tr>';
}

// Simpan absensi
function saveAbsensi() {
    const kelas = currentAbsensiSession.kelas;
    const matkul = currentAbsensiSession.matkul;
    const tanggal = currentAbsensiSession.tanggal;
    
    if (!kelas || !matkul || !tanggal) {
        showToast('Harap pilih kelas, mata kuliah, dan tanggal terlebih dahulu!', 'error');
        return;
    }
    
    // Hapus absensi lama untuk kombinasi ini
    absensiData = absensiData.filter(a => 
        !(a.kelas === kelas && a.matkul === matkul && a.tanggal === tanggal)
    );
    
    // Ambil data absensi baru dari tabel
    const rows = document.querySelectorAll('#absensi-table tbody tr');
    let savedCount = 0;
    
    rows.forEach(row => {
        const nim = row.querySelector('.status-select').getAttribute('data-nim');
        const nama = row.querySelector('td:nth-child(3)').textContent;
        const status = row.querySelector('.status-select').value;
        const keterangan = row.querySelector('.keterangan-input').value;
        
        // Tambah ke absensiData
        const newId = absensiData.length > 0 ? Math.max(...absensiData.map(a => a.id)) + 1 : 1;
        
        absensiData.push({
            id: newId,
            nim,
            nama,
            kelas,
            matkul,
            tanggal,
            status,
            keterangan
        });
        
        savedCount++;
    });
    
    // Update dashboard
    updateDashboard();
    loadRecentAbsensi();
    
    showToast(`Absensi berhasil disimpan untuk ${savedCount} mahasiswa!`, 'success');
}

// Generate laporan
function generateLaporan() {
    const bulan = parseInt(document.getElementById('laporan-bulan').value);
    const tahun = parseInt(document.getElementById('laporan-tahun').value);
    const kelas = document.getElementById('laporan-kelas').value;
    
    // Filter absensi berdasarkan bulan dan tahun
    let filteredAbsensi = absensiData.filter(a => {
        const date = new Date(a.tanggal);
        return date.getMonth() + 1 === bulan && date.getFullYear() === tahun;
    });
    
    // Filter berdasarkan kelas jika dipilih
    if (kelas) {
        filteredAbsensi = filteredAbsensi.filter(a => a.kelas === kelas);
    }
    
    // Kelompokkan data per mahasiswa
    const mahasiswaMap = new Map();
    
    // Inisialisasi untuk semua mahasiswa
    let mahasiswaToProcess = kelas ? 
        mahasiswaData.filter(m => m.kelas === kelas) : 
        mahasiswaData;
    
    mahasiswaToProcess.forEach(m => {
        mahasiswaMap.set(m.nim, {
            nim: m.nim,
            nama: m.nama,
            kelas: m.kelas,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpha: 0
        });
    });
    
    // Hitung statistik
    filteredAbsensi.forEach(a => {
        if (mahasiswaMap.has(a.nim)) {
            const stats = mahasiswaMap.get(a.nim);
            
            switch(a.status) {
                case 'Hadir': stats.hadir++; break;
                case 'Izin': stats.izin++; break;
                case 'Sakit': stats.sakit++; break;
                case 'Alpha': stats.alpha++; break;
            }
            
            mahasiswaMap.set(a.nim, stats);
        }
    });
    
    // Konversi ke array
    const laporanData = Array.from(mahasiswaMap.values());
    
    // Update ringkasan
    updateLaporanSummary(laporanData);
    
    // Update tabel detail
    updateLaporanTable(laporanData);
}

// Update ringkasan laporan
function updateLaporanSummary(data) {
    let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlpha = 0;
    
    data.forEach(item => {
        totalHadir += item.hadir;
        totalIzin += item.izin;
        totalSakit += item.sakit;
        totalAlpha += item.alpha;
    });
    
    document.getElementById('summary-hadir').textContent = totalHadir;
    document.getElementById('summary-izin').textContent = totalIzin;
    document.getElementById('summary-sakit').textContent = totalSakit;
    document.getElementById('summary-alpha').textContent = totalAlpha;
}

// Update tabel laporan
function updateLaporanTable(data) {
    const tbody = document.getElementById('laporan-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const total = item.hadir + item.izin + item.sakit + item.alpha;
        const persentase = total > 0 ? Math.round((item.hadir / total) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nim}</td>
            <td>${item.nama}</td>
            <td>${item.kelas}</td>
            <td>${item.hadir}</td>
            <td>${item.izin}</td>
            <td>${item.sakit}</td>
            <td>${item.alpha}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${persentase}%"></div>
                    <span>${persentase}%</span>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Export laporan
function exportLaporan() {
    showToast('Fitur export laporan akan segera tersedia!', 'info');
}

// Print laporan
function printLaporan() {
    window.print();
}

// Tampilkan tab pengaturan
function showSettingsTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Simpan pengaturan akun
function saveAccountSettings() {
    const password = document.getElementById('setting-password').value;
    const confirmPassword = document.getElementById('setting-confirm-password').value;
    
    if (password && password !== confirmPassword) {
        showToast('Password dan konfirmasi password tidak cocok!', 'error');
        return;
    }
    
    // Simpan perubahan (dalam implementasi nyata, ini akan ke backend)
    if (password) {
        showToast('Password berhasil diubah!', 'success');
        document.getElementById('setting-password').value = '';
        document.getElementById('setting-confirm-password').value = '';
    } else {
        showToast('Tidak ada perubahan yang disimpan.', 'info');
    }
}

// Simpan pengaturan sistem
function saveSystemSettings() {
    const institution = document.getElementById('setting-institution').value;
    const timeout = document.getElementById('setting-timeout').value;
    const records = document.getElementById('setting-records').value;
    const notifications = document.getElementById('setting-notifications').checked;
    const darkmode = document.getElementById('setting-darkmode').checked;
    
    // Simpan ke localStorage
    const settings = {
        institution,
        timeout: parseInt(timeout),
        recordsPerPage: parseInt(records),
        notifications,
        darkmode
    };
    
    localStorage.setItem('absensi_settings', JSON.stringify(settings));
    
    // Terapkan pengaturan
    mahasiswaPerPage = parseInt(records);
    
    // Update tema jika berubah
    if (darkmode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    showToast('Pengaturan sistem berhasil disimpan!', 'success');
}

// Tampilkan modal QR Code
function showQRModal() {
    // Set data untuk QR Code
    document.getElementById('qr-modal').classList.add('active');
    
    // Generate QR Code
    generateQRCode();
}

// Generate QR Code
function generateQRCode() {
    const kelas = document.getElementById('absensi-kelas').value || 'TI-1A';
    const matkul = document.getElementById('absensi-mata-kuliah').value || 'Pemrograman Web';
    const tanggal = document.getElementById('absensi-tanggal').value || new Date().toISOString().split('T')[0];
    
    // Update info QR
    document.getElementById('qr-kelas').textContent = kelas;
    document.getElementById('qr-matkul').textContent = matkul;
    document.getElementById('qr-tanggal').textContent = formatDate(tanggal);
    
    // Data untuk QR Code
    const qrData = JSON.stringify({
        type: 'absensi',
        kelas,
        matkul,
        tanggal,
        timestamp: Date.now()
    });
    
    // Generate QR Code
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = '';
    
    QRCode.toCanvas(qrContainer, qrData, {
        width: 200,
        height: 200,
        color: {
            dark: '#2a5298',
            light: '#ffffff'
        }
    }, function(error) {
        if (error) {
            console.error('QR Code error:', error);
            qrContainer.innerHTML = '<p>Gagal generate QR Code</p>';
        }
    });
}

// Tutup modal QR
function closeQRModal() {
    document.getElementById('qr-modal').classList.remove('active');
}

// Modal konfirmasi
let pendingAction = null;

function confirmAction() {
    const action = document.getElementById('confirm-ok').getAttribute('data-action');
    const id = parseInt(document.getElementById('confirm-ok').getAttribute('data-id'));
    
    if (action === 'delete-mahasiswa') {
        // Hapus mahasiswa
        mahasiswaData = mahasiswaData.filter(m => m.id !== id);
        showToast('Mahasiswa berhasil dihapus!', 'success');
        
        // Update dashboard
        updateDashboard();
        
        // Reload tabel mahasiswa
        loadMahasiswaData();
    }
    
    closeConfirmModal();
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('active');
    document.getElementById('confirm-ok').removeAttribute('data-action');
    document.getElementById('confirm-ok').removeAttribute('data-id');
}

// Fungsi utilitas
function getCurrentDateFormatted() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return now.toLocaleDateString('id-ID', options);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function initTahunLaporan() {
    const select = document.getElementById('laporan-tahun');
    const currentYear = new Date().getFullYear();
    
    // Tambahkan 5 tahun ke belakang dan 1 tahun ke depan
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === currentYear;
        select.appendChild(option);
    }
}

function initKelasDropdowns() {
    const kelasOptions = document.querySelectorAll('.kelas-dropdown');
    
    kelasOptions.forEach(select => {
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add kelas options
        kelasList.forEach(kelas => {
            const option = document.createElement('option');
            option.value = kelas;
            option.textContent = kelas;
            select.appendChild(option);
        });
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.remove();
    });
}

// Tambahkan CSS untuk status badge dan progress bar
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .status-hadir {
        background-color: #d4edda;
        color: #155724;
    }
    
    .status-izin {
        background-color: #fff3cd;
        color: #856404;
    }
    
    .status-sakit {
        background-color: #d1ecf1;
        color: #0c5460;
    }
    
    .status-alpha {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    .btn-action {
        background: none;
        border: none;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
    }
    
    .btn-edit {
        color: #2a5298;
    }
    
    .btn-edit:hover {
        background-color: #eef2ff;
    }
    
    .btn-delete {
        color: #dc3545;
    }
    
    .btn-delete:hover {
        background-color: #f8d7da;
    }
    
    .btn-reset {
        color: #6c757d;
    }
    
    .btn-reset:hover {
        background-color: #f8f9fa;
    }
    
    .progress-bar-container {
        width: 100%;
        background-color: #e9ecef;
        border-radius: 4px;
        height: 1.5rem;
        position: relative;
        overflow: hidden;
    }
    
    .progress-bar {
        height: 100%;
        background-color: #28a745;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    
    .progress-bar-container span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.8rem;
        font-weight: 600;
        color: #333;
    }
    
    .text-center {
        text-align: center;
    }
    
    .dark-mode {
        background-color: #1a1a1a;
        color: #f0f0f0;
    }
    
    .dark-mode .card,
    .dark-mode .content-box,
    .dark-mode .sidebar,
    .dark-mode .modal-content {
        background-color: #2d2d2d;
        color: #f0f0f0;
    }
    
    .dark-mode table th {
        background-color: #333;
        color: #f0f0f0;
    }
    
    .dark-mode table td {
        border-color: #444;
    }
    
    .dark-mode .form-group input,
    .dark-mode .form-group select,
    .dark-mode .search-box {
        background-color: #333;
        color: #f0f0f0;
        border-color: #555;
    }
    
    .status-dot.disconnected {
        background-color: #dc3545;
    }
`;
document.head.appendChild(style);
