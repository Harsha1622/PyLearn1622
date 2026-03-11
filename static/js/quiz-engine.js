class QuizEngine {

constructor(quizData, apiUrl=null){

if(!quizData || !Array.isArray(quizData) || quizData.length === 0){
console.error("Quiz data missing");
return;
}

this.quiz = quizData;
this.api = apiUrl;

this.current = 0;
this.answers = new Array(quizData.length).fill(null);
this.finished = false;

/* DOM */

this.progress = document.getElementById("progress");
this.questionText = document.getElementById("questionText");
this.options = document.getElementById("options");
this.prevBtn = document.getElementById("prevBtn");
this.nextBtn = document.getElementById("nextBtn");
this.quizArea = document.getElementById("quizArea");
this.result = document.getElementById("result");

/* DOM safety */

if(!this.questionText || !this.options){
console.error("Quiz DOM not found");
return;
}

/* button events */

if(this.prevBtn){
this.prevBtn.onclick = () => this.prev();
}

if(this.nextBtn){
this.nextBtn.onclick = () => this.next();
}

/* option event delegation */

this.options.onclick = (e)=>{

const el = e.target.closest("[data-index]");
if(!el) return;

const index = Number(el.dataset.index);

this.answers[this.current] = index;

this.load();

};

this.load();

}


/* ================= LOAD QUESTION ================= */

load(){

if(this.progress){
this.progress.innerText =
`Question ${this.current+1} of ${this.quiz.length}`;
}

const q = this.quiz[this.current];

this.questionText.innerText =
`${this.current+1}. ${q.q}`;

this.options.innerHTML = q.o.map((op,i)=>{

const selected =
this.answers[this.current] === i ? "selected" : "";

return `<div class="${selected}" data-index="${i}">${op}</div>`;

}).join("");

if(this.prevBtn){
this.prevBtn.disabled = this.current === 0;
}

if(this.nextBtn){
this.nextBtn.innerText =
this.current === this.quiz.length-1 ? "Submit" : "Next";
}

}


/* ================= NEXT ================= */

next(){

if(this.answers[this.current] === null){
alert("Select an answer first");
return;
}

if(this.current === this.quiz.length-1){
this.showResult();
}else{
this.current++;
this.load();
}

}


/* ================= PREVIOUS ================= */

prev(){

if(this.current > 0){
this.current--;
this.load();
}

}


/* ================= RESULT ================= */

showResult(){

if(this.finished) return;
this.finished = true;

let score = 0;
let out = "";

this.quiz.forEach((q,i)=>{

if(this.answers[i] === q.a){

score++;

}else{

const userAnswer =
this.answers[i] !== null ? q.o[this.answers[i]] : "Not answered";

out += `
<div class="wrong">
<strong>Question:</strong> ${q.q}<br>
<strong>Your Answer:</strong> ${userAnswer}<br>
<strong>Correct Answer:</strong> ${q.o[q.a]}
${q.e ? `<div><strong>Explanation:</strong> ${q.e}</div>` : ""}
</div>`;

}

});


/* save result */

if(this.api){

fetch(this.api+"/save-quiz",{
method:"POST",
headers:{"Content-Type":"application/json"},
credentials:"include",
body:JSON.stringify({
score:score,
total:this.quiz.length
})
}).catch(()=>{});

}


/* hide quiz */

if(this.quizArea){
this.quizArea.style.display="none";
}


/* show result */

if(this.result){

this.result.innerHTML =
`<h3>Your Score: ${score} / ${this.quiz.length}</h3>`+
(out || `<div class="correct">Excellent! All answers are correct 🎉</div>`) +
`<br><button onclick="location.reload()">Restart Quiz</button>`;

}

}

}
