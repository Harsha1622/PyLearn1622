/* ================= API BASE ================= */

const API = "https://pylearn-8niw.onrender.com";


/* ================= PAGE CACHE ================= */

let pageCache = {};


/* ================= SPA PAGE LOADER ================= */

function loadPage(page){

if(pageCache[page]){
document.getElementById("app").innerHTML = pageCache[page];
window.scrollTo(0,0);
loadDashboard();
loadProfile();
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

document.getElementById("app").innerHTML = html;

window.scrollTo(0,0);

loadDashboard();
loadProfile();

})
.catch(()=>{

document.getElementById("app").innerHTML =
"<p style='padding:40px;text-align:center;'>Page not found.</p>";

});

}


/* ================= CHECK LOGIN ================= */

function checkLogin(){

fetch(API + "/dashboard",{
credentials:"include"
})
.then(res => {

if(res.ok){

const profile = document.getElementById("profileMenu");

if(profile){
profile.style.display = "flex";
}

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

alert("Login successful");

checkLogin();

loadPage("dashboard.html");

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

if(data.name){
name.innerText = data.name;
}

if(data.email){
email.innerText = data.email;
}

if(data.joined){
join.innerText = data.joined;
}

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

if(profile){
profile.style.display = "none";
}

loadPage("homecontent.html");

})
.catch(()=>{

alert("Logout failed");

});

}


/* ================= INITIAL LOAD ================= */

window.onload = function(){

loadPage("homecontent.html");

checkLogin();

};
