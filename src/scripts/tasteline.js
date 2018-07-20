var Nightmare = require('nightmare');
var nightmare = Nightmare({
    openDevTools: false, show: false, webPreferences: {
        images: false,
    }
})

var fs = require('fs');


//ta fram urls genom att:
//1. Använd tastelineHrefs.js för att få it urls
//2. paste in i urls
//3. Sätt filename enligt "TASTELINE-RECEPTSRC-DATE.json"
//4. kör node set DEBUG=nightmare && node tasteline.js
//5. kör node createRecipes.js och ange namnet på filen som skapades här
let urls = [];
let filename = "tasteline/Newtasteline-100-2018-02-22.json";

nightmare
    .goto('http://www.tasteline.com/recept/')
    .evaluate(function () {

    })
    .then(function (hrefs) {

        console.log("start");
        console.log("nr of urls: " + urls.length);
        uniqurls = [...new Set(urls)];
        console.log("uniq : " + uniqurls.length);
        return uniqurls.reduce(function (accumulator, href) {
            return accumulator.then(function (results) {
                return nightmare.goto(href)
                    .evaluate(function () {
                        if (!document.querySelector('.page-content .recipe-content')) {
                            return;
                        }
                        let recipe = {};
                        //title
                        recipe.title = document.querySelector('.page-content .recipe-description h1').innerHTML.trim();
                        //tags
                        let tags = {};
                        //cannot read property length of null
                        $('.page-content .recipe-description .category-list a').each(function () {
                            let t = $(this).text();
                            tags[t.charAt(0).toUpperCase() + t.slice(1).replace(/\s*\([^()]*\)/g, '').split(",")[0].replace(/([/.#$])/g, '').trim()] = true;


                        })
                        recipe.tags = tags;
                        //source
                        recipe.source = window.location.href;
                        recipe.source = recipe.source.substr(recipe.source.indexOf("tasteline.com"));


                        //votes rating
                        if (document.querySelector('.page-content .recipe-description .recipe-rating.voting-enabled i')) {
                            let ratingLine = document.querySelector('.page-content .recipe-description .recipe-rating.voting-enabled').getAttribute("title");
                            let parts = ratingLine.split("Antal röster:");
                            recipe.votes = parts[1].trim();
                            recipe.rating = parts[0].split(":")[1].trim();
                        }
                        //author
                        if (document.querySelector('.page-content .recipe-author-text-inner span')) {
                            recipe.author = document.querySelector('.page-content .recipe-author-text-inner span').innerText.trim();
                        } else {
                            recipe.author = "tasteline.com";
                        }

                        //createdFor

                        //portions
                        if (document.querySelector('.page-content .recipe-content .portions')) {
                            recipe.portions = document.querySelector('.page-content .recipe-content .portions option[selected]').innerHTML.trim();
                            //generall portion parser
                            if (recipe.portions.toUpperCase().startsWith("GER ")) {
                                recipe.portions = recipe.portions.substr(4);
                            }
                            if (recipe.portions.toUpperCase().startsWith("CA ")) {
                                recipe.portions = recipe.portions.substr(3);
                            }
                            if (recipe.portions.indexOf("1/2") > -1) {
                                recipe.portions = recipe.portions.replace("1/2", "+.5");
                                let parts = recipe.portions.split(" ");
                                if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                                    let nr = eval(parts[0] + parts[1]);
                                    recipe.portions = nr + recipe.portions.substr(parts[0].length + parts[1].length + 1);
                                } else if (!isNaN(parts[0])) {
                                    let nr = eval(parts[0]);
                                    recipe.portions = nr + recipe.portions.substr(parts[0].length + 1);
                                } else {
                                    recipe.portions = recipe.portions.replace("+.5", "1/2");
                                }

                            }
                            let firstString = recipe.portions.split(" ")[0];
                            let seperateArray = firstString.split(/([0-9]+)/).filter(Boolean);
                            if (seperateArray.length === 2) {
                                let newFirstString = seperateArray[0] + " " + seperateArray[1];
                                recipe.portions = newFirstString + recipe.portions.substr(firstString.length);
                            }

                            if (recipe.portions.toUpperCase().startsWith("GER ")) {
                                recipe.portions = recipe.portions.substr(4);
                            }
                            if (recipe.portions.toUpperCase().startsWith("CA ")) {
                                recipe.portions = recipe.portions.substr(3);
                            }
                            let parts = recipe.portions.split(" ")[0].split("-");
                            if (parts.length === 2) {
                                let tmp = ((parts[0] - 0) + (parts[1] - 0)) / 2;
                                if (recipe.portions.split(" ").length > 1) {
                                    tmp = tmp + recipe.portions.substr(recipe.portions.indexOf(recipe.portions.split(" ")[1]) - 1);
                                }
                                recipe.portion = tmp;
                            }
                        }
                        //created

                        //description
                        if (document.querySelector('.page-content .recipe-ingress')) {
                            recipe.description = document.querySelector('.page-content .recipe-ingress').innerHTML.replace(/(\r\n|\n|\r|<[^>]*>)/gm, "").replace(/  +/g, ' ').trim();
                        }

                        //time
                        if (document.querySelector('.page-content .recipe-description .fa-clock-o')) {
                            let timeString = document.querySelector('.page-content .recipe-description .fa-clock-o').nextSibling.nodeValue.trim();
                            if (timeString.indexOf("minut") > -1) {
                                recipe.time = timeString.split(" ")[0] - 0;
                            } else if (timeString.indexOf("timm") > -1) {
                                recipe.time = (timeString.split(" ")[0] - 0) * 60;
                            } else {
                                return;
                            }
                            if (recipe.time < 25) {
                                if (!tags.hasOwnProperty('Snabbt')) {
                                    tags["Snabbt"] = true;
                                }
                            }
                        }
                        //denna är kvar att fixa till
                        //ingredients
                        if (document.querySelector('.page-content .ingredient-group li')) {
                            let ingredientgroups = document.querySelector('.page-content').getElementsByClassName('ingredient-group');
                            let ingredients = [];
                            let ingredientNames = [];
                            for (let i = 0; i < ingredientgroups.length; i++) {
                                let ingredientsDom = ingredientgroups[i].getElementsByTagName("li");
                                for (let j = 0; j < ingredientsDom.length; ++j) {
                                    let ingredient = {};
                                    //testa läs om http://www.tasteline.com/recept/hummerfisk/
                                    //när en lösning finns på plats. ta bort alla recpet från tasteline
                                    //läs om dem från backup. måste läsa om hrefs, då recepten i backup är fel
                                    let amountElement = ingredientsDom[j].getElementsByClassName("quantity")[0];
                                    if (!amountElement.classList.contains('hidden')) {
                                        ingredient.amount = amountElement.getAttribute('data-quantity');
                                    }
                                    let unitElement = ingredientsDom[j].getElementsByClassName("unit")[0];
                                    if (!unitElement.classList.contains('hidden')) {
                                        ingredient.unit = unitElement.getAttribute('data-unit-name');
                                    }
                                    if (!ingredientsDom[j].getElementsByClassName("ingredient")[0]) {
                                        return;
                                    }
                                    let namepart = ingredientsDom[j].getElementsByClassName("ingredient")[0].getElementsByTagName("span")[0].innerHTML.trim();
                                    ingredient.name = namepart.charAt(0).toUpperCase() + namepart.slice(1).replace(/\s*\([^()]*\)/g, '').split(",")[0].replace(/([/.#$])/g, '').trim();
                                    if (ingredientNames.indexOf(ingredient.name) > -1) {
                                        continue;
                                    }
                                    ingredientNames.push(ingredient.name);
                                    ingredients.push(ingredient);
                                    //måste göra om till innerHTML och ta ut det som ligger i spanet till amount 
                                    //och det andra får först trimmas och sen splitas på " " och ta ut [0] till unit

                                }
                            }
                            recipe.ingredients = ingredients;
                        }

                        if (!recipe.ingredients || recipe.ingredients.length === 0 || (recipe.time && recipe.time < 1)) {
                            return;
                        }

                        //difficulty
                        let instructionsList = document.querySelector('.page-content .recipe-content .steps').getElementsByTagName("li");
                        let nrOfIngredients = recipe.ingredients.length;
                        let instructionLength = 0;
                        for (let i = 0; i < instructionsList.length; i++) {
                            instructionLength = instructionLength + instructionsList[i].innerHTML.replace(/(\r\n|\n|\r|)/gm, "").trim().length;
                        }
                        instructionLength = instructionLength - instructionsList.length * 10;

                        let levelIndex = (nrOfIngredients * 8) + (instructionLength / 14);
                        if (recipe.tags.hasOwnProperty('Enkelt') || recipe.tags.hasOwnProperty('Lättlagat')) {
                            levelIndex = levelIndex - 100;
                        }
                        if (recipe.tags.hasOwnProperty('Snabbt')) {
                            levelIndex = levelIndex - 20;
                        }

                        if (levelIndex < 100) {
                            recipe.level = 1;
                        } else if (levelIndex < 200) {
                            recipe.level = 2;
                        } else {
                            recipe.level = 3;
                        }


                        return recipe;
                    })
                    .then(function (html) {
                        results.push(html);
                        return results;
                    })

            });
        }, Promise.resolve([]))
    })
    .then(function (resultArr) {
        console.log(resultArr.length);

        fs.writeFile("C:/react/" + filename, JSON.stringify(resultArr), function (err) {

            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    });