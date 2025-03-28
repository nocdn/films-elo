<script lang="ts">
  import "./app.css";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Leaderboard from "$lib/Leaderboard.svelte";

  let firstChoice: string = $state("First Choice");
  let secondChoice: string = $state("Second Choice");

  let filmsDialogOpen: boolean = $state(false);
  let scoresDialogOpen: boolean = $state(false);

  // state to track if comparisons are finished
  let complete: boolean = $state(false);

  // persistent list of all items loaded
  const listOfItems: string[] = [];

  // reactive list of pairs yet to be compared
  let comparisonPairs: string[][] = $state([]);

  function makeComparisonPairs() {
    // clear any existing pairs before creating new ones
    comparisonPairs.length = 0;
    for (let i = 0; i < listOfItems.length; i++) {
      for (let j = i + 1; j < listOfItems.length; j++) {
        let newPair = [listOfItems[i], listOfItems[j]];
        comparisonPairs.push(newPair);
      }
    }

    // shuffle the pairs for randomness
    comparisonPairs = comparisonPairs.sort(() => 0.5 - Math.random());
    console.log("created pairs:", comparisonPairs);
  }

  function showNextPair() {
    // check if there were pairs *before* attempting to shift
    if (comparisonPairs.length > 0) {
      // remove the pair that was just compared
      // note: we don't need to read from comparisonPairs[0] before shifting anymore
      comparisonPairs.shift();

      // now check if there are *more* pairs left *after* shifting
      if (comparisonPairs.length > 0) {
        // if yes, display the next pair
        firstChoice = comparisonPairs[0][0];
        secondChoice = comparisonPairs[0][1];
        complete = false; // ensure complete is false if we have more pairs
      } else {
        // if no, all comparisons are done! set the complete flag
        console.log("no more pairs to compare");
        complete = true;
      }
    }
    // this else case handles the initial state before films are loaded
    // or if called unexpectedly with an empty list
    else {
      console.log("called showNextPair with no pairs in the list");
      // if list of items is empty, not complete; otherwise, yes complete
      complete = listOfItems.length > 0;
      if (!complete) {
        // reset choices if loading for the first time or cleared
        firstChoice = "First Choice";
        secondChoice = "Second Choice";
      }
    }
  }

  type ScoreDict = {
    [key: string]: number;
  };
  // use $state for scores so leaderboard updates reactively
  let scores: ScoreDict = $state({});
  function initializeScores() {
    const initialScores: ScoreDict = {};
    for (let i = 0; i < listOfItems.length; i++) {
      initialScores[listOfItems[i]] = 0;
    }
    scores = initialScores; // assign to the $state variable
    console.log("initial scores dict:", scores);
  }

  let firstButtonShrunk: boolean = $state(false);
  let secondButtonShrunk: boolean = $state(false);
  function selectFirstOption() {
    if (complete) return; // prevent action if already complete
    firstButtonShrunk = true;
    // ensure the choice exists in scores before incrementing
    if (scores.hasOwnProperty(firstChoice)) {
      scores[firstChoice] += 1;
    }
    showNextPair();
    setTimeout(() => {
      firstButtonShrunk = false;
    }, 50); // short delay for visual effect
  }

  function selectSecondOption() {
    if (complete) return; // prevent action if already complete
    secondButtonShrunk = true;
    // ensure the choice exists in scores before incrementing
    if (scores.hasOwnProperty(secondChoice)) {
      scores[secondChoice] += 1;
    }
    showNextPair();
    setTimeout(() => {
      secondButtonShrunk = false;
    }, 50); // short delay for visual effect
  }

  function loadScores() {
    // just log for debugging, reactivity handles UI
    console.log("current scores:", scores);
  }

  let filmsInput: string = $state("");
  function loadFilms() {
    // clearing previous data
    listOfItems.length = 0; // clear the main list
    // comparisonPairs = []; // assigning new array for reactivity (already done in makeComparisonPairs)
    // scores = {}; // assigning new object for reactivity (done in initializeScores)
    complete = false; // reset completion state

    // loading new films from textarea
    const films = filmsInput.split("\n");
    for (let i = 0; i < films.length; i++) {
      const trimmedFilm = films[i].trim();
      if (trimmedFilm !== "") {
        // prevent duplicates
        if (!listOfItems.includes(trimmedFilm)) {
          listOfItems.push(trimmedFilm);
        }
      }
    }

    // check if enough items to compare
    if (listOfItems.length < 2) {
      console.log("need at least 2 unique films to compare");
      comparisonPairs = []; // ensure pairs list is empty
      scores = {};
      showNextPair(); // update state to show initial message
      return; // stop processing
    }

    // initialise scores for each film
    initializeScores();

    // create pairs
    makeComparisonPairs();

    // show the *very first* pair without shifting yet
    if (comparisonPairs.length > 0) {
      firstChoice = comparisonPairs[0][0];
      secondChoice = comparisonPairs[0][1];
    } else {
      // this should only happen if makeComparisonPairs failed or list was < 2
      showNextPair(); // handle the empty state
    }

    console.log("films loaded:", listOfItems);
    console.log("comparison pairs ready:", comparisonPairs);

    // close the dialog after loading
    filmsDialogOpen = false;
  }
