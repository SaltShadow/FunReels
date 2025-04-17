document.addEventListener('DOMContentLoaded', function() {
    const reelsContainer = document.getElementById('reelsContainer');
    const loadingElement = document.getElementById('loading');
    let currentReelIndex = 0;
    let reels = [];
    let isAnimating = false;
    let startY = 0;
    
    // Configurações
    const API_BASE_URL = 'http://10.0.0.20:7777/images/'; // Substitua pela sua API real
    const INITIAL_REEL_COUNT = 3; // Número inicial de reels a carregar
    const PRELOAD_NEXT_COUNT = 1; // Quantos reels pré-carregar à frente
    
    // Inicializar o app
    init();
    
    function init() {
        loadInitialReels();
        setupSwipeGestures();
    }
    
    async function loadInitialReels() {
        showLoading();
        
        try {
            // Carrega os reels iniciais
            for (let i = 1; i <= INITIAL_REEL_COUNT; i++) {
                const reel = await fetchReel(i);
                if (reel) {
                    reels.push(reel);
                    createReelElement(reel, i - 1);
                }
            }
            
            // Ativa o primeiro reel
            if (reels.length > 0) {
                activateReel(0);
            }
            
            // Pré-carrega os próximos reels
            preloadNextReels();
            
        } catch (error) {
            console.error('Error loading initial reels:', error);
        } finally {
            hideLoading();
        }
    }
    
    async function fetchReel(id) {
        // Simulação de chamada à API
        // Na prática, você faria uma requisição fetch para sua API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: id,
                    imageUrl: `${API_BASE_URL}${id}.png`,
                    username: `user_${id}`,
                    description: `Este é o reel número ${id}`,
                    likes: Math.floor(Math.random() * 1000),
                    comments: Math.floor(Math.random() * 100),
                    shares: Math.floor(Math.random() * 50),
                    isLiked: false
                });
            }, 500); // Simula delay de rede
        });
    }
    
    function createReelElement(reelData, index) {
        const reelElement = document.createElement('div');
        reelElement.className = 'reel';
        reelElement.dataset.id = reelData.id;
        reelElement.dataset.index = index;
        
        reelElement.innerHTML = `
            <img src="${reelData.imageUrl}" alt="Reel ${reelData.id}" class="reel-image" onerror="this.src='placeholder.png'">
            <div class="reel-info">
                <div class="reel-username">@${reelData.username}</div>
                <div class="reel-description">${reelData.description}</div>
            </div>
            <div class="reel-actions">
                <button class="action-btn like-btn ${reelData.isLiked ? 'active' : ''}" data-id="${reelData.id}">
                    <i class="fas fa-heart"></i>
                    <span>${reelData.likes}</span>
                </button>
                <button class="action-btn comment-btn" data-id="${reelData.id}">
                    <i class="fas fa-comment"></i>
                    <span>${reelData.comments}</span>
                </button>
                <button class="action-btn share-btn" data-id="${reelData.id}">
                    <i class="fas fa-share"></i>
                    <span>${reelData.shares}</span>
                </button>
            </div>
        `;
        
        reelsContainer.appendChild(reelElement);
        
        // Adiciona event listeners para os botões
        const likeBtn = reelElement.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => toggleLike(reelData.id));
        
        const commentBtn = reelElement.querySelector('.comment-btn');
        commentBtn.addEventListener('click', () => openComments(reelData.id));
        
        const shareBtn = reelElement.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => shareReel(reelData.id));
    }
    
    function activateReel(index) {
        if (index < 0 || index >= reels.length || isAnimating) return;
        
        const reelsElements = document.querySelectorAll('.reel');
        const currentActive = document.querySelector('.reel.active');
        
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        
        reelsElements[index].classList.add('active');
        currentReelIndex = index;
        
        // Verifica se precisamos carregar mais reels
        if (index >= reels.length - PRELOAD_NEXT_COUNT) {
            preloadNextReels();
        }
    }
    
    async function preloadNextReels() {
        const nextId = reels.length + 1;
        
        try {
            const reel = await fetchReel(nextId);
            if (reel) {
                reels.push(reel);
                createReelElement(reel, reels.length - 1);
            }
        } catch (error) {
            console.error('Error preloading next reel:', error);
        }
    }
    
    function showLoading() {
        loadingElement.style.display = 'flex';
    }
    
    function hideLoading() {
        loadingElement.style.display = 'none';
    }
    
    function setupSwipeGestures() {
        reelsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        reelsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        reelsContainer.addEventListener('touchend', handleTouchEnd);
        
        // Para suporte a mouse também
        reelsContainer.addEventListener('mousedown', handleMouseDown);
        reelsContainer.addEventListener('mousemove', handleMouseMove);
        reelsContainer.addEventListener('mouseup', handleMouseUp);
    }
    
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        if (isAnimating) {
            e.preventDefault();
            return;
        }
        
        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        // Impede o scroll padrão se estiver fazendo swipe
        if (Math.abs(diffY) > 10) {
            e.preventDefault();
        }
    }
    
    function handleTouchEnd(e) {
        const endY = e.changedTouches[0].clientY;
        const diffY = startY - endY;
        
        // Determina se foi um swipe significativo
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // Swipe para cima - próximo reel
                showNextReel();
            } else {
                // Swipe para baixo - reel anterior
                showPreviousReel();
            }
        }
    }
    
    // Handlers para mouse (similar aos de touch)
    function handleMouseDown(e) {
        startY = e.clientY;
    }
    
    function handleMouseMove(e) {
        if (isAnimating && e.buttons === 1) {
            e.preventDefault();
        }
    }
    
    function handleMouseUp(e) {
        const endY = e.clientY;
        const diffY = startY - endY;
        
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                showNextReel();
            } else {
                showPreviousReel();
            }
        }
    }
    
    function showNextReel() {
        if (isAnimating || currentReelIndex >= reels.length - 1) return;
        
        isAnimating = true;
        const currentReel = document.querySelector('.reel.active');
        const nextReel = document.querySelector(`.reel[data-index="${currentReelIndex + 1}"]`);
        
        if (currentReel && nextReel) {
            currentReel.classList.add('exit-up');
            nextReel.classList.add('active');
            
            setTimeout(() => {
                currentReel.classList.remove('active', 'exit-up');
                isAnimating = false;
                currentReelIndex++;
            }, 500);
        }
    }
    
    function showPreviousReel() {
        if (isAnimating || currentReelIndex <= 0) return;
        
        isAnimating = true;
        const currentReel = document.querySelector('.reel.active');
        const prevReel = document.querySelector(`.reel[data-index="${currentReelIndex - 1}"]`);
        
        if (currentReel && prevReel) {
            currentReel.classList.add('exit-down');
            prevReel.classList.add('active');
            
            setTimeout(() => {
                currentReel.classList.remove('active', 'exit-down');
                isAnimating = false;
                currentReelIndex--;
            }, 500);
        }
    }
    
    function toggleLike(reelId) {
        const reelIndex = reels.findIndex(r => r.id === reelId);
        if (reelIndex === -1) return;
        
        const reel = reels[reelIndex];
        reel.isLiked = !reel.isLiked;
        reel.likes += reel.isLiked ? 1 : -1;
        
        const likeBtn = document.querySelector(`.like-btn[data-id="${reelId}"]`);
        if (likeBtn) {
            likeBtn.classList.toggle('active');
            likeBtn.querySelector('span').textContent = reel.likes;
        }
    }
    
    function openComments(reelId) {
        alert(`Abrir comentários para o reel ${reelId}`);
        // Na implementação real, você mostraria um modal com os comentários
    }
    
    function shareReel(reelId) {
        alert(`Compartilhar reel ${reelId}`);
        // Na implementação real, você mostraria opções de compartilhamento
    }
    
    // Adiciona suporte para teclado (setas para cima/baixo)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            showPreviousReel();
        } else if (e.key === 'ArrowDown') {
            showNextReel();
        }
    });
});