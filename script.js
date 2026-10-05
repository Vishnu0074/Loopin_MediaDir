const root=document.documentElement;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis=(!reduced&&typeof window.Lenis==='function')?new window.Lenis({autoRaf:true,anchors:true,lerp:.075,smoothWheel:true,syncTouch:true}):null;

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('is-visible','letters-visible');observer.unobserve(e.target)}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal,.reveal-scale').forEach(el=>observer.observe(el));root.classList.add('motion-ready');

const cursor=document.querySelector('.cursor');if(cursor)window.addEventListener('pointermove',e=>cursor.style.transform=`translate3d(${e.clientX-3}px,${e.clientY-3}px,0)`);
const dots=[...document.querySelectorAll('.progress-dots i')],scenes=[...document.querySelectorAll('[data-scene]')];
const sceneObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const i=scenes.indexOf(e.target);dots.forEach((d,n)=>d.classList.toggle('active',n===i))}),{threshold:.45});scenes.forEach(s=>sceneObserver.observe(s));

const tracks=[
  {title:'Malare',artist:'Vijay Yesudas',displayArtist:'Vijay Yesudas · Premam',image:'/Loopin_MediaDir/Loopin_Artists/yesudas.jpg',next:'Pavizha Mazha'},
  {title:'Pavizha Mazha',artist:'KS Harisankar',displayArtist:'KS Harisankar · Athiran',image:'/Loopin_MediaDir/Loopin_Artists/sithara.png',next:'Darshana'},
  {title:'Darshana',artist:'Hesham Abdul Wahab',displayArtist:'Hesham Abdul Wahab · Hridayam',image:'/Loopin_MediaDir/Loopin_Artists/vithu.webp',next:'Aaradhike'},
  {title:'Aaradhike',artist:'Sooraj Santhosh',displayArtist:'Sooraj Santhosh · Ambili',image:'/Loopin_MediaDir/Loopin_Artists/chithra.webp',next:'Malare'}
];

let current=0,playing=false,searchToken=0;
const audio=document.getElementById('previewAudio'),art=document.getElementById('playerArt'),title=document.getElementById('playerTitle'),artist=document.getElementById('playerArtist'),nextTrack=document.getElementById('nextTrack'),play=document.getElementById('play'),progress=document.getElementById('playerProgress'),currentTime=document.getElementById('playerCurrentTime'),duration=document.getElementById('playerDuration'),status=document.getElementById('previewStatus'),storeLink=document.getElementById('storeLink');

function formatTime(value){if(!Number.isFinite(value))return'0:00';const s=Math.max(0,Math.floor(value)),m=Math.floor(s/60),sec=String(s%60).padStart(2,'0');return `${m}:${sec}`}
function setStatus(message){if(status)status.textContent=message}

function searchApplePreview(track){
  const token=++searchToken;
  setStatus('Finding Apple preview…');
  if(storeLink){storeLink.hidden=true;storeLink.removeAttribute('href')}
  return new Promise((resolve,reject)=>{
    const callback=`loopinAppleSearch_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script=document.createElement('script');
    const cleanup=()=>{delete window[callback];script.remove()};
    const timer=setTimeout(()=>{cleanup();reject(new Error('Apple preview search timed out'))},9000);
    window[callback]=(data)=>{
      clearTimeout(timer);cleanup();
      if(token!==searchToken)return;
      const results=Array.isArray(data?.results)?data.results:[];
      const normalizedTitle=track.title.toLowerCase();
      const normalizedArtist=track.artist.toLowerCase();
      const ranked=results.filter(x=>x.previewUrl).map(x=>{
        const t=String(x.trackName||'').toLowerCase();
        const a=String(x.artistName||'').toLowerCase();
        const titleMatch=t===normalizedTitle?8:(t.includes(normalizedTitle)||normalizedTitle.includes(t)?4:0);
        const artistMatch=a.includes(normalizedArtist)||normalizedArtist.includes(a)?5:0;
        return {item:x,score:titleMatch+artistMatch};
      }).sort((a,b)=>b.score-a.score);
      const match=ranked[0]?.item;
      if(!match)return reject(new Error('No Apple preview found'));
      resolve(match);
    };
    script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error('Apple preview search failed'))};
    const params=new URLSearchParams({term:`${track.title} ${track.artist}`,country:'IN',media:'music',entity:'song',limit:'5',callback});
    script.src=`https://itunes.apple.com/search?${params.toString()}`;
    document.head.appendChild(script);
  });
}

