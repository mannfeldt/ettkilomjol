var firebase = require('firebase');
var fs = require('fs');
//Prod
let prodConfig = {
    apiKey: "AIzaSyAPoXwInGdHakbqWzlhH62qSRBSxljMNn8",
    authDomain: "ettkilomjol-10ed1.firebaseapp.com",
    databaseURL: "https://ettkilomjol-10ed1.firebaseio.com",
    storageBucket: "ettkilomjol-10ed1.appspot.com",
    messagingSenderId: "1028199106361"
};
//Dev
let devConfig = {
    apiKey: "AIzaSyCRcK1UiO7j0x9OjC_8jq-kbFl9r9d38pk",
    authDomain: "ettkilomjol-dev.firebaseapp.com",
    databaseURL: "https://ettkilomjol-dev.firebaseio.com",
    projectId: "ettkilomjol-dev",
    storageBucket: "ettkilomjol-dev.appspot.com",
    messagingSenderId: "425944588036"
};
let enviromentArg = process.argv[2];
if (enviromentArg === "dev") {
    firebase.initializeApp(devConfig);

} else if (enviromentArg === "prod") {
    firebase.initializeApp(prodConfig);

} else {
    console.log("missing enviroment arguement: dev / prod");
    process.exit();
}
let recipesRef = firebase.database().ref("recipes");
let foodsRef = firebase.database().ref("foods");
let tagsRef = firebase.database().ref("tags");

var fs = require('fs');
let existingFoods = [];
let existingTags = [];
let recipes = [];
let foods = {};
let tags = {};
let filename = "test";
let log = [];
let foodLoaded = false;
let recipeLoaded = false;
firebase.auth().signInAnonymously().catch(function (error) {
});
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log("Start");
        firebase.database().ref("foods").remove();
        recipesRef.once('value', function (snapshot) {
            snapshot.forEach(function (child) {
                recipes.push(child.val());
            });
            runRecipes();
        });
    }
});

function runRecipes() {
    console.log("Recipes loaded");
    log.push("starting");
    for (let j = 0; j < recipes.length; j++) {
        recipe = recipes[j];
        console.log("recipe running:" + recipe.source);
        for (let i = 0; i < recipe.ingredients.length; i++) {
            let food = recipe.ingredients[i].name;
            if (existingFoods.indexOf(food) > -1) {
                foods[food].uses = foods[food].uses + 1;
            } else {
                if (food.indexOf("/") < 0 && food.trim().length > 0) {
                    foods[food] = {
                        name: food,
                        uses: 0
                    };
                    existingFoods.push(food);
                }

            }
        }
    }
    console.log(foods.length)
    for (let prop in foods) {
        let food = foods[prop];
        if (food.uses < 5) {
            delete foods[prop];
        }
    }

    foodsRef.set(foods);
    console.log("Success!");
}