/// <reference path="chrome.d.ts"/>

chrome.storage.sync.get({
    gimkitTranslate: true
}, (items) => {
    if (items.gimkitTranslate) {
        const target = document.getRootNode()
        const callback = () => {
            const text = document.getElementsByClassName("notranslate sc-gDPesD dUMQFj")
            if (text.length < 1) {
                console.log("Could not find element :/")
            } else if (text.length > 1) {
                console.log("Found too many elements :/")
            } else {
                console.log(text[0].innerHTML)
            }
        }

        const observer = new MutationObserver(callback)

        observer.observe(target, {
            attributes: true,
            childList: true,
            subtree: true,
            childList: true
        })

    }
});