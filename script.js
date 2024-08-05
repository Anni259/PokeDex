const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon?limit=25";

let pokemonData = [];
let currentPokemonIndex = 0;
let numberOfDisplayedPokemon = 25;

const POKEDEX = document.getElementById("pokedex");

const TYPE_TRANSLATIONS = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  electric: "Elektro",
  grass: "Pflanze",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
};

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

async function renderAllPokemon(){
  await fetchPokemonData();
  sortPokemonData();
  translate();
  displayPokemon();
}

function loadMorePokemon(){
  numberOfDisplayedPokemon += 25;
  renderAllPokemon();
}

async function fetchPokemonData() {
  try {
    let response = await fetch(POKE_API_URL+"&offset="+(numberOfDisplayedPokemon-25));
    let data = await response.json();
    let pokemonFetchDetails = await fetchAllPokemonDetails(data.results);
    pokemonFetchDetails.forEach((pokemon) => pokemonData.push(pokemon));
  
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Daten:", error);
  }
}

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

async function fetchAndCombinePokemonDetails(pokemon) {
  const basicData = await fetchData(pokemon.url);
  const speciesData = await fetchData(basicData.species.url);
  const evolutionData = await fetchEvolutionChain(speciesData.evolution_chain.url);
  addNamesToEvolutionChain(evolutionData.chain);
  const details = combinePokemonDetails(basicData, speciesData, evolutionData);

  return {
    name: pokemon.name,
    url: pokemon.url,
    details: details,
  };
}

async function fetchAllPokemonDetails(results) {
  let detailedPokemonData = [];

  for (let i = 0; i < results.length; i++) {
    let pokemon = results[i];
    try {
      let pokemonDetails = await fetchAndCombinePokemonDetails(pokemon);
      detailedPokemonData.push(pokemonDetails);
    } catch (error) {
      console.error(
        `Fehler beim Abrufen der Details für Pokémon ${pokemon.name}:`, error);
    }
  }
  return detailedPokemonData;
}

async function fetchPokemonImage(pokemonName) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  const data = await response.json();
  return data.sprites.other["official-artwork"].front_default;
}

async function fetchEvolutionChain(evolutionChainUrl) {
  try {
    const response = await fetch(evolutionChainUrl);
    const evolutionData = await response.json();

    async function addImagesToChain(chain) {
      chain.species.imageUrl = await fetchPokemonImage(chain.species.name);
      for (let i = 0; i < chain.evolves_to.length; i++) {
        await addImagesToChain(chain.evolves_to[i]);
      }
    }

    await addImagesToChain(evolutionData.chain);

    return evolutionData;
  } catch (error) {
    console.error("Fehler beim Abrufen der Evolutionskette:", error);
  }
}
function combinePokemonDetails(basicData, speciesData, evolutionData) {
  return {
    id: basicData.id,
    name: basicData.name,
    height: basicData.height,
    weight: basicData.weight,
    types: basicData.types,
    speciesData: speciesData,
    stats: basicData.stats,
    imageUrl: basicData.sprites.other["official-artwork"].front_default,
    evolutionChain: evolutionData,
  };
}

function sortPokemonData() {
  pokemonData.sort((a, b) => a.details.id - b.details.id);
}

function addNamesToEvolutionChain(stage) {
  if (!stage.species.names) {
    // Fetch species data if names are not already present
    fetchData(
      `https://pokeapi.co/api/v2/pokemon-species/${stage.species.name}/`
    )
      .then((speciesData) => {
        stage.species.names = speciesData.names;
        stage.evolves_to.forEach(addNamesToEvolutionChain);
      })
      .catch((error) =>
        console.error("Fehler beim Abrufen der Spezies-Daten:", error)
      );
  } else {
    stage.evolves_to.forEach(addNamesToEvolutionChain);
  }
}

function translateName(names) {
  const germanNameEntry = names.find((name) => name.language.name === "de");
  if (germanNameEntry) {
    return germanNameEntry.name;
  } else {
    return "";
  }
}

function translateTypes(types) {
  types.forEach((type) => {
    type.type.name_de = TYPE_TRANSLATIONS[type.type.name];
  });
}

function translateEvolutionChain(evolutionChain) {
  if (!evolutionChain) return;
  const translateStage = (stage) => {
    if (stage.species && stage.species.names) {
      stage.species.name_de = translateName(stage.species.names);
    }
    stage.evolves_to.forEach(translateStage);
  };
  translateStage(evolutionChain.chain);
}

