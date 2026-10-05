const root=document.documentElement;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis=(!reduced&&typeof window.Lenis==='function')?new window.Lenis({autoRaf:true,anchors:true,lerp:.075,smoothWheel:true,syncTouch:true}):null;

function splitLetters(el){if(el.dataset.splitDone)return;el.dataset.splitDone='1';const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{const f=document.createDocumentFragment();for(const c of node.textContent){const s=document.createElement('span');s.className=c.trim()?'letter':'letter space';s.textContent=c.trim()?c:'\u00a0';f.appendChild(s)}node.parentNode.replaceChild(f,node)})}
document.querySelectorAll('[data-letters]').forEach(splitLetters);
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('is-visible','letters-visible');observer.unobserve(e.target)}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal,.reveal-scale,[data-letters]').forEach(el=>observer.observe(el));root.classList.add('motion-ready');
document.querySelectorAll('[data-letters] .letter').forEach((el,i)=>el.style.transitionDelay=Math.min(i*.018,.65)+'s');

const cursor=document.querySelector('.cursor');if(cursor)window.addEventListener('pointermove',e=>cursor.style.transform=`translate3d(${e.clientX-3}px,${e.clientY-3}px,0)`);
const dots=[...document.querySelectorAll('.progress-dots i')],scenes=[...document.querySelectorAll('[data-scene]')];
const sceneObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const i=scenes.indexOf(e.target);dots.forEach((d,n)=>d.classList.toggle('active',n===i))}),{threshold:.45});scenes.forEach(s=>sceneObserver.observe(s));

const tracks=[{title:'Malare',artist:'Vijay Yesudas · Premam',image:'/Loopin_MediaDir/Loopin_Artists/yesudas.jpg',next:'Pavizha Mazha'},{title:'Pavizha Mazha',artist:'KS Harisankar · Athiran',image:'/Loopin_MediaDir/Loopin_Artists/sithara.png',next:'Darshana'},{title:'Darshana',artist:'Hesham Abdul Wahab · Hridayam',image:'/Loopin_MediaDir/Loopin_Artists/vithu.webp',next:'Aaradhike'},{title:'Aaradhike',artist:'Sooraj Santhosh · Ambili',image:'/Loopin_MediaDir/Loopin_Artists/chithra.webp',next:'Malare'}];
let current=0,playing=false;const art=document.getElementById('playerArt'),title=document.getElementById('playerTitle'),artist=document.getElementById('playerArtist'),nextTrack=document.getElementById('nextTrack'),play=document.getElementById('play');
function setTrack(i){current=(i+tracks.length)%tracks.length;const t=tracks[current];if(art){art.style.opacity='.2';setTimeout(()=>{art.src=t.image;art.style.opacity='1'},120)}if(title)title.textContent=t.title;if(artist)artist.textContent=t.artist;if(nextTrack)nextTrack.textContent=t.next}
document.getElementById('next')?.addEventListener('click',()=>setTrack(current+1));document.getElementById('prev')?.addEventListener('click',()=>setTrack(current-1));play?.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Ⅱ':'▶'});
document.querySelectorAll('.artist-card').forEach(card=>card.addEventListener('click',()=>{if(art)art.src=card.dataset.image;if(title)title.textContent=card.dataset.title;if(artist)artist.textContent=card.dataset.artist;if(nextTrack)nextTrack.textContent='Your next discovery'}));

const menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');if(menu&&toggle){const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu'};toggle.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close':'Menu'});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close))}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();if(lenis)lenis.scrollTo(target,{offset:-25,duration:1.15});else target.scrollIntoView({behavior:reduced?'auto':'smooth'})}));
const sound=document.querySelector('.sound-toggle');sound?.addEventListener('click',()=>{sound.classList.toggle('on');sound.querySelector('.sound-bars').textContent=sound.classList.contains('on')?'▮▮▮':'▯▯▯'});
const theme=document.querySelector('.theme-dot');theme?.addEventListener('click',()=>document.body.classList.toggle('pink-mode'));
