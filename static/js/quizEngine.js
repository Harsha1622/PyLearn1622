const API="https://pylearn-8niw.onrender.com";

let quiz=[];
let cur=0;
let ans=[];

let progress,questionText,options,prevBtn,nextBtn,quizArea,result;

/* detect lesson */

function getLesson(){

const params=new URLSearchParams(window.location.search);
return params.get("lesson");

}

/* load quiz file */

async function loadQuiz(){

const lesson=getLesson();

if(!lesson){
document.getElementById("quizTitle").innerText="Quiz not found";
return;
}

const data=await fetch("/static/quizzes/"+lesson+".js");
const text=await data.text();

/* evaluate quiz data */
eval(text);

quiz=quizData;

ans=new Array(quiz.length).fill(null);

initQuiz();

}

function initQuiz(){

progress=document.getElementById("progress");
questionText=document.getElementById("questionText");
options=document.getElementById("options");
prevBtn=document.getElementById("prevBtn");
nextBtn=document.getElementById("nextBtn");
quizArea=document.getElementById("quizArea");
result=document.getElementById("result");

prevBtn.onclick=prevQ;
nextBtn.onclick=nextQ;

load();

}

function load(){

progress.innerText=`Question ${cur+1} of ${quiz.length}`;

questionText.innerText=`${cur+1}. ${quiz[cur].q}`;

options.innerHTML=quiz[cur].o.map((op,i)=>
`<div class="${ans[cur]===i?'selected':''}" onclick="selectOpt(${i})">${op}</div>`
).join("");

prevBtn.disabled=cur===0;

nextBtn.innerText=cur===quiz.length-1?"Submit":"Next";

}

function selectOpt(i){
ans[cur]=i;
load();
}

function nextQ(){

if(ans[cur]===null){
alert("Select an answer first");
return;
}

if(cur===quiz.length-1){
showResult();
}else{
cur++;
load();
}

}

function prevQ(){
cur--;
load();
}

function showResult(){

let score=0;
let out="";

quiz.forEach((q,i)=>{

if(ans[i]===q.a) score++;

else out+=`
<div class="wrong">
<strong>Question:</strong> ${q.q}<br>
<strong>Your Answer:</strong> ${q.o[ans[i]]}<br>
<strong>Correct Answer:</strong> ${q.o[q.a]}
<div><strong>Explanation:</strong> ${q.e}</div>
</div>`;

});

fetch(API+"/save-quiz",{
method:"POST",
headers:{"Content-Type":"application/json"},
credentials:"include",
body:JSON.stringify({score:score,total:quiz.length})
});

quizArea.style.display="none";

result.innerHTML=
`<h3>Your Score: ${score} / ${quiz.length}</h3>`+
(out||`<div class="correct">Excellent! All answers correct 🎉</div>`)+
`<br><button onclick="location.reload()">Restart Quiz</button>`;

}

loadQuiz();
