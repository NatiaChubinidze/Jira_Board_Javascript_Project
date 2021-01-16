const createBtn=document.getElementById("create");
const createTaskBtn=document.getElementById("createTaskBtn");
const cancelBtn=document.getElementById("cancel");
const taskWindow = document.getElementById("createTask");

createBtn.addEventListener("click",(event)=>{
    taskWindow.classList.remove("d-none");
});

createTaskBtn.addEventListener("click",(event)=>{
    taskWindow.classList.add("d-none");
});

cancelBtn.addEventListener("click",(event)=>{
    taskWindow.classList.add("d-none");
});
