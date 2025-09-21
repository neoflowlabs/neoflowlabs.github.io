// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
hamburger && hamburger.addEventListener('click', ()=>{
  mobileMenu.classList.toggle('open');
});
mobileMenu && mobileMenu.addEventListener('click', (e)=>{
  if(e.target.tagName==='A') mobileMenu.classList.remove('open');
});

// Reveal on scroll
const reveal = (el)=>{
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.classList.add('revealed');
        io.unobserve(ent.target);
      }
    });
  }, {threshold:.2});
  el.forEach(n=>io.observe(n));
}
reveal(document.querySelectorAll('.fade-in'));
reveal(document.querySelectorAll('.slide-up'));

// Contact form AJAX with success/error status
(function(){
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        status.textContent = "✅ Thanks, your message has been sent!";
        status.classList.remove("error");
        status.style.display = "block";
        form.reset();
      } else {
        status.textContent = "❌ Oops! Something went wrong.";
        status.classList.add("error");
        status.style.display = "block";
      }
    } catch (err) {
      status.textContent = "❌ Could not send message. Please try again later.";
      status.classList.add("error");
      status.style.display = "block";
    }
  });
})();
