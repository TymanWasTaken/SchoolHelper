/// <reference path="chrome.d.ts"/>

const redirects = {
    discord: {
        "discordapp.com": "canary.discord.com",
        "discord.gg": "canary.discord.com/invite",
        "www.discordapp.com": "canary.discord.com",
        "www.discord.com": "canary.discord.com",
        "discord.com": "canary.discord.com"
    }
}

/**
 * Merges two objects only if `condition` is truthy
 * @param {object} obj The object to be added to
 * @param {object} objToAdd The object to add to `obj`
 * @param {boolean} condition The condition to check before adding
 * @returns {object} The merged (or unmerged) object
 */
const addIfCondition = (obj, objToAdd, condition) => {
    if (condition) {
        return {
            ...obj,
            ...objToAdd
        }
    }
    return obj
}

chrome.webNavigation.onErrorOccurred.addListener((details) => {
    chrome.storage.sync.get({
        discordUrlRedirect: true
    }, (items) => {
        let currentRedirects = {}
        currentRedirects = addIfCondition(currentRedirects, redirects.discord, items.discordUrlRedirect)
        if (details.error != "net::ERR_CONNECTION_REFUSED") return
        const url = details.url.split("/")[2]
        if (currentRedirects[url]) {
            const newurl = details.url.replace(url, currentRedirects[url])
            chrome.tabs.update(details.tabId, {
                url: newurl
            })
        } else if ((!currentRedirects[url])) {
            console.log(`Redirect missing or turned off for url "${url}"`)
        }

    });
})