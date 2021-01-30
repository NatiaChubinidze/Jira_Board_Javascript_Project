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

taskTitle = document.getElementById("summery");
taskDescription = document.querySelector("#description");
taskDate = document.querySelector("#dueDate");
taskAssigned = document.querySelector("#assignedTo");

let clickedTask;
let tasksList = [];
let totalTasks = Array.from(document.querySelectorAll(".totalTasks"));

class Task {
  constructor(
    title,
    description,
    assignedTo,
    dueDate,
    section = "backlog",
    Id = Math.ceil(Math.random() * 100000)
  ) {
    this.title = title;
    this.description = description;
    this.assignedTo = assignedTo;
    this.dueDate = dueDate;
    this.section = section;
    this.Id = Id;
  }
  deleteTask() {
    let taskToDelete = "";
    tasksList.forEach((element) => {
      if (element.Id == this.Id) taskToDelete = element;
    });
    let index = tasksList.indexOf(taskToDelete);
    if (index > -1) {
      tasksList.splice(index, 1);
    }
  }
  getCurrentDate() {
    const today = new Date();
    const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    return date;
  }
}

class Card extends Task {
  constructor(title, description, assignedTo, dueDate, section, Id) {
    super(title, description, assignedTo, dueDate, section, Id);
    this.deleteButton = null;
    this.taskCard = null;

    this.div = null;
    this.btn = null;
    this.h5 = null;
    this.p_assigned = null;
    this.p_dueDate = null;
    this.deadlineRed = false;
  }

  renderTask() {
    //creating element
    this.div = document.createElement("div");
    this.div.classList.add("task");
    this.div.setAttribute("id", `${this.Id}`);
    this.div.setAttribute("draggable", "true");

    this.btn = document.createElement("button");
    this.btn.classList.add("btn-close");
    this.btn.classList.add("close");
    this.btn.setAttribute("aria-label", "Close");
    this.btn.setAttribute("data-Id", `${this.Id}`);
    this.h5 = document.createElement("h5");
    this.h5.textContent = this.title;

    this.p_assigned = document.createElement("p");
    this.p_assigned.textContent = this.assignedTo;
    this.p_assigned.setAttribute("data-Id", `${this.Id}`);

    this.p_dueDate = document.createElement("p");
    this.p_dueDate.classList.add("dueDate");
    this.p_dueDate.textContent = this.dueDate;
    this.p_dueDate.setAttribute("data-Id", `${this.Id}`);

    //making dueDate red
    const dateDue = new Date(this.dueDate);
    const dueDate =
      dateDue.getFullYear() +
      "-" +
      (dateDue.getMonth() + 1) +
      "-" +
      dateDue.getDate();

    if (this.getCurrentDate() > dueDate) {
      this.deadlineRed = true;
      this.p_dueDate.style.color = "red";
    }
    //////adding to the board

    this.div.appendChild(this.btn);
    this.div.appendChild(this.h5);
    this.div.appendChild(this.p_assigned);
    this.div.appendChild(this.p_dueDate);

    units[this.section].appendChild(this.div);
  }
}

getStorage();
if (tasksList != null) {
  tasksList.forEach((element) => {
    const card = new Card(
      element.title,
      element.description,
      element.assignedTo,
      element.dueDate,
      element.section,
      element.Id
    );
    card.renderTask();
  });
}


/////Eventlisteners
search.addEventListener("change", ({ target }) => {
  const { value } = target;
  if (value != "") {
    let filteredArray = tasksList.filter((element) =>
      element.title.toLowerCase().includes(value.toLowerCase())
    );
    clearBoard();
    render(filteredArray);
  } else {
    clearBoard();
    render(tasksList);
  }
});

createBtn.addEventListener("click", (event) => {
  taskWindow.classList.remove("d-none");
  taskTitle.value = "";
  taskDescription.value = "";
  taskAssigned.value = "";
  taskDate.value = "";
});

