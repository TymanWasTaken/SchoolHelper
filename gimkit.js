/// <reference path="chrome.d.ts"/>

chrome.storage.sync.get({
    gimkitTranslate: true
}, (items) => {
    if (items.gimkitTranslate) {
        const target = document.getRootNode()
        const cachedAnswers = {}
        
        const observer =  new MutationObserver(
              () => {
                const question = document.querySelector(".sc-kRCAcj > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1)").innerText
                const answerBoxes = document.querySelector(".sc-cBXKeB").children

              }
            ).observe(document, {childList: true, subtree: true })

        observer.observe(target, {
            attributes: true,
            childList: true,
            subtree: true,
            childList: true
        })

    }
});
