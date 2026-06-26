let scrapedData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const syncBtn = document.getElementById('sync-btn');
  const statusDiv = document.getElementById('status');
  
  // Get active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // Check if it's a valid URL
    if (activeTab.url.includes('leetcode.com/problems/') || activeTab.url.includes('geeksforgeeks.org/problems/')) {
      document.getElementById('error-container').classList.add('hidden');
      document.getElementById('content-container').classList.remove('hidden');
      
      // Request data from content script
      chrome.tabs.sendMessage(activeTab.id, { action: 'scrape' }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error: Refresh the page and try again.';
          statusDiv.className = 'error';
          return;
        }
        
        if (response && response.data) {
          scrapedData = response.data;
          
          document.getElementById('p-title').textContent = scrapedData.title || 'Not found';
          document.getElementById('p-tags').textContent = (scrapedData.tags || []).join(', ') || 'None';
          document.getElementById('p-code').textContent = scrapedData.solutionCode ? 'Yes' : 'No';
        }
      });
    }
  });

  syncBtn.addEventListener('click', () => {
    if (!scrapedData) return;
    
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing...';
    statusDiv.textContent = '';
    
    // Get config
    const defaultQuestionPrompt = `A concise summary of the problem statement itself in Hinglish (a mix of Hindi and English).
Example style: "Alien language ke words sorted order me diye gaye hain. In words ki help se characters ka valid order find karna hai. Agar valid order possible na ho to empty string return karo."`;

    const defaultSolutionPrompt = `A detailed summary of the solution logic/algorithm in Hinglish, using a balanced mix of Hindi and coding terminology (e.g. "queue use karenge", "Kahn's algorithm chalao"). Do NOT include any raw code.
Example style: "Pehle har adjacent pair of words compare karo aur first different character dhoondo. Agar u aur v pehle different characters hain, to edge u -> v banao. Adjacency list aur indegree banao, phir Kahn's Algorithm (BFS) chalao. Indegree 0 wale characters queue me daalo..."`;

    chrome.storage.sync.get({ 
      apiUrl: 'http://localhost:3000', 
      userId: '',
      questionPrompt: defaultQuestionPrompt,
      solutionPrompt: defaultSolutionPrompt
    }, async (items) => {
      if (!items.userId) {
        statusDiv.textContent = 'Error: Please set your Clerk User ID in Extension Options.';
        statusDiv.className = 'error';
        syncBtn.disabled = false;
        syncBtn.textContent = 'Sync & Generate Summary';
        
        // Open options page
        setTimeout(() => chrome.runtime.openOptionsPage(), 1500);
        return;
      }
      
      try {
        const url = new URL('/api/extension/sync', items.apiUrl).toString();
        
        const payload = {
          ...scrapedData,
          userId: items.userId,
          questionPrompt: items.questionPrompt,
          solutionPrompt: items.solutionPrompt
        };
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          statusDiv.textContent = 'Successfully synced to Tracker!';
          statusDiv.className = 'success';
          syncBtn.textContent = 'Done!';
        } else {
          statusDiv.textContent = 'Error: ' + (result.error || 'Failed to sync');
          statusDiv.className = 'error';
          syncBtn.disabled = false;
          syncBtn.textContent = 'Try Again';
        }
      } catch (err) {
        statusDiv.textContent = 'Connection Error. Is Next.js running?';
        statusDiv.className = 'error';
        syncBtn.disabled = false;
        syncBtn.textContent = 'Try Again';
      }
    });
  });
});
