/// <reference path="../chrome.d.ts"/>

const checkboxes = {
	"duolingoSolver": false,
	"discordUrlRedirect": true,
	"gimkitTranslate": false
}

const passwords = {
	"duolingoSolverKey": ""
}

/**
 * Save the current options on the page
 */
const save_options = () => {
	let checkboxValues = {}
	let passwordValues = {}
	for (const checkboxItem of Object.keys(checkboxes)) {
		const checked = document.getElementById(checkboxItem).checked
		checkboxValues[checkboxItem] = checked
	}
	for (const passwordItem of Object.keys(passwords)) {
		const pw = document.getElementById(passwordItem).value
		passwordValues[passwordItem] = pw
	}
    chrome.storage.sync.set({
		...checkboxValues,
		...passwordValues
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

/**
 * Loads the options on the page from the chrome storage API
 */
const restore_options = () => {
    chrome.storage.sync.get({
        ...checkboxes,
        ...passwords
    }, (items) => {
        Object.keys(checkboxes).forEach((e) => {
			if (document.getElementById(e)?.checked !== undefined) {
				document.getElementById(e).checked = items[e]
			}
		})
		Object.keys(passwords).forEach((e) => {
			if (document.getElementById(e)?.value !== undefined) {
				document.getElementById(e).value = items[e]
			}
		})
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);