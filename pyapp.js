/* ================= API BASE URL ================= */
const API = "http://127.0.0.1:5000";


/* ================= SPA PAGE LOADER ================= */
function loadPage(page){

fetch(page)
.then(res => res.text())
.then(html => {

document.getElementById("app").innerHTML = html;

/* reset scroll position */
window.scrollTo(0,0);

})
.catch(()=>{
document.getElementById("app").innerHTML =
"<p style='padding:40px;text-align:center;'>Page not found.</p>";
});

}


/* ================= CHECK LOGIN STATUS ================= */
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


/* ================= LOGIN FORM ================= */
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


/* ================= SIGNUP FORM ================= */
document.addEventListener("submit", function(e){

if(e.target && e.target.id === "signupForm"){

e.preventDefault();

const name = document.getElementById("name").value;
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


/* ================= INITIAL PAGE LOAD ================= */
window.onload = function(){

loadPage("homecontent.html");

checkLogin();

};