</script>

<main
  class="min-w-vw min-h-dvh flex flex-col gap-16 justify-center items-center p-6 sm:p-12 md:p-24 font-mono"
>
  <picks
    class="flex flex-col sm:flex-row gap-4 sm:gap-12 md:gap-24 items-stretch h-auto sm:h-72 md:h-96 w-full max-w-4xl"
  >
    {#if !complete && comparisonPairs.length > 0}
      <!-- Comparison View -->
      <button
        onmousedown={selectFirstOption}
        class="w-full h-48 sm:h-full grid place-content-center rounded-xl text-center p-4 {firstButtonShrunk
          ? 'scale-[97%]'
          : ''} outline-none hover:outline-red-300 hover:outline-2 transition-all bg-red-100"
        >{firstChoice}</button
      >
      <button
        onmousedown={selectSecondOption}
        class="w-full h-48 sm:h-full grid place-content-center rounded-xl text-center p-4 {secondButtonShrunk
          ? 'scale-[97%]'
          : ''} outline-none hover:outline-blue-300 hover:outline-2 transition-all bg-blue-100"
        >{secondChoice}</button
      >
    {:else if !complete && listOfItems.length < 2}
      <!-- Initial/Not enough items View -->
      <div
        class="flex flex-col gap-2.5 justify-center items-center w-full h-full min-h-48 sm:min-h-full rounded-xl p-4"
      >
        <p class="text-center w-full">add at least 2 films to compare</p>
        <button
          class="text-blue-700 hover:underline"
          onclick={() => {
            filmsDialogOpen = true;
          }}>add films here</button
        >
      </div>
    {:else if complete}
      <!-- Completion View -->
      <div
        class="flex flex-col gap-2.5 justify-center items-center w-full h-full min-h-48 sm:min-h-full rounded-xl p-4"
      >
        <p class="text-xl font-semibold">all comparisons complete! 🎉</p>
        <button
          class="text-blue-700 hover:underline mt-2 text-lg"
          onclick={() => {
            scoresDialogOpen = true;
          }}>show results</button
        >
        <button
          class="text-blue-600 hover:underline mt-2 text-md relative"
          onclick={() => {
            filmsDialogOpen = true;
          }}
          >compare a new list
        </button>
      </div>
    {/if}
  </picks>
  {#if !complete && comparisonPairs.length > 0 && listOfItems.length > 0}
    <!-- Progress indicator -->
    {@const totalPairs = (listOfItems.length * (listOfItems.length - 1)) / 2}
    {@const completedPairs = totalPairs - comparisonPairs.length}
    <p class="text-center text-lg h-fit">
      Comparison {completedPairs + 1} / {totalPairs}
    </p>
  {/if}
</main>

<!-- Leaderboard Dialog -->
<Dialog.Root bind:open={scoresDialogOpen}>
  <Dialog.Trigger
    onmousedown={loadScores}
    class="p-2 rounded-xl border border-gray-200 absolute top-3 left-3 hover:bg-gray-50"
    aria-label="Show Leaderboard"><Leaderboard /></Dialog.Trigger
  >
  <Dialog.Content class="font-mono">
    <Dialog.Header>
      <Dialog.Title>Scores</Dialog.Title>
      <Dialog.Description>
        Ranked list of films based on comparison wins.
      </Dialog.Description>
    </Dialog.Header>
    {#if Object.keys(scores).length === 0}
      <p class="text-center py-4">
        No comparisons made yet or no films loaded.
      </p>
    {:else}
      <div
        class="border border-gray-200 rounded-xl px-4 py-3 max-h-64 overflow-y-auto"
      >
        {#each Object.entries(scores).sort((a, b) => b[1] - a[1]) as [film, score], i (film)}
          <div
            class="flex justify-between py-1 border-b border-gray-100 last:border-b-0"
          >
            <p>{i + 1}. {film}</p>
            <p>{score}</p>
          </div>
        {/each}
      </div>
    {/if}
    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="outline" class="w-full font-mono rounded-xl"
          >Close</Button
        >
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Load Films Dialog -->
<Dialog.Root bind:open={filmsDialogOpen}>
  <Dialog.Trigger
    class="py-2 px-3 rounded-xl border border-gray-200 absolute top-3 left-16 font-mono hover:bg-gray-50"
    >Load Films</Dialog.Trigger
  >
  <Dialog.Content class="font-mono">
    <Dialog.Header>
      <Dialog.Title class="font-mono">Add Films</Dialog.Title>
      <Dialog.Description class="font-sans"
        >Enter each film on a new line. Duplicates will be ignored.</Dialog.Description
      >
    </Dialog.Header>
    <textarea
      name="films-input"
      id="films-input"
      style="field-sizing: content;"
      bind:value={filmsInput}
      placeholder="e.g.&#10;Inception&#10;The Matrix&#10;Parasite"
      class="font-mono rounded-xl border border-gray-200 focus:outline-none px-3 py-2 text-sm min-h-32 max-h-64 w-full"
    ></textarea>
    <Dialog.Footer>
      <Button
        variant="outline"
        class="w-full font-mono rounded-xl"
        onclick={loadFilms}
      >
        Load & Compare</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
