const root=document.documentElement;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis=(!reduced&&typeof window.Lenis==='function')?new window.Lenis({autoRaf:true,anchors:true,lerp:.085,smoothWheel:true,syncTouch:true}):null;

function splitLetters(el){
  if(el.dataset.splitDone)return;
  el.dataset.splitDone='1';
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    const frag=document.createDocumentFragment();
    for(const char of node.textContent){
      const span=document.createElement('span');
      span.className=char.trim()?'letter':'letter space';
      span.textContent=char.trim()?char:'\u00a0';
      frag.appendChild(span);
    }
    node.parentNode.replaceChild(frag,node);
  });
}
document.querySelectorAll('[data-letters]').forEach(splitLetters);

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-visible','letters-visible');
    observer.unobserve(entry.target);
  });
},{threshold:.1,rootMargin:'0px 0px -7% 0px'});
document.querySelectorAll('.reveal,.reveal-scale,[data-letters]').forEach(el=>observer.observe(el));
root.classList.add('motion-ready');

document.querySelectorAll('[data-letters] .letter').forEach((el,i)=>el.style.transitionDelay=Math.min(i*.018,.65)+'s');

const cursor=document.querySelector('.cursor');
if(cursor)window.addEventListener('pointermove',e=>cursor.style.transform=`translate3d(${e.clientX-4}px,${e.clientY-4}px,0)`);

const tracks=[
 {title:'Malare',artist:'Vijay Yesudas · Premam',image:'assets/Loopin_Artists/yesudas.jpg',next:'Pavizha Mazha'},
 {title:'Pavizha Mazha',artist:'KS Harisankar · Athiran',image:'assets/Loopin_Artists/sithara.png',next:'Darshana'},
 {title:'Darshana',artist:'Hesham Abdul Wahab · Hridayam',image:'assets/Loopin_Artists/vithu.webp',next:'Aaradhike'},
 {title:'Aaradhike',artist:'Sooraj Santhosh · Ambili',image:'assets/Loopin_Artists/chithra.webp',next:'Malare'}
];
let trackIndex=0,playing=false;
const title=document.getElementById('trackTitle'),artist=document.getElementById('trackArtist'),cover=document.querySelector('#cover img'),queueNext=document.getElementById('queueNext'),play=document.getElementById('play');
function setTrack(i){
  trackIndex=(i+tracks.length)%tracks.length;
  const t=tracks[trackIndex];
  if(title)title.textContent=t.title;if(artist)artist.textContent=t.artist;if(cover)cover.src=t.image;if(queueNext)queueNext.textContent=t.next;
  document.querySelectorAll('.story-step').forEach((s,n)=>s.classList.toggle('active',n===trackIndex));
}
function togglePlay(){playing=!playing;if(play)play.textContent=playing?'Ⅱ':'▶'}
play?.addEventListener('click',togglePlay);
document.getElementById('next')?.addEventListener('click',()=>setTrack(trackIndex+1));
document.getElementById('prev')?.addEventListener('click',()=>setTrack(trackIndex-1));

const steps=[...document.querySelectorAll('.story-step')];
const storyObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){const i=steps.indexOf(e.target);if(i>=0)setTrack(i)}
}),{threshold:.65});
steps.forEach(s=>storyObserver.observe(s));

document.querySelectorAll('.art-card').forEach(card=>card.addEventListener('click',()=>{
  if(cover)cover.src=card.dataset.image;
  if(title)title.textContent=card.dataset.title;
  if(artist)artist.textContent=card.dataset.artist;
  if(queueNext)queueNext.textContent='Your next discovery';
  document.querySelector('#experience')?.scrollIntoView({behavior:reduced?'auto':'smooth'});
}));

const menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');
if(menu&&toggle){
 const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu'};
 toggle.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',open);toggle.textContent=open?'Close':'Menu'});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
 const target=document.querySelector(link.getAttribute('href'));if(!target)return;e.preventDefault();
 if(lenis)lenis.scrollTo(target,{offset:-30,duration:1.1});else target.scrollIntoView({behavior:reduced?'auto':'smooth'});
}));