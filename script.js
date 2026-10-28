let vocabData = [];

let currentWords = [...vocabData];
let currentTab = 'cards';

// Cards State
let cardIdx = 0;

// Quiz State
let quizWords = [];
let quizIdx = 0;
let quizScore = 0;
let quizMistakes = [];

// Write State
let writeWords = [];
let writeIdx = 0;
let writeScore = 0;
let writeMistakes = [];

// Initialize application on load
window.onload = async function () {
    try {
        const response = await fetch("./vocab.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        vocabData = await response.json();
    } catch (error) {
        console.error("Не вдалося завантажити vocab.json:", error);

        alert("Не вдалося завантажити словник. Запустіть сайт через локальний сервер.");

        return;
    }

    currentWords = [...vocabData];

    updatePageDropdown();
    filterWords();

    // Add keyboard shortcuts for cards
    document.addEventListener('keydown', (e) => {
        if (currentTab !== 'cards') return;

        if (e.code === 'Space') {
            e.preventDefault();
            flipCard();
        } else if (e.code === 'ArrowRight') {
            nextCard();
        } else if (e.code === 'ArrowLeft') {
            prevCard();
        }
    });
};

function onSectionChange() {
    updatePageDropdown();
    filterWords();
}

function onPageChange() {
    filterWords();
}

function updatePageDropdown() {
    const secVal = document.getElementById('section-select').value;
    const pageSelect = document.getElementById('page-select');

    pageSelect.innerHTML = '';

    let options = [
        { val: 'all', label: 'Усі сторінки' }
    ];

    if (secVal === 'all') {
        options.push(
            { val: '1', label: 'Сторінка 1 (30 слів)' },
            { val: '2', label: 'Сторінка 2 (28 слів)' },
            { val: '3', label: 'Сторінка 3 (18 слів)' },
            { val: '4', label: 'Сторінка 4 (33 слова)' },
            { val: '5', label: 'Сторінка 5 (25 слів)' },
            { val: '6', label: 'Сторінка 6 (29 слів)' },
            { val: '7', label: 'Сторінка 7 (5 слів)' }
        );
    } else if (secVal === '1') {
        options.push(
            { val: '1', label: 'Сторінка 1 (30 слів)' },
            { val: '2', label: 'Сторінка 2 (28 слів)' },
            { val: '3', label: 'Сторінка 3 (18 слів)' }
        );
    } else if (secVal === '2') {
        options.push(
            { val: '4', label: 'Сторінка 4 (33 слова)' },
            { val: '5', label: 'Сторінка 5 (25 слів)' },
            { val: '6', label: 'Сторінка 6 (29 слів)' },
            { val: '7', label: 'Сторінка 7 (5 слів)' }
        );
    } else if (secVal === '3') {
        options.push(
            { val: '7', label: 'Сторінка 7 (22 слова)' },
            { val: '8', label: 'Сторінка 8 (31 слово)' },
            { val: '9', label: 'Сторінка 9 (32 слова)' },
            { val: '10', label: 'Сторінка 10 (6 слів)' }
        );
    }

    options.forEach(opt => {
        const el = document.createElement('option');

        el.value = opt.val;
        el.textContent = opt.label;

        pageSelect.appendChild(el);
    });
}

function filterWords() {
    const secVal = document.getElementById('section-select').value;
    const pageVal = document.getElementById('page-select').value;

    currentWords = vocabData.filter(item => {
        const matchesSec =
            secVal === 'all' || item.section === parseInt(secVal);

        const matchesPage =
            pageVal === 'all' || item.page === parseInt(pageVal);

        return matchesSec && matchesPage;
    });

    document.getElementById('total-words-badge').textContent =
        `${currentWords.length} слів`;

    // Reset current active tab view
    cardIdx = 0;

    if (currentTab === 'cards') {
        renderCard();
    } else if (currentTab === 'quiz') {
        startQuiz();
    } else if (currentTab === 'write') {
        startWriteTest();
    }
}

function switchTab(tab) {
    currentTab = tab;

    const tabs = ['cards', 'quiz', 'write'];

    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        const sec = document.getElementById(`${t}-section`);

        if (t === tab) {
            btn.className =
                "flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all bg-white text-indigo-600 shadow-sm";

            sec.classList.remove('hidden');
            sec.classList.add('flex');
        } else {
            btn.className =
                "flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all text-slate-600 hover:text-slate-900";

            sec.classList.add('hidden');
            sec.classList.remove('flex');
        }
    });

    if (tab === 'cards') renderCard();
    if (tab === 'quiz') startQuiz();
    if (tab === 'write') startWriteTest();
}

// --- FLASHCARD LOGIC ---

