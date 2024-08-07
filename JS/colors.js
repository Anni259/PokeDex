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