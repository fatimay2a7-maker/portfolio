const glow = document.querySelector(".cursor-glow");
if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", e => {
    glow.style.left = `${e.clientX - 180}px`;
    glow.style.top = `${e.clientY - 180}px`;
  });
}
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.querySelectorAll(".skill-card,.project-empty,.about-card").forEach(card => {
  card.addEventListener("pointermove", e => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateY(-4px)`;
  });
  card.addEventListener("pointerleave", () => card.style.transform = "");
});
document.querySelectorAll(".magnetic").forEach(el => {
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px, ${(e.clientY-r.top-r.height/2)*.12}px)`;
  });
  el.addEventListener("pointerleave", () => el.style.transform = "");
});
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
}));
document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("contact-form");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type=submit]");
  const data = Object.fromEntries(new FormData(form).entries());
  button.disabled = true; button.textContent = "Sending...";
  status.textContent = "";
  try {
    const response = await fetch("/api/contact", {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)
    });
    const result = await response.json();
    status.textContent = result.message || (result.ok ? "Message sent." : "Could not send message.");
    if (result.ok) form.reset();
  } catch {
    status.textContent = "ارتباط با سرور برقرار نشد. مطمئن شو سایت از طریق Node.js اجرا شده است.";
  } finally {
    button.disabled = false; button.textContent = "Send Message ↗";
  }
});