function numberPull(text){
    let newText = /([0-9]+)[.]([0-9]+)/.exec(text)
    if(newText === null){
        newText = /([0-9]+)/.exec(text)
    }
    if(newText === null){
        return "ERROR WITH numberPull SANITIZER"
    }
    return +newText[0]
}

module.exports = numberPull;