const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

//takes in a queryFile, parameterFile, and linksFile -- spits out scraped data
function dataGrabber(queryFile, parameterFile, linksFile, nameOfExportedFile){

    let links = require(linksFile);

    fs.readFile(queryFile, 'utf8', (err, unparsedQueries) => {
        fs.readFile(parameterFile, 'utf8', (err2, unparsedParameters)=>{
            if (err) {
                console.log("ERROR READING QUERY FILE");
            }
            else if (err2){
                console.log('ERROR READING PARAMETERS')
            }
            else {
                const parsedQueries = JSON.parse(unparsedQueries);
                const parsedParameters = JSON.parse(unparsedParameters);
            
                let listOfQueryNames = [];
        
                for (x in parsedQueries) {
                    listOfQueryNames.push(x);
                }
        
                (async () => {
        
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();

                    await page.setRequestInterception(true);

                    page.on('request', interceptedRequest => {
                        if(interceptedRequest.resourceType() === 'image'|| interceptedRequest.resourceType() === 'stylesheet' || interceptedRequest.resourceType() === 'font'){
                            interceptedRequest.abort();
                        }
                        else{
                            interceptedRequest.continue();
                        }
                    })

                    let exportedFile = [];
        
                    for (let i = 0; i < links.length; i++) {
                        console.log(`${i+1} pages scraped`)
        
                        await page.goto(links[i]);
                        
                        let currentFile = {};
                        let sanitizer = '';
        
                        for (let j = 0; j < listOfQueryNames.length; j++) {
                            let queryName = listOfQueryNames[j];
                            const query = parsedQueries[queryName];

                            let nodeContent = await page.evaluate((query) => {
                                let node = document.querySelector(query);
                                return node.textContent
                            }, query)
        
                            sanitizer = require(`./sanitizers/${parsedParameters[queryName][1]}.js`)
                            
                            currentFile = { ...currentFile, [queryName]:sanitizer(nodeContent)}
                        }
        
                        exportedFile.push(currentFile)
        
                    }

                    fs.writeFile(`./dataFiles/${nameOfExportedFile}`, JSON.stringify(exportedFile), (err)=>{
                        if(err){
                            console.log('errror writing file');
                        }
                    })
        
                    await browser.close();
        
                })();
            }
        
        })

    })

}

module.exports = dataGrabber