function renderCard() {
    if (currentWords.length === 0) return;

    const cardEl = document.getElementById('flashcard');

    cardEl.classList.remove('flipped');

    setTimeout(() => {
        const item = currentWords[cardIdx];

        document.getElementById('card-en').textContent = item.en;
        document.getElementById('card-ua').textContent = item.ua;

        document.getElementById('card-count-label').textContent =
            `Слово ${cardIdx + 1} з ${currentWords.length}`;

        const pct = ((cardIdx + 1) / currentWords.length) * 100;

        document.getElementById('card-progress-bar').style.width =
            `${pct}%`;
    }, 150);
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function nextCard() {
    if (cardIdx < currentWords.length - 1) {
        cardIdx++;
        renderCard();
    }
}

function prevCard() {
    if (cardIdx > 0) {
        cardIdx--;
        renderCard();
    }
}

function shuffleCards() {
    for (let i = currentWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [currentWords[i], currentWords[j]] =
            [currentWords[j], currentWords[i]];
    }

    cardIdx = 0;

    renderCard();
}

function speakWord() {
    if (currentWords.length === 0) return;

    const text = currentWords[cardIdx].en;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// --- MULTIPLE CHOICE QUIZ LOGIC ---

function startQuiz() {
    if (currentWords.length === 0) return;

    quizWords = [...currentWords];

    // Shuffle quiz queue
    for (let i = quizWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [quizWords[i], quizWords[j]] =
            [quizWords[j], quizWords[i]];
    }

    quizIdx = 0;
    quizScore = 0;
    quizMistakes = [];

    document.getElementById('quiz-box').classList.remove('hidden');
    document.getElementById('quiz-results').classList.add('hidden');

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const current = quizWords[quizIdx];

    const dir = document.getElementById('quiz-direction').value;
    const isEnToUa = dir === 'en-ua';

    const questionText = isEnToUa ? current.en : current.ua;
    const correctAnswer = isEnToUa ? current.ua : current.en;

    document.getElementById('quiz-question-text').textContent =
        questionText;

    document.getElementById('quiz-step').textContent =
        `Питання ${quizIdx + 1} з ${quizWords.length}`;

    document.getElementById('quiz-score-badge').textContent =
        `Правильно: ${quizScore}`;

    const pct = ((quizIdx + 1) / quizWords.length) * 100;

    document.getElementById('quiz-progress-bar').style.width =
        `${pct}%`;

    // Generate 4 choices
    let choices = [correctAnswer];

    while (choices.length < Math.min(4, vocabData.length)) {
        const rand =
            vocabData[Math.floor(Math.random() * vocabData.length)];

        const choiceVal = isEnToUa ? rand.ua : rand.en;

        if (!choices.includes(choiceVal)) {
            choices.push(choiceVal);
        }
    }

    choices.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('quiz-options-grid');

    grid.innerHTML = '';

    choices.forEach(opt => {
        const btn = document.createElement('button');

        btn.className =
            "p-4 border-2 border-slate-200 rounded-xl font-medium text-slate-800 text-left hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-sm sm:text-base outline-none";

        btn.textContent = opt;

        btn.onclick = () =>
            selectQuizOption(btn, opt, correctAnswer, questionText);

        grid.appendChild(btn);
    });
}

function selectQuizOption(btn, selected, correct, question) {
    const allBtns =
        document.querySelectorAll('#quiz-options-grid button');

    allBtns.forEach(b => b.onclick = null);

    if (selected === correct) {
        btn.className =
            "p-4 border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold rounded-xl text-left text-sm sm:text-base";

        quizScore++;
    } else {
        btn.className =
            "p-4 border-2 border-rose-500 bg-rose-50 text-rose-900 font-semibold rounded-xl text-left text-sm sm:text-base";

        allBtns.forEach(b => {
            if (b.textContent === correct) {
                b.className =
                    "p-4 border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold rounded-xl text-left text-sm sm:text-base";
            }
        });

        quizMistakes.push({
            question,
            correct,
            user: selected
        });
    }

    setTimeout(() => {
        quizIdx++;

        if (quizIdx < quizWords.length) {
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 1200);
}

function showQuizResults() {
    document.getElementById('quiz-box').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');

    const pct = Math.round((quizScore / quizWords.length) * 100);

    document.getElementById('quiz-res-percent').textContent =
        `${pct}%`;

    document.getElementById('quiz-res-detail').textContent =
        `Ви правильно відповіли на ${quizScore} з ${quizWords.length} слів.`;

    const wrapper =
        document.getElementById('quiz-mistakes-wrapper');

    const list =
        document.getElementById('quiz-mistakes-list');

    if (quizMistakes.length > 0) {
        wrapper.classList.remove('hidden');

        list.innerHTML = '';

        quizMistakes.forEach(m => {
            const item = document.createElement('div');

            item.className =
                "p-2.5 bg-slate-50 rounded-lg border border-slate-200";

            item.innerHTML =
                `<span class="font-bold text-slate-800">${m.question}</span> ➔ ` +
                `<span class="text-emerald-600 font-semibold">${m.correct}</span> ` +
                `<span class="text-xs text-rose-500 block sm:inline sm:ml-2">(Ваша відповідь: ${m.user})</span>`;

            list.appendChild(item);
        });
    } else {
        wrapper.classList.add('hidden');
    }
}

// --- WRITTEN TEST LOGIC ---

function startWriteTest() {
    if (currentWords.length === 0) return;

    writeWords = [...currentWords];

    for (let i = writeWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [writeWords[i], writeWords[j]] =
            [writeWords[j], writeWords[i]];
    }

    writeIdx = 0;
    writeScore = 0;
    writeMistakes = [];

    document.getElementById('write-box').classList.remove('hidden');
    document.getElementById('write-results').classList.add('hidden');

    renderWriteQuestion();
}

function renderWriteQuestion() {
    const current = writeWords[writeIdx];

    document.getElementById('write-question-text').textContent =
        current.ua;

    document.getElementById('write-step').textContent =
        `Слово ${writeIdx + 1} з ${writeWords.length}`;

    document.getElementById('write-score-badge').textContent =
        `Вірно: ${writeScore}`;

    const pct = ((writeIdx + 1) / writeWords.length) * 100;

    document.getElementById('write-progress-bar').style.width =
        `${pct}%`;

    const input = document.getElementById('write-input');

    input.value = '';
    input.disabled = false;
    input.focus();

    const fb = document.getElementById('write-feedback');

    fb.className =
        "mt-4 p-3 rounded-xl text-center text-sm font-semibold hidden";

    document.getElementById('write-submit-btn').disabled = false;
}

function normalizeText(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9\s/]/g, '')
        .trim();
}

function handleWriteSubmit(e) {
    e.preventDefault();

    const input = document.getElementById('write-input');
    const userVal = input.value.trim();

    if (!userVal) return;

    input.disabled = true;

    document.getElementById('write-submit-btn').disabled = true;

    const current = writeWords[writeIdx];

    const normUser = normalizeText(userVal);
    const normTarget = normalizeText(current.en);

    // Support alternative options split by slash
    const alternatives = current.en
        .split('/')
        .map(a => normalizeText(a));

    const isCorrect =
        normUser === normTarget || alternatives.includes(normUser);

    const fb = document.getElementById('write-feedback');

    fb.classList.remove('hidden');

    if (isCorrect) {
        writeScore++;

        fb.className =
            "mt-4 p-3 rounded-xl text-center text-sm font-semibold bg-emerald-100 text-emerald-800";

        fb.textContent = "Вірно! Чудова робота 🎉";
    } else {
        fb.className =
            "mt-4 p-3 rounded-xl text-center text-sm font-semibold bg-rose-100 text-rose-800";

        fb.textContent =
            `Невірно. Правильна відповідь: ${current.en}`;

        writeMistakes.push({
            ua: current.ua,
            correct: current.en,
            user: userVal
        });
    }

    setTimeout(() => {
        writeIdx++;

        if (writeIdx < writeWords.length) {
            renderWriteQuestion();
        } else {
            showWriteResults();
        }
    }, 1500);
}

function showWriteResults() {
    document.getElementById('write-box').classList.add('hidden');
    document.getElementById('write-results').classList.remove('hidden');

    const pct = Math.round((writeScore / writeWords.length) * 100);

    document.getElementById('write-res-percent').textContent =
        `${pct}%`;

    document.getElementById('write-res-detail').textContent =
        `Ви правильно написали ${writeScore} з ${writeWords.length} слів.`;

    const wrapper =
        document.getElementById('write-mistakes-wrapper');

    const list =
        document.getElementById('write-mistakes-list');

    if (writeMistakes.length > 0) {
        wrapper.classList.remove('hidden');

        list.innerHTML = '';

        writeMistakes.forEach(m => {
            const item = document.createElement('div');

            item.className =
                "p-2.5 bg-slate-50 rounded-lg border border-slate-200";

            item.innerHTML =
                `<span class="font-bold text-slate-800">${m.ua}</span> ➔ ` +
                `<span class="text-emerald-600 font-semibold">${m.correct}</span> ` +
                `<span class="text-xs text-rose-500 block sm:inline sm:ml-2">(Ви ввели: ${m.user})</span>`;

            list.appendChild(item);
        });
    } else {
        wrapper.classList.add('hidden');
    }
}