document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  initNavbar();
  initTyping();
  initReveal();
  initParallax();
  initSliders();
  initFaq();
  initForms();
  initSmoothScroll();
  initYear();
});

window.addEventListener("load", () => {
  const loader = document.querySelector(".loading-screen");
  document.body.classList.remove("is-loading");

  if (loader) {
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 560);
  }
});

async function loadNavbar() {
  const targets = document.querySelectorAll("[data-navbar]");

  if (!targets.length) {
    return;
  }

  try {
    const response = await fetch(new URL("navbar.html", document.baseURI), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Gagal memuat navbar.");
    }
    const markup = await response.text();

    targets.forEach((target) => {
      target.innerHTML = markup;
    });
  } catch (error) {
    console.error("Gagal memuat navbar.html:", error);
  }
}

function initNavbar() {
  const navRoot = document.querySelector("[data-nav-root]");

  if (!navRoot) {
    return;
  }

  const navToggle = navRoot.querySelector(".nav-toggle");
  const navMenu = navRoot.querySelector(".nav-menu");
  const currentIndicator = navRoot.querySelector("[data-nav-current]");
  const currentPath = normalizePagePath(window.location.pathname);
  let activeLabel = "Beranda";
  let hasActiveNavLink = false;

  // Set active link berdasarkan route folder yang sedang dibuka
  navRoot.querySelectorAll("[data-nav-link]").forEach((link) => {
    const target = link.getAttribute("href");

    if (!target) {
      return;
    }

    const targetPath = normalizePagePath(new URL(target, document.baseURI).pathname);

    if (targetPath === currentPath) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
      activeLabel = link.textContent?.trim() || activeLabel;
      hasActiveNavLink = true;
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });

  if (!hasActiveNavLink && currentPath === "/") {
    activeLabel = "Beranda";
  }

  if (currentIndicator) {
    currentIndicator.textContent = activeLabel;
  }

  // Toggle mobile menu
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.classList.toggle("is-open");
      navMenu.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));

      // Prevent body scroll when menu is open
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });
  }

  // Close mobile menu when link is clicked
  navRoot.querySelectorAll(".nav-links a, .nav-cta").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1024 && navToggle && navMenu) {
        navToggle.classList.remove("is-open");
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  });

  // Handle resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024 && navToggle && navMenu) {
      navToggle.classList.remove("is-open");
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

function initTyping() {
  const typingElement = document.querySelector("[data-typing]");

  if (!typingElement) {
    return;
  }

  const entries = typingElement.dataset.typing.split("||").map((item) => item.trim()).filter(Boolean);
  if (!entries.length) {
    return;
  }

  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;

  if (shouldReduceMotion || isMobileViewport) {
    typingElement.textContent = entries[0];
    return;
  }

  const shouldLoop = entries.length > 1;

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const tick = () => {
    const currentText = entries[textIndex];

    if (isDeleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }

    typingElement.textContent = currentText.slice(0, Math.max(0, charIndex));

    let delay = isDeleting ? 34 : 64;

    if (!isDeleting && charIndex === currentText.length) {
      if (!shouldLoop) {
        return;
      }
      delay = 1700;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % entries.length;
      delay = 420;
    }

    window.setTimeout(tick, delay);
  };

  tick();
}

function initReveal() {
  const elements = document.querySelectorAll(".scroll-reveal");

  if (!elements.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
  });

  elements.forEach((element) => observer.observe(element));
}

function initParallax() {
  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (shouldReduceMotion || window.innerWidth <= 980) {
    return;
  }

  const elements = document.querySelectorAll("[data-parallax]");

  if (!elements.length) {
    return;
  }

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    elements.forEach((element) => {
      const depth = Number(element.dataset.parallax || 0.08);
      element.style.setProperty("--parallax-offset", `${scrollY * depth}px`);
    });
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  update();
  window.addEventListener("scroll", requestTick, { passive: true });
}

