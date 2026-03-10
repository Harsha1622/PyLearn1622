class QuizEngine {

constructor(quizData, apiUrl=null){

this.quiz = quizData
this.api = apiUrl

this.current = 0
this.answers = new Array(quizData.length).fill(null)

/* DOM */

this.progress = document.getElementById("progress")
this.questionText = document.getElementById("questionText")
this.options = document.getElementById("options")
this.prevBtn = document.getElementById("prevBtn")
this.nextBtn = document.getElementById("nextBtn")
this.quizArea = document.getElementById("quizArea")
this.result = document.getElementById("result")

this.prevBtn.onclick = () => this.prev()
this.nextBtn.onclick = () => this.next()

this.load()

}


/* ================= LOAD QUESTION ================= */

load(){

this.progress.innerText = `Question ${this.current+1} of ${this.quiz.length}`

let q = this.quiz[this.current]

this.questionText.innerText = `${this.current+1}. ${q.q}`

this.options.innerHTML = q.o.map((op,i)=>{

let selected = this.answers[this.current]===i ? "selected":""

return `<div class="${selected}" data-index="${i}">${op}</div>`

}).join("")


/* attach click events */

Array.from(this.options.children).forEach(el=>{

el.onclick = ()=>{

let index = Number(el.dataset.index)

this.answers[this.current] = index

this.load()

}

})


this.prevBtn.disabled = this.current === 0

this.nextBtn.innerText =
this.current === this.quiz.length-1 ? "Submit" : "Next"

}


/* ================= NEXT ================= */

next(){

if(this.answers[this.current] === null){

alert("Select an answer first")
return

}

if(this.current === this.quiz.length-1){

this.showResult()

}else{

this.current++
this.load()

}

}


/* ================= PREVIOUS ================= */

prev(){

this.current--
this.load()

}


/* ================= RESULT ================= */

showResult(){

let score = 0
let out = ""

this.quiz.forEach((q,i)=>{

if(this.answers[i] === q.a){

score++

}else{

out += `
<div class="wrong">
<strong>Question:</strong> ${q.q}<br>
<strong>Your Answer:</strong> ${q.o[this.answers[i]]}<br>
<strong>Correct Answer:</strong> ${q.o[q.a]}
<div><strong>Explanation:</strong> ${q.e}</div>
</div>`

}

})


/* SAVE RESULT */

if(this.api){

fetch(this.api+"/save-quiz",{
method:"POST",
headers:{"Content-Type":"application/json"},
credentials:"include",
body:JSON.stringify({
score:score,
total:this.quiz.length
})
})

}


this.quizArea.style.display="none"

this.result.innerHTML =
`<h3>Your Score: ${score} / ${this.quiz.length}</h3>`+
(out || `<div class="correct">Excellent! All answers are correct 🎉</div>`) +
`<br><button onclick="location.reload()">Restart Quiz</button>`

}

}
