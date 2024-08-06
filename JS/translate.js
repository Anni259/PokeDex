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
