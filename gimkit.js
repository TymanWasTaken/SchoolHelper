const target = document.getRootNode();

/**
 * Key: question
 * Value:
 *  Key: answer
 *  Value: boolean (is it right or wrong)
 * @type {Record<string, Record<string, boolean>}
 */
const cachedAnswers = {};
/** @type {string} */
let lastQuestion;
/** @type {string} */
let clickedAnswer;

const Contexts = Object.freeze({
    Question: "QUESTION",
    Answered: "ANSWERED"
});
const Selectors = Object.freeze({
    Question: ".sc-kRCAcj > div:nth-child(1) > div:nth-child(1) > " +
        "div:nth-child(1) > div:nth-child(1) > span:nth-child(1)",
    AnswerBoxes: ".sc-cBXKeB > div.sc-bUqnYt.lkZTMB",
    MoneyChange: ".sc-cOoQYZ > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
})

const observer = new MutationObserver(
    () => {
        let context;
        const question = document.querySelector(Selectors.Question)?.innerText;
        if (!question) context = Contexts.Answered;
        else context = Contexts.Question;
        switch (context) {
            case Contexts.Question:
                // Cache question and add onClick to cache the answer
                lastQuestion = question;
                const answerBoxes = document.querySelectorAll(Selectors.AnswerBoxes);
                for (const box of answerBoxes) {
                    box.addEventListener("click", () => {
                        clickedAnswer = box.innerText;
                    })
                }
                // Change colors and stuff
                const answers = cachedAnswers[question] ??= {};
                for (const answerBox of answerBoxes) {
                    const coloredElement = answerBox.children[0];
                    if (answers[answerBox.innerText] === true) {
                        coloredElement.style.backgroundColor = "magenta";
                    }
                }
                break;
            case Contexts.Answered:
                if (!lastQuestion || !clickedAnswer) return;
                const moneyChange = document.querySelector(Selectors.MoneyChange);
                // Set answer based on if the money gain/loss was positive or negative
                // (which is an easy way to detect if it was right vs wrong)
                cachedAnswers[lastQuestion] = cachedAnswers[lastQuestion] ?? {}
                cachedAnswers[lastQuestion][clickedAnswer] = moneyChange.innerText.startsWith("+")
                break;
        }
    }
).observe(document, { childList: true, subtree: true });

observer.observe(target, {
    attributes: true,
    childList: true,
    subtree: true,
    childList: true
});