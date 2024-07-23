const listOfItems = [];

let comparisonPairs = [];

function makeComparisonPairs() {
  for (let i = 0; i < listOfItems.length; i++) {
    for (let j = i + 1; j < listOfItems.length; j++) {
      let newPair = [listOfItems[i], listOfItems[j]];
      comparisonPairs.push(newPair);
    }
  }

  // shuffle the list
  comparisonPairs = comparisonPairs.sort(() => 0.5 - Math.random());
  // console.log(comparisonPairs);
}

makeComparisonPairs();

function createScores(filmList) {
  let scores = filmList;
  for (let i = 0; i < scores.length; i++) {
    let tempArray = [scores[i], 0];
    scores[i] = tempArray;
  }
  return scores;
}

scores = createScores(listOfItems);
// console.log(scores);

currentPairCount = 0;

const progressCount = document.querySelector(".progress");

function updateProgress(currentCount) {
  if (currentCount >= comparisonPairs.length) {
    progressCount.textContent = "Complete";
  } else {
    progressCount.textContent = currentCount + 1 + `/${comparisonPairs.length}`;
  }
}

updateProgress(currentPairCount);

function displayNextComparison() {
  const leftSpace = document.querySelector(".left-choice");
  const rightSpace = document.querySelector(".right-choice");
  // console.log(currentPairCount);
  updateProgress(currentPairCount);

  if (currentPairCount < comparisonPairs.length) {
    leftSpace.textContent = comparisonPairs[currentPairCount][0];
    rightSpace.textContent = comparisonPairs[currentPairCount][1];
    currentPairCount++;
  } else {
    leftSpace.textContent = "Comparison Complete";
    leftSpace.style.backgroundColor = "#E2FBE8";
    leftSpace.style.color = "#424843";
    rightSpace.textContent = "Comparison Complete";
    rightSpace.style.backgroundColor = "#E2FBE8";
    rightSpace.style.color = "#424843";
  }
}

displayNextComparison();

const leftSpace = document.querySelector(".left-choice");
const rightSpace = document.querySelector(".right-choice");

leftSpace.addEventListener("click", function () {
  const winningSpace = leftSpace.textContent;

  for (let i = 0; i < scores.length; i++) {
    if (scores[i][0] === winningSpace) {
      scores[i][1]++;
    }
  }

  displayNextComparison();
  // console.log(scores);
});

rightSpace.addEventListener("click", function () {
  const winningSpace = rightSpace.textContent;

  for (let i = 0; i < scores.length; i++) {
    if (scores[i][0] === winningSpace) {
      scores[i][1]++;
    }
  }

  displayNextComparison();
  // console.log(scores);
});

const scoresButton = document.querySelector(".scores-button");
const scoresModal = document.querySelector(".scores-modal");
scoresButton.addEventListener("click", function () {
  scoresModal.showModal();

  // sort scores array by score, descending
  const sortedScores = [...scores].sort((a, b) => b[1] - a[1]);

  const scoresTable = document.createElement("table");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Film</th><th>Score</th>";
  scoresTable.appendChild(headerRow);

  for (let i = 0; i < sortedScores.length; i++) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + sortedScores[i][0] + "</td><td>" + sortedScores[i][1] + "</td>";
    scoresTable.appendChild(row);
  }

  // clear previous table if exists
  const form = scoresModal.querySelector("form");
  form.innerHTML = "";
  form.appendChild(scoresTable);
});

// close modal when user clicks outside of it
scoresModal.addEventListener("click", function (event) {
  if (event.target === scoresModal) {
    scoresModal.close();
  }
});
