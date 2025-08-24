document.addEventListener('DOMContentLoaded', () => {

    // --- PEMILIH ELEMEN DOM ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');
    const submenuToggles = document.querySelectorAll('.has-submenu');

    // --- DATABASE SEMENTARA (Simulasi untuk Papan Peringkat) ---
    // Di aplikasi nyata, data ini akan diambil dari database atau Google Sheet.
    let leaderboardData = [
        { name: "Bunga Citra", class: "7.1", score: 100 },
        { name: "Andi Wijaya", class: "7.2", score: 95 },
        { name: "Charlie D.", class: "7.4", score: 90 },
        { name: "Dewi Lestari", class: "7.3", score: 85 },
        { name: "Eko Prasetyo", class: "7.1", score: 80 },
    ];

    // --- FUNGSI NAVIGASI & TAMPILAN HALAMAN ---
    // Fungsi global untuk menampilkan halaman berdasarkan ID
    window.showPage = (pageId) => {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });

        // Tutup sidebar di mobile setelah klik link
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        }
    }

    // Event listener untuk setiap link navigasi
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            showPage(pageId);
        });
    });

    // Event listener untuk tombol toggle sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
    });

    // Menutup sidebar jika klik di area konten utama
    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        }
    });
    
    // Event listener untuk membuka/menutup submenu
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = toggle.nextElementSibling;
            toggle.classList.toggle('open');
            if (submenu.style.maxHeight) {
                submenu.style.maxHeight = null;
            } else {
                submenu.style.maxHeight = submenu.scrollHeight + "px";
            }
        });
    });


    // --- LOGIKA KUIS ---
    const regForm = document.getElementById('regForm');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const quizRegistration = document.getElementById('quiz-registration');

    const questions = [
        { q: "Perangkat keras yang berfungsi sebagai otak komputer adalah...", o: ["Monitor", "CPU", "Keyboard", "RAM"], a: "CPU" },
        { q: "Aplikasi yang digunakan untuk menjelajahi internet disebut...", o: ["Explorer", "Word", "Browser", "Gmail"], a: "Browser" },
        { q: "Untuk menyimpan file secara permanen, kita menggunakan...", o: ["RAM", "Cache", "Hard Drive", "Processor"], a: "Hard Drive" },
        { q: "Format file untuk dokumen teks yang dibuat di Microsoft Word adalah...", o: [".xlsx", ".pptx", ".docx", ".jpg"], a: ".docx" },
        { q: "URL adalah singkatan dari...", o: ["Uniform Resource Locator", "Universal Routing Language", "Uniform Resource Language", "Universal Resource Locator"], a: "Uniform Resource Locator" },
        { q: "Tombol keyboard untuk menyalin teks yang sudah dipilih adalah...", o: ["Ctrl + V", "Ctrl + X", "Ctrl + C", "Ctrl + P"], a: "Ctrl + C" },
        { q: "Aplikasi perkantoran untuk membuat presentasi adalah...", o: ["Excel", "Outlook", "Word", "PowerPoint"], a: "PowerPoint" },
        { q: "Apa kepanjangan dari 'e-mail'?", o: ["Electric Mail", "Easy Mail", "External Mail", "Electronic Mail"], a: "Electronic Mail" },
        { q: "Perangkat untuk memasukkan suara ke komputer disebut...", o: ["Speaker", "Webcam", "Microphone", "Printer"], a: "Microphone" },
        { q: "Jaringan komputer global yang menghubungkan seluruh dunia disebut...", o: ["Intranet", "LAN", "WAN", "Internet"], a: "Internet" },
    ];
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;

    // Menangani registrasi kuis
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const token = document.getElementById('token').value;
        if (token === '1234') {
            quizRegistration.style.display = 'none';
            resultContainer.style.display = 'none';
            quizContainer.style.display = 'block';
            startQuiz();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Token Salah!',
                text: 'Pastikan token yang Anda masukkan sudah benar.',
                confirmButtonColor: 'var(--highlight-color)',
            });
        }
    });

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        displayQuestion();
        startTimer(120); // 2 menit = 120 detik
    }

    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) return;
        const q = questions[currentQuestionIndex];
        const questionArea = document.getElementById('question-area');
        questionArea.innerHTML = `
            <h4>${currentQuestionIndex + 1}. ${q.q}</h4>
            ${q.o.map(opt => `
                <div class="option">
                    <input type="radio" name="answer" value="${opt}" id="${opt.replace(/\s+/g, '')}">
                    <label for="${opt.replace(/\s+/g, '')}">${opt}</label>
                </div>
            `).join('')}
        `;
        updateProgressBar();
    }

    // Tombol untuk soal berikutnya
    document.getElementById('nextBtn').addEventListener('click', () => {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (!selected) {
            Swal.fire('Peringatan', 'Silakan pilih jawaban terlebih dahulu.', 'warning');
            return;
        }

        if (selected.value === questions[currentQuestionIndex].a) {
            score++;
        }

        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    });

    function startTimer(duration) {
        let time = duration;
        const timerEl = document.getElementById('timer');
        clearInterval(timerInterval); // Hentikan timer sebelumnya jika ada
        timerInterval = setInterval(() => {
            let minutes = parseInt(time / 60, 10);
            let seconds = parseInt(time % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            timerEl.textContent = minutes + ":" + seconds;
            if (--time < 0) {
                showResults();
            }
        }, 1000);
    }
    
    function updateProgressBar() {
        const progress = (currentQuestionIndex / questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    function showResults() {
        clearInterval(timerInterval);
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        const finalScore = Math.round((score / questions.length) * 100);
        document.getElementById('score').innerText = finalScore;

        let feedback = "Terus belajar, ya! Semangat!";
        if (finalScore >= 90) feedback = "Luar biasa! Kamu sangat paham materi ini.";
        else if (finalScore >= 75) feedback = "Bagus! Pertahankan semangat belajarmu.";
        document.getElementById('feedback').innerText = feedback;

        saveScoreToLeaderboard(finalScore);
    }

    function saveScoreToLeaderboard(finalScore) {
        const name = document.getElementById('nama').value;
        const className = document.getElementById('kelas').value;
        // Di aplikasi nyata, ini akan mengirim data ke server/Google Sheet
        leaderboardData.push({ name: name, class: className, score: finalScore });
        console.log("Skor berhasil disimpan ke database simulasi!");
        updateLeaderboardDisplay();
    }

    // --- LOGIKA PAPAN PERINGKAT ---
    function updateLeaderboardDisplay() {
        leaderboardData.sort((a, b) => b.score - a.score);

        const top3 = leaderboardData.slice(0, 3);
        const setPodium = (rank, data) => {
            document.getElementById(`rank-${rank}-name`).innerText = data?.name || '-';
            document.getElementById(`rank-${rank}-score`).innerText = data?.score !== undefined ? data.score : '-';
        };
        setPodium(1, top3[0]);
        setPodium(2, top3[1]);
        setPodium(3, top3[2]);
        
        const tableBody = document.querySelector("#leaderboard-table tbody");
        tableBody.innerHTML = '';
        leaderboardData.forEach((player, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.class}</td>
                    <td>${player.score}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // --- INISIALISASI APLIKASI ---
    showPage('beranda');
    updateLeaderboardDisplay();
});