createTaskBtn.addEventListener("click", (event) => {
  if (createTaskBtn.innerText == "Create") {
    let task = new Task(
      taskTitle.value,
      taskDescription.value,
      taskAssigned.value,
      taskDate.value
    );
    tasksList.push(task);
    let card = new Card(
      taskTitle.value,
      taskDescription.value,
      taskAssigned.value,
      taskDate.value,
      task.section,
      task.Id
    );
    updateStorage();
    card.renderTask();
    progressBar();
    taskWindow.classList.add("d-none");
  } else {
    //save the edited task
    clickedTask.title = taskTitle.value;
    clickedTask.description = taskDescription.value;
    clickedTask.dueDate = taskDate.value;
    clickedTask.assignedTo = taskAssigned.value;
    taskWindow.classList.add("d-none");
    updateStorage();
    clearBoard();
    render(tasksList);
  }
});

cancelBtn.addEventListener("click", (event) => {
  taskWindow.classList.add("d-none");
});

totalTasks.forEach((task) =>
  task.addEventListener("dragover", (event) => {
    event.preventDefault();
    const draggable = document.querySelector(".dragging");
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


////Adding Eventlisteners on the parent element (sections) instead of tasks themselves
sections.addEventListener("dragstart", (event) => {
  let clickedTask = null;
  let id = null;
  if (event.target.dataset.id) {
    id = event.target.dataset.id;
    clickedtask = document.getElementById(id);
  } else {
    clickedTask = event.target;
  }
  clickedTask.classList.add("dragging");
});

sections.addEventListener("dragend", () => {
  const draggingCard = document.getElementsByClassName("dragging")[0];
  draggingCard.classList.remove("dragging");
});

sections.addEventListener("click", (event) => {
  if (event.target.tagName.toLowerCase() == "button") {
    event.stopPropagation();
    const id = event.target.dataset.id;
    tasksList.forEach((element) => {
      if (element.Id == id) element.deleteTask();
    });
    updateStorage();
    clearBoard();
    render(tasksList);
    progressBar();
  } else {
    let task = null;
    if (event.target.dataset.id) {
      tasksList.forEach((element) => {
        if (element.Id == event.target.dataset.id) task = element;
      });
    } else if (event.target.id) {
      tasksList.forEach((element) => {
        if (element.Id == event.target.id) task = element;
      });
    }
    if (!task) return;
    taskWindow.classList.remove("d-none");
    createTaskBtn.textContent = "Save";

    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskDate.value = task.dueDate;
    taskAssigned.value = task.assignedTo;

    clickedTask = task;
  }
});

progressBar();




///// functions used in the project
function progressBar() {
  const tasksNumber = tasksList.length;
  if (tasksNumber === 0) {
    backlogBar.style.width = "0%";
    toDoBar.style.width = "0%";
    inProgressBar.style.width = "0%";
    doneBar.style.width = "0%";
  } else {
    const backlogs =
      (tasksList.filter((item) => item.section == "backlog").length /
        tasksNumber) *
      100;
    const toDos =
      (tasksList.filter((item) => item.section == "toDo").length /
        tasksNumber) *
      100;
    const inProgress =
      (tasksList.filter((item) => item.section == "inProgress").length /
        tasksNumber) *
      100;
    const done =
      (tasksList.filter((item) => item.section == "done").length /
        tasksNumber) *
      100;
    backlogBar.style.width = `${backlogs}%`;
    toDoBar.style.width = `${toDos}%`;
    inProgressBar.style.width = `${inProgress}%`;
    doneBar.style.width = `${done}%`;
  }
}

function clearBoard() {
  totalTasks.forEach((element) => (element.innerHTML = null));
}

function render(array) {
  array.forEach((element) => {
    const card = new Card(
      element.title,
      element.description,
      element.assignedTo,
      element.dueDate,
      element.section,
      element.Id
    );
    card.renderTask();
  });
}

function updateStorage() {
  localStorage.setItem(storageKey, JSON.stringify(tasksList));
}

function getStorage() {
  const list = JSON.parse(localStorage.getItem(storageKey));
  if (list != null) {
    list.forEach((item) => {
      const taskObject = new Task(
        item.title,
        item.description,
        item.assignedTo,
        item.dueDate,
        item.section,
        item.Id
      );
      tasksList.push(taskObject);
    });
    return tasksList;
  } else return null;
}
