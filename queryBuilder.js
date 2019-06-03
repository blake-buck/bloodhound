const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

const {htmlDisplayer, selectorCreator} = require('./controller.js');

async function queryBuilder(parametersFile, queriesFile){

    fs.readFile(parametersFile, 'utf8', (err, parameters) => {

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

                    let parameter = blueprint[parametersArray[t]][0];
                    var selector = '';

                    var matches = await page.evaluate((parameter, parameterTitle)=>{

                        
                        let nodeList = document.querySelectorAll('*')
                        let partialMatches =[];
                        let exactMatches = [];

                        for(let i=0; i<nodeList.length; i++){
                            if(!nodeList.item(i).id){
                                nodeList.item(i).id = `unique-${i}`
                            }
                            
                            if(parameterTitle.indexOf('img') > -1 && nodeList.item(i).src && nodeList.item(i).src.includes(parameter)){
                                

                                let value = nodeList.item(i).src

                                if(value === parameter){
                                    exactMatches.push({value, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }
                                else{
                                    partialMatches.push({value, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }

                            }

                            else if(nodeList.item(i).textContent.includes(parameter)){

                                let value = nodeList.item(i).textContent
                                
                                value.trim();
                                value = value.replace(/\n/g, '');
                                value = value.replace(/  /g, '')
                                value.trim()

                                if(value === parameter){
                                    exactMatches.push({value, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }
                                else{
                                    partialMatches.push({value, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }

                            }
                        }

                        return {exactMatches, partialMatches}

                    }, parameter, parametersArray[t])

                    console.log(`There are ${matches.exactMatches.length} exact matches for ${parametersArray[t]}.`);
                    console.log(`There are ${matches.partialMatches.length} partial matches for ${parametersArray[t]}.`);

                    console.log()

                    let userChoice = ''
        

                    if(matches.exactMatches.length === 1){
                        console.log(`Using the one exact match as the query for ${parametersArray[t]}`);
                        htmlDisplayer(matches.exactMatches)

                        selector = await selectorCreator(matches.exactMatches, 0, page)
                    }
                    else if(matches.exactMatches.length > 1){
                        console.log(`More than one exact match for ${parametersArray[t]}`)
                        htmlDisplayer(matches.exactMatches)

                        userChoice = readline.question('Pick a block of html to use as the query');
                        selector = await selectorCreator(matches.exactMatches, userChoice, page)                        
                    }
                    else if(matches.partialMatches.length === 1){
                        console.log('Using the one partial match')
                        htmlDisplayer(matches.partialMatches)

                        selector = await selectorCreator(matches.partialMatches, 0, page);
                    }
                    else if(matches.partialMatches.length > 1){
                        console.log('More than one partial match')
                        htmlDisplayer(matches.partialMatches);

                        userChoice = readline.question('Pick a block of html to use as the query');
                        selector = await selectorCreator(matches.partialMatches, userChoice, page);
                    }
                    

                    data[parametersArray[t]] = selector;
                    
                }

                
                
                fs.writeFile(queriesFile, JSON.stringify(data), (err)=>{
                    if(err){
                        console.log('errror writing file');
                    }
                })


                

                await browser.close();
            })();
        }
    })

}

module.exports = queryBuilder;