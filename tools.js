module.exports.getRandomInt = function(max) {
    return Math.floor(Math.random() * max);
}

module.exports.replaceAt = function (str,index,chr) {
    if(index > str.length-1) return str;
        return str.substring(0,index) + chr + str.substring(index+1);
}

// Fonction utilitaire pour remplacer un caractère à un index donné
function replaceAt(string, index, replacement) {
    if (index >= string.length) {
        return string;
    }
    return string.substring(0, index) + replacement + string.substring(index + 1);
}

module.exports = {
    replaceAt
};
