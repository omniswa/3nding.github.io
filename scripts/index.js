// --- DOM Elements ---
const blogGrid = document.getElementById('blogGrid');
const searchInput = document.getElementById('searchInput');
const topicFilter = document.getElementById('topicFilter');
const yearFilter = document.getElementById('yearFilter');
const paginationContainer = document.getElementById('pagination');
document.getElementById("year").innerHTML = new Date().getFullYear();
const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
const dateIcon = `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;

// --- Global State ---
let currentPage = 1;
const itemsPerPage = 6;
let filteredDataGlobal = [];
let currentBlogs = [];

// --- Dynamic Data Loader ---
async function loadBlogData(year) {
  blogGrid.classList.add('loading');

  try {
    const module = await import(`../data/${year}.js`);
    currentBlogs = module.default;
    handleFilters();
  } catch (error) {
    console.error("Error loading blog data:", error);
    blogGrid.classList.remove('loading');
    blogGrid.innerHTML = `
        <div class="no-results">
          <h3>Failed to load data</h3>
          <p style="margin-top: 8px;">Content for ${year} might not be published yet.</p>
        </div>`;
  }
}

// --- Render Function ---
function renderBlogs(data) {
  blogGrid.classList.remove('loading');
  blogGrid.innerHTML = '';

  if (data.length === 0) {
    blogGrid.innerHTML = `
          <div class="no-results">
            <h3>No articles found</h3>
            <p style="margin-top: 8px;">Try adjusting your search or filters.</p>
          </div>
        `;
    return;
  }

  data.forEach(blog => {
    const card = document.createElement('a');
    card.href = blog.link;
    card.className = 'card';

    card.innerHTML = `
          <div class="card-header">
            <span class="category-tag">${blog.category}</span>
          </div>
          
          <h2 class="card-title">${blog.title}</h2>
          
          <p class="card-excerpt">${blog.excerpt}</p>

          <div class="card-footer">
            <span class="published-tag">${dateIcon} ${blog.published}</span>
            <span class="view-btn">Read ${arrowIcon}</span>
          </div>
        `;
    blogGrid.appendChild(card);
  });
}

// --- Filter Logic ---
function handleFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedTopic = topicFilter.value.toLowerCase();

  const filtered = currentBlogs.filter(blog => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm) ||
      blog.excerpt.toLowerCase().includes(searchTerm) ||
      blog.category.toLowerCase().includes(searchTerm);

    const matchesTopic = selectedTopic === 'all' || blog.category.toLowerCase().includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  filteredDataGlobal = filtered.reverse();
  currentPage = 1;
  updateDisplay();
}

function updateDisplay() {
  const totalPages = Math.ceil(filteredDataGlobal.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredDataGlobal.slice(startIndex, startIndex + itemsPerPage);

  renderBlogs(paginatedData);
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPageNum');
  const totalPageSpan = document.getElementById('totalPageNum');

  currentPageSpan.textContent = currentPage;
  totalPageSpan.textContent = totalPages;

  if (totalPages <= 1) {
    paginationContainer.classList.add('hidden');
    return;
  }

  paginationContainer.classList.remove('hidden');
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  prevBtn.onclick = () => {
    currentPage--;
    updateDisplay();
    window.scrollTo({ top: 0 });
  };

  nextBtn.onclick = () => {
    currentPage++;
    updateDisplay();
    window.scrollTo({ top: 0 });
  };
}

// --- Event Listeners ---
searchInput.addEventListener('input', handleFilters);
topicFilter.addEventListener('change', handleFilters);
yearFilter.addEventListener('change', (e) => {
  loadBlogData(e.target.value);
});

// Initial Render
loadBlogData(yearFilter.value);

/* Theme */
const themeToggleBtn = document.getElementById('themeToggle');
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function updateThemeUI() {
  const isLight = document.documentElement.classList.contains('light-theme');
  if (isLight) {
    themeToggleBtn.innerHTML = `${moonIcon} Dark Mode`;
  } else {
    themeToggleBtn.innerHTML = `${sunIcon} Light Mode`;
  }
}

updateThemeUI();

themeToggleBtn.addEventListener('click', () => {
  document.documentElement.classList.toggle('light-theme');
  const isLight = document.documentElement.classList.contains('light-theme');
  localStorage.setItem('3nding_theme', isLight ? 'light' : 'dark');
  updateThemeUI();
});

// --- Modal Logic ---
const filterModal = document.getElementById('filterModal');
const filterFab = document.getElementById('filterFab');
const closeModal = document.getElementById('closeModal');

// Function to toggle modal visibility
function toggleModal() {
  filterModal.classList.toggle('hidden');

  // Optional: Focus the search input automatically when opening
  if (!filterModal.classList.contains('hidden')) {
    setTimeout(() => {
      document.getElementById('searchInput').focus();
    }, 100);
  }
}

// Open modal via FAB
filterFab.addEventListener('click', toggleModal);

// Close modal via close button
closeModal.addEventListener('click', toggleModal);

// Close modal when clicking outside the content box
filterModal.addEventListener('click', (e) => {
  if (e.target === filterModal) {
    toggleModal();
  }
});

// Close modal on Escape key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !filterModal.classList.contains('hidden')) {
    toggleModal();
  }
});

// Add to your DOM elements at the top
const applyBtn = document.getElementById('applyFilters');

// Add to your Event Listeners section
applyBtn.addEventListener('click', () => {
  handleFilters(); // Run the search logic
  toggleModal(); // Close the modal
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && searchInput.value.trim() !== "") {
    handleFilters();
    toggleModal();
  }
});