async function loadPreview(){
  if(!audio)return;
  const track=tracks[current];
  audio.pause();audio.removeAttribute('src');audio.load();playing=false;if(play)play.textContent='▶';
  progress?.style.setProperty('width','0%');if(currentTime)currentTime.textContent='0:00';if(duration)duration.textContent='0:30';
  try{
    const match=await searchApplePreview(track);
    audio.src=match.previewUrl;
    if(storeLink&&match.trackViewUrl){storeLink.href=match.trackViewUrl;storeLink.hidden=false}
    setStatus('30-second preview ready.');
    if(art&&match.artworkUrl100)art.src=match.artworkUrl100.replace(/100x100[^/]*$/,'600x600bb.jpg');
  }catch(error){setStatus('Preview unavailable for this track.');console.warn('[Loopin] Apple preview:',error)}
}

function setTrack(i){
  current=(i+tracks.length)%tracks.length;
  const t=tracks[current];
  if(art){art.style.opacity='.2';setTimeout(()=>{art.src=t.image;art.style.opacity='1'},120)}
  if(title)title.textContent=t.title;
  if(artist)artist.textContent=t.displayArtist;
  if(nextTrack)nextTrack.textContent=t.next;
  loadPreview();
}

document.getElementById('next')?.addEventListener('click',()=>setTrack(current+1));
document.getElementById('prev')?.addEventListener('click',()=>setTrack(current-1));
play?.addEventListener('click',async()=>{
  if(!audio?.src){await loadPreview()}
  if(!audio?.src){return}
  try{if(audio.paused){await audio.play();playing=true;play.textContent='Ⅱ';setStatus('Playing Apple preview.')}else{audio.pause();playing=false;play.textContent='▶';setStatus('Preview paused.')}}catch(error){playing=false;play.textContent='▶';setStatus('Preview could not be played.');console.warn('[Loopin] Apple preview playback:',error)}
});
audio?.addEventListener('timeupdate',()=>{
  if(progress)progress.style.width=`${audio.duration?Math.min(100,audio.currentTime/audio.duration*100):0}%`;
  if(currentTime)currentTime.textContent=formatTime(audio.currentTime);
  if(duration&&Number.isFinite(audio.duration))duration.textContent=formatTime(audio.duration);
});
audio?.addEventListener('loadedmetadata',()=>{if(duration)duration.textContent=formatTime(audio.duration)});
audio?.addEventListener('ended',()=>{playing=false;if(play)play.textContent='▶';setStatus('Preview finished. Play again or open Apple Music.')});
audio?.addEventListener('error',()=>{playing=false;if(play)play.textContent='▶';setStatus('Apple preview could not be loaded.')});

document.querySelectorAll('.artist-card').forEach(card=>card.addEventListener('click',()=>{if(art)art.src=card.dataset.image;if(title)title.textContent=card.dataset.title;if(artist)artist.textContent=card.dataset.artist;if(nextTrack)nextTrack.textContent='Your next discovery'}));

loadPreview();

const menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');if(menu&&toggle){const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu'};toggle.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close':'Menu'});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close))}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();if(lenis)lenis.scrollTo(target,{offset:-25,duration:1.15});else target.scrollIntoView({behavior:reduced?'auto':'smooth'})}));
const sound=document.querySelector('.sound-toggle');sound?.addEventListener('click',()=>{sound.classList.toggle('on');sound.querySelector('.sound-bars').textContent=sound.classList.contains('on')?'▮▮▮':'▯▯▯'});
const theme=document.querySelector('.theme-dot');theme?.addEventListener('click',()=>document.body.classList.toggle('pink-mode'));
