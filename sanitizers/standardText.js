function standardText (text) {
    text.trim();
    text = text.replace(/\n/g, '');
    text = text.replace(/  /g, '')
    text.trim()

    return text
}

module.exports = standardText