const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon?limit=25";
const POKEDEX = document.getElementById("pokedex");
const pokemonDataCache = {};
const imageCache = {};

let pokemonData = [];
let currentPokemonIndex = 0;
let numberOfDisplayedPokemon = 25;

async function renderAllPokemon(){
  await fetchPokemonData();
  sortPokemonData();
  translate();
  displayPokemon();
}

async function fetchPokemonData() {
  try {
    let response = await fetch(POKE_API_URL + "&offset=" + (numberOfDisplayedPokemon - 25));
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

async function fetchBasicDataAndSpecies(pokemon) {
  const basicData = await fetchData(pokemon.url);
  const speciesData = await fetchData(basicData.species.url);
  return { basicData, speciesData };
}

async function fetchAllPokemonDetails(results) {
  return Promise.all(results.map(fetchAndCombinePokemonDetails));
}

async function fetchPokemonImage(pokemonName) {
  if (imageCache[pokemonName]) {
    return imageCache[pokemonName];
  }

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  const data = await response.json();
  const imageUrl = data.sprites.other["official-artwork"].front_default;

  imageCache[pokemonName] = imageUrl;

  return imageUrl;
}

async function fetchAndCombinePokemonDetails(pokemon) {
  if (pokemonDataCache[pokemon.name]) {
    return pokemonDataCache[pokemon.name];
  }

  const { basicData, speciesData } = await fetchBasicDataAndSpecies(pokemon);
  const evolutionData = await fetchEvolutionData(speciesData);
  const details = createPokemonDetails(basicData, speciesData, evolutionData);

  const pokemonDetails = {
    name: pokemon.name,
    url: pokemon.url,
    details: details,
  };

  pokemonDataCache[pokemon.name] = pokemonDetails;
  return pokemonDetails;
}

async function fetchEvolutionData(speciesData) {
  const evolutionData = await fetchEvolutionChain(
    speciesData.evolution_chain.url
  );
  addNamesToEvolutionChain(evolutionData.chain);
  return evolutionData;
}

async function fetchEvolutionChain(evolutionChainUrl) {
  try {
    const response = await fetch(evolutionChainUrl);
    const evolutionData = await response.json();
    await addImagesToChain(evolutionData.chain);
    return evolutionData;
  } catch (error) {
    console.error("Fehler beim Abrufen der Evolutionskette:", error);
  }
}

async function addNamesToEvolutionChain(stage) {
  if (!stage.species.names) {
    try {
      const speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${stage.species.name}/`);
      stage.species.names = speciesData.names;
    } catch (error) {
      console.error("Fehler beim Abrufen der Spezies-Daten:", error.message);
    }
  }

  await Promise.all(stage.evolves_to.map((evolve) => addNamesToEvolutionChain(evolve)));
}

function renderEvolution(evolutionChain) {
  const generateEvolutionChain = (stage) => {
    if (!stage) return "";

    const germanName = translateName(stage.species.names);
    const imageUrl = stage.species.imageUrl;
    const evolutionHTML = generateEvolution(germanName, imageUrl);

    return (evolutionHTML +(stage.evolves_to.length > 0
      ? generateEvolutionChain(stage.evolves_to[0])
      : "")
    );
  };
  return generateEvolutionChain(evolutionChain.chain);
}

function createPokemonDetails(basicData, speciesData, evolutionData) {
  return combinePokemonDetails(basicData, speciesData, evolutionData);
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

async function addImagesToChain(chain) {
  if (!chain.species.imageUrl) {
    chain.species.imageUrl = await fetchPokemonImage(chain.species.name);
  }
  for (let i = 0; i < chain.evolves_to.length; i++) {
    await addImagesToChain(chain.evolves_to[i]);
  }
}

function sortPokemonData() {
  pokemonData.sort((a, b) => a.details.id - b.details.id);
}

function getPokemonTypesHTML(types) {
  return types.map((type) =>
    `<span class="pokemon-type" style="background-color: ${TYPE_COLORS[type.type.name]}">${type.type.name_de}</span>`).join("");
}

function renderPokemonCard(pokemon, index) {
  const pokemonId = pokemon.details.id.toString().padStart(4, "0");
  const pokemonName = pokemon.details.name_de || pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const backgroundColor = getTypeColors(pokemon.details.types);
  const typesHTML = getPokemonTypesHTML(pokemon.details.types);
  const imageUrl = pokemon.details.imageUrl; // Bild-URL aus den Details

  return generatePokemonCardHTML(pokemonId,pokemonName,backgroundColor,typesHTML,imageUrl,index);
}

function displayPokemon() {
  const container = document.getElementById("pokedex");
  container.innerHTML = pokemonData.map((pokemon, i) => renderPokemonCard(pokemon, i)).join("");
}


function openPokemonCard(index) {
  const currentPokemon = pokemonData[index];
  currentPokemonIndex = index;

  applyTypeColorsToBorder(currentPokemon);

  document.getElementById("pokemonName").innerHTML = currentPokemon.details.name_de;
  document.getElementById("pokemon-card-img").src = currentPokemon.details.imageUrl;
  document.getElementById("home-tab-pane").innerHTML = generateAbout(currentPokemon);
  document.getElementById("profile-tab-pane").innerHTML = generateStats(currentPokemon);
  document.getElementById("evolution").innerHTML = renderEvolution(currentPokemon.details.evolutionChain);
  document.getElementById("pokemonCard").classList.remove("d-none");
  document.getElementById("body").classList.add("overflow");

  updateButtonVisibility();
}

function closePokemonCard() {
  document.getElementById("pokemonCard").classList.add("d-none");
  document.getElementById("body").classList.remove("overflow");
}

function loadMorePokemon(){
  numberOfDisplayedPokemon += 25;
  renderAllPokemon();
}

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

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

function updateButtonVisibility() {
  if (currentPokemonIndex === 0) {
    prevButton.style.display = "none"; 
  } else {
    prevButton.style.display = "block"; 
  }

  if (currentPokemonIndex === pokemonData.length - 1) {
    nextButton.style.display = "none"; 
  } else {
    nextButton.style.display = "block";
  }
}

updateButtonVisibility();