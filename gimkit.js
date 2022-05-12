const target = document.getRootNode();

/**
 * Key: question
 * Value:
 *  Key: answer
 *  Value: boolean (is it right or wrong)
 * @type {Record<string, Record<string, boolean>}
 */
const answers = {};

// Constants
const Contexts = Object.freeze({
    Question: "QUESTION",
    Answered: "ANSWERED",
    Uknown: "UNKNOWN"
});
const Selectors = Object.freeze({
    Question: ".sc-kRCAcj > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1)",
    AnswerBoxes: ".sc-cBXKeB > div.sc-bUqnYt.lkZTMB",
    MoneyChange: ".sc-cOoQYZ > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
});

(async () => {
    // Fetch the room questions and answers
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = await fetch("https://www.gimkit.com/api/matchmaker/find-info-from-code", {
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            code: urlParams.get("gc")
        }),
        method: "POST"
    }).then(r => r.json()).then(json => roomId = json.roomId)
    const kit = await fetch(`https://www.gimkit.com/api/games/fetch/${gameId}`).then(r => r.json())
    for (const question of kit.questions) {
        answers[question.text] = {}
        for (const answer of question.answers) {
            answers[question.text][answer.text] = answer.correct;
        }
    }

    // Setup mutation observer
    const observer = new MutationObserver(
        // On mutation
        () => {
            // Query page for key elements (a question, money gain/loss, etc)
            const question = document.querySelector(Selectors.Question)?.innerText;
            const moneyChange = document.querySelector(Selectors.MoneyChange)?.innerText;
            // Set context based on key elements
            const context =
                question
                    ? Contexts.Question // Page has a question, so it must be asking for an answer
                    : moneyChange
                        ? Contexts.Answered // Page has a money change (+$10, -$10), so a question must have been answered
                        : Contexts.Unknown // Page has none of the previous key elements, so it is unknown;
            switch (context) {
                case Contexts.Question:
                    // Cache question and add onClick to cache the answer
                    const answerBoxes = document.querySelectorAll(Selectors.AnswerBoxes);
                    // Change colors and stuff
                    const answers = cachedAnswers[question] ??= {};
                    for (const answerBox of answerBoxes) {
                        const coloredElement = answerBox.children[0];
                        if (answers[answerBox.innerText] === true) {
                            coloredElement.style.backgroundColor = "magenta";
                        }
                    }
                    break;
                // case Contexts.Answered:
                //     break;
            }
        }
    ).observe(document, { childList: true, subtree: true });

    observer.observe(target, {
        attributes: true,
        childList: true,
        subtree: true,
        childList: true
    });
})()