import Fuse from 'fuse.js';

let fuse;
let posts = [];

// Initialize search
async function initSearch() {
  try {
    const response = await fetch('/api/search.json');
    posts = await response.json();
    
    fuse = new Fuse(posts, {
      keys: ['title', 'description', 'content'],
      threshold: 0.3,
      includeMatches: true,
    });
  } catch (error) {
    console.error('Failed to initialize search:', error);
  }
}

// Perform search
function performSearch(query) {
  if (!fuse || query.length < 2) {
    hideResults();
    return;
  }

  const results = fuse.search(query);
  displayResults(results, query);
}

// Display search results
function displayResults(results, query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="search-result">未找到相关文章</div>';
  } else {
    resultsContainer.innerHTML = results
      .slice(0, 10)
      .map(result => {
        const { item, matches } = result;
        let excerpt = item.description;
        
        // Highlight matches
        if (matches) {
          matches.forEach((match) => {
            if (match.key === 'description' && match.indices) {
              // Simple highlighting
              excerpt = highlightText(excerpt, query);
            }
          });
        }

        return `
          <div class="search-result" onclick="window.location.href='/posts/${item.slug}'">
            <div class="search-result-title">${highlightText(item.title, query)}</div>
            <div class="search-result-excerpt">${excerpt}</div>
          </div>
        `;
      })
      .join('');
  }

  resultsContainer.classList.remove('hidden');
}

// Highlight text
function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Hide results
function hideResults() {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer?.classList.add('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initSearch();

  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      performSearch(query);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideResults();
        searchInput.blur();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const query = searchInput?.value.trim() || '';
      performSearch(query);
    });
  }

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
      hideResults();
    }
  });
});