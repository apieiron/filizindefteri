/**
 * app.js - Frontend application logic for Filiz'in Defteri
 */

// Global State
let allStories = [];
let filteredStories = [];
let currentStoryId = null;
let activeTag = null;
let activeSearch = '';

// Preferences State (with defaults or LocalStorage)
let appTheme = localStorage.getItem('filizindefteri-theme') || localStorage.getItem('moladayim-theme') || 'mola';
let appFontSize = parseInt(localStorage.getItem('filizindefteri-fontsize')) || parseInt(localStorage.getItem('moladayim-fontsize')) || 18;

// DOM Elements
const sidebar = document.getElementById('appSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const searchInput = document.getElementById('searchInput');
const tagCloud = document.getElementById('tagCloud');
const storyList = document.getElementById('storyList');
const storyCount = document.getElementById('storyCount');
const randomStoryBtn = document.getElementById('randomStoryBtn');
const readingProgressBar = document.getElementById('readingProgressBar');
const readerViewport = document.getElementById('readerViewport');

const welcomeContainer = document.getElementById('welcomeContainer');
const storyFullView = document.getElementById('storyFullView');
const homeLink = document.getElementById('homeLink');

// Font Adjusters
const btnFontSizeDecrease = document.getElementById('fontSizeDecrease');
const btnFontSizeIncrease = document.getElementById('fontSizeIncrease');

// Theme Options
const themeOptions = document.querySelectorAll('.theme-option');

// ==========================================================================
// 1. INITIALIZATION & DATA FETCH
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved settings
  applyTheme(appTheme);
  
  // Fetch stories
  fetch('stories.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Stories JSON could not be loaded');
      }
      return response.json();
    })
    .then(data => {
      allStories = data.map(story => {
        // Pre-normalize tags for clean presentation
        story.normalizedTags = normalizeTags(story.tags);
        return story;
      });
      
      filteredStories = [...allStories];
      
      initTagCloud();
      renderStoryList();
      updateStoryCount();
      
      // Check if URL has a hash to load specific story
      handleHashChange();
      
      // Hide loading text and update count
      updateStoryCount();
    })
    .catch(error => {
      console.error('Error fetching stories:', error);
      storyCount.textContent = 'Yazılar yüklenemedi.';
    });

  // Setup Event Listeners
  setupEventListeners();
});

// Helper to normalize Turkish characters for search
function cleanTextForSearch(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

// Clean and combine tags for display
function normalizeTags(tagList) {
  if (!tagList || !Array.isArray(tagList)) return [];
  const normalized = [];
  const lower = tagList.map(t => t.toLowerCase());
  
  let i = 0;
  while (i < tagList.length) {
    if (i < tagList.length - 1 && lower[i] === 'az' && lower[i+1] === 'pişmiş') {
      normalized.push('Az Pişmiş');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'aile' && lower[i+1] === 'hayatı') {
      normalized.push('Aile Hayatı');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'aile' && lower[i+1] === 'hikayesi') {
      normalized.push('Aile Hikayesi');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'anne' && lower[i+1] === 'kız') {
      normalized.push('Anne Kız');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'anne' && lower[i+1] === 'çocuk') {
      normalized.push('Anne Çocuk');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'anne' && lower[i+1] === 'olmak') {
      normalized.push('Anne Olmak');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'çocuk' && lower[i+1] === 'yetiştirmek') {
      normalized.push('Çocuk Yetiştirmek');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'insan' && lower[i+1] === 'ilişkileri') {
      normalized.push('İnsan İlişkileri');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'tükenmişlik' && lower[i+1] === 'sendromu') {
      normalized.push('Tükenmişlik Sendromu');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'camdan' && lower[i+1] === 'bakmak') {
      normalized.push('Camdan Bakmak');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'balkon' && lower[i+1] === 'temizliği') {
      normalized.push('Balkon Temizliği');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'orta' && lower[i+1] === 'yaş') {
      normalized.push('Orta Yaş');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'yaş' && lower[i+1] === 'sendromu') {
      normalized.push('Yaş Sendromu');
      i += 2;
    } else if (i < tagList.length - 1 && lower[i] === 'karşı' && lower[i+1] === 'cins') {
      normalized.push('Karşı Cins');
      i += 2;
    } else {
      let word = tagList[i].trim();
      // Only keep tags longer than 2 characters and ignore generic numbers
      if (word.length > 2 && isNaN(word)) {
        // Capitalize first letter
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        normalized.push(word);
      }
      i++;
    }
  }
  return [...new Set(normalized)];
}

// ==========================================================================
// 2. TAG CLOUD GENERATION
// ==========================================================================

function initTagCloud() {
  if (!tagCloud) return;
  const tagCounts = {};
  allStories.forEach(story => {
    story.normalizedTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12) // Top 12 tags
    .map(entry => entry[0]);

  tagCloud.innerHTML = '';
  
  // Render tag buttons
  sortedTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener('click', () => toggleTag(tag));
    tagCloud.appendChild(btn);
  });
}

