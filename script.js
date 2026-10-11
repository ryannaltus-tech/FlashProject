let sets = JSON.parse(localStorage.getItem("sets")) || [];

let currentSetIndex = null;
let currentCardIndex = 0;
let showingAnswer = false;
let shuffleMode = false;
let shuffledIndexes = [];
let confirmingDelete = false;
/* ---------------- SAVE ---------------- */
function save() {
  localStorage.setItem("sets", JSON.stringify(sets));
}

/* ---------------- RENDER SETS ---------------- */
function renderSets() {
  const list = document.getElementById("setList");
  list.innerHTML = "";

  sets.forEach((set, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${set.name}</h3>
      <button onclick="openSet(${index})">Open</button>
      <button onclick="deleteSet(${index})">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* ---------------- CREATE SET ---------------- */
function createSet() {
  const name = document.getElementById("setName").value.trim();
  if (!name) return;

  sets.push({
    name: name,
    cards: []
  });

  document.getElementById("setName").value = "";
  save();
  renderSets();
}

/* ---------------- DELETE SET ---------------- */
function deleteSet(index) {
  sets.splice(index, 1);

  if (currentSetIndex === index) {
    currentSetIndex = null;
    currentCardIndex = 0;

    document.getElementById("homePage").style.display = "block";
    document.getElementById("studyPage").style.display = "none";
  }

  save();
  renderSets();
}

/* ---------------- OPEN SET ---------------- */
function openSet(index) {
  currentSetIndex = index;
  currentCardIndex = 0;
  showingAnswer = false;
  confirmingDelete = false;

  document.getElementById("homePage").style.display = "none";
  document.getElementById("studyPage").style.display = "block";

  document.getElementById("currentSetTitle").innerText =
    sets[currentSetIndex].name;

  showCard();
}

/* ---------------- SHOW CARD ---------------- */
function showCard() {
  if (currentSetIndex === null || !sets[currentSetIndex]) return;

  const set = sets[currentSetIndex];

  if (!set.cards || set.cards.length === 0) {
    document.getElementById("cardContainer").innerHTML = "No cards yet";
    document.getElementById("cardCount").innerText = "0 / 0";
    return;
  }

  const realIndex = getRealCardIndex();
  const card = set.cards[realIndex];

  if (!card) return;

  if (!card.level) card.level = "";

  document.getElementById("cardContainer").innerHTML = `
  <div class="card" onclick="flipCard()">

    <div class="cardTopBar">
      <span onclick="event.stopPropagation(); editCurrentCard()">✏️</span>
      <span onclick="event.stopPropagation(); handleDeleteClick()">
  ${confirmingDelete ? "✓" : "🗑️"}
</span>

    <div class="${card.level}">
      ${showingAnswer ? card.answer : card.question}
    </div>

    <br>

    <button onclick="event.stopPropagation(); setCardLevel('red')" class="redBtn">Red</button>
    <button onclick="event.stopPropagation(); setCardLevel('yellow')" class="yellowBtn">Yellow</button>
    <button onclick="event.stopPropagation(); setCardLevel('green')" class="greenBtn">Green</button>

  </div>
`;

  document.getElementById("cardCount").innerText =
    `${currentCardIndex + 1} / ${set.cards.length}`;
}
/* ---------------- Shuffle mode ---------------- */
function toggleShuffle() {
  shuffleMode = !shuffleMode;

  const btn = document.getElementById("shuffleBtn");

  if (shuffleMode) {
    btn.innerText = "Shuffle: ON";
    btn.style.background = "red";

    generateShuffleOrder();
    currentCardIndex = 0;
  } 
  else {
    btn.innerText = "Shuffle: OFF";
    btn.style.background = "";

    currentCardIndex = 0;
  }

  showingAnswer = false;
  showCard();
}
/* ---------------- Shuffle order ---------------- */
function generateShuffleOrder() {
  const set = sets[currentSetIndex];

  shuffledIndexes = [];

  for (let i = 0; i < set.cards.length; i++) {
    shuffledIndexes.push(i);
  }

  // Fisher-Yates shuffle
  for (let i = shuffledIndexes.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffledIndexes[i], shuffledIndexes[randomIndex]] = 
    [shuffledIndexes[randomIndex], shuffledIndexes[i]];
  }
}
/* ---------------- FLIP ---------------- */
function flipCard() {
  confirmingDelete = false;
  showingAnswer = !showingAnswer;
  showCard();
}

/* ---------------- NEXT ---------------- */
function nextCard() {
  if (currentSetIndex === null) return;

  const set = sets[currentSetIndex];
  if (!set || currentCardIndex >= set.cards.length - 1) return;

  currentCardIndex++;
  showingAnswer = false;
  confirmingDelete = false;
  showCard();
}

/* ---------------- PREVIOUS ---------------- */
function prevCard() {
  if (currentSetIndex === null) return;

  if (currentCardIndex > 0) {
    currentCardIndex--;
    showingAnswer = false;
    confirmingDelete = false;
    showCard();
  }
}

/* ---------------- ADD CARD ---------------- */
function addCard() {
  if (currentSetIndex === null) return;

  const q = document.getElementById("question").value.trim();
  const a = document.getElementById("answer").value.trim();

  if (!q || !a) return;

  sets[currentSetIndex].cards.push({
    question: q,
    answer: a,
    level: ""
  });

  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";

  save();
  showCard();
}

/* ---------------- DELETE CARD ---------------- */
function deleteCard(index) {
  const set = sets[currentSetIndex];
  if (!set) return;

  set.cards.splice(index, 1);

  if (currentCardIndex >= set.cards.length) {
    currentCardIndex = Math.max(set.cards.length - 1, 0);
  }

  save();
  showCard();
}
/*----------------Cardlevel------------------------*/
function setCardLevel(level) {
  const realIndex = getRealCardIndex();

  sets[currentSetIndex].cards[realIndex].level = level;

  save();
  showCard();
}
/* ---------------- EDIT CARD ---------------- */
function editCard(index) {
  const card = sets[currentSetIndex].cards[index];

  const newQuestion = prompt("Edit question:", card.question);
  const newAnswer = prompt("Edit answer:", card.answer);

  if (newQuestion !== null && newQuestion.trim() !== "") {
    card.question = newQuestion;
  }

  if (newAnswer !== null && newAnswer.trim() !== "") {
    card.answer = newAnswer;
  }

  save();
  showCard();
}
/* ---------------- Card indexing ---------------- */
function getRealCardIndex() {
  if (shuffleMode) {
    return shuffledIndexes[currentCardIndex];
  }

  return currentCardIndex;
}

function editCurrentCard() {
  editCard(getRealCardIndex());
}

function deleteCurrentCard() {
  deleteCard(getRealCardIndex());
}
/*delete confirmation*/
function handleDeleteClick() {

  if (!confirmingDelete) {
    confirmingDelete = true;
    showCard();
    return;
  }

  confirmingDelete = false;
  deleteCurrentCard();

  showCard(); // ALWAYS re-render after state reset
}
/* ---------------- BACK HOME ---------------- */
function backHome() {
  document.getElementById("homePage").style.display = "block";
  document.getElementById("studyPage").style.display = "none";
  renderSets();
}

/* ---------------- CSV IMPORT ---------------- */
function importCSV() {
  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    alert("Select a CSV file first");
    return;
  }

  if (currentSetIndex === null || !sets[currentSetIndex]) {
    alert("Open a set first before importing CSV");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const rows = parseCSV(e.target.result);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] || !row[1]) continue;

      sets[currentSetIndex].cards.push({
        question: row[0],
        answer: row[1]
      });
    }

    save();
    showCard();
    renderSets();

    alert("CSV Imported Successfully");
  };

  reader.readAsText(file);
}

/* ---------------- CSV PARSER ---------------- */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } 
    else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } 
    else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (row.length || current) {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = "";
      }
    } 
    else {
      current += char;
    }
  }

  if (row.length || current) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/* ---------------- INIT ---------------- */
renderSets();