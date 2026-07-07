const drinkSizes = [
  { name: 'Small', additionalPrice: 0 },
  { name: 'Medium', additionalPrice: 3000 },
  { name: 'Large', additionalPrice: 6000 },
]

const regularSize = [
  { name: 'Regular', additionalPrice: 0 },
]

const sugarOptions = ['Normal Sugar', 'Less Sugar', 'No Sugar']

const iceOptions = ['Normal Ice', 'Less Ice', 'No Ice']

const coffeeAddOns = [
  { name: 'Extra Shot', price: 5000 },
  { name: 'Vanilla Syrup', price: 4000 },
  { name: 'Caramel Syrup', price: 4000 },
  { name: 'Oat Milk', price: 6000 },
]

const nonCoffeeAddOns = [
  { name: 'Vanilla Syrup', price: 4000 },
  { name: 'Caramel Syrup', price: 4000 },
  { name: 'Whipped Cream', price: 5000 },
  { name: 'Oat Milk', price: 6000 },
]

export const products = [
  {
    id: 1,
    name: 'Espresso',
    category: 'Espresso',
    price: 18000,
    image: '☕',
    description: 'Kopi pekat dengan rasa kuat dan aroma khas.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced'],
    sugarOptions,
    iceOptions,
    addOnOptions: [
      { name: 'Extra Shot', price: 5000 },
    ],
  },
  {
    id: 2,
    name: 'Americano',
    category: 'Espresso',
    price: 20000,
    image: '☕',
    description: 'Espresso dengan tambahan air panas.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced'],
    sugarOptions,
    iceOptions,
    addOnOptions: coffeeAddOns,
  },
  {
    id: 3,
    name: 'Caffe Latte',
    category: 'Espresso',
    price: 25000,
    image: '🥛',
    description: 'Espresso, susu, dan foam lembut.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced', 'Blend'],
    sugarOptions,
    iceOptions,
    addOnOptions: coffeeAddOns,
  },
  {
    id: 4,
    name: 'Cappuccino',
    category: 'Espresso',
    price: 24000,
    image: '☕',
    description: 'Espresso dengan susu dan foam tebal.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced'],
    sugarOptions,
    iceOptions,
    addOnOptions: coffeeAddOns,
  },
  {
    id: 5,
    name: 'Manual Brew',
    category: 'Manual Brew',
    price: 28000,
    image: '🫖',
    description: 'Seduhan manual dengan karakter rasa yang lebih kompleks.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced'],
    sugarOptions: [],
    iceOptions,
    addOnOptions: [
      { name: 'Extra Coffee', price: 6000 },
    ],
  },
  {
    id: 6,
    name: 'Chocolate',
    category: 'Non-Coffee',
    price: 23000,
    image: '🍫',
    description: 'Minuman coklat lembut dan manis.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced', 'Blend'],
    sugarOptions,
    iceOptions,
    addOnOptions: nonCoffeeAddOns,
  },
  {
    id: 7,
    name: 'Matcha Latte',
    category: 'Non-Coffee',
    price: 26000,
    image: '🍵',
    description: 'Matcha creamy dengan susu segar.',
    sizeOptions: drinkSizes,
    temperatureOptions: ['Hot', 'Iced', 'Blend'],
    sugarOptions,
    iceOptions,
    addOnOptions: nonCoffeeAddOns,
  },
  {
    id: 8,
    name: 'Croissant',
    category: 'Makanan',
    price: 22000,
    image: '🥐',
    description: 'Pastry renyah cocok untuk teman kopi.',
    sizeOptions: regularSize,
    temperatureOptions: [],
    sugarOptions: [],
    iceOptions: [],
    addOnOptions: [
      { name: 'Butter Extra', price: 3000 },
      { name: 'Chocolate Dip', price: 4000 },
    ],
  },
]