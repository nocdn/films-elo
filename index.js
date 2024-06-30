const listOfFilms = [
  "In the heights",
  "Black panther",
  "Snowden",
  "Kingsman: The secret agent",
  "Negotiator",
  "Enemy of the state",
  "Martian",
  "Entergalactic",
  "Hidden figures",
  "The gentlemen",
  "When harry met sally",
  "The Bourne identity (and all later films)",
  "Intouchables",
  "Knives out",
  "Taken 1, Taken 2",
  "Shutter island",
  "Shawshank redemption ",
  "Flight plan",
  "Endgame",
  "Dancing with wolves",
  "Pinondze to nie wszystko",
  "Jak rozpętałem drugą wojnę światową",
  "Anne of green gables",
  "Rye Lane",
  "10 Things I hate about you",
  "Pretty woman",
  "Grab Turismo",
  "Creed films",
  "Bullet train",
];

let comparisonPairs = [];

function makeComparisonPairs() {
  for (let i = 0; i < listOfFilms.length; i++) {
    for (let j = i + 1; j < listOfFilms.length; j++) {
      let newPair = [listOfFilms[i], listOfFilms[j]];
      comparisonPairs.push(newPair);
    }
  }
  console.log(comparisonPairs);
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

scores = createScores(listOfFilms);
console.log(scores);

function displayComparison() {
  const leftSpace = document.querySelector(".left-choice");
  const rightSpace = document.querySelector(".right-choice");

  for (i = 0; comparisonPairs.length; i++) {
    leftSpace.textContent = comparisonPairs[i][0];
    rightSpace.textContent = comparisonPairs[i][1];
  }
}

displayComparison();
