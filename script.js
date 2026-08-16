const themeBtn=document.getElementById("themeBtn");
themeBtn.addEventListener("click",()=>{document.body.classList.toggle("dark");themeBtn.textContent=document.body.classList.contains("dark")?"☀️ Light Mode":"🌙 Dark Mode";});
function showMessage(){alert("This section is ready. Add your Google Drive PDF links here.");}
function selectClass(c){document.getElementById("classMessage").textContent=`Class ${c} selected — next, add your ${c} notes and subject PDF links here.`;}
