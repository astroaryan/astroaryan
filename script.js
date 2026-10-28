const zodiacNames = ["Sagittarius", "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio"];
const zodiacQuestions = zodiacNames.map(name => ({ name, image: "constellations/" + name.toLowerCase() + ".png" }));
const games = {
    zodiac: { title: "Western Zodiac", subject: "constellation", questions: zodiacQuestions },
    nebula: { title: "Nebula Game", subject: "nebula", questions: nebulaQuestions }
};
const quiz = document.getElementById("quiz");
const gameChoices = document.getElementById("game-choices");
const gameHeading = document.getElementById("headingforconstellationgame1");
const results = document.getElementById("resultstab");
const questionHeading = document.getElementById("question-heading");
const questionCounter = document.getElementById("question-counter");
const roundProgress = document.getElementById("round-progress");
const scorecard = document.getElementById("scorecard");
const questionImage = document.getElementById("constellationimage1");
const imageStage = document.querySelector(".image-stage");
const imageStatus = document.getElementById("image-status");
const imageCredit = document.getElementById("image-credit");
const retryImage = document.getElementById("retry-image");
const answerButtons = [...document.querySelectorAll(".answer-option")];
const answerFeedback = document.getElementById("answer-feedback");
const questionDetail = document.getElementById("question-detail");
const nextQuestion = document.getElementById("next-question");
let activeGame = "zodiac";
let round = [];
let questionIndex = 0;
let score = 0;
let answered = false;
let imageReady = false;
let questionVersion = 0;

document.getElementById("nebula-description").textContent = "12 questions from " + nebulaQuestions.length + " named nebulae";
document.querySelectorAll("[data-game]").forEach(button => button.addEventListener("click", () => startQuiz(button.dataset.game)));
answerButtons.forEach(button => button.addEventListener("click", () => checkAnswer(button)));
document.getElementById("restart").addEventListener("click", () => startQuiz(activeGame));
document.getElementById("change-game").addEventListener("click", chooseGame);
retryImage.addEventListener("click", renderQuestion);
nextQuestion.addEventListener("click", () => {
    if (!answered) return;
    questionIndex += 1;
    if (questionIndex === round.length) finishQuiz();
    else {
        renderQuestion();
        quiz.scrollIntoView({ block: "start" });
    }
});

function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function startQuiz(game) {
    activeGame = game;
    round = shuffle(games[game].questions).slice(0, 12);
    questionIndex = 0;
    score = 0;
    gameHeading.textContent = games[game].title;
    gameChoices.hidden = true;
    results.hidden = true;
    quiz.hidden = false;
    roundProgress.max = round.length;
    renderQuestion();
    quiz.scrollIntoView({ block: "start" });
}

function renderQuestion() {
    const game = games[activeGame];
    const question = round[questionIndex];
    const version = ++questionVersion;
    const distractors = shuffle(game.questions.filter(item => item.name !== question.name)).slice(0, 3);
    const choices = shuffle([question, ...distractors]);
    answered = false;
    imageReady = false;
    questionHeading.textContent = "Which " + game.subject + " is in the image?";
    questionCounter.textContent = "Question " + (questionIndex + 1) + " of " + round.length;
    roundProgress.value = questionIndex;
    scorecard.textContent = "Score: " + score + " / " + questionIndex;
    answerFeedback.textContent = "";
    questionDetail.textContent = "";
    nextQuestion.hidden = true;
    answerButtons.forEach((button, index) => {
        button.textContent = choices[index].name;
        button.className = "answer-option";
        button.removeAttribute("aria-label");
        button.disabled = true;
    });
    questionImage.hidden = true;
    questionImage.alt = "Identify the " + game.subject + " in question " + (questionIndex + 1);
    imageStage.setAttribute("aria-busy", "true");
    imageStatus.textContent = "Loading image…";
    imageStatus.hidden = false;
    retryImage.hidden = true;
    renderImageSource(question);
    questionImage.onload = () => {
        if (version !== questionVersion) return;
        imageReady = true;
        questionImage.hidden = false;
        imageStatus.hidden = true;
        imageStage.setAttribute("aria-busy", "false");
        answerButtons.forEach(button => { button.disabled = false; });
    };
    questionImage.onerror = () => {
        if (version !== questionVersion) return;
        imageStatus.textContent = "This image couldn't load. Try again to continue.";
        imageStage.setAttribute("aria-busy", "false");
        retryImage.hidden = false;
    };
    questionImage.src = question.image;
    questionHeading.focus({ preventScroll: true });
}

function renderImageSource(question) {
    imageCredit.replaceChildren();
    imageCredit.hidden = !question.sourceUrl;
    if (!question.sourceUrl) return;
    const link = document.createElement("a");
    link.textContent = "Image Source";
    link.href = question.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    imageCredit.append(link);
}

function checkAnswer(selectedButton) {
    if (answered || !imageReady) return;
    answered = true;
    const question = round[questionIndex];
    const correct = selectedButton.textContent === question.name;
    if (correct) score += 1;
    answerButtons.forEach(button => {
        button.disabled = true;
        if (button.textContent === question.name) {
            button.classList.add("is-correct");
            button.setAttribute("aria-label", question.name + " — correct answer");
        } else if (button === selectedButton) {
            button.classList.add("is-incorrect");
            button.setAttribute("aria-label", button.textContent + " — incorrect answer");
        }
    });
    answerFeedback.textContent = correct ? "Correct! This is " + question.name + "." : "Not quite. This is " + question.name + ".";
    questionDetail.textContent = [question.catalog, question.type, question.aliases?.length ? "Also called " + question.aliases.join(" or ") : ""].filter(Boolean).join(" · ");
    questionImage.alt = question.name;
    scorecard.textContent = "Score: " + score + " / " + (questionIndex + 1);
    roundProgress.value = questionIndex + 1;
    nextQuestion.textContent = questionIndex === round.length - 1 ? "See results" : "Next question";
    nextQuestion.hidden = false;
    nextQuestion.focus({ preventScroll: true });
}

function chooseGame() {
    questionVersion += 1;
    imageReady = false;
    questionImage.onload = null;
    questionImage.onerror = null;
    questionImage.removeAttribute("src");
    quiz.hidden = true;
    results.hidden = true;
    gameChoices.hidden = false;
    gameHeading.textContent = "Astronomy Games";
    document.querySelector('[data-game="' + activeGame + '"]').focus();
}

function finishQuiz() {
    chooseGame();
    results.hidden = false;
    document.getElementById("results1").textContent = games[activeGame].title + ": " + score + " / " + round.length;
    document.getElementById("results-heading").focus();
}
