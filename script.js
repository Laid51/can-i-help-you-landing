document.addEventListener("DOMContentLoaded", () => {

    /* =======================
       REDIRECT NOTIFICATION (404)
       ======================= */
    const NOTIFICATION_DURATION = 5000; // Duration in ms (matches CSS animation)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('redirect') === '404') {
        // Create and show the notification
        const notification = document.createElement('div');
        notification.className = 'redirect-notification';
        notification.textContent = 'Vous vous êtes perdu ? On vous a ramené au bon endroit !';
        document.body.prepend(notification);
        
        // Clean the URL without reloading
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Remove notification after animation completes
        setTimeout(() => {
            notification.remove();
        }, NOTIFICATION_DURATION + 100);
    }

    /* =======================
       NAVBAR STICKY ON SCROLL
       ======================= */
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });


    /* =======================
       MOBILE MENU
       ======================= */
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Fermer menu en cliquant sur un lien
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });


    /* =======================
       SCROLL REVEAL
       ======================= */
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach(el => revealObserver.observe(el));


    /* =======================
       CAROUSEL (Host Cities)
       ======================= */
    const track = document.querySelector(".carousel-track");
    
    // Only run carousel code if the element exists (main page only)
    if (track) {
        const slides = Array.from(track.children);
        const prevBtn = document.querySelector(".carousel-btn.prev");
        const nextBtn = document.querySelector(".carousel-btn.next");

        let currentIndex = 0;

        function updateCarousel(newIndex) {
            slides.forEach((slide, i) => {
                slide.classList.toggle("active", i === newIndex);
            });
            currentIndex = newIndex;
        }

        // Buttons navigation
        nextBtn.addEventListener("click", () => {
            const newIndex = (currentIndex + 1) % slides.length;
            updateCarousel(newIndex);
        });

        prevBtn.addEventListener("click", () => {
            const newIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(newIndex);
        });

        // Auto-slide every 5s
        setInterval(() => {
            const newIndex = (currentIndex + 1) % slides.length;
            updateCarousel(newIndex);
        }, 5000);
    }


    /* =======================
       OPTIONAL: Smooth Scroll
       ======================= */
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));

            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });
    });
});
