// Sizzle & Serve — the menu: ingredients and dishes.
// Every dish is an exact set of ingredients; order on the plate does not
// matter, which keeps the game about reading tickets fast, not memorising
// sequences. A wrong ingredient can be trashed, never served.

export const INGREDIENTS = [
  { id: 'bun',      name: 'Bun',      key: '1', color: '#e8a94e', dark: '#b97d2a' },
  { id: 'patty',    name: 'Patty',    key: '2', color: '#7a4a28', dark: '#4e2c14' },
  { id: 'cheese',   name: 'Cheese',   key: '3', color: '#f5c542', dark: '#c9920e' },
  { id: 'lettuce',  name: 'Lettuce',  key: '4', color: '#5da24a', dark: '#35702a' },
  { id: 'tomato',   name: 'Tomato',   key: '5', color: '#d8443a', dark: '#96221c' },
  { id: 'onion',    name: 'Onion',    key: '6', color: '#c9a7d8', dark: '#8a5fa8' },
  { id: 'tortilla', name: 'Tortilla', key: '7', color: '#e8cf96', dark: '#b3945a' },
  { id: 'sauce',    name: 'Sauce',    key: '8', color: '#e2703a', dark: '#a34a1d' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const DISHES = [
  { id: 'burger', name: 'Burger', price: 12, recipe: ['bun', 'patty', 'cheese', 'lettuce'] },
  { id: 'taco',   name: 'Taco',   price: 10, recipe: ['tortilla', 'patty', 'tomato', 'sauce'] },
  { id: 'salad',  name: 'Salad',  price: 9,  recipe: ['lettuce', 'tomato', 'onion', 'sauce'] },
  { id: 'melt',   name: 'Cheesy Melt', price: 11, recipe: ['bun', 'cheese', 'patty', 'tomato'] },
  { id: 'wrap',   name: 'Veggie Wrap', price: 10, recipe: ['tortilla', 'lettuce', 'onion', 'cheese'] },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

// Same set, ignoring order: a plate matches an order only when it holds
// exactly the dish's ingredients, no more and no fewer.
export function plateMatches(plate, recipe) {
  if (plate.length !== recipe.length) return false;
  const have = [...plate].sort().join(',');
  return have === [...recipe].sort().join(',');
}
