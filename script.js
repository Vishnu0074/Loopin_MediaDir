document.documentElement.classList.add('js');

const lenis=new Lenis({autoRaf:true,anchors:true,lerp:.085,duration:1.15,smoothWheel:true});

const cursor=document.querySelector('.cursor');
window.addEventListener('pointermove',e=>{
  cursor.style.transform=`translate3d(${e.clientX-4}px,${e.clientY-4}px,0)`;
});

const reveal=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      reveal.unobserve(entry.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.section-tag,.statement-body,.feature-intro,.feature-list article,.app-head,.app-window,.big-type,.open-grid,.finale h2').forEach(el=>reveal.observe(el));

const songs=[...document.querySelectorAll('.song')];
const title=document.getElementById('trackTitle');
const artist=document.getElementById('trackArtist');
const play=document.getElementById('play');
let playing=false;

function choose(song){
  songs.forEach(s=>s.classList.remove('selected'));
  song.classList.add('selected');
  title.textContent=song.dataset.title;
  artist.textContent=song.dataset.artist;
  playing=true;
  play.textContent='Ⅱ';
}
songs.forEach(song=>song.addEventListener('click',()=>choose(song)));

play.addEventListener('click',()=>{
  playing=!playing;
  play.textContent=playing?'Ⅱ':'▶';
});

document.getElementById('next').addEventListener('click',()=>{
  const index=songs.findIndex(s=>s.classList.contains('selected'));
  choose(songs[(index+1)%songs.length]);
});
document.getElementById('prev').addEventListener('click',()=>{
  const index=songs.findIndex(s=>s.classList.contains('selected'));
  choose(songs[(index-1+songs.length)%songs.length]);
});

const parallaxItems=document.querySelectorAll('.opening-word,.manifesto-word,.big-type h2');
lenis.on('scroll',({scroll})=>{
  parallaxItems.forEach((el,i)=>{
    const rect=el.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<innerHeight){
      const shift=(innerHeight/2-(rect.top+rect.height/2))*(i%2?-.035:.025);
      el.style.transform=`translate3d(${shift}px,0,0)`;
    }
  });
});