function elementGrabber(htmlString){
    let element = [];
    let htmlArray = htmlString.split('');
    htmlArray.shift();
    for(let i=0; i<htmlArray.length; i++){
        if(htmlArray[i] === ' ' || htmlArray[i] === '>'){
            return element.join('');
        }
        element.push(htmlArray[i]);
    }

    return "AN ERROR HAS OCCURED IN ELEMENT GRABBER"
}

function elementAndSelectorGrabber(htmlString){
    let element = [];
    let elementClass ='';
    let elementID = '';

    let closingBracketPosition = htmlString.search('>');
    let shortHtmlString = htmlString.slice(0, closingBracketPosition);
    let classPosition = shortHtmlString.search('class="')
    let idPosition = shortHtmlString.search('id="')


    let htmlArray = shortHtmlString.split('');


    if(classPosition > -1){
        elementClass = '.';
        for(let i = classPosition + 7; i< htmlArray.length; i++){

            if(htmlArray[i] === '"' || htmlArray[i] === "'"){
                break;
            }
            else if(htmlArray[i] === ' '){
                element.push('.')
            }
            else{
                element.push(htmlArray[i]);
            }
        }
    }
    elementClass += element.join('');

    element=[]

    if(idPosition > -1 && shortHtmlString.search('id="unique') === -1){
        elementID = '#';
        for(let i = classPosition + 4; i< htmlArray.length; i++){

            if(htmlArray[i] === '"' || htmlArray[i] === "'"){
                break;
            }
            else{
                element.push(htmlArray[i]);
            }
        }
    }

    elementID += element.join('')

    return elementGrabber(htmlString) + elmentID +  elementClass
}

function htmlDisplayer(matchArray){
    console.log("Displaying the HTML of all matches")
    for(let i = 0; i<matchArray.length; i++){
        console.log()
        console.log(i)
        console.log()
        console.log(matchArray[i].html)
        console.log()
        console.log()
    }
}

async function queryCreator(matchArray, userChoice, page){
    let selector = '';
                        
    let loopController = true;
    let elementID = matchArray[+(userChoice)].id;

    while(loopController){

        const query = await page.evaluate((id) => {

            if(document.getElementById(id) && document.getElementById(id).parentElement){
                return {
                    selectorHTML: document.getElementById(id).outerHTML,
                    parentID: document.getElementById(id).parentElement.id
                }
            }

            else{
                return false;
            }

        }, elementID)

        if(query && query.selectorHTML && selector === ''){
            selector = elementAndSelectorGrabber(query.selectorHTML);
            elementID = query.parentID
        }
        else if(query && query.selectorHTML){
            selector = elementAndSelectorGrabber(query.selectorHTML) + " > " + selector;
            elementID = query.parentID
        }
        else{
            loopController = false;
        }
                        

    }

    return selector;
}

module.exports={
    elementGrabber,
    elementAndSelectorGrabber,
    htmlDisplayer,
    queryCreator
}