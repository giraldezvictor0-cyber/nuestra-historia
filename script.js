/**
 * Nuestra historia todavía tiene páginas por escribir
 * Script principal del libro digital interactivo
 */

(function() {
    'use strict';

    // ========================================
    // ESTADO GLOBAL
    // ========================================
    const state = {
        currentPage: 'cover',
        pages: [
            'cover', 'index',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
            'minigames', 'new-memories', 'gallery', 'music', 'mateo'
        ],
        chapterPages: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        lightboxImages: [],
        lightboxIndex: 0,
        isTransitioning: false,
        // Minigame states
        trivia: {
            currentQuestion: 0,
            score: 0,
            questions: [
                {
                    q: "¿Cuál es nuestra canción principal?",
                    options: ["Ebrio de Amor", "No One Noticed", "Otra", "No tengo canción"],
                    correct: 0
                },
                {
                    q: "¿Cuál es nuestra segunda canción?",
                    options: ["Ebrio de Amor", "No One Noticed", "Perfect", "All of Me"],
                    correct: 1
                },
                {
                    q: "¿Entre qué dos lugares era nuestra relación a distancia?",
                    options: ["Panamá y Miami", "Panamá y Texas", "Colombia y Texas", "Panamá y Nueva York"],
                    correct: 1
                },
                {
                    q: "¿Cómo se llama el niño con quien soñamos jugar?",
                    options: ["Mateo", "Lucas", "Santiago", "Gabriel"],
                    correct: 0
                },
                {
                    q: "¿Alrededor de qué fecha es nuestro aniversario?",
                    options: ["14 de febrero", "25 de diciembre", "1 de enero", "31 de octubre"],
                    correct: 1
                }
            ],
            answered: false
        },
        puzzle: {
            pieces: [],
            board: [],
            correctOrder: [0,1,2,3,4,5,6,7,8],
            imageSrc: 'fotos/foto_0001.png'
        }
    };

    // ========================================
    // ELEMENTOS DOM
    // ========================================
    const elements = {
        bookContainer: null,
        pages: {},
        openBookBtn: null,
        prevPageBtn: null,
        nextPageBtn: null,
        pageIndicator: null,
        currentPageEl: null,
        totalPagesEl: null,
        navBtns: {},
        floatBtns: {},
        lightbox: null,
        lightboxImage: null,
        lightboxCaption: null,
        lightboxCounter: null,
        lightboxClose: null,
        lightboxPrev: null,
        lightboxNext: null,
        toastContainer: null,
        envelopes: {},
        letters: {}
    };

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    function init() {
        cacheElements();
        buildLightboxImages();
        setupEventListeners();
        setupKeyboardNavigation();
        setupTouchNavigation();
        showPage('cover');
        updateNavigation();
        setupEditableSpaces();
        setupPhotoFrames();
        setupEnvelopes();
        populateGallery();
        setupPrintButton();
        setupMinigames();
        showToast('Bienvenida a nuestra historia 🌹', 3000);
    }

    function cacheElements() {
        elements.bookContainer = document.getElementById('bookContainer');

        // Cachear todas las páginas
        state.pages.forEach(pageId => {
            elements.pages[pageId] = document.querySelector(`[data-page="${pageId}"]`);
        });

        // Botones principales
        elements.openBookBtn = document.getElementById('openBookBtn');
        elements.prevPageBtn = document.getElementById('prevPage');
        elements.nextPageBtn = document.getElementById('nextPage');
        elements.pageIndicator = document.getElementById('pageIndicator');
        elements.currentPageEl = document.getElementById('currentPage');
        elements.totalPagesEl = document.getElementById('totalPages');

        // Navegación flotante
        elements.floatBtns = {
            index: document.getElementById('btnIndex'),
            home: document.getElementById('btnHome'),
            pdf: document.getElementById('btnPDF'),
            gallery: document.getElementById('btnGallery'),
            music: document.getElementById('btnMusic'),
            mateo: document.getElementById('btnMateo')
        };

        // Lightbox
        elements.lightbox = document.getElementById('lightbox');
        elements.lightboxImage = document.getElementById('lightboxImage');
        elements.lightboxCaption = document.getElementById('lightboxCaption');
        elements.lightboxCounter = document.getElementById('lightboxCounter');
        elements.lightboxClose = document.getElementById('lightboxClose');
        elements.lightboxPrev = document.getElementById('lightboxPrev');
        elements.lightboxNext = document.getElementById('lightboxNext');

        // Toast
        elements.toastContainer = document.getElementById('toastContainer');

        // Sobres y cartas
        document.querySelectorAll('.envelope').forEach(env => {
            const id = env.dataset.envelope;
            elements.envelopes[id] = env;
        });

        document.querySelectorAll('.envelope-letter').forEach(letter => {
            const id = letter.id.replace('letter', '');
            elements.letters[id] = letter;
        });

        // Total pages
        elements.totalPagesEl.textContent = state.chapterPages.length;
    }

    // ========================================
    // CONSTRUIR ARRAY DE IMÁGENES PARA LIGHTBOX
    // ========================================
    function buildLightboxImages() {
        const photoFrames = document.querySelectorAll('.photo-frame[data-photo]');
        photoFrames.forEach((frame, index) => {
            const photo = frame.dataset.photo;
            const caption = frame.dataset.caption || `Foto ${index + 1}`;
            state.lightboxImages.push({
                src: `fotos/${photo}`,
                caption: caption,
                element: frame
            });
        });
    }

    // ========================================
    // NAVEGACIÓN DE PÁGINAS
    // ========================================
    function showPage(pageId, direction = 'forward') {
        if (state.isTransitioning || !elements.pages[pageId]) return;

        state.isTransitioning = true;

        const currentPageEl = elements.pages[state.currentPage];
        const nextPageEl = elements.pages[pageId];

        // Ocultar página actual con animación
        if (currentPageEl && currentPageEl.style.display !== 'none') {
            currentPageEl.classList.add('exiting');
            currentPageEl.addEventListener('animationend', function onExit() {
                currentPageEl.classList.remove('exiting');
                currentPageEl.style.display = 'none';
                currentPageEl.removeEventListener('animationend', onExit);
            }, { once: true });
        }

        // Mostrar nueva página
        setTimeout(() => {
            nextPageEl.style.display = 'block';
            nextPageEl.classList.add('entering');
            nextPageEl.addEventListener('animationend', function onEnter() {
                nextPageEl.classList.remove('entering');
                state.isTransitioning = false;
                nextPageEl.removeEventListener('animationend', onEnter);
            }, { once: true });

            state.currentPage = pageId;
            updateNavigation();
            updateFloatingButtons();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }

    function goToPage(pageId) {
        showPage(pageId);
    }

    function nextPage() {
        const currentIndex = state.pages.indexOf(state.currentPage);
        if (currentIndex < state.pages.length - 1) {
            showPage(state.pages[currentIndex + 1], 'forward');
        }
    }

    function prevPage() {
        const currentIndex = state.pages.indexOf(state.currentPage);
        if (currentIndex > 0) {
            showPage(state.pages[currentIndex - 1], 'backward');
        }
    }

    function updateNavigation() {
        const currentIndex = state.pages.indexOf(state.currentPage);
        const isChapter = state.chapterPages.includes(state.currentPage);
        const chapterIndex = state.chapterPages.indexOf(state.currentPage);

        // Botones prev/next
        elements.prevPageBtn.disabled = currentIndex === 0;
        elements.nextPageBtn.disabled = currentIndex === state.pages.length - 1;

        // Indicador de página
        if (isChapter) {
            elements.currentPageEl.textContent = chapterIndex + 1;
            elements.totalPagesEl.textContent = state.chapterPages.length;
        } else {
            elements.currentPageEl.textContent = '—';
            elements.totalPagesEl.textContent = '—';
        }

        // Mostrar/ocultar navegación
        const nav = document.getElementById('bookNavigation');
        const floats = document.getElementById('floatingButtons');

        if (state.currentPage === 'cover') {
            nav.style.display = 'none';
            floats.style.display = 'none';
        } else {
            nav.style.display = 'flex';
            floats.style.display = 'flex';
        }
    }

    function updateFloatingButtons() {
        // Resaltar botón activo
        Object.entries(elements.floatBtns).forEach(([key, btn]) => {
            btn.classList.remove('active');
        });

        switch (state.currentPage) {
            case 'index':
                elements.floatBtns.index.classList.add('active');
                break;
            case 'gallery':
                elements.floatBtns.gallery.classList.add('active');
                break;
            case 'music':
                elements.floatBtns.music.classList.add('active');
                break;
            case 'mateo':
                elements.floatBtns.mateo.classList.add('active');
                break;
            case 'new-memories':
                // No hay botón específico
                break;
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    function setupEventListeners() {
        // Botón abrir libro
        elements.openBookBtn.addEventListener('click', () => {
            showPage('index');
            showToast('¡Bienvenida al índice! 🌹', 2000);
        });

        // Navegación inferior
        elements.prevPageBtn.addEventListener('click', prevPage);
        elements.nextPageBtn.addEventListener('click', nextPage);

        // Enlaces del índice
        document.querySelectorAll('.chapter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.target;
                showPage(target);
                showToast(`Capítulo ${target} 🌹`, 1500);
            });
        });

        // Botones flotantes
        elements.floatBtns.index.addEventListener('click', () => showPage('index'));
        elements.floatBtns.home.addEventListener('click', () => showPage('cover'));
        elements.floatBtns.pdf.addEventListener('click', downloadPDF);
        elements.floatBtns.gallery.addEventListener('click', () => showPage('gallery'));
        elements.floatBtns.music.addEventListener('click', () => showPage('music'));
        elements.floatBtns.mateo.addEventListener('click', () => showPage('mateo'));

        // Lightbox
        elements.lightboxClose.addEventListener('click', closeLightbox);
        elements.lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        elements.lightboxNext.addEventListener('click', () => navigateLightbox(1));
        elements.lightbox.addEventListener('click', (e) => {
            if (e.target === elements.lightbox) closeLightbox();
        });

        // Botones de canción
        document.querySelectorAll('.btn-play-song').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const song = btn.dataset.song;
                openSongLink(song);
            });
        });

        // Cerrar cartas con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllLetters();
                closeLightbox();
            }
        });
    }

    // ========================================
    // NAVEGACIÓN POR TECLADO
    // ========================================
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // No interceptar si hay inputs enfocados
            if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    nextPage();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    prevPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    showPage('cover');
                    break;
                case 'End':
                    e.preventDefault();
                    showPage('12'); // Última carta
                    break;
                case 'g':
                case 'G':
                    if (e.ctrlKey || e.metaKey) return;
                    e.preventDefault();
                    showPage('gallery');
                    break;
                case 'm':
                case 'M':
                    if (e.ctrlKey || e.metaKey) return;
                    e.preventDefault();
                    showPage('music');
                    break;
                case 'i':
                case 'I':
                    if (e.ctrlKey || e.metaKey) return;
                    e.preventDefault();
                    showPage('index');
                    break;
            }
        });
    }

    // ========================================
    // NAVEGACIÓN TÁCTIL (SWIPE)
    // ========================================
    function setupTouchNavigation() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const bookContainer = elements.bookContainer;

        bookContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        bookContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Solo horizontal, no vertical (scroll)
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    // Swipe left -> next page
                    nextPage();
                } else {
                    // Swipe right -> prev page
                    prevPage();
                }
            }
        }
    }

    // ========================================
    // ESPACIOS EDITABLES
    // ========================================
    function setupEditableSpaces() {
        const editableSpaces = document.querySelectorAll('[contenteditable="true"]');

        editableSpaces.forEach(space => {
            // Placeholder handling
            space.addEventListener('focus', () => {
                if (space.textContent.trim() === space.dataset.placeholder) {
                    space.textContent = '';
                    space.classList.remove('placeholder');
                }
                space.classList.add('editing');
            });

            space.addEventListener('blur', () => {
                space.classList.remove('editing');
                if (space.textContent.trim() === '') {
                    space.innerHTML = `<span class="placeholder-text">${space.dataset.placeholder}</span>`;
                }
                saveContent(space);
            });

            // Enter para nueva línea en espacios grandes
            space.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !space.classList.contains('memory-card')) {
                    // Permitir enter normal
                }
            });

            // Cargar contenido guardado
            loadContent(space);
        });
    }

    function saveContent(element) {
        const key = `book_content_${element.dataset.placeholder?.substring(0, 50) || 'unknown'}`;
        const content = element.innerHTML;
        try {
            localStorage.setItem(key, content);
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
        }
    }

    function loadContent(element) {
        const key = `book_content_${element.dataset.placeholder?.substring(0, 50) || 'unknown'}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved && saved.trim() !== '') {
                element.innerHTML = saved;
                element.classList.remove('placeholder');
            }
        } catch (e) {
            console.warn('No se pudo cargar de localStorage:', e);
        }
    }

    // ========================================
    // FOTOS AMPLIABLES (LIGHTBOX)
    // ========================================
    function setupPhotoFrames() {
        document.querySelectorAll('.photo-frame[data-photo]').forEach((frame, index) => {
            frame.addEventListener('click', () => openLightbox(index));
            frame.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
            // Hacer focusable
            frame.setAttribute('tabindex', '0');
            frame.setAttribute('role', 'button');
            frame.setAttribute('aria-label', `Ampliar foto: ${frame.dataset.caption || `Foto ${index + 1}`}`);
        });
    }

    function openLightbox(index) {
        if (index < 0 || index >= state.lightboxImages.length) return;

        state.lightboxIndex = index;
        const img = state.lightboxImages[index];

        elements.lightboxImage.src = img.src;
        elements.lightboxImage.alt = img.caption;
        elements.lightboxCaption.textContent = img.caption;
        elements.lightboxCounter.textContent = `${index + 1} / ${state.lightboxImages.length}`;

        elements.lightbox.classList.add('visible');
        document.body.style.overflow = 'hidden';

        // Focus trap
        elements.lightboxClose.focus();
    }

    function closeLightbox() {
        elements.lightbox.classList.remove('visible');
        document.body.style.overflow = '';
        elements.lightboxImage.src = '';
    }

    function navigateLightbox(direction) {
        const newIndex = state.lightboxIndex + direction;
        if (newIndex >= 0 && newIndex < state.lightboxImages.length) {
            openLightbox(newIndex);
        }
    }

    // Teclado en lightbox
    document.addEventListener('keydown', (e) => {
        if (!elements.lightbox.classList.contains('visible')) return;

        switch (e.key) {
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    });

    // ========================================
    // SOBRES Y CARTAS
    // ========================================
    function setupEnvelopes() {
        Object.entries(elements.envelopes).forEach(([id, envelope]) => {
            envelope.addEventListener('click', () => openLetter(id));
            envelope.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLetter(id);
                }
            });
            envelope.setAttribute('tabindex', '0');
            envelope.setAttribute('role', 'button');
        });

        // Botones cerrar cartas
        document.querySelectorAll('.close-letter').forEach(btn => {
            btn.addEventListener('click', () => closeLetter(btn.dataset.target));
        });
    }

    function openLetter(id) {
        const letter = elements.letters[id];
        const envelope = elements.envelopes[id];

        if (letter && envelope) {
            envelope.classList.add('open');
            letter.classList.add('visible');

            // Focus trap en la carta
            const closeBtn = letter.querySelector('.close-letter');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 300);
            }

            showToast('Carta abierta 💌', 1500);
        }
    }

    function closeLetter(id) {
        const letter = elements.letters[id];
        const envelope = elements.envelopes[id];

        if (letter && envelope) {
            envelope.classList.remove('open');
            letter.classList.remove('visible');
            envelope.focus();
        }
    }

    function closeAllLetters() {
        Object.keys(elements.letters).forEach(id => closeLetter(id));
    }

    // ========================================
    // GALERÍA DE RECUERDOS
    // ========================================
    function populateGallery() {
        const gallery = document.getElementById('fullGallery');
        if (!gallery) return;

        gallery.innerHTML = '';

        state.lightboxImages.forEach((img, index) => {
            const frame = document.createElement('div');
            frame.className = 'photo-frame';
            frame.dataset.photo = img.src.replace('fotos/', '');
            frame.dataset.caption = img.caption;
            frame.setAttribute('tabindex', '0');
            frame.setAttribute('role', 'button');
            frame.setAttribute('aria-label', `Ampliar: ${img.caption}`);

            frame.innerHTML = `
                <img src="${img.src}" alt="${img.caption}" loading="lazy">
                <div class="photo-caption">${img.caption}</div>
            `;

            frame.addEventListener('click', () => openLightbox(index));
            frame.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });

            gallery.appendChild(frame);
        });
    }

    // ========================================
    // MÚSICA - ENLACES A CANCIONES
    // ========================================
    function openSongLink(songNum) {
        const songs = {
            '1': { title: 'Ebrio de Amor', search: 'Ebrio de Amor' },
            '2': { title: 'No One Noticed', search: 'No One Noticed' }
        };

        const song = songs[songNum];
        if (!song) return;

        // Crear URLs de búsqueda para principales plataformas
        const encodedTitle = encodeURIComponent(song.search);
        const urls = {
            spotify: `https://open.spotify.com/search/${encodedTitle}`,
            youtube: `https://www.youtube.com/results?search_query=${encodedTitle}`,
            apple: `https://music.apple.com/search?term=${encodedTitle}`
        };

        // Abrir en nueva pestaña (Spotify por defecto)
        window.open(urls.spotify, '_blank', 'noopener,noreferrer');

        showToast(`Abriendo "${song.title}" en Spotify 🎵`, 2500);
    }

    // ========================================
    // DESCARGAR PDF
    // ========================================
    function setupPrintButton() {
        // El botón ya tiene event listener en setupEventListeners
    }

    function downloadPDF() {
        showToast('Preparando PDF para imprimir... 📄', 2000);

        // Usar la API de impresión del navegador
        setTimeout(() => {
            window.print();
        }, 500);
    }

    // ========================================
    // MINI-JUEGOS DE RECUERDOS
    // ========================================
    function setupMinigames() {
        setupMapGame();
        setupTriviaGame();
        setupPuzzleGame();
    }

    // --- JUEGO 1: MAPA INTERACTIVO ---
    function setupMapGame() {
        const markers = document.querySelectorAll('.map-marker');
        const noteEl = document.getElementById('mapNote');

        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const note = marker.dataset.note;
                noteEl.innerHTML = `<p>${note}</p>`;
                noteEl.style.animation = 'none';
                noteEl.offsetHeight; // trigger reflow
                noteEl.style.animation = 'fadeIn 0.5s ease';

                // Efecto visual en el marcador
                markers.forEach(m => m.classList.remove('active'));
                marker.classList.add('active');
            });

            marker.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    marker.click();
                }
            });
        });
    }

    // --- JUEGO 2: TRIVIA ---
    function setupTriviaGame() {
        const container = document.getElementById('triviaContainer');
        const questionEl = document.getElementById('triviaQuestion');
        const optionsEl = document.getElementById('triviaOptions');
        const feedbackEl = document.getElementById('triviaFeedback');
        const nextBtn = document.getElementById('btnTriviaNext');
        const restartBtn = document.getElementById('btnTriviaRestart');
        const currentEl = document.getElementById('triviaCurrent');
        const fillEl = document.getElementById('triviaFill');
        const secretEl = document.getElementById('triviaSecret');
        const secretEnvelope = document.getElementById('secretEnvelope');
        const secretLetter = document.getElementById('secretLetter');

        function loadQuestion() {
            const q = state.trivia.questions[state.trivia.currentQuestion];
            questionEl.textContent = q.q;
            optionsEl.innerHTML = '';
            feedbackEl.textContent = '';
            feedbackEl.className = 'trivia-feedback';
            nextBtn.disabled = true;
            nextBtn.textContent = state.trivia.currentQuestion === 4 ? 'Ver resultado →' : 'Siguiente →';

            currentEl.textContent = state.trivia.currentQuestion + 1;
            fillEl.style.width = `${((state.trivia.currentQuestion + 1) / 5) * 100}%`;

            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'trivia-option';
                btn.textContent = opt;
                btn.dataset.index = i;
                btn.addEventListener('click', () => selectAnswer(i, btn));
                optionsEl.appendChild(btn);
            });

            state.trivia.answered = false;
        }

        function selectAnswer(index, btn) {
            if (state.trivia.answered) return;
            state.trivia.answered = true;

            const q = state.trivia.questions[state.trivia.currentQuestion];
            const options = optionsEl.querySelectorAll('.trivia-option');

            options.forEach((opt, i) => {
                opt.disabled = true;
                if (i === q.correct) opt.classList.add('correct');
                if (i === index && i !== q.correct) opt.classList.add('incorrect');
            });

            if (index === q.correct) {
                state.trivia.score++;
                feedbackEl.textContent = '¡Correcto! 🌹';
                feedbackEl.classList.add('correct-feedback');
            } else {
                feedbackEl.textContent = `Incorrecto. La respuesta era: ${q.options[q.correct]}`;
                feedbackEl.classList.add('incorrect-feedback');
            }

            nextBtn.disabled = false;
        }

        function nextQuestion() {
            state.trivia.currentQuestion++;
            if (state.trivia.currentQuestion < 5) {
                loadQuestion();
            } else {
                showResult();
            }
        }

        function showResult() {
            container.classList.add('hidden');
            secretEl.classList.remove('hidden');

            let msg = `¡Completaste la trivia! Acertaste ${state.trivia.score} de 5. `;
            if (state.trivia.score >= 3) {
                msg += '¡Se abre el sobre secreto! 💌';
            } else {
                msg += 'Inténtalo de nuevo para desbloquear el secreto.';
                secretEnvelope.style.opacity = '0.5';
                secretEnvelope.style.pointerEvents = 'none';
            }
            showToast(msg, 4000);
        }

        function restartTrivia() {
            state.trivia.currentQuestion = 0;
            state.trivia.score = 0;
            container.classList.remove('hidden');
            secretEl.classList.add('hidden');
            secretLetter.classList.add('hidden');
            secretEnvelope.classList.remove('open');
            loadQuestion();
        }

        nextBtn.addEventListener('click', nextQuestion);
        restartBtn.addEventListener('click', restartTrivia);

        secretEnvelope.addEventListener('click', () => {
            if (state.trivia.score >= 3) {
                secretEnvelope.classList.add('open');
                secretLetter.classList.remove('hidden');
                showToast('Sobre secreto abierto 💌', 2000);
            }
        });

        document.querySelector('[data-target="secret"]').addEventListener('click', () => {
            secretLetter.classList.add('hidden');
            secretEnvelope.classList.remove('open');
        });

        // Inicializar si estamos en la página
        if (document.getElementById('triviaQuestion')) {
            loadQuestion();
        }
    }

    // --- JUEGO 3: ROMPECABEZAS ---
    function setupPuzzleGame() {
        const board = document.getElementById('puzzleBoard');
        const piecesContainer = document.getElementById('puzzlePieces');
        const shuffleBtn = document.getElementById('btnPuzzleShuffle');
        const checkBtn = document.getElementById('btnPuzzleCheck');
        const messageEl = document.getElementById('puzzleMessage');
        const completeEl = document.getElementById('puzzleComplete');

        let draggedPiece = null;

        function createPuzzle() {
            board.innerHTML = '';
            piecesContainer.innerHTML = '';
            state.puzzle.pieces = [];
            state.puzzle.board = new Array(9).fill(null);

            // Crear 9 slots en el tablero
            for (let i = 0; i < 9; i++) {
                const slot = document.createElement('div');
                slot.className = 'puzzle-slot';
                slot.dataset.index = i;
                slot.addEventListener('dragover', (e) => e.preventDefault());
                slot.addEventListener('drop', () => dropPiece(slot));
                slot.addEventListener('click', () => removePiece(slot));
                board.appendChild(slot);
            }

            // Crear piezas desordenadas
            const indices = [...Array(9).keys()].sort(() => Math.random() - 0.5);
            indices.forEach((idx, visualIndex) => {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.correctIndex = idx;
                piece.dataset.visualIndex = visualIndex;
                piece.draggable = true;
                piece.style.backgroundImage = `url(${state.puzzle.imageSrc})`;
                piece.style.backgroundPosition = getBackgroundPosition(idx);
                piece.addEventListener('dragstart', (e) => dragStart(e, piece));
                piece.addEventListener('dragend', dragEnd);
                piece.addEventListener('click', () => pickPiece(piece));
                piecesContainer.appendChild(piece);
                state.puzzle.pieces.push(piece);
            });

            messageEl.textContent = 'Arrastra las piezas al tablero. Click en pieza para seleccionar, click en slot para colocar.';
            completeEl.classList.add('hidden');
        }

        function getBackgroundPosition(index) {
            const col = index % 3;
            const row = Math.floor(index / 3);
            return `${-col * 100}% ${-row * 100}%`;
        }

        function dragStart(e, piece) {
            draggedPiece = piece;
            piece.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        function dragEnd(e) {
            if (draggedPiece) {
                draggedPiece.classList.remove('dragging');
                draggedPiece = null;
            }
        }

        function dropPiece(slot) {
            if (!draggedPiece) return;
            if (slot.dataset.filled === 'true') return;

            const piece = draggedPiece;
            const correctIdx = parseInt(piece.dataset.correctIndex);
            const slotIdx = parseInt(slot.dataset.index);

            // Animación de colocación
            slot.appendChild(piece);
            piece.style.position = 'relative';
            piece.style.left = '0';
            piece.style.top = '0';
            piece.draggable = false;
            slot.dataset.filled = 'true';
            slot.dataset.pieceIndex = correctIdx;
            state.puzzle.board[slotIdx] = correctIdx;

            piece.classList.add('placed');
            draggedPiece = null;

            checkAutoComplete();
        }

        function pickPiece(piece) {
            if (piece.parentElement.classList.contains('puzzle-slot')) {
                // Si está en el tablero, devolverla
                const slot = piece.parentElement;
                slot.dataset.filled = 'false';
                slot.dataset.pieceIndex = '';
                piecesContainer.appendChild(piece);
                piece.draggable = true;
                piece.style.position = '';
                piece.classList.remove('placed');
                state.puzzle.board[parseInt(slot.dataset.index)] = null;
            } else {
                // Seleccionar para colocar
                document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
                piece.classList.add('selected');
                draggedPiece = piece;
            }
        }

        function removePiece(slot) {
            if (slot.dataset.filled === 'true') {
                const piece = slot.querySelector('.puzzle-piece');
                if (piece) {
                    slot.dataset.filled = 'false';
                    slot.dataset.pieceIndex = '';
                    piecesContainer.appendChild(piece);
                    piece.draggable = true;
                    piece.style.position = '';
                    piece.classList.remove('placed');
                    state.puzzle.board[parseInt(slot.dataset.index)] = null;
                }
            }
        }

        function checkAutoComplete() {
            const filled = state.puzzle.board.filter(x => x !== null).length;
            if (filled === 9) {
                setTimeout(() => {
                    const correct = state.puzzle.board.every((val, i) => val === i);
                    if (correct) {
                        completePuzzle();
                    } else {
                        messageEl.textContent = '¡Casi! Algunas piezas están en el lugar incorrecto. Intenta de nuevo. 🌹';
                        messageEl.className = 'puzzle-message incorrect';
                    }
                }, 300);
            }
        }

        function checkPuzzle() {
            const filled = state.puzzle.board.filter(x => x !== null).length;
            if (filled < 9) {
                messageEl.textContent = 'Faltan piezas por colocar. Completa el tablero primero.';
                messageEl.className = 'puzzle-message';
                return;
            }

            const correct = state.puzzle.board.every((val, i) => val === i);
            if (correct) {
                completePuzzle();
            } else {
                messageEl.textContent = 'Algunas piezas no encajan. Revisa e intenta de nuevo. 🌹';
                messageEl.className = 'puzzle-message incorrect';
            }
        }

        function completePuzzle() {
            messageEl.textContent = '¡Rompecabezas completado perfectamente! 🌹';
            messageEl.className = 'puzzle-message correct';
            completeEl.classList.remove('hidden');
            showToast('¡Rompecabezas completado! Cada pieza encaja como nosotros 🧩🌹', 4000);
        }

        function shufflePuzzle() {
            createPuzzle();
        }

        shuffleBtn.addEventListener('click', shufflePuzzle);
        checkBtn.addEventListener('click', checkPuzzle);

        // Inicializar
        if (board && piecesContainer) {
            createPuzzle();
        }
    }

    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        elements.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        });
    }

    // ========================================
    // GUARDAR/CARGAR ESTADO DEL LIBRO
    // ========================================
    function saveBookState() {
        const bookState = {
            currentPage: state.currentPage,
            scrollPositions: {}
        };

        // Guardar scroll de cada página
        Object.entries(elements.pages).forEach(([id, page]) => {
            if (page) {
                bookState.scrollPositions[id] = page.scrollTop;
            }
        });

        try {
            localStorage.setItem('book_state', JSON.stringify(bookState));
        } catch (e) {
            console.warn('No se pudo guardar estado del libro:', e);
        }
    }

    function loadBookState() {
        try {
            const saved = localStorage.getItem('book_state');
            if (saved) {
                const bookState = JSON.parse(saved);
                if (bookState.currentPage && elements.pages[bookState.currentPage]) {
                    // No restaurar automáticamente, solo ofrecer
                    console.log('Estado previo encontrado:', bookState.currentPage);
                }
            }
        } catch (e) {
            console.warn('No se pudo cargar estado del libro:', e);
        }
    }

    // Guardar estado al cambiar página
    const originalShowPage = showPage;
    showPage = function(pageId, direction) {
        saveBookState();
        return originalShowPage(pageId, direction);
    };

    // ========================================
    // SERVICE WORKER / PWA (opcional)
    // ========================================
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Silencioso - SW es opcional
            });
        }
    }

    // ========================================
    // INICIALIZAR CUANDO EL DOM ESTÉ LISTO
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exponer funciones globales para debugging
    window.BookApp = {
        showPage,
        nextPage,
        prevPage,
        openLightbox,
        closeLightbox,
        openLetter,
        closeLetter,
        showToast,
        state: () => ({ ...state })
    };

})();