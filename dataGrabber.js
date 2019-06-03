const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

let links = require('./linkFiles/links.json')
let queryFile = './queryFiles/queries.json';
let parameterFile = './parameterFiles/parameters.json';


fs.readFile(queryFile, 'utf8', (err, readQueries) => {
    fs.readFile(parameterFile, 'utf8', (err2, readParameters)=>{
        if (err) {
            console.log("ERROR READING QUERY FILE");
        }
        else if (err2){
            console.log('ERROR READING PARAMETERS')
        }
        else {
            const queries = JSON.parse(readQueries);
            const parameters = JSON.parse(readParameters);
           
            let queriesArray = [];
    
            for (x in queries) {
                queriesArray.push(x);
            }
    
            (async () => {
    
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.setRequestInterception(true);
                page.on('request', interceptedRequest => {
                    if(interceptedRequest.resourceType() === 'image'){
                        interceptedRequest.abort();
                    }
                    else if(interceptedRequest.resourceType() === 'stylesheet' || interceptedRequest.resourceType() === 'font'){
                        interceptedRequest.abort();
                    }
                    else{
                        interceptedRequest.continue();
                    }
                })

                let exportedFile = [];
    
                for (let i = 0; i < 200; i++) {
                    console.log(`${i+1} pages scraped`)
    
                    await page.goto(links[i]);
                    
                    let currentFile = {};
                    let sanitizer = '';
    
                    for (let j = 0; j < queriesArray.length; j++) {
                        const query = queries[queriesArray[j]];
                        let nodeContent = await page.evaluate((query) => {
                            let node = document.querySelector(query);
                            return node.textContent
                        }, query)
    
                        sanitizer = require(`./sanitizers/${parameters[queriesArray[j]][1]}.js`)
                        
                        currentFile = { ...currentFile, [queriesArray[j]]:sanitizer(nodeContent)}
                    }
    
                    exportedFile.push(currentFile)
    
                }

                fs.writeFile('test.json', JSON.stringify(exportedFile), (err)=>{
                    if(err){
                        console.log('errror writing file');
                    }
                })
    
                await browser.close();
    
            })();
        }
    
    })

})