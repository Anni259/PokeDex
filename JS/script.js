const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon?limit=25";

let pokemonData = [];
let currentPokemonIndex = 0;
let numberOfDisplayedPokemon = 25;

const POKEDEX = document.getElementById("pokedex");

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
const pokemonDataCache = {};

async function fetchPokemonData() {
  try {
    let response = await fetch(
      POKE_API_URL + "&offset=" + (numberOfDisplayedPokemon - 25)
    );
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
  if (pokemonDataCache[pokemon.name]) {
    return pokemonDataCache[pokemon.name];
  }

  const basicData = await fetchData(pokemon.url);
  const speciesDataPromise = fetchData(basicData.species.url);
  const speciesData = await speciesDataPromise;

  const evolutionDataPromise = fetchEvolutionChain(
    speciesData.evolution_chain.url
  );
  const evolutionData = await evolutionDataPromise;

  addNamesToEvolutionChain(evolutionData.chain);

  const details = combinePokemonDetails(basicData, speciesData, evolutionData);

  const pokemonDetails = {
    name: pokemon.name,
    url: pokemon.url,
    details: details,
  };

  pokemonDataCache[pokemon.name] = pokemonDetails;

  return pokemonDetails;
}

async function fetchAllPokemonDetails(results) {
  const detailedPokemonData = await Promise.all(results.map(fetchAndCombinePokemonDetails));
  return detailedPokemonData;
}

const imageCache = {};

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

async function addImagesToChain(chain) {
  if (!chain.species.imageUrl) {
    chain.species.imageUrl = await fetchPokemonImage(chain.species.name);
  }
  for (let i = 0; i < chain.evolves_to.length; i++) {
    await addImagesToChain(chain.evolves_to[i]);
  }
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

async function addNamesToEvolutionChain(stage) {
  if (!stage.species.names) {
    const speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${stage.species.name}/`);
    stage.species.names = speciesData.names;
    for (let i = 0; i < stage.evolves_to.length; i++) {
      await addNamesToEvolutionChain(stage.evolves_to[i]);
    }
  } else {
    for (let i = 0; i < stage.evolves_to.length; i++) {
      await addNamesToEvolutionChain(stage.evolves_to[i]);
    }
  }
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
  document.getElementById("evolution").innerHTML = renderEvolution(currentPokemon.details.evolutionChain);
  document.getElementById("pokemonCard").classList.remove("d-none");
  document.getElementById("body").classList.add("overflow");
}

function closePokemonCard() {
  document.getElementById("pokemonCard").classList.add("d-none");
  document.getElementById("body").classList.remove("overflow");
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

function renderEvolution(evolutionChain) {
  let htmlContent = "";
  let currentStage = evolutionChain.chain;

  while (currentStage) {
    const germanName = translateName(currentStage.species.names);
    const imageUrl = currentStage.species.imageUrl;

    htmlContent += generateEvolution(germanName, imageUrl);

    if (currentStage.evolves_to.length > 0) {
      currentStage = currentStage.evolves_to[0];
    } else {
      break;
    }
  }
  return htmlContent;
}