function toggleTag(tag) {
  if (activeTag === tag) {
    activeTag = null;
  } else {
    activeTag = tag;
  }

  // Update tag styling in UI
  document.querySelectorAll('.tag-btn').forEach(btn => {
    if (btn.dataset.tag === activeTag) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  applyFilters();
}

// ==========================================================================
// 3. STORY FILTER & SEARCH
// ==========================================================================

function applyFilters() {
  const searchClean = cleanTextForSearch(activeSearch);

  filteredStories = allStories.filter(story => {
    // Search filter
    const matchesSearch = !searchClean || 
      cleanTextForSearch(story.title).includes(searchClean) || 
      cleanTextForSearch(story.content).includes(searchClean);

    // Tag filter
    const matchesTag = !activeTag || story.normalizedTags.includes(activeTag);

    return matchesSearch && matchesTag;
  });

  renderStoryList();
  updateStoryCount();
}

// ==========================================================================
// 4. RENDERING FUNCTIONS
// ==========================================================================

function renderStoryList() {
  storyList.innerHTML = '';

  if (filteredStories.length === 0) {
    storyList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">☕</div>
        <p>Aramanıza uygun hikaye bulunamadı.</p>
      </div>
    `;
    return;
  }

  filteredStories.forEach(story => {
    const item = document.createElement('div');
    item.className = 'story-list-item';
    if (story.id === currentStoryId) {
      item.classList.add('active');
    }

    // Format date string slightly cleaner (YYYY-MM-DD to DD.MM.YYYY)
    let displayDate = story.date.split(' ')[0];
    try {
      const parts = displayDate.split('-');
      if (parts.length === 3) {
        displayDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    } catch(e) {}

    // Calculate reading time
    const wordCount = story.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Get a brief snippet of content
    const previewText = story.content.replace(/\n+/g, ' ').substring(0, 100);

    item.innerHTML = `
      <div class="story-item-meta">
        <span>${displayDate}</span>
        <span>☕ ${readingTime} dk okuma</span>
      </div>
      <h2 class="story-item-title">${story.title}</h2>
      <p class="story-item-preview">${previewText}...</p>
    `;

    item.addEventListener('click', () => {
      // Set hash which triggers story loading
      window.location.hash = `hikaye-${story.id}`;
      // On mobile, close sidebar drawer on selection
      closeSidebarMobile();
    });

    storyList.appendChild(item);
  });
}

function updateStoryCount() {
  if (filteredStories.length === allStories.length) {
    storyCount.textContent = `${allStories.length} Yazı`;
  } else {
    storyCount.textContent = `${filteredStories.length} / ${allStories.length} Yazı`;
  }
}

// Render the selected story inside the reading viewport
function renderStory(storyId) {
  currentStoryId = storyId;
  const story = allStories.find(s => s.id === storyId);

  if (!story) {
    showWelcomeScreen();
    return;
  }

  // Highlight active item in the list
  document.querySelectorAll('.story-list-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Re-render list slightly to apply active styling
  const listItems = storyList.querySelectorAll('.story-list-item');
  const activeIdx = filteredStories.findIndex(s => s.id === storyId);
  if (activeIdx !== -1 && listItems[activeIdx]) {
    listItems[activeIdx].classList.add('active');
    // Scroll active item into view inside sidebar
    listItems[activeIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Format full date
  let dateStr = story.date;
  try {
    const parts = story.date.split(' ');
    const dateParts = parts[0].split('-');
    dateStr = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]} ${parts[1]}`;
  } catch(e) {}

  // Calculate words and time
  const wordCount = story.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Previous and Next story index pagination
  const currentIndex = allStories.findIndex(s => s.id === storyId);
  let paginationHtml = '';
  if (currentIndex > -1) {
    paginationHtml = `<div class="story-navigation">`;
    
    // Previous Link
    if (currentIndex > 0) {
      const prevStory = allStories[currentIndex - 1];
      paginationHtml += `
        <a href="#hikaye-${prevStory.id}" class="nav-link-btn prev" data-id="${prevStory.id}">
          <span class="nav-link-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Önceki Hikaye
          </span>
          <span class="nav-link-title">${prevStory.title}</span>
        </a>
      `;
    } else {
      paginationHtml += `<div></div>`;
    }
    
    // Next Link
    if (currentIndex < allStories.length - 1) {
      const nextStory = allStories[currentIndex + 1];
      paginationHtml += `
        <a href="#hikaye-${nextStory.id}" class="nav-link-btn next" data-id="${nextStory.id}">
          <span class="nav-link-label">
            Sonraki Hikaye
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </span>
          <span class="nav-link-title">${nextStory.title}</span>
        </a>
      `;
    } else {
      paginationHtml += `<div></div>`;
    }
    
    paginationHtml += `</div>`;
  }

  welcomeContainer.style.display = 'none';
  storyFullView.style.display = 'block';

  // Format paragraphs from double newlines
  const paragraphs = story.content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // Replace single newlines within the paragraph block with <br> tags (for poems/lists)
      const cleanParagraph = p.replace(/\n/g, '<br>');
      return `<p>${cleanParagraph}</p>`;
    })
    .join('');

  // Setup tags HTML
  const tagsHtml = story.normalizedTags
    .map(tag => `<span class="story-tag" style="cursor: pointer;" onclick="searchByTag('${tag.replace(/'/g, "\\'")}')" title="Bu konudaki diğer yazıları ara">${tag}</span>`)
    .join('');

  storyFullView.innerHTML = `
    <div class="story-full-header">
      <h1 class="story-full-title">${story.title}</h1>
      <div class="story-full-meta">
        <div class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${dateStr}</span>
        </div>
        <div class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${readingTime} dakika okuma</span>
        </div>
        
        <!-- Share Container -->
        <div class="story-share-container">
          <button class="share-btn copy" onclick="shareStory('copy', \`${story.title.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${story.id}')" title="Bağlantıyı Kopyala">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>Paylaş</span>
          </button>
          <button class="share-btn whatsapp" onclick="shareStory('whatsapp', \`${story.title.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${story.id}')" title="WhatsApp'ta Paylaş">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </button>
          <button class="share-btn twitter" onclick="shareStory('twitter', \`${story.title.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${story.id}')" title="X'te Paylaş">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
          </button>
        </div>
      </div>
      <div class="story-tags">
        ${tagsHtml}
      </div>
    </div>
    
    <article class="story-full-body" id="storyBody" style="font-size: ${appFontSize}px;">
      ${paragraphs}
    </article>

    ${paginationHtml}
  `;

  // Reset scroll position and progress bar
  readerViewport.scrollTop = 0;
  readingProgressBar.style.width = '0%';
}

