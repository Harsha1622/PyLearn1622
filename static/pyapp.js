/* ================= API BASE ================= */

const API = "https://pylearn-8niw.onrender.com";


/* ================= PAGE CACHE ================= */

let pageCache = {};


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

.catch(()=>{

document.getElementById("app").innerHTML =
"<p style='padding:40px;text-align:center;'>Page not found.</p>";

});

}


/* ================= RENDER PAGE ================= */

function renderPage(html){

const app = document.getElementById("app");

/* clear old content */

app.innerHTML = html;

window.scrollTo(0,0);

checkLogin();
loadDashboard();
loadProfile();

/* execute scripts safely */

const scripts = app.querySelectorAll("script");

scripts.forEach(oldScript => {

const newScript = document.createElement("script");

if(oldScript.src){
newScript.src = oldScript.src;
}else{
newScript.textContent = oldScript.textContent;
}

/* replace instead of append */

oldScript.replaceWith(newScript);

});

}


/* ================= CHECK LOGIN ================= */

function checkLogin(){

fetch(API + "/dashboard",{
credentials:"include"
})

.then(res => {

const profile = document.getElementById("profileMenu");
const loginCard = document.getElementById("loginCard");

if(res.ok){

if(profile) profile.style.display = "flex";
if(loginCard) loginCard.style.display = "none";

}else{

if(profile) profile.style.display = "none";
if(loginCard) loginCard.style.display = "block";

}

})

.catch(()=>{});

}


/* ================= LOGIN ================= */

document.addEventListener("submit", function(e){

if(e.target && e.target.id === "loginForm"){

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

fetch(API + "/login",{

method: "POST",

headers:{
"Content-Type":"application/json"
},

credentials:"include",

body: JSON.stringify({
email: email,
password: password
})

})

.then(res => res.json())

.then(data => {

if(data.success){

checkLogin();
loadPage("profile.html");

}else{

alert("Invalid email or password");

}

})

.catch(()=>{

alert("Server error");

});

}

});


/* ================= SIGNUP ================= */

document.addEventListener("submit", function(e){

if(e.target && e.target.id === "signupForm"){

e.preventDefault();

const name = document.getElementById("fullname").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

fetch(API + "/signup",{

method: "POST",

headers:{
"Content-Type":"application/json"
},

credentials:"include",

body: JSON.stringify({
name: name,
email: email,
password: password
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

.catch(()=>{

alert("Server error");

});

}

});


/* ================= DASHBOARD ================= */

function loadDashboard(){

const quiz = document.getElementById("quizCount");
const score = document.getElementById("avgScore");

if(!quiz || !score) return;

fetch(API + "/dashboard",{
credentials:"include"
})

.then(res => res.json())

.then(data => {

if(data.quizCount !== undefined){
quiz.innerText = data.quizCount;
}

if(data.avgScore !== undefined){
score.innerText = data.avgScore + "%";
}

})

.catch(()=>{});

}


/* ================= PROFILE ================= */

function loadProfile(){

const name = document.getElementById("studentName");
const email = document.getElementById("studentEmail");
const join = document.getElementById("joinDate");

if(!name) return;

fetch(API + "/dashboard",{
credentials:"include"
})

.then(res => res.json())

.then(data => {

if(data.name) name.innerText = data.name;
if(data.email) email.innerText = data.email;
if(data.joined) join.innerText = data.joined;

})

.catch(()=>{});

}


/* ================= LOGOUT ================= */

function logout(){

fetch(API + "/logout",{
method:"POST",
credentials:"include"
})

.then(()=>{

const profile = document.getElementById("profileMenu");
const loginCard = document.getElementById("loginCard");

if(profile) profile.style.display = "none";
if(loginCard) loginCard.style.display = "block";

loadPage("homecontent.html");

})

.catch(()=>{

alert("Logout failed");

});

}


/* ================= INITIAL LOAD ================= */

window.addEventListener("DOMContentLoaded", () => {

loadPage("homecontent.html");
checkLogin();

});
