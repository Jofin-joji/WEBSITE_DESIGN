document.addEventListener('DOMContentLoaded', () => {

    // --- 1. THEME TOGGLE (DARK/LIGHT MODE) ---
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.className = `${savedTheme}-mode`;

    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-mode');
            const newTheme = isDarkMode ? 'light' : 'dark';
            body.className = `${newTheme}-mode`;
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // --- 2. GALLERY & MASONRY SETUP ---
    const masonryContainer = document.getElementById('masonry-container');
    const emptyMessage = document.getElementById('empty-gallery-message');
    let macyInstance = null;

    function initializeMasonry() {
        if (macyInstance) macyInstance.remove();
        if (masonryContainer && masonryContainer.children.length > 1) {
             macyInstance = Macy({
                container: '#masonry-container',
                trueOrder: false,
                waitForImages: true,
                columns: 1,
                margin: { x: 24, y: 24 },
                breakAt: { 1200: 4, 940: 3, 520: 2 }
            });
        }
    }

    // --- 3. SCROLL REVEAL & IMAGE CREATION ---
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function createImageElement(imageData) {
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';
        figure.setAttribute('data-scroll-reveal', '');
        figure.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.caption}" loading="lazy">
            <figcaption class="gallery-caption"><h3>${imageData.caption}</h3></figcaption>
        `;
        revealObserver.observe(figure);
        return figure;
    }

    function loadGalleryFromStorage() {
        const localImages = JSON.parse(localStorage.getItem('userAddedImages') || '[]');
        
        if (emptyMessage) {
            emptyMessage.style.display = localImages.length === 0 ? 'block' : 'none';
        }
        
        if (masonryContainer) {
            localImages.forEach(imgData => {
                const el = createImageElement(imgData);
                masonryContainer.appendChild(el);
            });
        }
        
        initializeMasonry();
    }
    
    loadGalleryFromStorage();

    // --- 4. ADMIN & UPLOAD FUNCTIONALITY (ROBUST VERSION) ---
    const adminIcon = document.getElementById('admin-icon');
    const passwordModal = document.getElementById('password-modal');
    const uploadModal = document.getElementById('upload-modal');
    const passwordForm = document.getElementById('password-form');
    const uploadForm = document.getElementById('upload-form');
    const passwordInput = document.getElementById('admin-password');
    const passwordError = document.getElementById('password-error');
    const uploadStatus = document.getElementById('upload-status');

    const ADMIN_PASSWORD = 'gold123'; // Your secret password

    if (adminIcon) {
        adminIcon.addEventListener('click', () => {
            if (passwordModal) {
                passwordModal.classList.add('visible');
                if(passwordInput) passwordInput.focus();
            }
        });
    }

    [passwordModal, uploadModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('visible');
                }
            });
        }
    });

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (passwordError) passwordError.textContent = '';

            if (passwordInput && passwordInput.value === ADMIN_PASSWORD) {
                if (passwordModal) passwordModal.classList.remove('visible');
                if (uploadModal) uploadModal.classList.add('visible');
            } else {
                if (passwordError) passwordError.textContent = 'Incorrect password.';
            }
            passwordForm.reset();
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('gallery-image');
            const captionInput = document.getElementById('image-caption');
            const file = fileInput.files[0];

            if (!file) {
                if(uploadStatus) uploadStatus.textContent = 'Please select a file to upload.';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const newImageData = { src: event.target.result, caption: captionInput.value || 'Untitled' };

                const localImages = JSON.parse(localStorage.getItem('userAddedImages') || '[]');
                localImages.push(newImageData);
                localStorage.setItem('userAddedImages', JSON.stringify(localImages));

                if (emptyMessage) emptyMessage.style.display = 'none';

                const el = createImageElement(newImageData);
                if (masonryContainer) masonryContainer.appendChild(el);
                
                if (macyInstance) {
                    macyInstance.recalculate(true);
                } else {
                    initializeMasonry();
                }

                if(uploadStatus) {
                    uploadStatus.textContent = 'Upload successful!';
                    uploadStatus.style.color = 'green';
                }
                setTimeout(() => {
                    if (uploadModal) uploadModal.classList.remove('visible');
                    if(uploadStatus) uploadStatus.textContent = '';
                }, 1500);
            };
            
            reader.onerror = () => { if(uploadStatus) { uploadStatus.textContent = 'Error reading file.'; uploadStatus.style.color = '#e74c3c'; } };
            
            reader.readAsDataURL(file);
            uploadForm.reset();
        });
    }
});