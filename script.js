document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = prefersReducedMotion ? null : new Lenis({
  autoRaf:true,
  anchors:true,
  lerp:.085,
  smoothWheel:true,
  syncTouch:true
});

const cursor=document.querySelector('.cursor');
if(cursor){
  window.addEventListener('pointermove',e=>{
    cursor.style.transform=`translate3d(${e.clientX-4}px,${e.clientY-4}px,0)`;
  });
}

/* Letter-by-letter headings. Only the display headings use this;
   normal body text remains untouched. */
function splitLetters(el){
  if(el.dataset.splitDone)return;
  el.dataset.splitDone='true';

  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);

  nodes.forEach(node=>{
    const fragment=document.createDocumentFragment();
    for(const char of node.textContent){
      const span=document.createElement('span');
      span.className=char.trim()?'letter':'letter space';
      span.textContent=char.trim()?char:'\u00a0';
      fragment.appendChild(span);
    }
    node.parentNode.replaceChild(fragment,node);
  });
}
document.querySelectorAll('[data-letter]').forEach(splitLetters);

/* One observer controls all reveal animations.
   Elements are observed once and never fight a second animation system. */
const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-visible','letters-visible');
    revealObserver.unobserve(entry.target);
  });
},{threshold:.12,rootMargin:'0px 0px -8% 0px'});

document.querySelectorAll('[data-aos],[data-letter]').forEach(el=>revealObserver.observe(el));

document.querySelectorAll('[data-letter] .letter').forEach((letter,index)=>{
  letter.style.transitionDelay=`${Math.min(index*.022,.75)}s`;
});

/* Small scroll-linked movement. It never writes to elements that also
   use transform-based AOS, avoiding the previous transform conflict. */
const parallaxItems=[...document.querySelectorAll('[data-parallax]')];
function updateParallax(){
  parallaxItems.forEach(el=>{
    if(!el.classList.contains('is-visible') && el.hasAttribute('data-letter'))return;
    const rect=el.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight)return;
    const speed=Number(el.dataset.parallax||.02);
    const progress=(window.innerHeight/2-(rect.top+rect.height/2));
    el.style.setProperty('--parallax-y',`${progress*speed}px`);
  });
}
if(lenis){
  lenis.on('scroll',updateParallax);
}else{
  window.addEventListener('scroll',updateParallax,{passive:true});
}

/* Interactive queue preview */
const songs=[...document.querySelectorAll('.song')];
const title=document.getElementById('trackTitle');
const artist=document.getElementById('trackArtist');
const play=document.getElementById('play');
let playing=false;

function choose(song){
  songs.forEach(item=>item.classList.remove('selected'));
  song.classList.add('selected');
  if(title)title.textContent=song.dataset.title;
  if(artist)artist.textContent=song.dataset.artist;
  playing=true;
  if(play)play.textContent='Ⅱ';
}
songs.forEach(song=>song.addEventListener('click',()=>choose(song)));

if(play){
  play.addEventListener('click',()=>{
    playing=!playing;
    play.textContent=playing?'Ⅱ':'▶';
  });
}
const next=document.getElementById('next');
const prev=document.getElementById('prev');
if(next)next.addEventListener('click',()=>{
  const index=songs.findIndex(s=>s.classList.contains('selected'));
  choose(songs[(index+1+songs.length)%songs.length]);
});
if(prev)prev.addEventListener('click',()=>{
  const index=songs.findIndex(s=>s.classList.contains('selected'));
  choose(songs[(index-1+songs.length)%songs.length]);
});

/* Lenis anchors with a safe fallback */
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const selector=link.getAttribute('href');
    const target=document.querySelector(selector);
    if(!target)return;
    e.preventDefault();
    if(lenis)lenis.scrollTo(target,{offset:-35,duration:1.15});
    else target.scrollIntoView({behavior:'smooth'});
  });
});