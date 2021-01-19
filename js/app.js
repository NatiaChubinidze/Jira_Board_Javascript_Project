const createBtn = document.getElementById("create");
const createTaskBtn = document.getElementById("createTaskBtn");
const cancelBtn = document.getElementById("cancel");
const taskWindow = document.getElementById("createTask");
const search = document.getElementById("search");
const sections = document.getElementById("sections");

const backlogBar = document.getElementById("backlogBar");
const toDoBar = document.getElementById("toDoBar");
const inProgressBar = document.getElementById("inProgressBar");
const doneBar = document.getElementById("doneBar");


const units = {
  backlog: document.getElementById("backlog"),
  toDo: document.getElementById("toDo"),
  inProgress: document.getElementById("inProgress"),
  done: document.getElementById("done"),
};

const storageKey = "JIRA_BOARD_APP:STORAGE";


let taskTitle = "";
let taskDescription = "";
let taskDate = "";
let taskAssigned = "";

//let cards =Array.from(document.querySelectorAll(".task"));
let clickedTask;
let tasksList = [];


getStorage();
if (tasksList != null) {
  tasksList.forEach((element) => renderTasks(element));
}

let cards = Array.from(document.querySelectorAll(".task"));
let existingTasks= document.querySelectorAll(".task");
let totalTasks = Array.from(document.querySelectorAll(".totalTasks"));
const deleteButtons=document.querySelectorAll(".close");

search.addEventListener("change", ({ target }) => {
  
  const { value } = target;
  clearBoard();
  if (value != "") {
    let filteredArray = tasksList.filter((element) =>
      element.title.toLowerCase().includes(value.toLowerCase())
    );
    filteredArray.forEach((element) => renderTasks(element));
  } else tasksList.forEach((element) => renderTasks(element));
});

createBtn.addEventListener("click", (event) => {
  taskWindow.classList.remove("d-none");
  taskTitle.value = "";
  taskDescription.value = "";
  taskAssigned.value = "";
  taskDate.value = "";
});


createTaskBtn.addEventListener("click", (event) => {
  getRenewedTaskInfo();
  console.log(createTaskBtn.innerText);

  if(createTaskBtn.innerText=="Create"){
  let task = new GenerateTask(
    taskTitle.value,
    taskDescription.value,
    taskAssigned.value,
    taskDate.value
  );
  tasksList.push(task);
  updateStorage();
  renderTasks(task);
  const newtask=Array.from(document.querySelectorAll(".task")).filter(item=>item.id==task.Id)[0];
  console.log(newtask);
  addEditEventlisteners(newtask);
dragAndDropEventlisteners(newtask);
addDeleteEventlisteners(newtask);
  compareDates();
  progressBar();
  taskWindow.classList.add("d-none");
  } else{
saveEditedTask(clickedTask);
updateStorage();
clearBoard();
tasksList.forEach(task=>renderTasks(task)); 
  }
});



cancelBtn.addEventListener("click", (event) => {
  taskWindow.classList.add("d-none");
});


for(let i=0; i<existingTasks.length;i++){
  addEditEventlisteners(existingTasks[i]);
}

for(let i=0; i<deleteButtons.length;i++){
  addDeleteEventlisteners(deleteButtons[i]);
}

////////////////// drag & drop functionality

cards.forEach(dragAndDropEventlisteners);


totalTasks.forEach((task) =>
  task.addEventListener("dragover", (event) => {
    event.preventDefault();
    const draggable = document.querySelector(".dragging");
    console.log(draggable);
    console.log(task);
    console.log(typeof task);
    task.appendChild(draggable);
    tasksList.forEach((item) => {
      if (draggable.id == item.Id) {
        item.section = task.id;
      }
    });
    updateStorage(); 
    progressBar();
  })
);

compareDates();
progressBar();

/////////////////////////////////////////////////////////////////////
//////rendering tasks on board

function renderTasks(task) {
  {
    // <div class="task" draggable="true" id="1234">
    //   <button type="button" class="btn-close close"
    //    aria-label="Close"></button>
    //         <h5>Title</h5>
    //         <p>Assigned to:</p>
    //         <p>Due Date:</p>
    //  </div>
  }

  const div = document.createElement("div");
  div.classList.add("task");
  div.setAttribute("id", `${task.Id}`);
  div.setAttribute("draggable", "true");

  const btn = document.createElement("button");
  btn.classList.add("btn-close");
  btn.classList.add("close");
  btn.setAttribute("aria-label", "Close");
  btn.setAttribute("data-Id",`${task.Id}`);
  const h5 = document.createElement("h5");
  h5.textContent = task.title;

  const p_assigned = document.createElement("p");
  p_assigned.textContent = task.assignedTo;

  const p_dueDate = document.createElement("p");
  p_dueDate.classList.add("dueDate");
  p_dueDate.textContent = task.dueDate;

  div.appendChild(btn);
  div.appendChild(h5);
  div.appendChild(p_assigned);
  div.appendChild(p_dueDate);

  units[task.section].appendChild(div);
}

