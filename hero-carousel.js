(()=>{
  const frame=document.querySelector('.hero-image-frame');
  if(!frame)return;
  const slides=[...frame.querySelectorAll('.hero-slide')],dots=[...document.querySelectorAll('.carousel-dot')],counter=document.querySelector('#slideCounter');
  let index=Math.max(0,slides.findIndex(slide=>slide.classList.contains('is-active'))),timer=null,cleanupTimer=null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(target,direction=1){
    const next=(target+slides.length)%slides.length;
    if(next===index)return;
    clearTimeout(cleanupTimer);
    const outgoing=slides[index],incoming=slides[next];
    slides.forEach(slide=>slide.classList.remove('is-exiting-left','is-exiting-right','is-entering-left','is-entering-right'));
    outgoing.classList.remove('is-active');
    outgoing.classList.add(direction>0?'is-exiting-right':'is-exiting-left');
    incoming.classList.add(direction>0?'is-entering-left':'is-entering-right');
    void incoming.offsetWidth;
    requestAnimationFrame(()=>{incoming.classList.remove('is-entering-right','is-entering-left');incoming.classList.add('is-active')});
    index=next;
    dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
    if(counter)counter.textContent=`0${index+1} — 0${slides.length}`;
    cleanupTimer=setTimeout(()=>{slides.forEach((slide,i)=>{if(i!==index)slide.classList.remove('is-exiting-left','is-exiting-right','is-active')})},1100);
  }
  function play(){if(!reduced){clearInterval(timer);timer=setInterval(()=>show(index+1,1),5200)}}
  document.querySelectorAll('[data-carousel]').forEach(button=>button.addEventListener('click',()=>{const direction=button.dataset.carousel==='next'?1:-1;show(index+direction,direction);play()}));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>{const direction=i>=index?1:-1;show(i,direction);play()}));
  frame.addEventListener('mouseenter',()=>clearInterval(timer));frame.addEventListener('mouseleave',play);frame.addEventListener('focusin',()=>clearInterval(timer));frame.addEventListener('focusout',play);
  play();
})();
