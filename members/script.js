document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const directoryContainer = document.getElementById('directory-body');
    const searchInput = document.getElementById('search-input');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalFamilyId = document.getElementById('modal-family-id');
    const modalMemberList = document.getElementById('modal-member-list');
    const memberDetailContent = document.getElementById('member-detail-content');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    
    // --- Global State ---
    let allFamilies = {};
    let currentFamilyMembers = [];

    // --- =================== THEME LOGIC =================== ---
    const lightIcon = '☀️';
    const darkIcon = '🌙';

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeToggleButton.textContent = darkIcon;
        } else {
            document.body.classList.remove('light-mode');
            themeToggleButton.textContent = lightIcon;
        }
    }

    function toggleTheme() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    }

    // Set initial theme on page load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
    
    themeToggleButton.addEventListener('click', toggleTheme);
    // --- ==================================================== ---

    // --- Main Data Fetching ---
    Papa.parse('data/family_data.csv', {
        download: true, header: true, skipEmptyLines: true,
        complete: (results) => {
            allFamilies = processData(results.data);
            renderDirectory(allFamilies);
        },
        error: (err) => { console.error("Error parsing CSV:", err); directoryContainer.innerHTML = `<p class="loading-message">Error loading directory.</p>`; }
    });

    function processData(data) {
        const families = data.reduce((acc, member) => {
            if (!acc[member.FamilyID]) acc[member.FamilyID] = [];
            acc[member.FamilyID].push(member);
            return acc;
        }, {});
        for (const familyId in families) {
            families[familyId].sort((a, b) => new Date(a.DateOfBirth) - new Date(b.DateOfBirth));
        }
        return families;
    }

    function renderDirectory(familiesToRender) {
        directoryContainer.innerHTML = '';
        if (Object.keys(familiesToRender).length === 0) {
            directoryContainer.innerHTML = '<p class="loading-message">No matching families found.</p>'; return;
        }
        for (const familyId in familiesToRender) {
            const members = familiesToRender[familyId];
            const primaryMemberName = members[0].MemberName;
            directoryContainer.insertAdjacentHTML('beforeend', `
                <div class="family-block" data-family-id="${familyId}">
                    <div class="family-row">
                        <div class="col-id">${familyId}</div>
                        <div class="col-primary-member">${primaryMemberName}</div>
                        <div class="col-summary">${members.length} Members</div>
                    </div>
                </div>
            `);
        }
        addModalTriggers();
    }

    function addModalTriggers() {
        directoryContainer.querySelectorAll('.family-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const familyId = e.currentTarget.parentElement.dataset.familyId;
                showModalForFamily(familyId);
            });
        });
    }

    function showModalForFamily(familyId) {
        currentFamilyMembers = allFamilies[familyId];
        if (!currentFamilyMembers) return;
        modalFamilyId.textContent = `Family ID: ${familyId}`;
        modalMemberList.innerHTML = currentFamilyMembers.map((member, index) => `<li><button data-member-index="${index}">${member.MemberName}</button></li>`).join('');
        modalMemberList.querySelectorAll('button').forEach(button => button.addEventListener('click', handleMemberSelection));
        if (modalMemberList.querySelector('button')) {
            modalMemberList.querySelector('button').click();
        }
        document.body.classList.add('modal-open');
        modalOverlay.classList.add('active');
    }

    function handleMemberSelection(e) {
        modalMemberList.querySelector('button.active')?.classList.remove('active');
        e.currentTarget.classList.add('active');
        const memberIndex = e.currentTarget.dataset.memberIndex;
        const selectedMember = currentFamilyMembers[memberIndex];
        displayMemberDetails(selectedMember);
    }

    function displayMemberDetails(member) {
        memberDetailContent.innerHTML = `
            <div class="detail-header">
                <img src="${member.ProfileImageURL || 'images/default_avatar.png'}" class="profile-image" alt="${member.MemberName}">
                <div class="text-info">
                    <h3>${member.MemberName}</h3>
                    <p>${member.CurrentStatus || 'Status Not Available'}</p>
                </div>
            </div>
            <div class="detail-body">
                <div class="detail-section"><h4>Date of Birth</h4><p>${formatDate(member.DateOfBirth)}</p></div>
                <div class="detail-section"><h4>Email Address</h4><p>${member.Email ? `<a href="mailto:${member.Email}">${member.Email}</a>` : 'Not Available'}</p></div>
                <div class="detail-section" style="grid-column: 1 / -1;"><h4>Biography</h4><p>${member.Bio || 'No biography provided.'}</p></div>
            </div>
        `;
    }

    function closeModal() {
        document.body.classList.remove('modal-open');
        modalOverlay.classList.remove('active');
        modalMemberList.innerHTML = '';
        memberDetailContent.innerHTML = '<div class="placeholder">Select a member from the list to view their details.</div>';
    }

    modalCloseBtn.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal(); });
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        directoryContainer.querySelectorAll('.family-block').forEach(block => {
            const familyId = block.dataset.familyId;
            const isMatch = allFamilies[familyId].some(m => m.MemberName.toLowerCase().includes(searchTerm));
            block.classList.toggle('hidden', !isMatch);
        });
    });

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});