//////Clearing the board
function clearBoard(){
  
  totalTasks.forEach((item) => (item.innerHTML = null));
  console.log("clearing");
}


//////////////////////////////////////////////////////////////////////////
////Task Object creation
function GenerateTask(
  title,
  description,
  assignedTo,
  dueDate,
  section = "backlog"
) {
  this.title = title;
  this.description = description;
  this.assignedTo = assignedTo;
  this.dueDate = dueDate;
  this.section = section;
  this.Id = Math.ceil(Math.random() * 100000);
}


function dragAndDropEventlisteners(card){
  card.addEventListener("dragstart", () => {
    card.style.cursor = "move";
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

}

function addEditEventlisteners(task){
  task.addEventListener("click",editTask);
}

function addDeleteEventlisteners(deleteButton){
deleteButton.addEventListener("click", (event)=>{
  event.stopPropagation();
  console.log(event.currentTarget.dataset.id);
  const taskToDelete=tasksList.filter(item=>item.Id==event.currentTarget.dataset.id)[0];
  console.log(taskToDelete);
  console.log(...tasksList);
  deleteTasks(tasksList,taskToDelete);
  console.log(...tasksList);
  updateStorage();
  clearBoard();
  tasksList.forEach(task=>renderTasks(task));
});
}





///////////////////////////////////////////////////////////////////////////
// making the datefield red

function getCurrentDate() {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  return date;
}

function compareDates() {
  const date = getCurrentDate();
  const cardsWithDates = cards.filter((card) => card.querySelector(".dueDate"));
  cardsWithDates.forEach((card) => {
    const dueDate = card.querySelector(".dueDate");

    const taskDate = new Date(dueDate.textContent);
    const dateDue =
      taskDate.getFullYear() +
      "-" +
      (taskDate.getMonth() + 1) +
      "-" +
      taskDate.getDate();

    if (date >= dateDue) {
      dueDate.style.color = "red";
    }
  });
}


//////////////////////////////////////////////////////////////////////////
///Progress Bar
function progressBar() {
  const tasksNumber = tasksList.length;
  
  const backlogs =
    (tasksList.filter((item) => item.section == "backlog").length /
      tasksNumber) *
    100;
  const toDos =
    (tasksList.filter((item) => item.section == "toDo").length / tasksNumber) *
    100;
  const inProgress =
    (tasksList.filter((item) => item.section == "inProgress").length /
      tasksNumber) *
    100;
  const done =
    (tasksList.filter((item) => item.section == "done").length / tasksNumber) *
    100;
  backlogBar.style.width = `${backlogs}%`;
  toDoBar.style.width = `${toDos}%`;
  inProgressBar.style.width = `${inProgress}%`;
  doneBar.style.width = `${done}%`;
  
}



////////////////////////////////////////////////////////////////////////
//////////Task Editing
function editTask(event){
 
  taskWindow.classList.remove("d-none");
  createTaskBtn.textContent="Save";
  const taskId=event.currentTarget.id;
  console.log(event.currentTarget);
  clickedTask=tasksList.filter(item=>item.Id==taskId)[0];
  console.log(clickedTask);
  getRenewedTaskInfo();
  taskTitle.value=clickedTask.title;
  taskDescription.value=clickedTask.description;
  taskDate.value=clickedTask.dueDate;
  taskAssigned.value=clickedTask.assignedTo;
  
}
function getRenewedTaskInfo(){
  taskTitle = document.getElementById("summery");
  taskDescription = document.querySelector("#description");
  taskDate = document.querySelector("#dueDate");
  taskAssigned = document.querySelector("#assignedTo");
}

function saveEditedTask(clickedTask){
  clickedTask.title=taskTitle.value;
  clickedTask.description=taskDescription.value;
  clickedTask.dueDate=taskDate.value;
  clickedTask.assignedTo=taskAssigned.value;
  taskWindow.classList.add("d-none");
}


//cards.forEach((card)=>addEventListener("click",editTask));


///////////////////////////////////////////////////////////////////////////
//////////Local storage
function updateStorage() {
  localStorage.setItem(storageKey, JSON.stringify(tasksList));
}

function getStorage() {
  const list = JSON.parse(localStorage.getItem(storageKey));
  if (list != null) {
    tasksList = list;
    return tasksList;
  } else return null;
}



////////////////////////////////////////////////////////////////////
////tasks deletion function
function deleteTasks(array, elem) {
  var index = array.indexOf(elem);
  if (index > -1) {
      array.splice(index, 1);
  }
}