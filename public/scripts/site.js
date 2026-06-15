const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

mobileMenuBtn?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
  const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;

  if (!anchor) {
    return;
  }

  const hash = anchor.getAttribute("href");

  if (!hash || hash === "#") {
    return;
  }

  const target = document.querySelector(hash);

  if (!target) {
    return;
  }

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
});
