function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function _write(response, content) {
    var contentToSend;
    if (typeof content === "object") {
        contentToSend = JSON.stringify(content);
    } else {
        contentToSend = content;
    }
    response.write(contentToSend);
}
function writeResponse(response, content) {
    response.statusCode = 200;
    _write(response, content);
    response.close();
}

function writeError(response, content) {
    response.statusCode = 400;
    if (content.error) {
        casper.echo("Error: " + content.error);
    }
    _write(response, content);
    response.close();
}

module.exports = {
    getParameterByName: getParameterByName,
    writeResponse: writeResponse,
    writeError: writeError
};
