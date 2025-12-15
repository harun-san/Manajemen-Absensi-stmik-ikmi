// Konfigurasi Supabase
// Ganti dengan URL dan Key Supabase Anda

const SUPABASE_URL = 'https://uhgrmridprwrzjrbbnbf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ3JtcmlkcHJ3cnpqcmJibmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDUxOTAsImV4cCI6MjA4MTMyMTE5MH0.dfoRBTrmDDVLUhUgFWGGIX-opbWdW7G1M4C8aRjpdW8';

// Inisialisasi Supabase client
let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Cek koneksi
    supabase.from('mahasiswa').select('count').limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.error('Error connecting to Supabase:', error);
                // Tetap gunakan mode demo
                return;
            }
            
            console.log('Connected to Supabase successfully');
            
            // Jika berhasil terhubung, Anda bisa:
            // 1. Load data dari Supabase
            // 2. Sinkronkan data dummy dengan database
            // 3. Implementasikan fungsi CRUD yang menggunakan Supabase
        });
} catch (error) {
    console.log('Supabase not configured, running in demo mode');
    // Aplikasi akan berjalan dengan data dummy
}

// Fungsi untuk mengambil data mahasiswa dari Supabase
async function getMahasiswaFromSupabase() {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('mahasiswa')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error fetching mahasiswa:', error);
        return null;
    }
}

// Fungsi untuk menambahkan mahasiswa ke Supabase
async function addMahasiswaToSupabase(mahasiswa) {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('mahasiswa')
            .insert([mahasiswa])
            .select();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error adding mahasiswa:', error);
        return null;
    }
}

// Fungsi untuk mengupdate mahasiswa di Supabase
async function updateMahasiswaInSupabase(id, updates) {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('mahasiswa')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error updating mahasiswa:', error);
        return null;
    }
}

// Fungsi untuk menghapus mahasiswa dari Supabase
async function deleteMahasiswaFromSupabase(id) {
    if (!supabase) return null;
    
    try {
        const { error } = await supabase
            .from('mahasiswa')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error deleting mahasiswa:', error);
        return false;
    }
}

// Fungsi untuk mengambil data absensi dari Supabase
async function getAbsensiFromSupabase() {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('absensi')
            .select('*')
            .order('tanggal', { ascending: false });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error fetching absensi:', error);
        return null;
    }
}

// Fungsi untuk menyimpan absensi ke Supabase
async function saveAbsensiToSupabase(absensiData) {
    if (!supabase) return null;
    
    try {
        // Hapus absensi yang sudah ada untuk kombinasi kelas, matkul, tanggal yang sama
        const { error: deleteError } = await supabase
            .from('absensi')
            .delete()
            .eq('kelas', absensiData[0].kelas)
            .eq('matkul', absensiData[0].matkul)
            .eq('tanggal', absensiData[0].tanggal);
        
        if (deleteError) throw deleteError;
        
        // Tambahkan absensi baru
        const { data, error } = await supabase
            .from('absensi')
            .insert(absensiData)
            .select();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error saving absensi:', error);
        return null;
    }
}

// Ekspor fungsi Supabase untuk digunakan di file lain
window.supabaseFunctions = {
    getMahasiswaFromSupabase,
    addMahasiswaToSupabase,
    updateMahasiswaInSupabase,
    deleteMahasiswaFromSupabase,
    getAbsensiFromSupabase,
    saveAbsensiToSupabase
};
