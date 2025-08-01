function doGet(e) {
  const allowedRef = "https://ваш-домен.ру";
  const key = e.parameter.key;

  if (e.parameter.action === "get" && key === "секрет123") {
    return ContentService.createTextOutput(JSON.stringify(getData()))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput("403 Forbidden");
  }
}


const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzeM58wRBplumti9Zz6d-jNDEvxBF7id_fwaRUcLF1HfX8Ku6aVXhozBPpeCzIfHfJQ/exec';

let cards = [];
let currentIndex = 0;
let currentTopic = '';
let flipped = false;

async function fetchCards() {
  try {
    const res = await fetch(SHEET_API_URL + '?action=get');
    const data = await res.json();
    cards = data;
    const topics = [...new Set(cards.map(c => c.topic))];
    renderTopics(topics);
    if (topics.length > 0) selectTopic(topics[0]);
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
    li.onclick = () => selectTopic(topic);
    list.appendChild(li);
  });
}

function selectTopic(topic) {
  currentTopic = topic;
  currentIndex = 0;
  flipped = false;
  updatePreview();
  highlightActiveTopic();
}

function highlightActiveTopic() {
  const listItems = document.querySelectorAll('#topic-list li');
  listItems.forEach(li => {
    li.classList.toggle('active', li.textContent === currentTopic);
  });
}

function updatePreview() {
  const topicCards = cards.filter(c => c.topic === currentTopic);
  if (!topicCards.length) {
    document.getElementById('card-preview').textContent = 'Noch keine Karte';
    return;
  }
  const card = topicCards[currentIndex];
  document.getElementById('card-preview').textContent = flipped
    ? card.answer
    : card.question;

  // Обновим поля редактирования
  document.getElementById('topic-input').value = card.topic;
  document.getElementById('question-input').value = card.question;
  document.getElementById('answer-input').value = card.answer;
}

function flipCard() {
  flipped = !flipped;
  updatePreview();
}

function nextCard() {
  const topicCards = cards.filter(c => c.topic === currentTopic);
  if (!topicCards.length) return;
  currentIndex = (currentIndex + 1) % topicCards.length;
  flipped = false;
  updatePreview();
}

function previousCard() {
  const topicCards = cards.filter(c => c.topic === currentTopic);
  if (!topicCards.length) return;
  currentIndex = (currentIndex - 1 + topicCards.length) % topicCards.length;
  flipped = false;
  updatePreview();
}

function newCard() {
  document.getElementById('topic-input').value = currentTopic;
  document.getElementById('question-input').value = '';
  document.getElementById('answer-input').value = '';
  document.getElementById('card-preview').textContent = 'Neue Karte erstellen...';
}

async function saveCard() {
  const topic = document.getElementById('topic-input').value.trim();
  const question = document.getElementById('question-input').value.trim();
  const answer = document.getElementById('answer-input').value.trim();
  if (!topic || !question || !answer) {
    alert('Alle Felder müssen ausgefüllt sein.');
    return;
  }

  const payload = {
    topic,
    question,
    answer
  };

  try {
    const res = await fetch(SHEET_API_URL + '?action=post', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();
    if (result.success) {
      await fetchCards();
      alert('Karte gespeichert!');
    } else {
      alert('Fehler beim Speichern.');
    }
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    alert('Fehler beim Speichern.');
  }
}

async function deleteCard() {
  const topicCards = cards.filter(c => c.topic === currentTopic);
  if (!topicCards.length) return;

  const card = topicCards[currentIndex];
  if (!confirm('Diese Karte wirklich löschen?')) return;

  try {
    const res = await fetch(SHEET_API_URL + '?action=delete', {
      method: 'POST',
      body: JSON.stringify(card),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();
    if (result.success) {
      await fetchCards();
      alert('Karte gelöscht.');
    } else {
      alert('Fehler beim Löschen.');
    }
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    alert('Fehler beim Löschen.');
  }
}

// Начальная загрузка
fetchCards();

const topicInput = document.getElementById('topic-input');
const topicList = document.getElementById('topic-list');
const topicSuggestions = document.getElementById('topic-suggestions');

// Функция обновления списка подсказок под input, из списка тем в sidebar
function updateSuggestions() {
  const filter = topicInput.value.toLowerCase();
  const topics = [...topicList.querySelectorAll('li')].map(li => li.textContent);

  // Фильтруем темы по введённому тексту
  const filtered = topics.filter(t => t.toLowerCase().includes(filter));

  // Очищаем подсказки
  topicSuggestions.innerHTML = '';

  // Если пусто — скрываем список
  if(filtered.length === 0) {
    topicSuggestions.style.display = 'none';
    return;
  }

  // Заполняем список подсказок
  filtered.forEach(topic => {
    const li = document.createElement('li');
    li.textContent = topic;
    li.onclick = () => {
      topicInput.value = topic;
      topicSuggestions.style.display = 'none';
      // Можно вызвать функцию выбора темы, если есть
      // selectTopic(topic);
    };
    topicSuggestions.appendChild(li);
  });

  topicSuggestions.style.display = 'block';
}

// События для поля ввода
topicInput.addEventListener('input', updateSuggestions);
topicInput.addEventListener('focus', updateSuggestions);

// Скрываем подсказки, если кликаем вне поля и списка
document.addEventListener('click', (e) => {
  if(e.target !== topicInput && !topicSuggestions.contains(e.target)) {
    topicSuggestions.style.display = 'none';
  }
});
