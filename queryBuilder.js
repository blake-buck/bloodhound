const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

const {htmlDisplayer, queryCreator} = require('./controller.js');

//Takes in a parameters file, spits out a queries file

async function queryBuilder(parametersFile, nameOfQueriesFile){

    fs.readFile(parametersFile, 'utf8', (err, unparsedParameters) => {

        if(err){
            console.log("ERROR READING PARAMETERS")
            console.log(err)
        }

        else{

            const parsedParameters = JSON.parse(unparsedParameters);

            let listOfParameterNames = []

            for(parameter in parsedParameters){
                if(parameter !== 'url'){
                    listOfParameterNames.push(parameter)
                }
            }


            (async () => {
                
                var queriesFile ={}

                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.goto(parsedParameters.url);

                for(var t=0; t<listOfParameterNames.length; t++){

                    let parameterName = listOfParameterNames[t];
                    let parameterToMatch = parsedParameters[parameterName][0];
                    var createdQuery = '';

                    var matches = await page.evaluate((parameterToMatch, parameterTitle)=>{

                        
                        let nodeList = document.querySelectorAll('*')
                        let partialMatches =[];
                        let exactMatches = [];

                        for(let i=0; i<nodeList.length; i++){

                            if(!nodeList.item(i).id){
                                nodeList.item(i).id = `unique-${i}`
                            }
                            
                            if(parameterTitle.indexOf('img') > -1 && nodeList.item(i).src && nodeList.item(i).src.includes(parameterToMatch)){
                                

                                let collectedSrc = nodeList.item(i).src

                                if(collectedSrc === parameterToMatch){
                                    exactMatches.push({value:collectedSrc, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }
                                else{
                                    partialMatches.push({value:collectedSrc, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }

                            }

                            else if(nodeList.item(i).textContent.includes(parameterToMatch)){

                                let collectedTextContent = nodeList.item(i).textContent
                                
                                collectedTextContent.trim();
                                collectedTextContent = collectedTextContent.replace(/\n/g, '');
                                collectedTextContent = collectedTextContent.replace(/  /g, '')
                                collectedTextContent.trim()

                                if(collectedTextContent === parameterToMatch){
                                    exactMatches.push({value:collectedTextContent, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }
                                else{
                                    partialMatches.push({value:collectedTextContent, html:nodeList.item(i).outerHTML, id:nodeList.item(i).id})
                                }

                            }
                        }

                        return {exactMatches, partialMatches}

                    }, parameterToMatch, listOfParameterNames[t])

                    console.log(`There are ${matches.exactMatches.length} exact matches for ${parameterName}.`);
                    console.log(`There are ${matches.partialMatches.length} partial matches for ${parameterName}.`);

                    console.log()

                    let userChoice = ''
        

                    if(matches.exactMatches.length === 1){
                        console.log(`Using the one exact match as the query for ${listOfParameterNames[t]}`);
                        htmlDisplayer(matches.exactMatches)

                        createdQuery = await queryCreator(matches.exactMatches, 0, page)
                    }
                    else if(matches.exactMatches.length > 1){
                        console.log(`More than one exact match for ${listOfParameterNames[t]}`)
                        htmlDisplayer(matches.exactMatches)

                        userChoice = readline.question('Pick a block of html to use as the query');
                        createdQuery = await queryCreator(matches.exactMatches, userChoice, page)                        
                    }
                    else if(matches.partialMatches.length === 1){
                        console.log('Using the one partial match')
                        htmlDisplayer(matches.partialMatches)

                        createdQuery = await queryCreator(matches.partialMatches, 0, page);
                    }
                    else if(matches.partialMatches.length > 1){
                        console.log('More than one partial match')
                        htmlDisplayer(matches.partialMatches);

                        userChoice = readline.question('Pick a block of html to use as the query');
                        createdQuery = await queryCreator(matches.partialMatches, userChoice, page);
                    }
                    

                    queriesFile[parameterName] = createdQuery;
                    
                }

                
                
                fs.writeFile(`./queryFiles/${nameOfQueriesFile}.json`, JSON.stringify(queriesFile), (err)=>{
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