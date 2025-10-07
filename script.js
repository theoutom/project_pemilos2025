// Fungsi global untuk update suara (dipanggil dari onclick di HTML)
function updateSuara(kandidat, delta) {
    const input = document.getElementById(kandidat === 'tidakSah' ? 'tidakSah' : `kandidat${kandidat}`);
    let current = parseInt(input.value) || 0;
    current = Math.max(0, current + delta); // Tidak boleh negatif
    input.value = current;
    saveAndUpdatePreview(); // Auto-save dan update preview
}

// Fungsi untuk load data dari localStorage
function loadData() {
    return JSON.parse(localStorage.getItem('suaraData')) || { A: 0, B: 0, C: 0, tidakSah: 0, totalValid: 0, totalSemua: 0, timestamp: Date.now() };
}

// Fungsi untuk simpan data ke localStorage
function saveData(data) {
    localStorage.setItem('suaraData', JSON.stringify(data));
}

// Fungsi untuk hitung dan tampilkan preview/hasil
function displayResults(containerId, isPreview = false) {
    const container = document.getElementById(containerId);
    const data = loadData();
    const totalValid = data.A + data.B + data.C;
    const totalSemua = totalValid + data.tidakSah;
    
    if (totalValid > 0 || !isPreview) {
        const persenA = totalValid > 0 ? (data.A / totalValid * 100).toFixed(1) : 0;
        const persenB = totalValid > 0 ? (data.B / totalValid * 100).toFixed(1) : 0;
        const persenC = totalValid > 0 ? (data.C / totalValid * 100).toFixed(1) : 0;
        const persenTidakSah = totalSemua > 0 ? (data.tidakSah / totalSemua * 100).toFixed(1) : 0;
        
        // Urutkan kandidat
        const kandidat = [
            { nama: 'A', suara: data.A, persen: persenA },
            { nama: 'B', suara: data.B, persen: persenB },
            { nama: 'C', suara: data.C, persen: persenC }
        ].sort((a, b) => b.suara - a.suara);
        
        let html = `
            <div class="preview-item">
                <h3>Ketua Sementara: Kandidat ${kandidat[0].nama} (${kandidat[0].suara} suara, ${kandidat[0].persen}%)</h3>
            </div>
            <div class="preview-item">
                <h4>Wakil 1: Kandidat ${kandidat[1].nama} (${kandidat[1].suara} suara, ${kandidat[1].persen}%)</h4>
            </div>
            <div class="preview-item">
                <h4>Wakil 2: Kandidat ${kandidat[2].nama} (${kandidat[2].suara} suara, ${kandidat[2].persen}%)</h4>
            </div>
            <div class="preview-item">
                <p>Suara Tidak Sah: ${data.tidakSah} (${persenTidakSah}% dari total semua)</p>
                <p>Total Suara Valid: ${totalValid} | Total Semua: ${totalSemua}</p>
        `;
        
        if (!isPreview) {
            html = html.replace(/preview-item/g, 'result-item').replace('Sementara', '');
            html += `<p>Terakhir Update: ${new Date(data.timestamp).toLocaleString('id-ID')}</p></div>`;
        } else {
            html += '</div>';
        }
        
        container.innerHTML = html;
        
        // Tampilkan export jika di hasil.html
        if (!isPreview) {
            const exportBtn = document.getElementById('exportBtn');
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
        }
    } else if (isPreview) {
        document.getElementById('previewLoading').textContent = 'Mulai hitung suara untuk lihat preview...';
    } else {
        container.innerHTML = '<p>Belum ada data. Input dulu di halaman input.</p>';
        document.getElementById('exportBtn').style.display = 'none';
    }
}

// Fungsi untuk save data dan update preview (dipanggil setiap perubahan)
function saveAndUpdatePreview() {
    const suaraA = parseInt(document.getElementById('kandidatA').value) || 0;
    const suaraB = parseInt(document.getElementById('kandidatB').value) || 0;
    const suaraC = parseInt(document.getElementById('kandidatC').value) || 0;
    const tidakSah = parseInt(document.getElementById('tidakSah').value) || 0;
    
    const totalValid = suaraA + suaraB + suaraC;
    const totalSemua = totalValid + tidakSah;
    
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
    displayResults('previewContainer', true); // Update preview real-time
}

document.addEventListener('DOMContentLoaded', function() {
    // Load data awal dan set input values
    const data = loadData();
    document.getElementById('kandidatA').value = data.A;
    document.getElementById('kandidatB').value = data.B;
    document.getElementById('kandidatC').value = data.C;
    document.getElementById('tidakSah').value = data.tidakSah;
    
    // Event listener untuk input manual (jika diedit langsung, meski readonly)
    ['kandidatA', 'kandidatB', 'kandidatC', 'tidakSah'].forEach(id => {
        document.getElementById(id).addEventListener('input', saveAndUpdatePreview);
    });
    
    // Reset button di index.html
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            document.getElementById('kandidatA').value = 0;
            document.getElementById('kandidatB').value = 0;
            document.getElementById('kandidatC').value = 0;
            document.getElementById('tidakSah').value = 0;
            saveAndUpdatePreview();
            alert('Data direset!');
        });
    }
    
    // Display awal
    if (document.getElementById('previewContainer')) {
        displayResults('previewContainer', true);
    } else if (document.getElementById('hasilContainer')) {
        displayResults('hasilContainer', false);
    }
    
    // Real-time listener untuk perubahan localStorage (dari tab lain)
    window.addEventListener('storage', function(e) {
        if (e.key === 'suaraData') {
            location.reload(); // Reload untuk update (simple & efektif)
        }
    });
    
    // Auto-poll setiap 2 detik untuk update di hasil.html (backup jika StorageEvent gagal di browser lama)
    if (document.getElementById('hasilContainer')) {
        setInterval(function() {
            const currentData = loadData();
            // Cek jika timestamp berubah
            if (currentData.timestamp !== (JSON.parse(localStorage.getItem('lastDisplayTimestamp')) || 0)) {
                displayResults('hasilContainer', false);
                localStorage.setItem('lastDisplayTimestamp', currentData.timestamp);
            }
        }, 2000);
    }
});