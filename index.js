
// Reboot every new facts
let letterIndex = 0;
// Never reboot, applyed for every span in advance
let letterIdIndex = 0;
// Never reboot, used to know wich id is currently focused
let currentLetterIdIndex = 0;

// Used only in lettersInjector
// Rebbt every newP to tell if a blank space is needed after a word
let wordIndexBeforeNextParagraph = 0;
// Never reboot, applyed for every span in advance
let wordIdIndex = 0;
// Never reboot, used to know wich id is currently focused
// let currentWordIndex = 0;

// Never reboot, applyed for every p in advance
let paragraphIdIndex = 0;
// Never reboot, change at every new fact
let currentParagraphIndex = 0;

// First eject padding included
// let translateIndex = -58;
let translateIndex = -36;

let wrongTyping = 0;
let goodTyping = 0;
let totalTyping = 0

let factsString = []
let facts = []

let capsLockOn = false;

const factsMaker = (data) => {
    let alreadyPushedArray = []
    for (let i = 0; i < 3; i++) {

        // Prevent a fact to be reused
        function numberCreator() {
            let alreadyPushed = false;
            const currentNumber = Math.floor(Math.random() * (data.length - 1));
            alreadyPushedArray.map((num) => {
                if (num === currentNumber) {
                    alreadyPushed = true;
                }
            })
            if(alreadyPushed === true){
             return numberCreator();
            } else{
                alreadyPushedArray.push(currentNumber);
                return currentNumber;
            }
        }
        const currentFact = data[numberCreator()];
        factsString.push(currentFact);
        facts.push(currentFact.split(" "));
    }
    lettersInjector();
}

//Animated cursor 
const cursor = document.createElement("span");
cursor.setAttribute("class", "cursor");
let previousCursorYPosition = 0;

// Allow cursor tracking
const CursorYPositionTracker = () => {
    let rect = cursor.getBoundingClientRect();
    if (previousCursorYPosition > 0 && previousCursorYPosition < rect.y) {
        document.getElementById('translateBlock').style.setProperty("--translateIndex", `${translateIndex}px`)
        translateIndex -= 36;
    }
    previousCursorYPosition = rect.y;
}

// Multiples for loop to add all layers, letters, words, paragrpahs, block 
const lettersInjector = () => {
    const translateBlock = document.createElement("div");
    translateBlock.setAttribute("id", "translateBlock");
    document.getElementById('text-area').appendChild(translateBlock);

    for (let i = 0; i < facts.length; i++) {
        const paragraph = document.createElement("p");
        paragraph.setAttribute("id", `paragraph-${paragraphIdIndex}`);
        paragraph.setAttribute("class", `paragraph`);
        translateBlock.appendChild(paragraph);
        wordIndexBeforeNextParagraph = 0;

        for (let j = 0; j < facts[i].length; j++) {
            const word = document.createElement("span");
            word.setAttribute("id", `word-${wordIdIndex}`);
            word.setAttribute("class", `word`);
            paragraph.appendChild(word);

            for (let k = 0; k < facts[i][j].length; k++) {
                const span = document.createElement('span');
                span.classList.add('letter');
                span.id = `letter-${letterIdIndex}`;
                span.textContent = facts[i][j][k];
                word.appendChild(span);
                letterIdIndex++;
            }
            wordIdIndex++;
            wordIndexBeforeNextParagraph++;

            // Will may be usefull for somme big big numbers
            // const pattern = /^[0-9]$/;
            // if((pattern.test(facts[i][j][facts[i][j].length-1]) && pattern.test(facts[i][j+1][facts[i][j].length-1]))){
            // console.log(facts[i][j])
            // console.log(facts[i][j+1])
            // }

            if ((wordIndexBeforeNextParagraph != facts[i].length)) {

                const blankWord = document.createElement("span");
                blankWord.setAttribute("id", `word-${wordIdIndex}`);
                blankWord.setAttribute("class", `word blank_word`);
                paragraph.appendChild(blankWord);

                const span = document.createElement('span');
                span.classList.add('letter');
                span.classList.add('blank_space');
                span.id = `letter-${letterIdIndex}`;
                span.textContent = " ";
                blankWord.appendChild(span);
                letterIdIndex++;
                wordIdIndex++;
            }
        }
        paragraphIdIndex++;
    }
    document.getElementById(`letter-${currentLetterIdIndex}`).classList.add('active');
    document.getElementById(`letter-${currentLetterIdIndex}`).appendChild(cursor);
}

// Key typing handler
window.addEventListener('keydown', (e) => {

    CursorYPositionTracker();
    // Prevent Red rectangle to appear if caps Lock... This app was made only for this purpose actually... yep
    if (e.key == "CapsLock") {
        document.querySelector('.capsLock_container').classList.toggle('active');
        // CapsLock dosen't count on final score, as IT SHOULD BE!!
        return
    }
    if (e.key == factsString[currentParagraphIndex][letterIndex]) {
        document.getElementById(`letter-${currentLetterIdIndex}`).classList.remove('wrong');
        document.getElementById(`letter-${currentLetterIdIndex}`).classList.remove('active');
        document.getElementById(`letter-${currentLetterIdIndex}`).classList.add('validated');
        letterIndex++;
        currentLetterIdIndex++;

        // Change cursor parent
        document.getElementById(`letter-${currentLetterIdIndex}`).appendChild(cursor);

        if (letterIndex == factsString[currentParagraphIndex].length) {
            letterIndex = 0;
            wordIdIndex = 0;
            currentParagraphIndex += 1;
        }

        document.getElementById(`letter-${currentLetterIdIndex}`).classList.add('active');
        totalTyping++;
        goodTyping++;
    } else {
        document.getElementById(`letter-${currentLetterIdIndex}`).classList.add('wrong');
        wrongTyping++;
    }
});

// Data fetcher
const dataFecther = () => {
    fetch('db-trimed.json')
        .then((response) => response.json())
        .then((data) => {
            factsMaker(data.facts);
        })
        .catch((error) => console.log(error))
}
dataFecther();

// Ending scrren handler
function theEnd() {
    document.querySelector('.ending_window').style.display = 'flex';
    document.querySelector('.accuracy-result').textContent = isNaN((Math.floor((goodTyping * 100) / (goodTyping + wrongTyping)))) ? " 0%" : (Math.floor((goodTyping * 100) / (goodTyping + wrongTyping))) + "%";
    document.querySelector('.speed-result').textContent = goodTyping  + "wpm";
}

// Timer handler obviously
function timerHandler() {
    const counter = document.querySelector('.counter')
    // IMPORTANT if you want to change the timer (30) you have to  also change
    if (counter.textContent != 0) {
        setTimeout(() => {
            counter.textContent = counter.textContent - 1;
            timerHandler()
        }, 1000)
    }
    else {
        theEnd()
    }
}

document.addEventListener("DOMContentLoaded", () => {
    timerHandler()
});

document.querySelector('.restart').addEventListener('click', function () {
    location.reload();
});
