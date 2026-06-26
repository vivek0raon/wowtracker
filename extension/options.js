const defaultQuestionPrompt = `A concise summary of the problem statement itself in Hinglish (a mix of Hindi and English).
Example style: "Alien language ke words sorted order me diye gaye hain. In words ki help se characters ka valid order find karna hai. Agar valid order possible na ho to empty string return karo."`;

const defaultSolutionPrompt = `A detailed summary of the solution logic/algorithm in Hinglish, using a balanced mix of Hindi and coding terminology (e.g. "queue use karenge", "Kahn's algorithm chalao"). Do NOT include any raw code.
Example style: "Pehle har adjacent pair of words compare karo aur first different character dhoondo. Agar u aur v pehle different characters hain, to edge u -> v banao. Adjacency list aur indegree banao, phir Kahn's Algorithm (BFS) chalao. Indegree 0 wale characters queue me daalo..."`;

// Saves options to chrome.storage
const saveOptions = () => {
  const apiUrl = document.getElementById('apiUrl').value || 'http://localhost:3000';
  const userId = document.getElementById('userId').value;
  const questionPrompt = document.getElementById('questionPrompt').value;
  const solutionPrompt = document.getElementById('solutionPrompt').value;

  chrome.storage.sync.set(
    { apiUrl, userId, questionPrompt, solutionPrompt },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { 
      apiUrl: 'http://localhost:3000', 
      userId: '',
      questionPrompt: defaultQuestionPrompt,
      solutionPrompt: defaultSolutionPrompt
    },
    (items) => {
      document.getElementById('apiUrl').value = items.apiUrl;
      document.getElementById('userId').value = items.userId;
      document.getElementById('questionPrompt').value = items.questionPrompt;
      document.getElementById('solutionPrompt').value = items.solutionPrompt;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
