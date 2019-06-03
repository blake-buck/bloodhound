const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');


async function linkGrabber(linkQueriesFile, linkParametersFile){

    (async () => {
        await fs.readFile(linkParametersFile, 'utf8', (err, readParameters) => {

            await fs.readFile('./queryFiles/linkQueries.json', 'utf8', (err2, readQueries) => {
                const queries = JSON.parse(readQueries);
                const parameters = JSON.parse(readParameters)
                
                if (err) {
                    console.log('ERROR READING PARAMETERS');
                }
                else if(err2){
                    console.log("ERROR READING QUERIES")
                }
                else {
                    (async () => {
                    const url = parameters.url;

                    const linkQuery = queries.linkQuery
                    const nextQuery = queries.nextQuery;
                    
                    let masterList = []

                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.goto(url);

                    let isNextPage = true;

                    while (isNextPage) {
                        var linksToScrape = await page.evaluate((linkQuery) => {
                            let nodeList = document.querySelectorAll(linkQuery);
                            let links = []
                            for (let i = 0; i < nodeList.length; i++) {
                                links.push(nodeList.item(i).href)
                            }
                            return links;
                        }, linkQuery)

                        linksToScrape.map(val => {
                            masterList.push(val)
                        })

                        isNextPage = await page.$(nextQuery);
                        if (isNextPage) {
                            await page.click(nextQuery)
                        }
                    }

                    console.log(masterList)

                    fs.writeFile('links.json', JSON.stringify(masterList), (err) => {
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
