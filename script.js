const zeasy1 = document.getElementById("zeasy1");
const zeightyeight1 = document.getElementById("zeightyeight1");
const zhard1 = document.getElementById("zhard1");
const clickbelow = document.getElementById("clickbelow");
const restart = document.getElementById("restart");
const disappear = document.getElementById("disappear");
const disappear1 = document.getElementById("disappear1");
scorecounter=0;
denominator=0;
//const answeroption1 = document.getElementById("answeroption1");
//const answeroption2 = document.getElementById("answeroption2");
//const answeroption3 = document.getElementById("answeroption3");
//const answeroption4 = document.getElementById("answeroption4");


zeasy1.addEventListener("click",startQuiz);
restart.addEventListener("click",restartquiz);
//answeroption1.addEventListener("click",checkanswer);
//answeroption2.addEventListener("click",checkanswer);
//answeroption3.addEventListener("click",checkanswer);
//answeroption4.addEventListener("click",checkanswer);


const images=["constellations/sagittarius.png","constellations/capricorn.png","constellations/aquarius.png","constellations/pisces.png",
"constellations/aries.png","constellations/taurus.png","constellations/gemini.png","constellations/cancer.png","constellations/leo.png","constellations/virgo.png",
"constellations/libra.png","constellations/scorpio.png"]
const possibleAnswers=['Sagittarius','Capricorn','Aquarius','Pisces','Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio']



function render(){
    
    //change text items
    correctanswer = Math.floor(Math.random() * 4);
    arr1 = myRandomInts(4, 11);

    integer = arr1[0];
    a = arr1[1];
    b = arr1[2];
    c = arr1[3];

    document.getElementById('constellationimage1').src = images[integer]; //this is the image we display, so it's the correct answer
    //these if statements determine which of our answer choices will be our right answer, so there's a lot of randomization
    if (correctanswer = 0){ 
        document.getElementById('answeroption1').innerHTML = possibleAnswers[integer];
        document.getElementById('answeroption2').innerHTML = possibleAnswers[a];
        document.getElementById('answeroption3').innerHTML = possibleAnswers[b];
        document.getElementById('answeroption4').innerHTML = possibleAnswers[c];
    }
    if (correctanswer = 1){
        document.getElementById('answeroption2').innerHTML = possibleAnswers[integer];
        document.getElementById('answeroption1').innerHTML = possibleAnswers[a];
        document.getElementById('answeroption3').innerHTML = possibleAnswers[b];
        document.getElementById('answeroption4').innerHTML = possibleAnswers[c];
    }

    if (correctanswer = 2){
        document.getElementById('answeroption3').innerHTML = possibleAnswers[integer];
        document.getElementById('answeroption1').innerHTML = possibleAnswers[a];
        document.getElementById('answeroption2').innerHTML = possibleAnswers[b];
        document.getElementById('answeroption4').innerHTML = possibleAnswers[c];
    }

    if (correctanswer = 3){
        document.getElementById('answeroption4').innerHTML = possibleAnswers[integer];
        document.getElementById('answeroption1').innerHTML = possibleAnswers[a];
        document.getElementById('answeroption2').innerHTML = possibleAnswers[b];
        document.getElementById('answeroption3').innerHTML = possibleAnswers[c];
    }
}




function checkAnswer(answer){
    if(answer=='A' && correctanswer==0){
        scorecounter=scorecounter+1;
    }

    if(answer=='B' && correctanswer==1){
        scorecounter=scorecounter+1;
    }

    if(answer=='C' && correctanswer==2){
        scorecounter=scorecounter+1;
    }

    if(answer=='D' && correctanswer==3){
        scorecounter=scorecounter+1;
    }

    denominator=denominator+1;
    string = 'score'
    document.getElementById('scorecard').innerHTML = 'Score:' + ' ' + scorecounter + '/' + denominator;
    if (denominator==12){
        zeasy1.style.display = "revert";
        zeightyeight1.style.display = "revert";
        zhard1.style.display = "revert";
        disappear.style.display = "revert"
        disappear1.style.display = "revert"
        quiz.style.display = "none";
        resultstab.style.display = "block";
        if (scorecounter==1){
        document.getElementById('results1').innerHTML = 'Nice try. You scored ' + scorecounter + ' point. Maybe you should study...';
        }
        else if (scorecounter>=9){
        document.getElementById('results1').innerHTML = 'Excellent! You scored ' + scorecounter + ' points. You must be an astronomer!';
        }
        else if (scorecounter>=6){
            document.getElementById('results1').innerHTML = 'Great Job! You scored ' + scorecounter + " points. You are pretty good!";
        }
        else if (scorecounter>=3){
            document.getElementById('results1').innerHTML = 'Good Job! You scored ' + scorecounter + ' points. You are learning well!';
        }else{
            document.getElementById('results1').innerHTML = 'Nice try. You scored ' + scorecounter + ' points. Maybe you should study...';
        }
    } else{render();}
}


function myRandomInts(quantity, max){
    const arr = []
    while(arr.length < quantity){
      var candidateInt = Math.floor(Math.random() * max) + 1;
      if(arr.indexOf(candidateInt) === -1) arr.push(candidateInt);
    }
  return(arr)
}


function startQuiz(){
    zeasy1.style.display = "none";
    zeightyeight1.style.display = "none";
    zhard1.style.display = "none";
    clickbelow.style.display = "none";
    disappear.style.display = "none"
    disappear1.style.display = "none"
    quiz.style.display = "block";
    resultstab.style.display = "none";
    document.getElementById('headingforconstellationgame1').innerHTML = 'Zodiac Constellations Quiz';
    denominator=0;
    scorecounter=0;
    document.getElementById('scorecard').innerHTML = 'Score: Nothing yet!';

    render();
}

function restartquiz(){
    zeasy1.style.display = "revert";
    zeightyeight1.style.display = "revert";
    zhard1.style.display = "revert";
    clickbelow.style.display = "revert";
    disappear.style.display = "revert"
    disappear1.style.display = "revert"
    quiz.style.display = "none";
    resultstab.style.display = "none";

    document.getElementById('headingforconstellationgame1').innerHTML = 'Constellation Quizzes';
}
