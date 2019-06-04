const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

//takes in query and parameter file, spits out a list of links

async function linkGrabber(linkQueriesFile, linkParametersFile, nameOfLinksFile, numberOfPagesToScrape){

    (async () => {
        fs.readFile(linkParametersFile, 'utf8', (err, unparsedParameters) => {
            
            fs.readFile(linkQueriesFile, 'utf8', (err2, unparsedQueries) => {
                const parsedQueries = JSON.parse(unparsedQueries);
                const parsedParameters = JSON.parse(unparsedParameters)
                
                if (err) {
                    console.log('ERROR READING PARAMETERS');
                    console.log(err);
                }
                else if(err2){
                    console.log("ERROR READING QUERIES")
                    console.log(err2);
                }
                else {
                    (async () => {
                    const url = parsedParameters.url;

                    const linkQuery = parsedQueries.linkQuery
                    const nextPageButtonQuery = parsedQueries.nextQuery;
                    
                    let masterList = []

                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.goto(url);

                    let nextPageButtonExists = true;
                    let scrapedPagesCount = 0;

                    
                    // if numberOfPagesToScrape is -1 then the scraper will keep collecting links until it reaches the end of the line
                    while (nextPageButtonExists && (numberOfPagesToScrape === -1 || scrapedPagesCount < numberOfPagesToScrape)) {
                        var currentPageLinks = await page.evaluate((linkQuery) => {
                            
                            let nodeList = document.querySelectorAll(linkQuery);
                            let currentPageLinkList = []

                            for (let i = 0; i < nodeList.length; i++) {
                                currentPageLinkList.push(nodeList.item(i).href)
                            }

                            return currentPageLinkList;

                        }, linkQuery)

                        currentPageLinks.map(val => {
                            masterList.push(val)
                        })

                        scrapedPagesCount++;

                        nextPageButtonExists = await page.$(nextPageButtonQuery);
                        if (nextPageButtonExists) {
                            await page.click(nextPageButtonQuery)
                        }
                    }

                    fs.writeFile(`./linkFiles/${nameOfLinksFile}`, JSON.stringify(masterList), (err) => {
                        if (err) {
                            console.log('errror writing file');
                        }
                    })

                    await browser.close();
                    })();
                }
            })
        })
        
    })();

}

module.exports = linkGrabber;