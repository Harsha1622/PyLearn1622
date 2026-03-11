/* ================= API BASE ================= */

const API = "https://pylearn-8niw.onrender.com";


/* ================= PAGE CACHE ================= */

let pageCache = {};
let userData = null;


/* ================= FETCH USER DATA ================= */

function fetchUserData(){

return fetch(API + "/dashboard",{
credentials:"include"
})

.then(res => {

if(!res.ok){
userData = null;
return null;
}

return res.json();

})

.then(data => {

if(data) userData = data;

return data;

})

.catch(err => {
console.error("User fetch error:", err);
return null;
});

}


/* ================= SPA PAGE LOADER ================= */

function loadPage(page){

if(pageCache[page]){
renderPage(pageCache[page]);
return;
}

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

document.getElementById("app").innerHTML =
"<p style='padding:40px;text-align:center;'>Page not found.</p>";

});

}


/* ================= RENDER PAGE ================= */

function renderPage(html){
function renderPage(html){

const app = document.getElementById("app");

/* insert page */

app.innerHTML = html;

window.scrollTo(0,0);


/* load user data */

fetchUserData().then(()=>{

updateLoginUI();
loadDashboard();
loadProfile();

});


/* ================= RUN PAGE SCRIPTS ================= */

const scripts = app.querySelectorAll("script");

scripts.forEach(oldScript => {

const script = document.createElement("script");

if(oldScript.src){

script.src = oldScript.src;
script.async = false;

}else{

script.innerHTML = oldScript.innerHTML;

}

document.body.appendChild(script);

});

}


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

body: JSON.stringify({
email,
password
})

})

.then(res => res.json())

.then(data => {

if(data.success){

loadPage("profile.html");

}else{

alert("Invalid email or password");

}

})

.catch(err=>{
console.error(err);
alert("Server error");
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

body: JSON.stringify({
name,
email,
password
})

})

.then(res => res.json())

.then(data => {

if(data.success){

alert("Account created successfully");
loadPage("homecontent.html");

}else{

alert("Signup failed");

}

})

.catch(err=>{
console.error(err);
alert("Server error");
});

}

});


/* ================= DASHBOARD ================= */

function loadDashboard(){

if(!userData) return;

const quiz = document.getElementById("quizCount");
const score = document.getElementById("avgScore");

if(quiz && userData.quizCount !== undefined){
quiz.innerText = userData.quizCount;
}

if(score && userData.avgScore !== undefined){
score.innerText = userData.avgScore + "%";
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

loadPage("homecontent.html");

});
