let lastEnteredID = ''
document.addEventListener('keypress', async (e) => {
    console.log(e.key)
    if (e.key !== 's') return
    for (;;) {
        const quizID = prompt('Please enter quiz ID (can be seen in the teacher\'s browser url)', lastEnteredID)
        if (quizID === null) return
        lastEnteredID = quizID
        const req = await fetch(`https://kahoot.it/rest/kahoots/${quizID}`)
        const res = await req.json()
        if (res.error === 'NOT_FOUND') {
            alert('Quiz ID does not exist, please try again')
        } else if (res.error) {
            alert(`Unrecognized error occured: ${res.error}`)
        } else {
            alert('Success')
			chrome.runtime.sendMessage({
				type: 'kahoot',
				data: res
			})
            return
        }
    }
})