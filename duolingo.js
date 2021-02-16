/// <reference path="chrome.d.ts"/>

const questionTypes = {
	"Write this in English": "wordSelectEnglish",
	"Write this in Spanish": "wordSelectSpanish",
	"Mark the correct meaning": "multipleChoice"
}

/**
 * Pauses execution for the specified amount of `ms`
 * @param {number} ms The amount of milliseconds to sleep
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets the given items from chrome storage
 * @param {object} keys The values to get, with the defaults
 */
function storageGetAsync(keys) {
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.sync.get(keys, (items) => {
				resolve(items)
			})
		} catch (e) {
			reject(e)
		}

	})
}

/**
 * Sets the given items in chrome storage
 * @param {object} keys The values to set
 */
function storageSetAsync(keys) {
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.sync.set(keys, () => {
				resolve()
			})
		} catch (e) {
			reject(e)
		}

	})
}

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i == 0)
				costs[j] = j;
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue = Math.min(Math.min(newValue, lastValue),
							costs[j]) + 1;
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0)
			costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

function similarity(s1, s2) {
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

const toArray = (variable) => [...variable]
let curQuestion = null

/**
 * Translates text to given language
 * @param {string} text The text to translate
 * @param {"en"|"es"} lang The language
 * @returns {string} The translated text
 */
async function getApiTranslated(text, lang) {
	const reqData = {
		headers: {
			"Content-Type": "application/json",
			"Ocp-Apim-Subscription-Key": (await storageGetAsync({duolingoSolverKey: ''})).duolingoSolverKey,
			"Ocp-Apim-Subscription-Region": "centralus"
		},
		body: JSON.stringify(
			[
				{
					"Text": text
				}
			]
		),
		method: "POST"
	}
	const spanish = await fetch(
		"https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to="+lang,
		reqData
	)
	const json = await spanish.json()
	try {
		return json[0].translations[0].text
	} catch {
		const haste = await fetch("https://hst.sh/documents", {
			method: "POST",
			body: JSON.stringify(json, null, 4),
			mode: "no-cors"
		})
		throw new Error("Invalid api response, response: " + await haste.text())
	}
}

/**
 * Gets the correct answer from a list of answers
 * @param {string} question The question
 * @param {string[]} answers The possible answers
 * @returns {string} The correct answer
 */
async function getMultipleChoiceAnswer(question, answers) {
	const saved = (await storageGetAsync({ savedDuolingoAnswers: {} })).savedDuolingoAnswers
	if (saved[question]) {
		return saved[question]
	}
	const translated = await getApiTranslated(question, "es")
	const correct = answers.sort((a, b) => {
		return similarity(a, translated) - similarity(b, translated)
	})[2]
	saved[question] = correct
	await storageSetAsync({ savedDuolingoAnswers: saved })
	return correct
}

/**
 * Gets the correct answer from word select
 * @param {string} question The question
 * @param {"en"|"es"} lang The language
 * @returns {string} The correct answer
 */
async function getWordSelectAnswer(question, lang) {
	const saved = (await storageGetAsync({ savedDuolingoWordAnswers: {} })).savedDuolingoWordAnswers
	if (saved[question]) {
		return saved[question]
	}
	const translated = await getApiTranslated(question, lang)
	saved[question] = translated
	await storageSetAsync({ savedDuolingoWordAnswers: saved })
	return translated
}

setInterval(async () => {
	if (typeof chrome.app.isInstalled !== 'undefined') {
		const enabled = await storageGetAsync({duolingoSolver: false})
		if (!enabled.duolingoSolver) return
		try {
			/**
			 * @type {[Element, string][]}
			 */
			const header = [...document.querySelectorAll('[data-test="challenge-header"]').values()][0]?.innerText
			if (!header) return
			const questionType = questionTypes[header]
			switch (questionType) {
				case "multipleChoice": {
					const q = document.getElementsByClassName("_3-JBe")[0]?.innerHTML
					if (q === curQuestion || !(typeof q == "string")) return
					/**
					 * @type {[Element, string][]}
					 */
					const answers = toArray(document.querySelectorAll('[data-test="challenge-judge-text"]').values()).map(v => [v, v.innerHTML])
					if (answers.length != 3) return
					curQuestion = q

					const correct = await getMultipleChoiceAnswer(q, answers.map(e => e[1]))
					answers.forEach(e => {
						e[1] == correct ? (
							e[0].style.color = 'green',
							e[0].click()
						) : (
							e[0].style.color = 'red'
						)
					})
					break
				}
				case "wordSelectEnglish": {
					const q = [...document.querySelectorAll('[data-test="hint-sentence"]').values()][0].innerText
					if (q === curQuestion || !(typeof q == "string")) return
					curQuestion = q
					const swapAnswerMethod = document.querySelectorAll('[data-test="challenge-translate-input"]')[0]
					if (swapAnswerMethod?.innerHTML == "Use keyboard") swapAnswerMethod.click()
					/**
					 * @type {Element}
					 */
					const textBox = [...document.querySelectorAll('[data-test="challenge-translate-input"]').values()][0]
					const answer = await getWordSelectAnswer(q, "en")
					textBox.value = answer
					const i = setInterval(() => {
						textBox.value = answer
					}, 100)
					setTimeout(() => {
						clearInterval(i)
					}, 1000)
					// const button = [...document.getElementsByClassName("_2orIw whuSQ _2gwtT _1nlVc _2fOC9 t5wFJ _3dtSu _25Cnc _3yAjN UCrz7 yTpGk _3B3OD")][0]
					// textBox.dispatchEvent(new KeyboardEvent('keydown',{'key':'a'}));
					break
				}
				case "wordSelectSpanish": {
					const q = [...document.querySelectorAll('[data-test="hint-sentence"]').values()][0].innerText
					if (q === curQuestion || !(typeof q == "string")) return
					curQuestion = q
					const swapAnswerMethod = document.querySelectorAll('[data-test="challenge-translate-input"]')[0]
					if (swapAnswerMethod?.innerHTML == "Use keyboard") swapAnswerMethod.click()
					/**
					 * @type {Element}
					 */
					const textBox = [...document.querySelectorAll('[data-test="challenge-translate-input"]').values()][0]
					const answer = await getWordSelectAnswer(q, "es")
					textBox.value = answer
					const i = setInterval(() => {
						textBox.value = answer
					}, 100)
					setTimeout(() => {
						clearInterval(i)
					}, 1000)
					// const button = [...document.getElementsByClassName("_2orIw whuSQ _2gwtT _1nlVc _2fOC9 t5wFJ _3dtSu _25Cnc _3yAjN UCrz7 yTpGk _3B3OD")][0]
					// textBox.dispatchEvent(new KeyboardEvent('keydown',{'key':'a'}));
					break
				}
				default: {
					console.warn("Invalid question type " + header)
					break
				}
			}

		} catch (e) {
			console.error(e)
		}
	}
}, 500)