function generatePokemonCardHTML(
  pokemonId,
  pokemonName,
  backgroundColor,
  typesHTML,
  imageUrl,
  index
) {
  return `
    <div onclick="openPokemonCard(${index})" class="pokemon" style="background: ${backgroundColor}">
      <p class="ID"># ${pokemonId}</p>
      <h2>${pokemonName}</h2>
      <img src="${imageUrl}" alt="${pokemonName}">
      <div class="pokemon-types">${typesHTML}</div>
    </div>
  `;
}

function generateAbout(currentPokemon) {
  let germanDescription =
    currentPokemon.details.speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === "de"
    ).flavor_text;
  return `
    <br>
    <div class="d-flex justify-content-evenly">
      <div class="d-flex flex-column align-items-center">
        <img class="icon" src="./img/height.png" alt="Icon height">
        <br>
        <h3>${(currentPokemon.details.height / 10)
          .toFixed(2)
          .replace(".", ",")} m</h3>
      </div>
      <div class="d-flex flex-column align-items-center">
        <img class="icon" src="./img/weight.png" alt="Icon weight">
        <br>
        <h3>${(currentPokemon.details.weight / 10)
          .toFixed(2)
          .replace(".", ",")} kg</h3>
      </div>
    </div>
    <br>
    <p class="description">${germanDescription}</p>
  `;
}

function generateStats(currentPokemon) {
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

function generateEvolution(germanName, imageUrl) {
  return `
      <div class="evolution-stage d-flex flex-column align-items-center">
        <br>
        <img class="evolution-img" src="${imageUrl}" alt="${germanName}" style="height:100px">
        <p class="evolution-title">${germanName}</p>
      </div>
    `;
}