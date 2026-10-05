document.documentElement.classList.add('js');

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}})
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const tracks=[...document.querySelectorAll('.track')];
const title=document.getElementById('nowTitle');
const artist=document.getElementById('nowArtist');
const play=document.getElementById('demoPlay');
const heroPlay=document.getElementById('heroPlay');
let playing=false;

function selectTrack(track){
  tracks.forEach(t=>t.classList.remove('active'));
  track.classList.add('active');
  title.textContent=track.dataset.title;
  artist.textContent=track.dataset.artist;
  playing=true;
  play.textContent='Ⅱ';
}
tracks.forEach(track=>track.addEventListener('click',()=>selectTrack(track)));

function togglePlay(){
  playing=!playing;
  play.textContent=playing?'Ⅱ':'▶';
  heroPlay.textContent=playing?'Ⅱ':'▶';
}
play.addEventListener('click',togglePlay);
heroPlay.addEventListener('click',togglePlay);

document.getElementById('shuffle').addEventListener('click',()=>{
  const random=tracks[Math.floor(Math.random()*tracks.length)];
  selectTrack(random);
});

document.querySelectorAll('.faq').forEach(item=>{
  item.addEventListener('click',()=>item.classList.toggle('open'));
});

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const target=document.querySelector(link.getAttribute('href'));
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'})}
  });
});