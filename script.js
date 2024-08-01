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

function combinePokemonDetails(basicData, speciesData) {
  return {
    id: basicData.id,
    name: basicData.name,
    height: basicData.height,
    weight: basicData.weight,
    types: basicData.types,
    speciesData: speciesData,
    stats: basicData.stats,
    imageUrl: basicData.sprites.other["official-artwork"].front_default, // Hinzufügen der Bild-URL
  };
}

async function fetchAndCombinePokemonDetails(pokemon) {
  const basicData = await fetchData(pokemon.url);
  const speciesData = await fetchData(basicData.species.url);
  const details = combinePokemonDetails(basicData, speciesData);

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

function sortPokemonData() {
  pokemonData.sort((a, b) => a.details.id - b.details.id);
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
  types.forEach((type) => {type.type.name_de = TYPE_TRANSLATIONS[type.type.name];});
}

function translate() {
  pokemonData.forEach((pokemon) => {pokemon.details.name_de = translateName(pokemon.details.speciesData.names);
    translateTypes(pokemon.details.types);
  });
}

function getPokemonTypesHTML(types) {
  return types.map((type) =>
        `<span class="pokemon-type" style="background-color: ${TYPE_COLORS[type.type.name]}">${type.type.name_de}</span>`).join("");
}

function generatePokemonCardHTML(pokemonId,pokemonName, backgroundColor,typesHTML,imageUrl,index) {
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
  const pokemonId = pokemon.details.id.toString().padStart(3, "0");
  const pokemonName = pokemon.details.name_de || pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const backgroundColor = getTypeColors(pokemon.details.types);
  const typesHTML = getPokemonTypesHTML(pokemon.details.types);
  const imageUrl = pokemon.details.imageUrl; // Bild-URL aus den Details

  return generatePokemonCardHTML(pokemonId,pokemonName,backgroundColor,typesHTML,imageUrl,index);
}

function getTypeColors(types) {
  if (types.length === 1) {
    return TYPE_COLORS[types[0].type.name];
  } else {
    const color1 = TYPE_COLORS[types[0].type.name];
    const color2 = TYPE_COLORS[types[1].type.name];
    return `linear-gradient(45deg, ${color1}, ${color2})`;
  }
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
  document.getElementById("pokemonName").innerHTML = currentPokemon.details.name_de;
  document.getElementById("pokemon-card-img").src = currentPokemon.details.imageUrl;
  document.getElementById("home-tab-pane").innerHTML = generateAbout(currentPokemon);
  document.getElementById("profile-tab-pane").innerHTML = generateStats(currentPokemon);
  document.getElementById("contact-tab-pane").innerHTML = generateEvolution(currentPokemon);
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
        <h3>${(currentPokemon.details.height / 10)
          .toFixed(2)
          .replace(".", ",")} m</h3>
      </div>
      <div class="d-flex flex-column align-items-center">
        <img class="icon" src="./img/weight.png" alt="Icon weight">
        <h3>${(currentPokemon.details.weight / 10)
          .toFixed(2)
          .replace(".", ",")} kg</h3>
      </div>
    </div>
    <br>
    <p>${germanDescription}</p>
  `;
}
// ${currentPokemon.details.stats[0].stat.name}

function generateStats(currentPokemon){
  return `
    <div class="statsHp d-flex flex-row align-items-center">
      <div class="statsTitle">
       <p>KP</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${currentPokemon.details.stats[0].base_stat}" aria-valuemin="0" aria-valuemax="255">
        <div class="progress-bar text-bg-warning" style="width: ${(currentPokemon.details.stats[0].base_stat / 255) * 100}%">${currentPokemon.details.stats[0].base_stat}</div> 
      </div>
    </div>
    <div class="statsAttack d-flex flex-row align-items-center">
      <div class="statsTitle">
       <p>Angriff</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${currentPokemon.details.stats[1].base_stat}" aria-valuemin="0" aria-valuemax="255">
        <div class="progress-bar text-bg-warning" style="width: ${(currentPokemon.details.stats[1].base_stat / 255) * 100}%">${currentPokemon.details.stats[1].base_stat}</div>
      </div>
    </div>
    <div class="statsDefense d-flex flex-row align-items-center">
      <div class="statsTitle">
        <p>Verteidigung</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${currentPokemon.details.stats[2].base_stat}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${(currentPokemon.details.stats[2].base_stat / 255) * 100}%">${currentPokemon.details.stats[2].base_stat}</div>
      </div>
    </div>
    <div class="statsSpecialAttack d-flex flex-row align-items-center">
      <div class="statsTitle">
       <p>Spez.Angriff</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${currentPokemon.details.stats[3].base_stat}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${(currentPokemon.details.stats[3].base_stat / 255) * 100}%">${currentPokemon.details.stats[3].base_stat}</div>
      </div>
    </div>
    <div class="statsSpecialDefense d-flex flex-row align-items-center">
      <div class="statsTitle">
        <p>Spez.Verteidigung</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${currentPokemon.details.stats[4].base_stat}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${(currentPokemon.details.stats[4].base_stat / 255) * 100}%">${currentPokemon.details.stats[4].base_stat}</div>
      </div>
    </div>
    <div class="statsSpeed d-flex flex-row align-items-center">
      <div class="statsTitle">
        <p>Initiative</p>
      </div>
      <div class="progress" role="progressbar" aria-label="Warning example" aria-valuenow="${currentPokemon.details.stats[5].base_stat}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar text-bg-warning" style="width: ${(currentPokemon.details.stats[5].base_stat / 255) * 100}%">${currentPokemon.details.stats[5].base_stat}</div>
      </div>
    </div>
    <i>*Der Maximalwert beträgt 255</i>
  `;
}

function generateEvolution(){

}

// Hinzufügen der Suchfunktion
function searchPokemon(query) {
  if (query.length >= 3) {
    const searchedPokemon = pokemonData.filter((pokemon) =>
      pokemon.details.name_de
        ? pokemon.details.name_de.toLowerCase().includes(query.toLowerCase())
        : pokemon.name.toLowerCase().includes(query.toLowerCase())
    );
    displaySearchedPokemon(searchedPokemon);
  } else {
    displayPokemon(); // Zeige alle Pokémon, wenn die Suchanfrage weniger als 3 Zeichen enthält
  }
}

function displaySearchedPokemon(searchedPokemon) {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";

  if (searchedPokemon.length == 0){
    container.innerHTML = '<h2>Kein Pokemon gefunden!</h2>';
  }

  for (let i = 0; i < searchedPokemon.length; i++) {
    const pokemon = searchedPokemon[i];
    container.innerHTML += renderPokemonCard(pokemon, i);
  }
}

// Event Listener für das Suchfeld
const searchInput = document.getElementById("input");
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchPokemon(event.target.value);
  }
});

// let currentPokemonIndex = 0;
// let displayedPokemon = [];

// // Funktion zum Abrufen der Pokémon-Daten
// async function fetchPokemonData() {
//   try {
//     // Abrufen der Daten von der API
//     let response = await fetch(POKE_API_URL);
//     let data = await response.json();
//     let pokemonList = data.results;

//     // Durch die Liste der Pokémon iterieren
//     for (let i = 0; i < pokemonList.length; i++) {
//       let pokemon = pokemonList[i];

//       // Abrufen der Details für jedes Pokémon
//       let response = await fetch(pokemon.url);
//       let pokemonDetails = await response.json();

//       // Abrufen der Spezies-Daten, um den deutschen Namen und die Beschreibung zu erhalten
//       let speciesResponse = await fetch(pokemonDetails.species.url);
//       let speciesData = await speciesResponse.json();

//       // Extrahieren des deutschen Namens
//       let germanName = speciesData.names.find(
//         (name) => name.language.name === "de"
//       ).name;

//       // Extrahieren der deutschen Beschreibung
//       let germanDescription = speciesData.flavor_text_entries.find(
//         (entry) => entry.language.name === "de"
//       ).flavor_text;

//       // Anzeige der Pokémon-Details
//       displayPokemon(pokemonDetails, germanName, germanDescription, i);
//     }
//   } catch (error) {
//     // Fehlerbehandlung, falls etwas schiefgeht
//     console.error("Fehler beim Abrufen der Pokemon-Daten:", error);
//   }
// }

// // Funktion zur Anzeige eines Pokémon
// function displayPokemon(pokemon, germanName, germanDescription, index) {
//   // Speichern der Pokémon-Daten für das Karussell
//   displayedPokemon.push({
//     imgSrc: pokemon.sprites.other["official-artwork"].front_default,
//     name: germanName,
//     height: pokemon.height,
//     weight: pokemon.weight,
//     description: germanDescription.replace(/\n/g, " "),
//   });

//   // Erstellen der HTML-Elemente für die Pokémon-Typen auf Deutsch
//   let pokemonTypes = pokemon.types
//     .map((typeInfo) => {
//       let typeName = typeInfo.type.name;
//       let translatedType = TYPE_TRANSLATIONS[typeName];
//       let typeColor = TYPE_COLORS[typeName];
//       return `<span class="pokemon-type" style="background-color: ${typeColor}">${translatedType}</span>`;
//     })
//     .join("");

//   // Formatieren der ID mit führenden Nullen
//   let formattedId = String(pokemon.id).padStart(4, "0");

//   // Bestimmen der Farben für den Hintergrund basierend auf den Typen
//   let type1Color = TYPE_COLORS[pokemon.types[0].type.name];
//   let type2Color = type1Color;
//   if (pokemon.types.length > 1) {
//     type2Color = TYPE_COLORS[pokemon.types[1].type.name];
//   }
//   let backgroundColor = `linear-gradient(to bottom right, ${type1Color}, ${type2Color})`;

//   // Hinzufügen des Pokémon-Divs zum Pokedex-Element
//   POKEDEX.innerHTML += `
//     <div onclick="openPokemonCard(${index})" class="pokemon" style="background: ${backgroundColor}">
//       <p class="ID"># ${formattedId}</p>
//       <h2>${germanName}</h2>
//       <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${germanName}">
//       <div class="pokemon-types">${pokemonTypes}</div>
//     </div>
//   `;
// }

// // Funktion zum Suchen von Pokémon
// async function searchPokemon(query) {
//   if (query.length < 3) {
//     return;
//   }

//   try {
//     // Abrufen der Daten von der API
//     let response = await fetch(POKE_API_URL);
//     let data = await response.json();
//     let pokemonList = data.results;

//     // Initialisieren eines Arrays, um die gefilterten Pokémon zu speichern
//     let filteredPokemon = [];

//     // Durch die Liste der Pokémon iterieren
//     for (let i = 0; i < pokemonList.length; i++) {
//       let pokemon = pokemonList[i];

//       // Abrufen der Details für jedes Pokémon
//       let response = await fetch(pokemon.url);
//       let pokemonDetails = await response.json();

//       // Abrufen der Spezies-Daten, um den deutschen Namen und die Beschreibung zu erhalten
//       let speciesResponse = await fetch(pokemonDetails.species.url);
//       let speciesData = await speciesResponse.json();

//       // Extrahieren des deutschen Namens
//       let germanName = speciesData.names.find(
//         (name) => name.language.name === "de"
//       ).name;

//       // Extrahieren der deutschen Beschreibung
//       let germanDescription = speciesData.flavor_text_entries.find(
//         (entry) => entry.language.name === "de"
//       ).flavor_text;

//       // Überprüfen, ob der deutsche Name mit der Suchanfrage übereinstimmt
//       if (germanName.toLowerCase().startsWith(query.toLowerCase())) {
//         filteredPokemon.push({ pokemonDetails, germanName, germanDescription });
//       }

//       // Begrenzen auf 10 Pokémon
//       if (filteredPokemon.length >= 10) {
//         break;
//       }
//     }

//     // Leeren des aktuellen Pokedex-Inhalts
//     POKEDEX.innerHTML = "";

//     // Durch die gefilterte Liste der Pokémon iterieren und anzeigen
//     for (let i = 0; i < filteredPokemon.length; i++) {
//       let { pokemonDetails, germanName, germanDescription } = filteredPokemon[i];
//       displayPokemon(pokemonDetails, germanName, germanDescription);
//     }
//   } catch (error) {
//     // Fehlerbehandlung, falls etwas schiefgeht
//     console.error("Fehler beim Abrufen der Pokemon-Daten:", error);
//   }
// }

// // Event Listener für das Suchfeld
// const searchInput = document.getElementById("input");
// searchInput.addEventListener("keypress", function (event) {
//   if (event.key === "Enter") {
//     searchPokemon(event.target.value);
//   }
// });

// // Aufrufen der Funktion zum Abrufen der Pokémon-Daten
// fetchPokemonData();

// function openPokemonCard(index) {
//   currentPokemonIndex = index;
//   const { imgSrc, name, height, weight, description } = displayedPokemon[index];
//   document.getElementById("pokemon-card-img").src = imgSrc;
//   document.getElementById("home-tab-pane").innerHTML = `
//     <br>
//     <h3>Größe: ${(height / 10).toFixed(1).replace(".", ",")} m</h3>
//     <h3>Gewicht: ${(weight / 10).toFixed(1).replace(".", ",")} kg</h3>
//     <br>
//     <p>${description}</p>
//   `;
//   document.getElementById("pokemonCard").classList.remove("d-none");
// }

// function closePokemonCard() {
//   document.getElementById("pokemonCard").classList.add("d-none");
// }

// function prevPokemon(event) {
//   event.stopPropagation();
//   if (currentPokemonIndex > 0) {
//     currentPokemonIndex--;
//     openPokemonCard(currentPokemonIndex);
//   }
// }

// function nextPokemon(event) {
//   event.stopPropagation();
//   if (currentPokemonIndex < displayedPokemon.length - 1) {
//     currentPokemonIndex++;
//     openPokemonCard(currentPokemonIndex);
//   }
// }