function translate() {
  pokemonData.forEach((pokemon) => {
    pokemon.details.name_de = translateName(pokemon.details.speciesData.names);
    translateTypes(pokemon.details.types);
    translateEvolutionChain(pokemon.details.evolutionChain);
  });
}

function getPokemonTypesHTML(types) {
  return types.map((type) =>
        `<span class="pokemon-type" style="background-color: ${TYPE_COLORS[type.type.name]}">${type.type.name_de}</span>`).join("");
}

function generatePokemonCardHTML(pokemonId, pokemonName, backgroundColor, typesHTML, imageUrl, index) {
  return `
    <div onclick="openPokemonCard(${index})" class="pokemon" style="background: ${backgroundColor}">
      <p class="ID"># ${pokemonId}</p>
      <h2>${pokemonName}</h2>
      <img src="${imageUrl}" alt="${pokemonName}">
      <div class="pokemon-types">${typesHTML}</div>
    </div>
  `;
}

function renderPokemonCard(pokemon, index) {
  const pokemonId = pokemon.details.id.toString().padStart(4, "0");
  const pokemonName = pokemon.details.name_de || pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const backgroundColor = getTypeColors(pokemon.details.types);
  const typesHTML = getPokemonTypesHTML(pokemon.details.types);
  const imageUrl = pokemon.details.imageUrl; // Bild-URL aus den Details

  return generatePokemonCardHTML(pokemonId,pokemonName,backgroundColor,typesHTML,imageUrl,index);
}

function getTypeColors(types) {
  if (types.length === 1) {
    return `linear-gradient(45deg, ${TYPE_COLORS[types[0].type.name]}, ${
      TYPE_COLORS[types[0].type.name]
    })`;
  } else {
    const color1 = TYPE_COLORS[types[0].type.name];
    const color2 = TYPE_COLORS[types[1].type.name];
    return `linear-gradient(45deg, ${color1}, ${color2})`;
  }
}

function applyTypeColorsToBorder(pokemon) {
  const cardContainer = document.querySelector(".card-container");
  const typeColors = getTypeColors(pokemon.details.types);

  cardContainer.style.borderImage = typeColors;
  cardContainer.style.borderImageSlice = 1;
}

function displayPokemon() {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";

  for (let i = 0; i < pokemonData.length; i++) {
    const pokemon = pokemonData[i];
    container.innerHTML += renderPokemonCard(pokemon, i);
  }
}

function openPokemonCard(index) {
  const currentPokemon = pokemonData[index];
  currentPokemonIndex = index;

  applyTypeColorsToBorder(currentPokemon);

  document.getElementById("pokemonName").innerHTML = currentPokemon.details.name_de;
  document.getElementById("pokemon-card-img").src = currentPokemon.details.imageUrl;
  document.getElementById("home-tab-pane").innerHTML = generateAbout(currentPokemon);
  document.getElementById("profile-tab-pane").innerHTML = generateStats(currentPokemon);
  document.getElementById("evolution").innerHTML = generateEvolution(currentPokemon.details.evolutionChain);
  document.getElementById("pokemonCard").classList.remove("d-none");
}

function closePokemonCard() {
  document.getElementById("pokemonCard").classList.add("d-none");
}

function prevPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--;
    openPokemonCard(currentPokemonIndex);
  }
}

function nextPokemon() {
  if (currentPokemonIndex < pokemonData.length - 1) {
    currentPokemonIndex++;
    openPokemonCard(currentPokemonIndex);
  }
}

function generateAbout(currentPokemon){
  let germanDescription = currentPokemon.details.speciesData.flavor_text_entries.find((entry) => entry.language.name === "de").flavor_text;
  return `
    <br>
    <div class="d-flex justify-content-evenly">
      <div class="d-flex flex-column align-items-center">
        <img class="icon" src="./img/height.png" alt="Icon height">
        <h3>${(currentPokemon.details.height / 10).toFixed(2).replace(".", ",")} m</h3>
      </div>
      <div class="d-flex flex-column align-items-center">
        <img class="icon" src="./img/weight.png" alt="Icon weight">
        <h3>${(currentPokemon.details.weight / 10).toFixed(2).replace(".", ",")} kg</h3>
      </div>
    </div>
    <br>
    <p class="description">${germanDescription}</p>
  `;
}

