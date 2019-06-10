const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

const queryBuilder = require('./queryBuilder');
const linkGrabber = require('./linkGrabber');


(async () => {
    let parameterFile = '';
    let queryFile = '';
    let nameOfQueriesFile = '';
    let nameOfLinksFile = '';

    // pick a parameter file to use
    // run the query creator
    
    let parameterFiles = fs.readdirSync('./parameterFiles');
    for(let i=0; i<parameterFiles.length; i++){
        console.log();
        console.log(`${i}: ${parameterFiles[i]}`);
        console.log();
    }

    parameterFile = readline.question('Pick a parameter file to use ');

    parameterFile = `./parameterFiles/${parameterFiles[+(parameterFile)]}`

    nameOfQueriesFile = readline.question('Type the name of your query file ');

    await queryBuilder(parameterFile, nameOfQueriesFile);

    // pick a link parameter file to use 
    // run the query creator

    let parameterFiles = fs.readdirSync('./parameterFiles');
    for(let i=0; i<parameterFiles.length; i++){
        console.log();
        console.log(`${i}: ${parameterFiles[i]}`);
        console.log();
    }

    parameterFile = readline.question('Pick a parameter file to use for links ');
    parameterFile = `./parameterFiles/${parameterFiles[+(parameterFile)]}`

    nameOfQueriesFile = readline.question('Type the name of your link query file ');

    await queryBuilder(parameterFile, nameOfQueriesFile);

    nameOfLinksFile = readline.question('Type the name of the links file ');
    let numberOfLinks = readline.question('Type the number of links you want to scrape ');

    await linkGrabber(`./queryFiles/${nameOfQueriesFile}`, parameterFile, nameOfLinksFile, +numberOfLinks )

})();