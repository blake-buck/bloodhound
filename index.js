const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

const {elementGrabber, firstElementGrabber} = require('./controller.js');

fs.readFile('parameters.json', 'utf8', (err, parameters) => {

    if(err){
        console.log("ERROR READING PARAMETERS")
    }

    else{
        const blueprint = JSON.parse(parameters);
        let parametersArray = []
        for(x in blueprint){
            if(x !== 'url'){
                parametersArray.push(x)
            }
        }

        console.log(parametersArray);

        (async () => {
            
            var data ={}

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.goto(blueprint.url);

            for(var t=0; t<parametersArray.length; t++){

                let parameter = blueprint[parametersArray[t]];

                var matches = await page.evaluate((parameter)=>{
                    
                    let nodeList = document.querySelectorAll('*')
                    let partialMatches =[];
                    let exactMatches = [];

                    for(let i=0; i<nodeList.length; i++){

                        if(nodeList.item(i).textContent.includes(parameter)){

                            if(!nodeList.item(i).id){
                                nodeList.item(i).id = `unique-${i}`
                            }

                            let value = nodeList.item(i).textContent
                            
                            value.trim();
                            value = value.replace(/\n/g, '');
                            value = value.replace(/  /g, '')
                            value.trim()

                            if(value === parameter){
                                exactMatches.push({value, html:nodeList.item(i).outerHTML, id:`unique-${i}`})
                            }
                            else{
                                partialMatches.push({value, html:nodeList.item(i).outerHTML, id:`unique-${i}`})
                            }

                        }
                    }

                    return {exactMatches, partialMatches}

                }, parameter)

                console.log(`There are ${matches.exactMatches.length} exact matches for ${parameter}.`);
                console.log(`There are ${matches.partialMatches.length} partial matches for ${parameter}.`);

                let userChoice = readline.question('would you like to use exact matches or partial Matches?');
                if(+(userChoice) === 0){}

                if(matches.exactMatches.length === 1){
                    console.log(`Using the one exact match as the query for ${parameter}`);
                }
                else if(matches.exactMatches.length > 1){
                    console.log(`More than one exact match for ${parameter}`)
                    console.log('Displaying the HTML of all matches');
                    for(let i=0; i<matches.exactMatches.length; i++){
                        console.log()
                        console.log(i)
                        console.log()
                        console.log(matches.exactMatches[i].html)
                        console.log()
                        console.log()
                    }

                    userChoice = readline.question('Pick a block of html to use as the query');


                    var selector = '';
                    
                    let loopController = true;
                    let elementID = matches.exactMatches[+(userChoice)].id;

                    while(loopController){

                        const query = await page.evaluate((id) => {

                            if(document.getElementById(id).parentElement){
                                return {
                                    selectorHTML: document.getElementById(id).outerHTML,
                                    parentID: document.getElementById(id).parentElement.id
                                }
                            }

                            else{
                                return false;
                            }

                        }, elementID)



                        // if(selector === ''){
                        //     selector = firstElementGrabber(query.selectorHTML);
                        //     elementID = query.parentID
                        // }
                        if(query && query.selectorHTML){
                            selector = firstElementGrabber(query.selectorHTML) + " " + selector;
                            elementID = query.parentID
                        }
                        else{
                            loopController = false;
                        }
                    

                    }
                }

                data[parametersArray[t]] = selector;
                

            }

            
            
            fs.writeFile('data.json', JSON.stringify(data), (err)=>{
                if(err)console.log('errror writing file');
            })


            

            await browser.close();
          })();
    }
})