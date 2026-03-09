let quiz=[];
let cur=0;
let ans=[];

const progress=document.getElementById("progress");
const questionText=document.getElementById("questionText");
const options=document.getElementById("options");
const prevBtn=document.getElementById("prevBtn");
const nextBtn=document.getElementById("nextBtn");
const quizArea=document.getElementById("quizArea");
const result=document.getElementById("result");

function startQuiz(data){

quiz=data;

ans=new Array(quiz.length).fill(null);

cur=0;

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

quiz.forEach((q,i)=>{
if(ans[i]===q.a) score++;
});

result.innerHTML=
`<h3>Your Score: ${score} / ${quiz.length}</h3>
<br>
<button onclick="location.reload()">Restart</button>`;

quizArea.style.display="none";
}

nextBtn.onclick=nextQ;
prevBtn.onclick=prevQ;
