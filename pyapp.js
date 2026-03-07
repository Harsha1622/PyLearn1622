/* ================= API BASE ================= */
const API = "http://127.0.0.1:5000";


/* ================= SPA PAGE LOADER ================= */
function loadPage(page){

fetch(page)
.then(res => res.text())
.then(html => {

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

});

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

});

}

});


/* ================= DASHBOARD ================= */
function loadDashboard(){

if(!document.getElementById("quizCount")) return;

fetch(API + "/dashboard",{
credentials:"include"
})
.then(res => res.json())
.then(data => {

document.getElementById("quizCount").innerText = data.quizCount;
document.getElementById("avgScore").innerText = data.avgScore + "%";

});

}


/* ================= PROFILE ================= */
function loadProfile(){

if(!document.getElementById("studentName")) return;

fetch(API + "/dashboard",{
credentials:"include"
})
.then(res => res.json())
.then(data => {

document.getElementById("studentName").innerText = data.name;
document.getElementById("studentEmail").innerText = data.email;
document.getElementById("joinDate").innerText = data.joined;

});

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

});

}


/* ================= INITIAL LOAD ================= */
window.onload = function(){

loadPage("homecontent.html");

checkLogin();

};
