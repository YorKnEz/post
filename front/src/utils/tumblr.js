!(function(d, s, id) {
    var js,
        ajs = d.getElementsByTagName(s)[0]
    if (!d.getElementById(id)) {
        js = d.createElement(s)
        js.id = id
        js.src = 'https://assets.tumblr.com/share-button.js'
        ajs.parentNode.insertBefore(js, ajs)
    }
})(document, 'script', 'tumblr-js')
