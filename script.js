// Fungsi global untuk update suara (dipanggil dari onclick di HTML)
function updateSuara(kandidat, delta) {
    const inputId = kandidat === 'tidakSah' ? 'tidakSah' : `kandidat${kandidat}`;
    const input = document.getElementById(inputId);
    let current = parseInt(input.value) || 0;
    current = Math.max(0, current + delta); // Tidak boleh negatif
    input.value = current;
    saveAndUpdatePreview(); // Auto-save dan update preview
    console.log('Update suara:', kandidat, 'delta:', delta, 'new value:', current); // Debug log
}

// Fungsi untuk load data dari localStorage
function loadData() {
    const data = JSON.parse(localStorage.getItem('suaraData')) || { A: 0, B: 0, C: 0, tidakSah: 0, totalValid: 0, totalSemua: 0, timestamp: Date.now() };
    console.log('Loaded data:', data); // Debug log
    return data;
}

// Fungsi untuk simpan data ke localStorage
function saveData(data) {
    localStorage.setItem('suaraData', JSON.stringify(data));
    console.log('Saved data:', data); // Debug log
}

// Fungsi untuk hitung dan tampilkan preview/hasil
function displayResults(containerId, isPreview = false) {
    console.log('Display results called for:', containerId, 'isPreview:', isPreview); // Debug log
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
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
        console.log('Results displayed:', html); // Debug log
        
        // Tampilkan tombol simpan/export jika di hasil.html
        if (!isPreview) {
            const saveBtn = document.getElementById('saveBtn');
            const exportBtn = document.getElementById('exportBtn');
            if (saveBtn) saveBtn.style.display = 'inline-block';
            if (exportBtn) exportBtn.style.display = 'inline-block';
            
            // Event untuk simpan ulang di hasil.html
            if (saveBtn) {
                saveBtn.onclick = function() {
                    saveData(data);
                    alert('Data disimpan ulang!');
                };
            }
            
            // Event export
            if (exportBtn) {
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
        }
    } else if (isPreview) {
        document.getElementById('previewLoading').textContent = 'Mulai hitung suara untuk lihat preview...';
    } else {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = '<p>Belum ada data. Input dulu di halaman input.</p>';
        } else {
            container.innerHTML = '<p>Belum ada data. Input dulu di halaman input.</p>';
        }
        if (!isPreview) {
            const saveBtn = document.getElementById('saveBtn');
            const exportBtn = document.getElementById('exportBtn');
            if (saveBtn) saveBtn.style.display = 'none';
            if (exportBtn) exportBtn.style.display = 'none';
        }
        console.log('No data to display'); // Debug log
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
    if (document.getElementById('previewContainer')) {
        displayResults('previewContainer', true); // Update preview real-time
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Debug log
    // Load data awal dan set input values
    const data = loadData();
    const inputs = ['kandidatA', 'kandidatB', 'kandidatC', 'tidakSah'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = data[id === 'tidakSah' ? 'tidakSah' : id.substring(8).toUpperCase()] || 0;
    });
    
    // Event listener untuk input manual
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', saveAndUpdatePreview);
    });
    
    // Tombol simpan di index.html
    const saveBtnIndex = document.getElementById('saveBtn');
    if (saveBtnIndex && document.getElementById('previewContainer')) {
        saveBtnIndex.addEventListener('click', function() {
            saveAndUpdatePreview();
            alert('Hasil disimpan!');
        });
    }
    
    // Reset button di index.html
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) input.value = 0;
            });
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
            console.log('Storage changed, reloading...'); // Debug log
            location.reload();
        }
    });
    
    // Auto-poll setiap 2 detik untuk update di hasil.html (perbaiki: check data setiap kali)
    if (document.getElementById('hasilContainer')) {
        let lastTimestamp = parseInt(localStorage.getItem('lastDisplayTimestamp')) || 0;
        setInterval(function() {
            const currentData = loadData();
            if (currentData.timestamp > lastTimestamp || lastTimestamp === 0) {
                console.log('Auto-poll update detected'); // Debug log
                displayResults('hasilContainer', false);
                lastTimestamp = currentData.timestamp;
                localStorage.setItem('lastDisplayTimestamp', lastTimestamp.toString());
            }
        }, 2000);
    }
});