function generateStats(currentPokemon){
  return `
    <div id="statsHp" class="statsHp d-flex flex-row align-items-center">
      <div class="statsTitle">
       <p>KP</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${
        currentPokemon.details.stats[0].base_stat
      }" aria-valuemin="0" aria-valuemax="255">
        <div class="progress-bar text-bg-warning" style="width: ${
          (currentPokemon.details.stats[0].base_stat / 255) * 100
        }%">${currentPokemon.details.stats[0].base_stat}</div> 
      </div>
    </div>
    <div id="statsAttack"class="statsAttack d-flex flex-row align-items-center">
      <div class="statsTitle">
       <p>Angriff</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${
        currentPokemon.details.stats[1].base_stat
      }" aria-valuemin="0" aria-valuemax="255">
        <div class="progress-bar text-bg-warning" style="width: ${
          (currentPokemon.details.stats[1].base_stat / 255) * 100
        }%">${currentPokemon.details.stats[1].base_stat}</div>
      </div>
    </div>
    <div id="statsDefense" class="statsDefense d-flex flex-row align-items-center">
      <div class="statsTitle">
        <p>Verteidigung</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${
        currentPokemon.details.stats[2].base_stat
      }" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${
          (currentPokemon.details.stats[2].base_stat / 255) * 100
        }%">${currentPokemon.details.stats[2].base_stat}</div>
      </div>
    </div>
    <div id="statsSpecialAttack" class="statsSpecialAttack d-flex flex-row align-items-center">
      <div class="statsTitle">
       <p>Spez.Angriff</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${
        currentPokemon.details.stats[3].base_stat
      }" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${
          (currentPokemon.details.stats[3].base_stat / 255) * 100
        }%">${currentPokemon.details.stats[3].base_stat}</div>
      </div>
    </div>
    <div id="statsSpecialDefense" class="statsSpecialDefense d-flex flex-row align-items-center">
      <div class="statsTitle">
        <p>Spez.Verteidigung</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${
        currentPokemon.details.stats[4].base_stat
      }" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${
          (currentPokemon.details.stats[4].base_stat / 255) * 100
        }%">${currentPokemon.details.stats[4].base_stat}</div>
      </div>
    </div>
    <div id="statsSpeed" class="statsSpeed d-flex flex-row align-items-center">
      <div class="statsTitle">
        <p>Initiative</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${
        currentPokemon.details.stats[5].base_stat
      }" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${
          (currentPokemon.details.stats[5].base_stat / 255) * 100
        }%">${currentPokemon.details.stats[5].base_stat}</div>
      </div>
    </div>
    <div class="d-flex justify-content-end" style="font-size: 12px">
      <i>*Der Maximalwert beträgt 255</i>
    </div>
  `;
}

function generateEvolution(evolutionChain) {
  let htmlContent = "";
  let currentStage = evolutionChain.chain;

  function addStageToChain(stage) {
    const germanName = translateName(stage.species.names);
    const imageUrl = stage.species.imageUrl;

    htmlContent += `
      <div class="evolution-stage d-flex flex-column align-items-center">
        <br>
        <img class="evolution-img" src="${imageUrl}" alt="${germanName}" style="height:100px">
        <p class="evolution-title">${germanName}</p>
      </div>
    `;

    if (stage.evolves_to.length > 0) {
      addStageToChain(stage.evolves_to[0]);
    }
  }

  addStageToChain(currentStage);
  return htmlContent;
}

function searchPokemon(query) {
  if (query.length >= 3) {
    const searchedPokemon = pokemonData.filter((pokemon) =>
      pokemon.details.name_de
        ? pokemon.details.name_de.toLowerCase().includes(query.toLowerCase())
        : pokemon.name.toLowerCase().includes(query.toLowerCase())
    );
    displaySearchedPokemon(searchedPokemon);
  } else {
    displayPokemon();
  }
}

function displaySearchedPokemon(searchedPokemon) {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";

  if (searchedPokemon.length === 0){
    container.innerHTML = '<h2>Kein Pokemon gefunden!</h2>';
  } else {
    for (let i = 0; i < searchedPokemon.length; i++) {
      const pokemon = searchedPokemon[i];
      container.innerHTML += renderPokemonCard(pokemon,pokemonData.indexOf(pokemon)); 
    }
  }
}
 
const searchInput = document.getElementById("input");
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchPokemon(event.target.value);
  }
});
