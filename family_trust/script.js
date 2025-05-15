/* === Kallarackal Family Trust - script.js === */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Hero Image Slider ---
    const slides = document.querySelectorAll('.hero-slider .slide');
    let currentSlide = 0;
    const slideIntervalTime = 3000; // Interval time in milliseconds (3 seconds)
    let slideInterval;

    function showSlide(index) {
        // Ensure slides exist before proceeding
        if (!slides || slides.length === 0) return;
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function nextSlide() {
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide + 1) % slides.length; 
        showSlide(currentSlide);
    }

    function startSlider() {
        stopSlider(); // Clear any existing interval before starting a new one
        if (slides.length > 0) {
            showSlide(currentSlide); 
            slideInterval = setInterval(nextSlide, slideIntervalTime);
        }
    }

    function stopSlider() {
        clearInterval(slideInterval);
    }

    // Start the slider initially
    startSlider();

    // Optional: Pause slider on hover (good UX)
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopSlider);
        heroSlider.addEventListener('mouseleave', startSlider);
    }

    // --- 2. Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Function to apply the theme (dark or light)
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'true');
        } else {
            body.classList.remove('dark-mode');
             if (darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'false');
        }
    };

    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    // Check for user's Operating System preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine the initial theme to apply
    let currentTheme = 'light'; // Default to light mode
    if (savedTheme) {
        // Use saved theme if it exists
        currentTheme = savedTheme;
    } else if (prefersDark) {
        // Otherwise, use OS preference if available
        currentTheme = 'dark';
    }

    // Apply the determined initial theme
    applyTheme(currentTheme);

    // Add event listener for the toggle button
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            // Toggle theme based on current state
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
                localStorage.setItem('theme', 'light'); 
            } else {
                applyTheme('dark');
                localStorage.setItem('theme', 'dark'); 
            }
        });
    }

    // Listen for changes in OS theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Only apply OS preference if the user hasn't manually set a theme
        if (!localStorage.getItem('theme')) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });

    // --- 3. Mobile Navigation Toggle ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileNavToggle && navLinks) {
        mobileNavToggle.addEventListener('click', () => {
            // Toggle the 'active' class to show/hide the menu
            const isActive = navLinks.classList.toggle('active');
            // Update aria-expanded attribute for accessibility
            mobileNavToggle.setAttribute('aria-expanded', isActive);
            // Change button icon based on state (Hamburger or Close)
            if (isActive) {
                mobileNavToggle.innerHTML = '×'; // Close icon (HTML entity)
            } else {
                mobileNavToggle.innerHTML = '☰'; // Hamburger icon (HTML entity)
            }
        });

        // Close mobile menu when a navigation link (for the same page) is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', () => {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        mobileNavToggle.setAttribute('aria-expanded', 'false');
                        mobileNavToggle.innerHTML = '☰'; // Reset to Hamburger icon
                    }
                });
            }
        });

        // Optional: Close mobile menu if user clicks outside of it
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = mobileNavToggle.contains(event.target);

            // If the click is outside the nav and toggle, and the nav is active, close it
            if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                mobileNavToggle.innerHTML = '☰';
            }
        });
    }


    // --- 4. Footer Current Year ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- 5. Intersection Observer for Scroll Animations (Repeating Version) ---

    // Select all elements intended for reveal animations
    const revealElements = document.querySelectorAll(
        '.reveal-bottom-initial, .reveal-left-initial, .reveal-right-initial, .reveal-scale-initial, .reveal-fade-initial'
    );

    // Select sections containing grids/items that need staggering animation
    const staggeredSections = document.querySelectorAll('#highlights, #officials, #gallery'); // Sections where children need delays

    const observerOptions = {
        root: null, // Use the viewport as the root
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element fully enters viewport bottom
    };

    const observerCallback = (entries, observer) => {
        entries.forEach((entry) => {

            if (entry.isIntersecting) {
                // Element is entering the viewport - make it visible
                entry.target.classList.add('is-visible');

                // Apply staggered delay logic only if the *section* container is intersecting
                if (entry.target.matches('#highlights, #officials, #gallery')) {
                    let itemsToStagger = [];
                    const gridContainer = entry.target; // The section itself

                    // Identify the items within the specific section that need staggering
                    if (gridContainer.matches('#highlights')) {
                        itemsToStagger = gridContainer.querySelectorAll('.highlight-item');
                    } else if (gridContainer.matches('#officials')) {
                        itemsToStagger = gridContainer.querySelectorAll('.official-card');
                    } else if (gridContainer.matches('#gallery')) {
                        // For the gallery, we stagger the appearance of the rows
                        itemsToStagger = gridContainer.querySelectorAll('.gallery-scroll-row');
                    }

                    // Apply the delay to each item
                    itemsToStagger.forEach((item, index) => {
                        item.style.transitionDelay = `${index * 0.1}s`; // 100ms increment
                        // Ensure the item itself becomes visible (needed if it doesn't have its own reveal class)
                        if (!item.classList.contains('is-visible')) {
                           item.classList.add('is-visible');
                        }
                    });
                }

                 // We DO NOT unobserve, allowing animations to repeat

            } else {
                // Element is leaving the viewport - reset for next time
                entry.target.classList.remove('is-visible');

                // Reset stagger delays if the element is a section container
                 if (entry.target.matches('#highlights, #officials, #gallery')) {
                    let itemsToReset = [];
                    const gridContainer = entry.target;
                     if (gridContainer.matches('#highlights')) itemsToReset = gridContainer.querySelectorAll('.highlight-item');
                     else if (gridContainer.matches('#officials')) itemsToReset = gridContainer.querySelectorAll('.official-card');
                     else if (gridContainer.matches('#gallery')) itemsToReset = gridContainer.querySelectorAll('.gallery-scroll-row');

                     itemsToReset.forEach(item => {
                         item.style.transitionDelay = ''; // Remove the inline delay style
                         // Optionally remove is-visible from items too, if they might stay in view longer
                         // item.classList.remove('is-visible');
                     });
                 }
            }
        });
    };

    // Create the Intersection Observer
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all elements with the initial reveal classes
    revealElements.forEach(el => scrollObserver.observe(el));

    // Also observe the sections that require staggering logic for their children
    staggeredSections.forEach(section => scrollObserver.observe(section));


    // --- 6. Infinite Scrolling Gallery Setup ---
    const galleryRows = document.querySelectorAll('.gallery-scroll-row .gallery-row-inner');

    galleryRows.forEach(rowInner => {
        // Check if content exists before cloning
        if (rowInner.innerHTML.trim().length > 0) {
            const originalContent = rowInner.innerHTML;
            // Append a copy of the content to create the seamless loop effect
            rowInner.innerHTML += originalContent;
        }
    });

}); // End DOMContentLoaded