function showWelcomeScreen() {
  currentStoryId = null;
  welcomeContainer.style.display = 'flex';
  storyFullView.style.display = 'none';
  window.location.hash = '';
  
  document.querySelectorAll('.story-list-item').forEach(item => {
    item.classList.remove('active');
  });

  readingProgressBar.style.width = '0%';
}

// ==========================================================================
// 5. SETTINGS & PREFERENCES
// ==========================================================================

function applyTheme(themeName) {
  appTheme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('filizindefteri-theme', themeName);

  // Update dots in panel
  themeOptions.forEach(opt => {
    if (opt.dataset.themeVal === themeName) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

function updateFontSize(delta) {
  const newSize = Math.max(14, Math.min(28, appFontSize + delta));
  if (newSize !== appFontSize) {
    appFontSize = newSize;
    localStorage.setItem('filizindefteri-fontsize', appFontSize);
    
    // Apply size to DOM element if it exists
    const body = document.getElementById('storyBody');
    if (body) {
      body.style.fontSize = `${appFontSize}px`;
    }
  }
}

// ==========================================================================
// 6. ROUTING & EVENTS
// ==========================================================================

function handleHashChange() {
  const hash = window.location.hash;
  if (hash.startsWith('#hikaye-')) {
    const id = hash.replace('#hikaye-', '');
    renderStory(id);
  } else {
    showWelcomeScreen();
  }
}

function setupEventListeners() {
  // Hash Routing
  window.addEventListener('hashchange', handleHashChange);

  // Search input change with input throttling
  let searchTimeout = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      activeSearch = e.target.value;
      applyFilters();
    }, 200);
  });

  // Home branding link clicks
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showWelcomeScreen();
  });

  // Surprise / Random story Selector
  randomStoryBtn.addEventListener('click', () => {
    const sourceList = filteredStories.length > 0 ? filteredStories : allStories;
    if (sourceList.length > 0) {
      const randomIndex = Math.floor(Math.random() * sourceList.length);
      const randomStory = sourceList[randomIndex];
      window.location.hash = `hikaye-${randomStory.id}`;
    }
  });

  // Font adjusters
  btnFontSizeDecrease.addEventListener('click', () => updateFontSize(-2));
  btnFontSizeIncrease.addEventListener('click', () => updateFontSize(2));

  // Theme selector click triggers
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      applyTheme(opt.dataset.themeVal);
    });
  });

  // Mobile Menu Drawer Toggles
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible');
  });

  sidebarOverlay.addEventListener('click', closeSidebarMobile);

  // Scroll Progress calculations
  readerViewport.addEventListener('scroll', () => {
    const scrollHeight = readerViewport.scrollHeight - readerViewport.clientHeight;
    if (scrollHeight > 0) {
      const scrolled = (readerViewport.scrollTop / scrollHeight) * 100;
      readingProgressBar.style.width = `${scrolled}%`;
    } else {
      readingProgressBar.style.width = '0%';
    }
  });
}

function closeSidebarMobile() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
}

// ==========================================================================
// 7. SHARE & SEARCH BY TAG GLOBALS
// ==========================================================================

window.shareStory = function(platform, title, id) {
  const url = `${window.location.origin}${window.location.pathname}#hikaye-${id}`;
  if (platform === 'copy') {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('.share-btn.copy');
      const origHtml = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Kopyalandı!</span>`;
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Kopyalama hatası:', err);
    });
  } else if (platform === 'whatsapp') {
    const text = encodeURIComponent(`Filiz'in Defteri'nden: "${title}"\nOkumak için: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  } else if (platform === 'twitter') {
    const text = encodeURIComponent(`Filiz'in Defteri'nden: "${title}"`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  }
};

window.searchByTag = function(tag) {
  if (searchInput) {
    searchInput.value = tag;
    activeSearch = tag;
    applyFilters();
    
    // Smooth scroll back to top of the sidebar list
    storyList.scrollTop = 0;
    
    // Open sidebar on mobile so user sees the filtered list
    if (window.innerWidth <= 992) {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('visible');
    }
  }
};
