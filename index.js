const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

let links = require('./linkFiles/links.json')

for(let i =0; i<5; i++){
    console.log(links[i])
}