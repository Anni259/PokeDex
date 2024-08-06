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

  if (searchedPokemon.length === 0) {
    container.innerHTML = "<h2>Kein Pokemon gefunden!</h2>";
  } else {
    for (let i = 0; i < searchedPokemon.length; i++) {
      const pokemon = searchedPokemon[i];
      container.innerHTML += renderPokemonCard(
        pokemon,
        pokemonData.indexOf(pokemon)
      );
    }
  }
}

const searchInput = document.getElementById("input");
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchPokemon(event.target.value);
    event.target.value = "";
  }
});
