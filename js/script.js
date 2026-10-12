/* =======================================================
   SCRIPT.JS
   Pequenos efeitos: tela de boot, menu mobile e ano no footer.
   JavaScript usado apenas onde é realmente necessário.
======================================================= */

/* -------- 1. Tela de boot (simulação de inicialização) -------- */
document.addEventListener('DOMContentLoaded', () => {
  const bootLog = document.getElementById('boot-log');
  const bootBarFill = document.getElementById('boot-bar-fill');
  const loadingScreen = document.getElementById('loading-screen');

  // mensagens exibidas em sequência durante o "boot"
  const messages = [
    'Loading profile...',
    'Loading projects...',
    'Loading skills...',
    'Authentication Complete',
    'ACCESS GRANTED'
  ];

  // inicia o preenchimento da barra de progresso
  requestAnimationFrame(() => {
    bootBarFill.style.width = '100%';
  });

  // adiciona cada mensagem em intervalos, criando o efeito de log
  messages.forEach((msg, index) => {
    setTimeout(() => {
      const li = document.createElement('li');
      li.textContent = msg;
      bootLog.appendChild(li);
    }, index * 450);
  });

  // após ~2.5s, esconde a tela de boot suavemente
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 2500);
});

/* -------- 2. Menu mobile (abrir/fechar) -------- */
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// fecha o menu ao clicar em um link (útil no mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

/* -------- 3. Ano automático no footer -------- */
document.getElementById('footer-year').textContent = new Date().getFullYear();

/* -------- 4. Carrossel 3D de projetos acadêmicos Front-End -------- */
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('frontend-carousel-stage');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.frontend-card'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const previous = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  const counter = document.getElementById('carousel-current');
  let activeIndex = 0;
  let startX = 0;

  function renderCarousel() {
    const total = cards.length;
    cards.forEach((card, index) => {
      let offset = index - activeIndex;
      // Com três cartões, mantém a distância mais curta entre os lados.
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      card.classList.toggle('is-active', offset === 0);
      card.dataset.position = offset === 0 ? 'active' : Math.abs(offset) === 1 ? (offset < 0 ? 'prev' : 'next') : 'hidden';
      card.style.zIndex = String(10 - Math.abs(offset));
      card.style.opacity = offset === 0 ? '1' : Math.abs(offset) === 1 ? '.74' : '0';
      card.style.filter = offset === 0 ? 'none' : 'blur(1px) saturate(.72)';
      card.style.pointerEvents = Math.abs(offset) <= 1 ? 'auto' : 'none';

      if (window.matchMedia('(max-width: 900px)').matches) {
        // Os posicionamentos laterais responsivos são definidos no CSS.
        card.style.transform = offset === 0
          ? 'translate(-50%, -50%) translateZ(60px) scale(1)'
          : offset < 0
            ? 'translate(-105%, -50%) rotateY(28deg) scale(.78)'
            : 'translate(5%, -50%) rotateY(-28deg) scale(.78)';
      } else {
        const x = offset * 275;
        const rotate = offset * -18;
        const scale = offset === 0 ? 1 : .79;
        const depth = offset === 0 ? 70 : -100;
        card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${depth}px) rotateY(${rotate}deg) scale(${scale})`;
      }
    });

    dots.forEach((dot, index) => {
      const active = index === activeIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-pressed', String(active));
    });
    if (counter) counter.textContent = String(activeIndex + 1).padStart(2, '0');
  }

  function goTo(index) {
    activeIndex = (index + cards.length) % cards.length;
    renderCarousel();
  }

  previous?.addEventListener('click', () => goTo(activeIndex - 1));
  next?.addEventListener('click', () => goTo(activeIndex + 1));
  dots.forEach(dot => dot.addEventListener('click', () => goTo(Number(dot.dataset.go))));

  cards.forEach((card, index) => {
    card.addEventListener('click', event => {
      if (index !== activeIndex && !event.target.closest('a')) {
        event.preventDefault();
        goTo(index);
      }
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (index !== activeIndex) {
          event.preventDefault();
          goTo(index);
        }
      }
    });
  });

  // Movimento sutil do cartão central acompanha o mouse, como na referência.
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const activeCard = cards[activeIndex];
    const bounds = activeCard.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    activeCard.style.setProperty('--card-tilt-y', `${relativeX * 7}deg`);
    activeCard.style.setProperty('--card-tilt-x', `${relativeY * -5}deg`);
  });
  stage.addEventListener('pointerleave', () => {
    cards.forEach(card => {
      card.style.setProperty('--card-tilt-x', '0deg');
      card.style.setProperty('--card-tilt-y', '0deg');
    });
  });

  // Arrastar no touchpad/celular troca o cartão em destaque.
  stage.addEventListener('pointerdown', event => { startX = event.clientX; });
  stage.addEventListener('pointerup', event => {
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 55) goTo(activeIndex + (distance < 0 ? 1 : -1));
  });
  window.addEventListener('resize', renderCarousel);
  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && document.activeElement?.closest('#projetos-front-end')) goTo(activeIndex - 1);
    if (event.key === 'ArrowRight' && document.activeElement?.closest('#projetos-front-end')) goTo(activeIndex + 1);
  });
  renderCarousel();
});
