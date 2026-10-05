document.documentElement.classList.add('js');

const lenis = new Lenis({
  autoRaf: true,
  anchors: true,
  lerp: .075,
  duration: 1.2,
  smoothWheel: true,
  syncTouch: true
});

const cursor = document.querySelector('.cursor');
window.addEventListener('pointermove', e => {
  if (!cursor) return;
  cursor.style.transform = `translate3d(${e.clientX - 4}px,${e.clientY - 4}px,0)`;
});

/* Letter-by-letter editorial typography */
function splitLetters(element) {
  if (element.dataset.splitDone) return;
  element.dataset.splitDone = 'true';

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    [...node.textContent].forEach(char => {
      const span = document.createElement('span');
      span.className = char.trim() ? 'letter' : 'letter space';
      span.textContent = char.trim() ? char : '\u00A0';
      fragment.appendChild(span);
    });
    node.parentNode.replaceChild(fragment, node);
  });
}

document.querySelectorAll('[data-letter]').forEach(splitLetters);

const reveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    entry.target.classList.add('letters-visible');
    reveal.unobserve(entry.target);
  });
}, {
  threshold: .12,
  rootMargin: '0px 0px -10% 0px'
});

document.querySelectorAll('[data-aos], [data-letter]').forEach((el, index) => {
  if (el.dataset.aos === 'media') {
    el.style.transitionDelay = '0s';
  }
  reveal.observe(el);
});

/* Extra stagger for letter animations */
document.querySelectorAll('[data-letter] .letter').forEach((letter, index) => {
  letter.style.transitionDelay = `${Math.min(index * .018, .9)}s`;
});

const songs = [...document.querySelectorAll('.song')];
const title = document.getElementById('trackTitle');
const artist = document.getElementById('trackArtist');
const play = document.getElementById('play');
let playing = false;

function choose(song) {
  songs.forEach(s => s.classList.remove('selected'));
  song.classList.add('selected');
  title.textContent = song.dataset.title;
  artist.textContent = song.dataset.artist;
  playing = true;
  play.textContent = 'Ⅱ';
}
songs.forEach(song => song.addEventListener('click', () => choose(song)));

play.addEventListener('click', () => {
  playing = !playing;
  play.textContent = playing ? 'Ⅱ' : '▶';
});

document.getElementById('next').addEventListener('click', () => {
  const index = songs.findIndex(s => s.classList.contains('selected'));
  choose(songs[(index + 1) % songs.length]);
});

document.getElementById('prev').addEventListener('click', () => {
  const index = songs.findIndex(s => s.classList.contains('selected'));
  choose(songs[(index - 1 + songs.length) % songs.length]);
});

/* Scroll-linked movement */
const parallaxItems = document.querySelectorAll('[data-parallax]');
const mediaItems = document.querySelectorAll('.visual-break img, .opening-media');

lenis.on('scroll', ({ scroll }) => {
  parallaxItems.forEach(el => {
    const speed = Number(el.dataset.parallax || .02);
    const rect = el.getBoundingClientRect();
    if (rect.bottom > -100 && rect.top < innerHeight + 100) {
      const progress = (innerHeight / 2 - (rect.top + rect.height / 2));
      el.style.transform = `translate3d(0,${progress * speed}px,0)`;
    }
  });

  mediaItems.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const progress = (innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight;
    const scale = 1 + Math.abs(progress) * .055;
    const y = progress * (i % 2 ? -24 : 18);
    el.style.transform = `translate3d(0,${y}px,0) scale(${scale})`;
  });
});

/* Smooth internal navigation */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -40, duration: 1.35 });
  });
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis.stop();
}