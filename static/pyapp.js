/* ================= API BASE ================= */

window.API = window.API || "https://pylearn-8niw.onrender.com";


/* ================= PAGE CACHE ================= */

let pageCache = {};
let userData = null;


/* ================= SIDEBAR ================= */

function toggleSidebar(){
const sidebar = document.getElementById("sidebar");
if(sidebar){
sidebar.classList.toggle("open");
}
}

function closeSidebar(){
const sidebar = document.getElementById("sidebar");
if(sidebar){
sidebar.classList.remove("open");
}
}

document.addEventListener("click", function(e){

const sidebar = document.getElementById("sidebar");
const hamburger = document.querySelector(".hamburger");

if(!sidebar || !hamburger) return;

if(!sidebar.contains(e.target) && !hamburger.contains(e.target)){
sidebar.classList.remove("open");
}

});


/* ================= FETCH USER DATA ================= */

async function fetchUserData(){

try{

const res = await fetch(API + "/dashboard",{
credentials:"include"
});

if(res.status === 401){
userData = null;
return null;
}

const data = await res.json();
userData = data;

return data;

}catch(err){

console.error("User fetch error:", err);
userData = null;
return null;

}

}


/* ================= SPA PAGE LOADER ================= */

function loadPage(page, addHistory = true){

closeSidebar();

if(pageCache[page]){
renderPage(pageCache[page]);
}else{

fetch("/static/pages/" + page)

.then(res => {

if(!res.ok){
throw new Error("Page not found");
}

return res.text();

})

.then(html => {

pageCache[page] = html;
renderPage(html);

})

.catch(err => {

console.error(err);

const app = document.getElementById("app");

if(app){
app.innerHTML =
"<p style='padding:40px;text-align:center;'>Page not found.</p>";
}

});

}

if(addHistory){
history.pushState({page:page}, "", "#" + page);
}

}


/* ================= RENDER PAGE ================= */

function renderPage(html){

const app = document.getElementById("app");

if(!app) return;

app.innerHTML = html;

window.scrollTo(0,0);


/* Load user session */

fetchUserData().then(()=>{

updateLoginUI();

if(userData){
loadDashboard();
loadProfile();
}

});


/* Run page scripts */

const scripts = Array.from(app.querySelectorAll("script"));

scripts.forEach(oldScript => {

const newScript = document.createElement("script");

if(oldScript.src){
newScript.src = oldScript.src;
}else{
newScript.textContent = oldScript.textContent;
}

document.body.appendChild(newScript);

});

}


/* ================= BACK BUTTON ================= */

window.addEventListener("popstate", function(event){

if(event.state && event.state.page){
loadPage(event.state.page, false);
}

});


/* ================= LOGIN STATUS ================= */

function updateLoginUI(){

const profile = document.getElementById("profileMenu");
const loginCard = document.getElementById("loginCard");

if(userData){

if(profile) profile.style.display = "flex";
if(loginCard) loginCard.style.display = "none";

}else{

if(profile) profile.style.display = "none";
if(loginCard) loginCard.style.display = "block";

}

}


/* ================= FORM HANDLER ================= */

document.addEventListener("submit", function(e){

/* LOGIN */

if(e.target.id === "loginForm"){

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

fetch(API + "/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

credentials:"include",

body: JSON.stringify({email,password})

})

.then(async res => {

const data = await res.json();

if(!res.ok){
throw new Error(data.message || "Login failed");
}

return data;

})

.then(() => {

fetchUserData().then(()=>{
loadPage("profile.html");
});

})

.catch(err=>{
alert(err.message);
});

}


/* SIGNUP */

if(e.target.id === "signupForm"){

e.preventDefault();

const name = document.getElementById("fullname").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

fetch(API + "/signup",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

credentials:"include",

body: JSON.stringify({name,email,password})

})

.then(async res => {

const data = await res.json();

if(!res.ok){
throw new Error(data.message || "Signup failed");
}

return data;

})

.then(()=>{

alert("Account created successfully");
loadPage("homecontent.html");

})

.catch(err=>{
alert(err.message);
});

}

});


/* ================= DASHBOARD ================= */

function loadDashboard(){

if(!userData) return;

const quiz = document.getElementById("quizCount");
const score = document.getElementById("avgScore");
const topic = document.getElementById("topicProgress");

if(quiz) quiz.innerText = userData.quizCount ?? 0;

if(score) score.innerText = (userData.avgScore ?? 0) + "%";


/* Topic completion */

if(topic && userData.totalTopics){

let percent = 0;

if(userData.totalTopics > 0){
percent = Math.round(
(userData.completedTopics / userData.totalTopics) * 100
);
}

topic.innerText = percent + "%";

}

}


/* ================= PROFILE ================= */

function loadProfile(){

if(!userData) return;

const name = document.getElementById("studentName");
const email = document.getElementById("studentEmail");
const join = document.getElementById("joinDate");

if(name) name.innerText = userData.name || "";
if(email) email.innerText = userData.email || "";
if(join) join.innerText = userData.joined || "";

}


/* ================= LOGOUT ================= */

function logout(){

fetch(API + "/logout",{
method:"POST",
credentials:"include"
})

.then(()=>{

userData = null;

updateLoginUI();

loadPage("homecontent.html");

})

.catch(err=>{
console.error(err);
alert("Logout failed");
});

}


/* ================= INITIAL LOAD ================= */

window.addEventListener("DOMContentLoaded", ()=>{

const page = location.hash.replace("#","") || "homecontent.html";

loadPage(page, false);

});
