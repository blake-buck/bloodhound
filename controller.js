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

function firstElementGrabber(htmlString){
    let element = [];
    let elementClass ='';


    let closingBracketPosition = htmlString.search('>');
    let shortHtmlString = htmlString.slice(0, closingBracketPosition);
    let classPosition = shortHtmlString.search('class="')



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

    return elementGrabber(htmlString) +  elementClass
}

module.exports={
    elementGrabber:elementGrabber,
    firstElementGrabber:firstElementGrabber
}