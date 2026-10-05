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

const motionItems = [
  ['.section-tag', 'fade-right'],
  ['.statement-body', 'clip-up'],
  ['.statement-copy p', 'fade-up'],
  ['.text-link', 'fade-left'],
  ['.manifesto-line', 'fade-up'],
  ['.manifesto-word', 'zoom'],
  ['.transition-word', 'fade-down'],
  ['.transition-name', 'zoom'],
  ['.transition-copy', 'fade-up'],
  ['.feature-intro h2', 'clip-up'],
  ['.feature-intro > p', 'fade-left'],
  ['.feature-list article', 'clip-right'],
  ['.app-head h2', 'clip-up'],
  ['.app-head p', 'fade-left'],
  ['.app-window', 'zoom'],
  ['.big-type p', 'fade-right'],
  ['.big-type h2', 'clip-up'],
  ['.open-grid h2', 'clip-up'],
  ['.open-grid p', 'fade-up'],
  ['.round-link', 'zoom'],
  ['.finale h2', 'zoom']
];

motionItems.forEach(([selector, type]) => {
  document.querySelectorAll(selector).forEach((el, index) => {
    el.dataset.aos = type;
    if (index > 0) el.dataset.delay = String(Math.min(index, 6));
  });
});

const reveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    reveal.unobserve(entry.target);
  });
}, {
  threshold: .14,
  rootMargin: '0px 0px -8% 0px'
});

document.querySelectorAll('[data-aos]').forEach(el => reveal.observe(el));

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

const parallaxItems = document.querySelectorAll('[data-parallax]');
const legacyParallax = document.querySelectorAll('.opening-word,.manifesto-word,.big-type h2');

lenis.on('scroll', ({ scroll }) => {
  parallaxItems.forEach(el => {
    const speed = Number(el.dataset.parallax || .08);
    const rect = el.getBoundingClientRect();
    if (rect.bottom > -100 && rect.top < innerHeight + 100) {
      const progress = (innerHeight / 2 - (rect.top + rect.height / 2));
      el.style.transform = `translate3d(0,${progress * speed}px,0)`;
    }
  });

  legacyParallax.forEach((el, i) => {
    if (el.closest('[data-aos]') && !el.classList.contains('is-visible')) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) {
      const shift = (innerHeight / 2 - (rect.top + rect.height / 2)) * (i % 2 ? -.025 : .018);
      el.style.transform = `translate3d(${shift}px,0,0)`;
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -40, duration: 1.35 });
  });
});
