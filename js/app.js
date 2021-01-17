const createBtn = document.getElementById("create");
const createTaskBtn = document.getElementById("createTaskBtn");
const cancelBtn = document.getElementById("cancel");
const taskWindow = document.getElementById("createTask");
let taskTitle = "";
let taskDescription = "";
let taskDate = "";
let taskAssigned = "";

const units = {
  backlog: document.getElementById("backlog"),
  toDo: document.getElementById("toDo"),
  inProgress: document.getElementById("inProgress"),
  done: document.getElementById("done"),
};

let tasksList = [];
const storageKey = "JIRA_BOARD_APP:STORAGE";

getStorage();
if(tasksList!=null){
    tasksList.forEach(element=>renderTasks(element))
}

function updateStorage() {
  localStorage.setItem(storageKey, JSON.stringify(tasksList));
}

function getStorage() {
  const list = JSON.parse(localStorage.getItem(storageKey));
  if (list!=null) {
    tasksList = list;
    return tasksList;
  } else return null;
}

createBtn.addEventListener("click", (event) => {
  taskWindow.classList.remove("d-none");
  taskTitle.value = "";
  taskDescription.value = "";
  taskAssigned.value = "";
  taskDate.value = "";
});

createTaskBtn.addEventListener("click", (event) => {
  taskTitle = document.getElementById("summery");
  taskDescription = document.querySelector("#description");
  taskDate = document.querySelector("#dueDate");
  taskAssigned = document.querySelector("#assignedTo");
  let task = new GenerateTask(
    taskTitle.value,
    taskDescription.value,
    taskAssigned.value,
    taskDate.value
  );
  tasksList.push(task);
  updateStorage();
  renderTasks(task);
});

createTaskBtn.addEventListener("click", (event) => {
  taskWindow.classList.add("d-none");
});

cancelBtn.addEventListener("click", (event) => {
  taskWindow.classList.add("d-none");
});

function renderTasks(task) {
  {
    /* <div class = "task">
<button type="button" class="btn-close close" aria-label="Close"></button>
            <h5>Title</h5>
            <p>Assigned to:</p>
            <p>Due Date:</p>
          </div> */
  }
  const div = document.createElement("div");
  div.classList.add("task");

  const btn = document.createElement("button");
  btn.classList.add("btn-close");
  btn.classList.add("close");
  btn.setAttribute("aria-label", "Close");
  const h5 = document.createElement("h5");
  h5.textContent = task.title;

  const p_assigned = document.createElement("p");
  p_assigned.textContent = task.assignedTo;

  const p_dueDate = document.createElement("p");
  p_dueDate.textContent = task.dueDate;
  div.appendChild(btn);
  div.appendChild(h5);
  div.appendChild(p_assigned);
  div.appendChild(p_dueDate);
  units[task.section].appendChild(div);
  //section.appendChild(div);
}

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
}
