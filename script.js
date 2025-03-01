class Task {
	constructor(name, description, time) {
		this.name = name;
		this.description = description;
		this.time = time;
	}

	displayTask() {
		return `Task: ${this.name}\nDescription: ${this.description}\nTime: ${this.time}`;
	}
	toJSON() {
		return JSON.stringify({
			name: this.name,
			description: this.description,
			time: this.time
		});
	}
}

var TodayDate = document.querySelector(".set_date");
var TodayTime = document.querySelector(".set_time");

if (TodayDate) {
	TodayDate.innerHTML = moment().format("ddd DD MMM YYYY");
}
if (TodayTime) {
	TodayTime.innerHTML = moment().format("HH:mm:ss");
}

setInterval(() => {
	if (TodayTime) {
		TodayTime.innerHTML = moment().format("HH:mm:ss");
	}
}, 1000);

const checkboxes = document.querySelectorAll(".taskbox");

checkboxes.forEach((checkbox) => {
	checkbox.addEventListener("change", function () {
		const taskItem = this.closest(".todo-main-item");
		if (this.checked) {
			taskItem.style.textDecoration = "line-through";
		} else {
			taskItem.style.textDecoration = "none";
		}
	});
});

function toggleAdd() {
	document.querySelector(".add-button-container").classList.toggle("closed");
}

const addTaskButton = document.querySelector(".add-task-button");
const taskTitleInput = document.querySelector(".title-task");
const taskDescriptionInput = document.querySelector(".description-task");
const taskTimeInput = document.querySelector("input[type='time']");

const taskList = [];

let selectedTaskName = "";

function setUpButtonCheckboxes() {
	const buttons = document.querySelectorAll(".name-container");
	const checkboxesHTML = document.querySelectorAll(".taskbox");
	const checkboxesArray = Array.from(checkboxesHTML);

	buttons.forEach((button) => {
		button.addEventListener("click", function (event) {
			if (checkboxesArray.some((checkbox) => checkbox === event.target)) {
				event.preventDefault();
				return;
			}
			selectedTaskName = button.querySelector(".todo-name").textContent;

			onClick_ModifyTaskTab(selectedTaskName);
		});

		checkboxesHTML.forEach((checkbox) => {
			checkbox.addEventListener("click", function (event) {
				event.stopPropagation();
			});
		});
	});
}
setUpButtonCheckboxes();

const modifyTaskTab = document.querySelector(".add-button-container");

const addButton = document.querySelector(".add-task-button");

const modifyButton = document.querySelector(".modify-task-button");
const deleteButton = document.querySelector(".delete-task-button");
const annulerButton = document.querySelector(".cancel-task-button");

function onClick_ModifyTaskTab(name) {
	if (modifyTaskTab.classList.contains("closed")) {
		modifyTaskTab.classList.remove("closed");
	}

	if (name) {
		const taskFound = taskList.find((task) => task.name === name);
		if (taskFound) {
			taskTitleInput.value = taskFound.name;
			taskDescriptionInput.value = taskFound.description;
			taskTimeInput.value = taskFound.time;

			if (modifyButton.classList.contains("hidden")) {
				modifyButton.classList.remove("hidden");
			}
			if (deleteButton.classList.contains("hidden")) {
				deleteButton.classList.remove("hidden");
			}
			if (annulerButton.classList.contains("hidden")) {
				annulerButton.classList.remove("hidden");
			}

			if (!addButton.classList.contains("hidden")) {
				addButton.classList.add("hidden");
			}
		} else {
			alert("No task found");
		}
	}
}
function resetAndHide() {
	if (!modifyButton.classList.contains("hidden")) {
		modifyButton.classList.add("hidden");
	}
	if (!deleteButton.classList.contains("hidden")) {
		deleteButton.classList.add("hidden");
	}
	if (!annulerButton.classList.contains("hidden")) {
		annulerButton.classList.add("hidden");
	}

	if (addButton.classList.contains("hidden")) {
		addButton.classList.remove("hidden");
	}

	taskTitleInput.value = "";
	taskTimeInput.value = "";
	taskDescriptionInput.value = "";
}
function cancelModify() {
	resetAndHide();

	document.querySelector(".add-button-container").classList.toggle("closed");
}

function deleteTask() {
	const task = taskList.find((task) => task.name === taskTitleInput.value);
	if (task) {
		const index = taskList.indexOf(task);
		if (index > -1) {
			taskList.splice(index, 1);
		}

		const taskElement = Array.from(document.querySelectorAll(".todo-name"))
			.find((todoNameElement) => {
				return todoNameElement.textContent === task.name;
			})
			?.closest(".todo-main-item");

		if (taskElement) {
			taskElement.remove();
		}

		saveTasksToLocalStorage(); // Save updated tasks to localStorage
		resetAndHide();
	} else {
		alert("Task not found");
	}
}
function modifyTask() {
	const task = taskList.find((task) => task.name === selectedTaskName);
	if (task) {
		let modified = false;

		if (task.name !== taskTitleInput.value) {
			task.name = taskTitleInput.value;
			modified = true;
		}
		if (task.description !== taskDescriptionInput.value) {
			task.description = taskDescriptionInput.value;
			modified = true;
		}
		if (task.time !== taskTimeInput.value) {
			task.time = taskTimeInput.value;
			modified = true;
		}

		if (modified) {
			const taskElement = Array.from(document.querySelectorAll(".todo-name"))
				.find((todoNameElement) => {
					return todoNameElement.textContent === selectedTaskName;
				})
				?.closest(".todo-main-item");

			if (taskElement) {
				taskElement.querySelector(".todo-name").textContent =
					taskTitleInput.value;
				taskElement.querySelector(".todo-time").textContent =
					taskTimeInput.value.trim();
			}

			saveTasksToLocalStorage(); // Save updated tasks to localStorage
		}

		resetAndHide();
	} else {
		alert("Task not found");
	}
}

