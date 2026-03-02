console.log("script.js loaded");

function startTyping(onComplete) {
    const text = "Jiwon Baek";
    const target = document.getElementById("typed-text");
    let index = 0;

    if (!target) return;

    function type() {
        if (index <= text.length) {
            target.innerHTML = text.substring(0, index) + '<span class="cursor">|</span>';
            index++;
            setTimeout(type, 100);
        } else {
            // ⏱ 바로 동시에 실행
            if (typeof onComplete === "function") onComplete();

            // 🧹 0.5초 후 글자와 커서 제거
            setTimeout(() => {
                target.innerHTML = "";
            }, 500);
        }
    }

    target.innerHTML = '<span class="cursor">|</span>';
    type();
}





document.addEventListener("DOMContentLoaded", () => {
    const doorContainer = document.querySelector(".door-container");
    const carouselContainer = document.querySelector(".carousel-container");
    const carousel = document.querySelector(".carousel");
    const cards = Array.from(carousel.children);
    let currentIndex = 0;
    

    // 🟢 타이핑 → 문열기 → 캐러셀 등장 → 문 숨기기
    startTyping(() => {
        // ✨ 동시에 실행!
        doorContainer.classList.add("open");
        carouselContainer.classList.add("show");
        updateCarousel();
    
        // 🔁 문 제거는 약간의 딜레이 후
        setTimeout(() => {
            doorContainer.style.display = "none";
        }, 1500);
    });
    

    function updateCarousel() {
        const total = cards.length;
        cards.forEach((card, index) => {
            card.classList.remove("active", "left", "right", "hidden");
            const position = (index - currentIndex + total) % total;
            if (position === 0) card.classList.add("active");
            else if (position === 1) card.classList.add("right");
            else if (position === total - 1) card.classList.add("left");
            else card.classList.add("hidden");
        });
    }

    function moveNext() {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }

    function movePrev() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }

    // 🔄 드래그
    let isDragging = false;
    let startX = 0;

    document.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
    });

    document.addEventListener("mouseup", (e) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = e.clientX - startX;
        if (deltaX < -50) {
            moveNext();
        } else if (deltaX > 50) {
            movePrev();
        }
    });

    // ⬅️ ➡️ 키보드
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
            moveNext();
        } else if (e.key === "ArrowLeft") {
            movePrev();
        }
    });

    updateCarousel();
    
// 📱 터치 스와이프 감지
let touchStartX = 0;
let touchEndX = 0;

// 터치 시작
document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

// 터치 끝
document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(); // 스와이프 동작 처리
});

// 스와이프 처리 함수
function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    if (deltaX > 50) {
        movePrev(); // 👉 오른쪽으로 스와이프 (이전 카드)
    } else if (deltaX < -50) {
        moveNext(); // 👈 왼쪽으로 스와이프 (다음 카드)
    }
}

updateCarousel();
});

function toggleAdditional() {
    const box = document.getElementById('additional-leadership-box');
    const btn = document.querySelector('.toggle-additional-btn');
    const leadershipCard = document.querySelector('.card.leadership');
    
    if (box.style.display === 'none' || box.style.display === '') {
    box.style.display = 'block';
    btn.textContent = '－ Hide Leadership';
    leadershipCard.classList.add('scrollable'); // ✅ 스크롤 가능하게
    } else {
    box.style.display = 'none';
    btn.textContent = '＋ View 6 More Leadership';
    leadershipCard.classList.remove('scrollable'); // ✅ 다시 스크롤 비활성화
    leadershipCard.scrollTop = 0; // 💡 스크롤 위치도 초기화
    }
}

function toggleProjectGrid() {
    const grid = document.querySelector('.tech-all-projects');
    const btn = document.getElementById('toggle-projects-btn');
    const card = document.querySelector('.card.tech');
    const techOne = document.querySelector('.tech-one');
    const initial = document.querySelector('.initial-tech-project');

    const isActive = grid.classList.contains('active');

    if (!isActive) {
        grid.classList.add('active');
        btn.textContent = '－ Hide Projects';

        card.classList.add('square');
        card.style.overflow = 'visible';

        techOne?.classList.add('move-up');
        initial?.classList.add('move-up');
        btn.classList.add('move-up');
    } else {
        grid.classList.remove('active');
        btn.textContent = '＋ View 6 More Projects';

        card.classList.remove('square');

        techOne?.classList.remove('move-up');
        initial?.classList.remove('move-up');
        btn.classList.remove('move-up');
    }
}
  
const headers = document.querySelectorAll('.accordion-header');

headers.forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const isOpen = body.classList.contains('open');

    if (isOpen) {
      body.style.maxHeight = null;
    } else {
      body.style.maxHeight = body.scrollHeight + "px";
    }

    body.classList.toggle('open', !isOpen);
    header.classList.toggle('active', !isOpen);

    headers.forEach(h => {
      if (h !== header) {
        h.classList.remove('active');
        h.nextElementSibling.classList.remove('open');
        h.nextElementSibling.style.maxHeight = null;
      }
    });
  });
});

