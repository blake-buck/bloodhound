const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');



(async () => {
    
    await fs.readFile('tester.json', 'utf8', (err, queries) => {
        const blueprint = JSON.parse(queries)
        console.log(queries.linkQuery, queries.nextQuery)
        
        if (err) {
            console.log('ERROR READING QUERIES');
        }
        else {
            (async () => {
            const url = 'http://books.toscrape.com/catalogue/category/books_1/index.html';
            const linkQuery = blueprint.linkQuery
            const nextQuery = blueprint.nextQuery;
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
    
})();