const checkboxAI = document.querySelector(".ai-checkbox");
const sliderAI = document.getElementById("slider-tasks-ai");
const sliderAiText = document.querySelector(".label-slider-ai");
const inputApiKey = document.querySelector(".api-key-input");

async function sendRequest(apiKey, prompt) {
	const payload = {
		apikey: apiKey,
		prompt: prompt
	};

	try {
		const response = await fetch("http://localhost:3000/call-anthropic", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		if (response.ok) {
			const data = await response.json();
			console.log("Response from backend:", data);
			return data;
		} else {
			console.error("Failed to send request:", response.statusText);
			throw new Error("Request failed with status: " + response.statusText);
		}
	} catch (error) {
		console.error("Error sending request:", error);
		throw error;
	}
}

sliderAiText.innerHTML = "Nombre de tache: " + sliderAI.value;

sliderAI.oninput = function () {
	sliderAiText.innerHTML = "Nombre de tache: " + this.value;
};

checkboxAI.addEventListener("change", () => {
	if (checkboxAI.checked) {
		if (!taskTimeInput.classList.contains("hidden")) {
			taskTimeInput.classList.add("hidden");
			sliderAI.classList.remove("hidden");
			sliderAiText.classList.remove("hidden");
			inputApiKey.classList.remove("hidden");
		}
	} else {
		if (taskTimeInput.classList.contains("hidden")) {
			taskTimeInput.classList.remove("hidden");
			sliderAI.classList.add("hidden");
			sliderAiText.classList.add("hidden");
			inputApiKey.classList.add("hidden");
		}
	}
});

function renderTask(task) {
	const newTask = document.createElement("li");
	newTask.className = "todo-main-item";

	newTask.innerHTML = `
        <div class="todo-item-main-container">
            <button class="name-container">
                <div class="item-checkbox">
                    <input type="checkbox" class="taskbox" />
                </div>
                <div class="todo-name">${task.name}</div>
            </button>
            <div class="time-container">
                <div class="todo-time">${task.time}</div>
            </div>
        </div>
    `;

	const checkbox = newTask.querySelector(".taskbox");
	checkbox.addEventListener("change", function () {
		const taskItem = this.closest(".todo-main-item");
		if (this.checked) {
			taskItem.style.textDecoration = "line-through";
		} else {
			taskItem.style.textDecoration = "none";
		}
	});

	document.querySelector(".todo-list-controller").appendChild(newTask);
	setUpButtonCheckboxes();
}

async function addTask() {
	if (!checkboxAI.checked) {
		const task = new Task(
			taskTitleInput.value,
			taskDescriptionInput.value,
			taskTimeInput.value
		);
		taskList.push(task);

		renderTask(task);
		saveTasksToLocalStorage();

		taskTitleInput.value = "";
		taskTimeInput.value = "";
		taskDescriptionInput.value = "";
	} else {
		const numSubtasks = sliderAI.value;

		const response = await sendRequest(
			inputApiKey.value,
			`
            You are tasked with breaking down a main task into a list of subtasks and returning the result as a JSON array. Follow these instructions carefully:
            
            1. You will be given a main task in the following format:
            <main_task>
            Task: ${taskTitleInput.value}  Description: ${taskDescriptionInput.value}
            </main_task>
            
            2. Analyze the main task and break it down into ${numSubtasks} logical subtasks that would be necessary to accomplish the main task.
            
            3. For each subtask, determine:
               a) A short, descriptive name
               b) A brief description of what needs to be done
               c) An estimated duration for the subtask (in 24-hour format)
            
            4. Format each subtask as a JSON object with the following structure:
               {
                 "name": "Subtask Name",
                 "description": "Description of the subtask",
                 "time": "HH:MM"
               }
            
            5. Return ONLY the JSON array, without any additional text, explanations, or formatting. The output should be valid JSON that can be parsed by a JSON parser.
            
            Example of the expected output format:
            [
              {
                "name": "Subtask 1",
                "description": "Description for subtask 1",
                "time": "09:30"
              },
              {
                "name": "Subtask 2",
                "description": "Description for subtask 2",
                "time": "11:00"
              },
              {
                "name": "Subtask 3",
                "description": "Description for subtask 3",
                "time": "14:45"
              }
            ]
            
            Remember, your response should contain ONLY the JSON array, nothing else.
        `
		);

		if (response && response.content && response.content.length > 0) {
			try {
				const subtasks = JSON.parse(response.content[0].text);

				if (Array.isArray(subtasks)) {
					subtasks.forEach((subtaskData) => {
						const subtask = new Task(
							subtaskData.name,
							subtaskData.description,
							subtaskData.time
						);
						taskList.push(subtask);
						renderTask(subtask);
					});

					saveTasksToLocalStorage();
				} else {
					console.error("Invalid subtask format received from AI.");
				}
			} catch (error) {
				console.error("Error parsing AI response:", error);
			}
		} else {
			console.error("Failed to receive valid response from AI.");
		}

		taskTitleInput.value = "";
		taskTimeInput.value = "";
		taskDescriptionInput.value = "";
	}
}

function saveTasksToLocalStorage() {
	localStorage.setItem("tasks", JSON.stringify(taskList));
}
function loadTasksFromLocalStorage() {
	const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
	tasks.forEach((taskString) => {
		const task = JSON.parse(taskString);
		const taskInstance = new Task(task.name, task.description, task.time);
		taskList.push(taskInstance);
		renderTask(taskInstance);
	});
}

loadTasksFromLocalStorage();
