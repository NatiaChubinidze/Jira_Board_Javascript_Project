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

    this.p_dueDate = document.createElement("p");
    this.p_dueDate.classList.add("dueDate");
    this.p_dueDate.textContent = this.dueDate;

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

    /////adding Eventlisteners
    this.taskCard = document.getElementById(this.Id);
    this.deleteButton = this.taskCard.getElementsByClassName("close")[0];

    this.taskCard.addEventListener("dragstart", () => {
      this.taskCard.classList.add("dragging");
    });

    this.taskCard.addEventListener("dragend", () => {
      this.taskCard.classList.remove("dragging");
    });

    this.taskCard.addEventListener("click", (event) => {
      taskWindow.classList.remove("d-none");
      createTaskBtn.textContent = "Save";

      taskTitle.value = this.title;
      taskDescription.value = this.description;
      taskDate.value = this.dueDate;
      taskAssigned.value = this.assignedTo;

      //clickedTask
      clickedTask = this;
    });

    this.deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.deleteTask();
      updateStorage();
      totalTasks.forEach((element) => (element.innerHTML = null));
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
      progressBar();
    });
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

search.addEventListener("change", ({ target }) => {
  const { value } = target;
  if (value != "") {
    let filteredArray = tasksList.filter((element) =>
      element.title.toLowerCase().includes(value.toLowerCase())
    );
    totalTasks.forEach((element) => (element.innerHTML = null));
    filteredArray.forEach((element) => {
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
  } else {
    totalTasks.forEach((element) => (element.innerHTML = null));
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
    saveEditedTask();
    updateStorage();
    totalTasks.forEach((element) => (element.innerHTML = null));
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

progressBar();

//////////////////////////////////////////////////////////////////////////
///Progress Bar
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

function saveEditedTask() {
  tasksList.forEach((element) => {
    if (element.Id == clickedTask.Id) clickedTask = element;
  });
  clickedTask.title = taskTitle.value;
  clickedTask.description = taskDescription.value;
  clickedTask.dueDate = taskDate.value;
  clickedTask.assignedTo = taskAssigned.value;
  taskWindow.classList.add("d-none");
}

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
