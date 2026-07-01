const filterButtons = document.querySelectorAll(".filter-pill");
const packageCards = document.querySelectorAll(".package-card");
const emptyState = document.getElementById("package-empty");

function applyFilter(filter) {
  let visibleCount = 0;

  packageCards.forEach((card) => {
    const filters = (card.dataset.filters || "").split(" ");
    const visible = filter === "all" || filters.includes(filter);
    card.hidden = !visible;
    if (visible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    applyFilter(button.dataset.filter || "all");
  });
});

applyFilter("all");

const packageCollapse = document.getElementById("package-collapse");
const togglePackages = document.getElementById("toggle-packages");

if (packageCollapse && togglePackages) {
  const label = togglePackages.querySelector(".toggle-packages-label");

  togglePackages.addEventListener("click", () => {
    const collapsed = packageCollapse.classList.toggle("is-collapsed");
    togglePackages.setAttribute("aria-expanded", String(!collapsed));
    if (label) {
      label.textContent = collapsed ? "Hiển thị thêm gói khám" : "Thu gọn";
    }
    togglePackages.classList.toggle("is-expanded", !collapsed);
  });
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const status = contactForm.querySelector(".form-status");
  const submitBtn = contactForm.querySelector("button[type=submit]");

  const GFORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSdeG-7g1HpRmGxjY02vYswf0nGyIgojWTtMO1mE3NOs7LFx1g/formResponse";
  const FIELD = {
    name: "entry.677788018",
    phone: "entry.969076694",
    time: "entry.759107430",
    note: "entry.1428776423",
  };

  // Datetime is gray by default (CSS); darken only once a value is chosen
  const timeInput = contactForm.elements.time;
  if (timeInput) {
    const syncTimeFilled = () =>
      timeInput.classList.toggle("has-value", !!timeInput.value);
    syncTimeFilled();
    timeInput.addEventListener("input", syncTimeFilled);
    timeInput.addEventListener("change", syncTimeFilled);
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    // Honeypot: real users never see/fill this field. If filled -> bot -> drop.
    const honeypot = contactForm.elements.company;
    if (honeypot && honeypot.value.trim() !== "") {
      if (status) {
        status.hidden = false;
        status.textContent =
          "Cảm ơn bạn! Chúng tôi đã nhận thông tin và sẽ liên hệ trong thời gian sớm nhất.";
      }
      contactForm.reset();
      return;
    }

    const name = contactForm.elements.name.value.trim();
    const data = new FormData();
    data.append(FIELD.name, name);
    data.append(FIELD.phone, contactForm.elements.phone.value.trim());
    data.append(FIELD.note, contactForm.elements.note.value.trim());

    // datetime-local -> Google Form date question with time + year
    const time = contactForm.elements.time.value; // e.g. 2026-07-01T14:30
    if (time) {
      const [datePart, timePart = ""] = time.split("T");
      const [year, month, day] = datePart.split("-");
      const [hour, minute] = timePart.split(":");
      data.append(FIELD.time + "_year", year);
      data.append(FIELD.time + "_month", String(Number(month)));
      data.append(FIELD.time + "_day", String(Number(day)));
      if (hour) data.append(FIELD.time + "_hour", String(Number(hour)));
      if (minute) data.append(FIELD.time + "_minute", String(Number(minute)));
    }

    if (submitBtn) submitBtn.disabled = true;

    fetch(GFORM_ACTION, { method: "POST", mode: "no-cors", body: data }).finally(
      () => {
        if (status) {
          status.hidden = false;
          status.textContent =
            "Cảm ơn " +
            (name || "bạn") +
            "! Chúng tôi đã nhận thông tin và sẽ liên hệ trong thời gian sớm nhất.";
        }
        contactForm.reset();
        if (submitBtn) submitBtn.disabled = false;
      }
    );
  });
}

// ===== Scroll reveal =====
(function initReveal() {
  const selector =
    ".section-head, .package-card, .feature-card, .facility-card, .stage-card, .hero-strip article, .insurance-logo, .insurance-intro, .doctor-spotlight, .contact-visual, .contact-form-card, .story-media, .story-copy, .quick-card, .rating-badge, .age-lead";
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
})();
