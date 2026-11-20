// Adds sample recipes and two demo accounts. Run with: npm run seed
// It is safe to run more than once: old sample recipes are replaced, and your own data is left alone.
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./models/User");
const Recipe = require("./models/Recipe");
const Comment = require("./models/Comment");
const MealPlan = require("./models/MealPlan");

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

const accounts = [
  { name: "RecipeHub Sample Kitchen", email: "samples@recipehub.local", password: "not-a-login-account", role: "user" },
  { name: "Admin", email: "admin@recipehub.com", password: "Admin@123", role: "admin" },
  { name: "Demo User", email: "demo@recipehub.com", password: "Demo@123", role: "user" },
];

const sampleRecipes = [
  {
    title: "Fluffy Pancakes",
    description: "Thick, soft pancakes made with pantry basics. Good with fruit, honey or maple syrup.",
    category: "Breakfast", prepTime: 10, cookTime: 15, servings: 4,
    imageUrl: photo("1567620905732-2d1ec7ab7445"),
    ingredients: ["1 1/2 cups all-purpose flour", "3 1/2 tsp baking powder", "1 tbsp sugar", "1/4 tsp salt", "1 1/4 cups milk", "1 egg", "3 tbsp melted butter", "Butter or oil for the pan", "Maple syrup or honey, to serve"],
    steps: [
      "Whisk the flour, baking powder, sugar and salt in a large bowl.",
      "In a jug, beat the milk, egg and melted butter together.",
      "Pour the wet mixture into the dry ingredients and stir until just combined. A few lumps are fine.",
      "Heat a non-stick pan over medium heat and brush with a little butter.",
      "Pour in about 1/4 cup of batter per pancake. Cook for 2 to 3 minutes until bubbles appear on the surface.",
      "Flip and cook for another 1 to 2 minutes until golden. Serve warm.",
    ],
  },
  {
    title: "Masala Omelette",
    imageUrl: photo("1510693206972-df098062cb71"),
    description: "A quick Indian-style omelette with onion, tomato, green chilli and coriander.",
    category: "Breakfast", prepTime: 5, cookTime: 5, servings: 2,
    ingredients: ["4 eggs", "1 small onion, finely chopped", "1 small tomato, finely chopped", "1 green chilli, finely chopped", "2 tbsp chopped coriander leaves", "1/4 tsp turmeric powder", "1/2 tsp red chilli powder", "Salt to taste", "1 tbsp oil or butter"],
    steps: [
      "Crack the eggs into a bowl and beat with a pinch of salt.",
      "Add the onion, tomato, green chilli, coriander, turmeric and chilli powder. Mix well.",
      "Heat the oil in a non-stick pan over medium heat.",
      "Pour in the egg mixture and spread it evenly. Cook for 2 minutes until the edges set.",
      "Flip carefully and cook for another minute. Serve hot with toast or roti.",
    ],
  },
  {
    title: "Chana Masala",
    imageUrl: photo("1788602564560-9bcbf0f9acb6"),
    description: "Chickpeas simmered in a spiced tomato and onion gravy. Serve with rice or roti.",
    category: "Lunch", prepTime: 10, cookTime: 30, servings: 4,
    ingredients: ["2 cans (400 g each) chickpeas, drained", "2 tbsp oil", "1 tsp cumin seeds", "2 onions, finely chopped", "1 tbsp ginger-garlic paste", "3 tomatoes, pureed", "1 tsp coriander powder", "1 tsp garam masala", "1/2 tsp turmeric powder", "1 tsp red chilli powder", "Salt to taste", "Fresh coriander, to garnish"],
    steps: [
      "Heat the oil in a pot and add the cumin seeds. Let them sizzle for 30 seconds.",
      "Add the onions and cook for 8 to 10 minutes until golden brown.",
      "Stir in the ginger-garlic paste and cook for 1 minute.",
      "Add the tomato puree, coriander, turmeric, chilli powder and salt. Cook for 8 minutes until the oil separates.",
      "Add the chickpeas and 1 cup of water. Simmer for 10 to 12 minutes, mashing a few chickpeas to thicken the gravy.",
      "Stir in the garam masala and garnish with coriander.",
    ],
  },
  {
    title: "Paneer Butter Masala",
    imageUrl: photo("1603894584373-5ac82b2ae398"),
    description: "Soft paneer cubes in a smooth, mildly sweet tomato and cashew gravy.",
    category: "Dinner", prepTime: 15, cookTime: 25, servings: 4,
    ingredients: ["250 g paneer, cubed", "3 large tomatoes, chopped", "10 cashews", "1 onion, chopped", "2 tbsp butter", "1 tbsp ginger-garlic paste", "1 tsp kashmiri red chilli powder", "1 tsp garam masala", "1 tsp dried fenugreek leaves", "1/4 cup cream", "1 tsp sugar", "Salt to taste"],
    steps: [
      "Boil the tomatoes, onion and cashews in 1 cup of water for 10 minutes. Cool and blend into a smooth puree.",
      "Melt 1 tbsp butter in a pan and cook the ginger-garlic paste for 1 minute.",
      "Pour in the puree, add the chilli powder, sugar and salt. Simmer for 10 minutes, stirring now and then.",
      "Add the paneer cubes and 1/2 cup water. Cook for 5 minutes.",
      "Stir in the remaining butter, garam masala, crushed fenugreek leaves and cream. Serve with naan or rice.",
    ],
  },
  {
    title: "Spaghetti Aglio e Olio",
    description: "A classic Italian pasta with garlic, olive oil and chilli. Ready in 20 minutes.",
    category: "Dinner", prepTime: 5, cookTime: 15, servings: 2,
    imageUrl: photo("1473093295043-cdd812d0e601"),
    ingredients: ["200 g spaghetti", "5 cloves garlic, thinly sliced", "1/3 cup olive oil", "1/2 tsp red chilli flakes", "2 tbsp chopped parsley", "Salt to taste", "Grated parmesan, optional"],
    steps: [
      "Boil the spaghetti in well-salted water until al dente. Save 1/2 cup of the pasta water, then drain.",
      "While the pasta cooks, warm the olive oil in a large pan over low heat.",
      "Add the garlic and cook gently for 2 to 3 minutes until pale golden. Do not let it burn.",
      "Add the chilli flakes, then the drained spaghetti and a splash of pasta water.",
      "Toss for 1 minute until the sauce coats the pasta. Add the parsley and serve with parmesan if you like.",
    ],
  },
  {
    title: "Creamy Tomato Soup",
    description: "A smooth tomato soup with a little cream. Good with buttered toast.",
    category: "Soup", prepTime: 10, cookTime: 30, servings: 4,
    imageUrl: photo("1692776407523-8f3c4678ad36"),
    ingredients: ["6 large ripe tomatoes, chopped", "1 onion, chopped", "2 cloves garlic", "1 tbsp butter", "1 tbsp olive oil", "2 cups vegetable stock", "1 tsp sugar", "1/4 cup cream", "Salt and black pepper to taste", "Basil leaves, to garnish"],
    steps: [
      "Heat the butter and oil in a pot. Cook the onion for 5 minutes until soft.",
      "Add the garlic and cook for 1 minute.",
      "Add the tomatoes, stock, sugar, salt and pepper. Simmer for 20 minutes.",
      "Blend the soup until smooth, then return it to the pot.",
      "Stir in the cream and heat gently for 2 minutes. Garnish with basil and serve.",
    ],
  },
  {
    title: "Greek Salad",
    description: "Crunchy vegetables with feta and olives, dressed with olive oil and oregano.",
    category: "Salad", prepTime: 15, cookTime: 0, servings: 3,
    imageUrl: photo("1540189549336-e6e99c3679fe"),
    ingredients: ["3 tomatoes, cut into wedges", "1 cucumber, sliced", "1 small red onion, thinly sliced", "1 green bell pepper, sliced", "1/2 cup kalamata olives", "150 g feta cheese", "3 tbsp olive oil", "1 tbsp red wine vinegar", "1 tsp dried oregano", "Salt and black pepper to taste"],
    steps: [
      "Put the tomatoes, cucumber, onion, pepper and olives in a large bowl.",
      "Whisk the olive oil, vinegar, oregano, salt and pepper in a small bowl.",
      "Pour the dressing over the vegetables and toss gently.",
      "Top with the feta, cut into slabs or crumbled. Serve right away.",
    ],
  },
  {
    title: "Avocado Toast with Egg",
    description: "Toasted bread with mashed avocado, lemon and a fried egg on top.",
    category: "Snack", prepTime: 5, cookTime: 5, servings: 1,
    imageUrl: photo("1482049016688-2d3e1b311543"),
    ingredients: ["2 slices sourdough or whole wheat bread", "1 ripe avocado", "1 egg", "1 tsp lemon juice", "1/4 tsp red chilli flakes", "1 tsp olive oil", "Salt and black pepper to taste"],
    steps: [
      "Toast the bread until golden and crisp.",
      "Mash the avocado with the lemon juice, salt and pepper.",
      "Heat the olive oil in a small pan and fry the egg to your liking.",
      "Spread the avocado on the toast, top with the egg and sprinkle with chilli flakes.",
    ],
  },
  {
    title: "Roasted Vegetable Quinoa Bowl",
    description: "Oven-roasted vegetables over fluffy quinoa with a lemon and olive oil dressing.",
    category: "Lunch", prepTime: 15, cookTime: 30, servings: 2,
    imageUrl: photo("1512621776951-a57141f2eefd"),
    ingredients: ["1 cup quinoa", "1 sweet potato, cubed", "1 zucchini, sliced", "1 red bell pepper, chopped", "1 cup broccoli florets", "3 tbsp olive oil", "1 tsp paprika", "1 lemon, juiced", "1 tsp honey", "Salt and black pepper to taste"],
    steps: [
      "Heat the oven to 200 C (400 F).",
      "Toss the vegetables with 2 tbsp olive oil, paprika, salt and pepper. Spread on a baking tray.",
      "Roast for 25 to 30 minutes, turning halfway, until tender and lightly browned.",
      "Rinse the quinoa and cook in 2 cups of water for 15 minutes. Fluff with a fork.",
      "Whisk the lemon juice, honey and remaining olive oil. Serve the vegetables over the quinoa with the dressing.",
    ],
  },
  {
    title: "Fudgy Chocolate Brownies",
    imageUrl: photo("1717768024023-73768e73f630"),
    description: "Dense, chewy brownies with a crackly top. Cut them once they have cooled.",
    category: "Dessert", prepTime: 15, cookTime: 25, servings: 12,
    ingredients: ["1/2 cup butter, melted", "1 cup sugar", "2 eggs", "1 tsp vanilla extract", "1/3 cup cocoa powder", "1/2 cup all-purpose flour", "1/4 tsp salt", "1/4 tsp baking powder", "1/2 cup chocolate chips or chopped walnuts"],
    steps: [
      "Heat the oven to 175 C (350 F) and line an 8-inch square tin with baking paper.",
      "Mix the melted butter and sugar. Beat in the eggs and vanilla.",
      "Sift in the cocoa, flour, salt and baking powder. Fold until just combined.",
      "Stir in the chocolate chips and spread the batter in the tin.",
      "Bake for 22 to 25 minutes. A skewer should come out with a few moist crumbs.",
      "Cool completely in the tin before cutting into 12 squares.",
    ],
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Create the accounts if they do not exist yet
  const users = {};
  for (const account of accounts) {
    let user = await User.findOne({ email: account.email });
    if (!user) {
      user = await User.create({ ...account, password: await bcrypt.hash(account.password, 10) });
    }
    users[account.email] = user;
  }

  // Remove the previous sample recipes (and anything attached to them)
  const oldIds = (await Recipe.find({ isSample: true }).select("_id")).map((r) => r._id);
  await Comment.deleteMany({ recipe: { $in: oldIds } });
  await User.updateMany({}, { $pull: { favourites: { $in: oldIds } } });
  await MealPlan.updateMany({}, { $pull: { entries: { recipe: { $in: oldIds } } } });
  await Recipe.deleteMany({ isSample: true });

  const author = users["samples@recipehub.local"]._id;
  await Recipe.insertMany(sampleRecipes.map((recipe) => ({ ...recipe, author, isSample: true })));

  console.log(`Added ${sampleRecipes.length} sample recipes.`);
  console.log("Admin login: admin@recipehub.com / Admin@123");
  console.log("Demo login:  demo@recipehub.com / Demo@123");
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
