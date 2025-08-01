const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzeM58wRBplumti9Zz6d-jNDEvxBF7id_fwaRUcLF1HfX8Ku6aVXhozBPpeCzIfHfJQ/exec';

let allCards = [];
let selectedTopics = [];
let filteredCards = [];
let currentIndex = 0;
let flipped = false;

async function fetchCards() {
  try {
    const res = await fetch(SHEET_API_URL + '?action=get');
    const data = await res.json();
    allCards = data;
    const topics = [...new Set(allCards.map(c => c.topic))];
    renderTopics(topics);
  } catch (err) {
    console.error('Fehler beim Laden:', err);
  }
}

function renderTopics(topics) {
  const list = document.getElementById('topic-list');
  list.innerHTML = '';
  topics.forEach(topic => {
    const li = document.createElement('li');
    li.textContent = topic;
    li.onclick = (e) => toggleTopicSelection(topic, li, e);
    list.appendChild(li);
  });
}

function toggleTopicSelection(topic, li, event) {
  const isMobile = !event.ctrlKey && !event.metaKey && event.pointerType !== 'mouse';

  if (event.ctrlKey || event.metaKey || isMobile) {
    // множественный выбор
    const index = selectedTopics.indexOf(topic);
    if (index > -1) {
      selectedTopics.splice(index, 1);
      li.classList.remove('active');
    } else {
      selectedTopics.push(topic);
      li.classList.add('active');
    }
  } else {
    // одиночный выбор
    selectedTopics = [topic];
    document.querySelectorAll('#topic-list li').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
  }

  updateFilteredCards();
  showCard();
}


function updateFilteredCards() {
  filteredCards = allCards.filter(c => selectedTopics.includes(c.topic));
  shuffleArray(filteredCards);
  currentIndex = 0;
  flipped = false;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function showCard() {
  if (!filteredCards.length) {
    document.getElementById('card-question').textContent = 'Keine Karte gefunden';
    document.getElementById('card-answer').textContent = '';
    return;
  }

  const card = filteredCards[currentIndex];
  document.getElementById('card-question').textContent = card.question;
  document.getElementById('card-answer').textContent = card.answer;

  const flashcard = document.getElementById('flashcard');
  flashcard.classList.remove('flipped');
}

function flipCard() {
  const flashcard = document.getElementById('flashcard');
  flashcard.classList.toggle('flipped');
}

function nextCard() {
  if (!filteredCards.length) return;
  currentIndex = (currentIndex + 1) % filteredCards.length;
  flipped = false;
  showCard();
}

function previousCard() {
  if (!filteredCards.length) return;
  currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
  flipped = false;
  showCard();
}

fetchCards();
