document.addEventListener('DOMContentLoaded', function() {
    // Fungsi untuk load data dari localStorage
    function loadData() {
        return JSON.parse(localStorage.getItem('suaraData')) || null;
    }

    // Fungsi untuk simpan data ke localStorage
    function saveData(data) {
        localStorage.setItem('suaraData', JSON.stringify(data));
    }

    // Event listener untuk form input (halaman index.html)
    const form = document.getElementById('inputForm');
    if (form) {
        // Load data lama jika ada (untuk edit)
        const existingData = loadData();
        if (existingData) {
            document.getElementById('kandidatA').value = existingData.A || 0;
            document.getElementById('kandidatB').value = existingData.B || 0;
            document.getElementById('kandidatC').value = existingData.C || 0;
            document.getElementById('tidakSah').value = existingData.tidakSah || 0;
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const suaraA = parseInt(document.getElementById('kandidatA').value) || 0;
            const suaraB = parseInt(document.getElementById('kandidatB').value) || 0;
            const suaraC = parseInt(document.getElementById('kandidatC').value) || 0;
            const tidakSah = parseInt(document.getElementById('tidakSah').value) || 0;
            
            const totalValid = suaraA + suaraB + suaraC;
            const totalSemua = totalValid + tidakSah;
            
            // Simpan ke localStorage
            const data = {
                A: suaraA,
                B: suaraB,
                C: suaraC,
                tidakSah: tidakSah,
                totalValid: totalValid,
                totalSemua: totalSemua,
                timestamp: Date.now()
            };
            saveData(data);
            
            alert('Data tersimpan! Buka halaman hasil untuk lihat persentase.');
        });
    }
    
    // Event listener untuk halaman hasil (hasil.html)
    const hasilContainer = document.getElementById('hasilContainer');
    const exportBtn = document.getElementById('exportBtn');
    if (hasilContainer) {
        // Fungsi untuk tampilkan hasil
        function displayResults(data) {
            if (data && data.totalValid > 0) {
                const persenA = (data.A / data.totalValid * 100).toFixed(1);
                const persenB = (data.B / data.totalValid * 100).toFixed(1);
                const persenC = (data.C / data.totalValid * 100).toFixed(1);
                const persenTidakSah = data.totalSemua > 0 ? (data.tidakSah / data.totalSemua * 100).toFixed(1) : 0;
                
                // Urutkan kandidat berdasarkan suara (tertinggi dulu)
                const kandidat = [
                    { nama: 'A', suara: data.A, persen: persenA },
                    { nama: 'B', suara: data.B, persen: persenB },
                    { nama: 'C', suara: data.C, persen: persenC }
                ].sort((a, b) => b.suara - a.suara);
                
                hasilContainer.innerHTML = `
                    <div class="result-item">
                        <h2>Ketua: Kandidat ${kandidat[0].nama} (${kandidat[0].suara} suara, ${kandidat[0].persen}%)</h2>
                    </div>
                    <div class="result-item">
                        <h3>Wakil 1: Kandidat ${kandidat[1].nama} (${kandidat[1].suara} suara, ${kandidat[1].persen}%)</h3>
                    </div>
                    <div class="result-item">
                        <h3>Wakil 2: Kandidat ${kandidat[2].nama} (${kandidat[2].suara} suara, ${kandidat[2].persen}%)</h3>
                    </div>
                    <div class="result-item">
                        <p>Suara Tidak Sah: ${data.tidakSah} (${persenTidakSah}% dari total semua)</p>
                        <p>Total Suara Valid: ${data.totalValid} | Total Semua: ${data.totalSemua}</p>
                        <p>Terakhir Update: ${new Date(data.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                `;
                
                // Tampilkan tombol export
                exportBtn.style.display = 'block';
                exportBtn.onclick = function() {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'data-suara-osis.json';
                    a.click();
                    URL.revokeObjectURL(url);
                };
            } else {
                hasilContainer.innerHTML = '<p>Belum ada data. Input dulu di halaman input.</p>';
                exportBtn.style.display = 'none';
            }
        }
        
        // Load dan tampilkan data
        const data = loadData();
        displayResults(data);
    }
});