function initSliders() {
  const sliders = document.querySelectorAll("[data-slider]");

  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll(".testimonial-slide"));
    const dotsWrap = slider.querySelector(".slider-dots");
    const prevButton = slider.querySelector('[data-direction="prev"]');
    const nextButton = slider.querySelector('[data-direction="next"]');

    if (slides.length < 2) {
      return;
    }

    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (activeIndex < 0) {
      activeIndex = 0;
      slides[0].classList.add("is-active");
    }

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Pindah ke testimoni ${index + 1}`);
      dotsWrap?.appendChild(dot);
      dot.addEventListener("click", () => {
        setActive(index);
        restartAuto();
      });
      return dot;
    });

    const setActive = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    };

    const next = () => setActive(activeIndex + 1);
    const prev = () => setActive(activeIndex - 1);

    prevButton?.addEventListener("click", () => {
      prev();
      restartAuto();
    });

    nextButton?.addEventListener("click", () => {
      next();
      restartAuto();
    });

    let intervalId = window.setInterval(next, 5200);
    const restartAuto = () => {
      window.clearInterval(intervalId);
      intervalId = window.setInterval(next, 5200);
    };

    slider.addEventListener("mouseenter", () => window.clearInterval(intervalId));
    slider.addEventListener("mouseleave", restartAuto);

    setActive(activeIndex);
  });
}

function initFaq() {
  document.querySelectorAll(".faq-accordion").forEach((accordion) => {
    const items = accordion.querySelectorAll(".faq-item");

    items.forEach((item, index) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      if (!question || !answer) {
        return;
      }

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        items.forEach((otherItem) => {
          otherItem.classList.remove("is-open");
          const otherAnswer = otherItem.querySelector(".faq-answer");
          if (otherAnswer) {
            otherAnswer.style.maxHeight = "0px";
          }
        });

        if (!isOpen) {
          item.classList.add("is-open");
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      });

      if (index === 0 && item.dataset.open === "true") {
        item.classList.add("is-open");
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

function initForms() {
  document.querySelectorAll(".contact-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector(".button");

      if (!button) {
        return;
      }

      // Ambil nilai dari input form
      const nama = form.querySelector("#nama")?.value.trim() || "-";
      const whatsapp = form.querySelector("#whatsapp")?.value.trim() || "-";
      const asal = form.querySelector("#asal")?.value.trim() || "-";
      const minat = form.querySelector("#minat")?.value.trim() || "-";
      const pesan = form.querySelector("#pesan")?.value.trim() || "-";

      // Format kalimat untuk WhatsApp
      const waText = `Halo tim Maulana Center,\nSaya ingin mengirim permintaan konsultasi dengan detail berikut:\n\n*Nama:* ${nama}\n*WhatsApp:* ${whatsapp}\n*Asal Kota / Pesantren:* ${asal}\n*Minat Layanan:* ${minat}\n\n*Kebutuhan / Pesan:* \n${pesan}`;
      const waUrl = `https://wa.me/6281522775390?text=${encodeURIComponent(waText)}`;

      const originalText = button.textContent;
      button.textContent = "Mengalihkan ke WhatsApp...";
      button.setAttribute("disabled", "true");

      window.setTimeout(() => {
        window.open(waUrl, "_blank");
        button.textContent = originalText;
        button.removeAttribute("disabled");
        // Opsional: form.reset(); jika ingin mengosongkan setelah terkirim
      }, 700);
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

function normalizePagePath(pathname) {
  let normalized = pathname.replace(/\/index\.html$/i, "/");
  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/$/, "");
  }

  return normalized || "/";
}

document.addEventListener('DOMContentLoaded', () => {
  // Ambil semua elemen yang diperlukan
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  const modals = document.querySelectorAll('.modal-overlay');
  const closeBtns = document.querySelectorAll('.modal-close');

  // Fungsi untuk Buka Popup
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault(); // Mencegah reload/scroll ke atas
      const targetId = trigger.getAttribute('data-target');
      const targetModal = document.getElementById(targetId);

      if (targetModal) {
        targetModal.classList.add('is-open');
        document.body.classList.add('modal-open'); // Mengunci scroll body
      }
    });
  });

  // Fungsi untuk Tutup Popup menggunakan tombol "X"
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open'); // Membuka kunci scroll body
    });
  });

  // Fungsi tambahan: Tutup popup jika user klik area blur (di luar kotak konten)
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
      }
    });
  });
});

// Tambahkan fungsi ini ke dalam script.js
function initPendaftaranModal() {
  const formReg = document.getElementById('pendaftaran-wa');

  if (formReg) {
    formReg.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = document.getElementById('reg-nama').value;
      const wa = document.getElementById('reg-wa').value;
      const domisili = document.getElementById('reg-domisili').value;
      const umur = document.getElementById('reg-umur').value;
      const sekolah = document.getElementById('reg-sekolah').value;
      const paket = document.getElementById('reg-paket').value;

      const nomorWA = "6285161808524"; // Nomor yang Anda minta

      const pesan = `Halo Maulana Center, saya ingin mendaftar dengan data berikut:%0A%0A` +
        `*Nama:* ${nama}%0A` +
        `*Nomor WhatsApp:* ${wa}%0A` +
        `*Domisili:* ${domisili}%0A` +
        `*Umur:* ${umur} Tahun%0A` +
        `*Sekolah:* ${sekolah}%0A` +
        `*Pilihan Paket:* ${paket}`;

      const url = `https://wa.me/${nomorWA}?text=${pesan}`;
      window.open(url, '_blank');
    });
  }
}

// Pastikan fungsi ini dipanggil saat DOM dimuat
document.addEventListener("DOMContentLoaded", () => {
  initPendaftaranModal();
});