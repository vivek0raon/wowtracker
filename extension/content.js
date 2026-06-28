// Extract data from LeetCode
function extractLeetCode() {
  // Title
  let title = document.title.split(' - ')[0] || '';
  
  // URL
  const url = window.location.href.split('?')[0]; // Remove query params
  
  // Tags
  const tagElements = document.querySelectorAll('a[href^="/tag/"]');
  const tags = Array.from(tagElements).map(el => el.textContent.trim()).filter(Boolean);
  
  // Problem Description
  let problemDescription = '';
  const descElement = document.querySelector('[data-track-load="description_content"]') || 
                      document.querySelector('.elfjS'); // LeetCode dynamic class
  if (descElement) {
    problemDescription = descElement.innerText;
  }

  // Solution Code (Extracting from Monaco editor lines)
  let solutionCode = '';
  
  // Try global Monaco if available
  try {
    if (window.monaco && window.monaco.editor) {
      const models = window.monaco.editor.getModels();
      if (models.length > 0) {
        let longest = '';
        models.forEach(m => {
          const val = m.getValue();
          if (val.length > longest.length) longest = val;
        });
        if (longest) solutionCode = longest;
      }
    }
  } catch (e) {}

  // Fallback to DOM scraping
  if (!solutionCode) {
    const codeLines = document.querySelectorAll('.view-lines .view-line');
    if (codeLines.length > 0) {
      // Monaco virtualizes lines. We must sort them by their 'top' CSS property to ensure correct order!
      const sortedLines = Array.from(codeLines).map(line => {
        const top = parseInt(line.style.top || '0', 10);
        return { text: line.textContent, top };
      }).sort((a, b) => a.top - b.top);
      
      solutionCode = sortedLines.map(l => l.text).join('\n').trim();
    } else {
      const altCode = document.querySelector('.CodeMirror-code');
      if (altCode) solutionCode = altCode.innerText.trim();
    }
  }

  return { title, url, tags, problemDescription, solutionCode };
}

// Extract data from GeeksForGeeks
function extractGFG() {
  // Title
  let title = '';
  const titleEl = document.querySelector('.problem-statement h3') || document.querySelector('.g-m-0');
  if (titleEl) {
    title = titleEl.textContent.trim();
  } else {
    title = document.title.split('|')[0].trim();
  }
  
  // URL
  const url = window.location.href.split('?')[0];
  
  // Tags
  const tags = [];
  const tagsSet = new Set();
  
  const tagSelectors = [
    'a[href*="category"]',
    '.ui.labels a.ui.label',
    '[class*="problems_tag_label"]',
    '.problems_accordion_tags_container__zk2Um a',
    '.problem-tags a',
    '.problem-tags span'
  ];
  
  tagSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 35 && !text.includes('\\n')) {
          tagsSet.add(text);
        }
      });
    } catch (e) {}
  });

  tags.push(...Array.from(tagsSet));

  // Problem Description
  let problemDescription = '';
  const descElement = document.querySelector('.problem-statement') || document.querySelector('.problems_problem_content__Xm_eO');
  if (descElement) {
    problemDescription = descElement.innerText;
  }

  // Solution Code (GFG often uses Ace editor or CodeMirror)
  let solutionCode = '';
  const aceCode = document.querySelector('.ace_layer.ace_text-layer');
  if (aceCode) {
    solutionCode = aceCode.innerText;
  }

  return { title, url, tags, problemDescription, solutionCode };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    let data = null;
    if (window.location.hostname.includes('leetcode.com')) {
      data = extractLeetCode();
    } else if (window.location.hostname.includes('geeksforgeeks.org')) {
      data = extractGFG();
    }
    sendResponse({ data });
  }
  return true;
});
