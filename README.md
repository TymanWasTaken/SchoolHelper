# SchoolHelper
A chrome extension to help with things school related

## Stuff it does
- Solves two duolingo question types
- Redirects all discord urls to `ptb.discord.com` to bypass hosts file blocking

### Duolingo solver

Solves the following questions:

#### Multiple choice
Both
1. Simulates clicking the correct answer, basically auto selecting it
2. Colors the text of the correct answer green and wrong answer red

#### Sentance translate
(where it gives you a word bank/text box and you have to translate the given text)

Auto types the correct, translated, text

**Warning**
  - This auto swaps from word bank mode to text box mode because it is easier to solve.
  - This one is a little messed up, but functions. It autofills the text in the box, and then makes sure the box is not edited for 1 second (idk why I had to do this but I had to so). Also, you need to type **something** in the text box for duolingo to make the sumbit button clickable

### Discord url redirect

Redirects all discord urls to `ptb.discord.com` on ERR_CONNECTION_REFUSED
