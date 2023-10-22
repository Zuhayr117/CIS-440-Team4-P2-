/// function to get tasks and their saved data from mysql
async function getTasks() {
    // once login page is set up, these two lines will need to change
    localStorage.setItem("currentUserId", 2);
    let currentUserId = localStorage.getItem("currentUserId");
    
    try {
        // get info from mysql
        let response = await fetch(`/getGoals?userId=${currentUserId}`);
        let data = await response.json();

        // this is the data to use
        let tasks = data["data3"];

        // this is the object to put the tasks from mysql in
        let taskListBox = document.getElementById('taskListId');
        console.log(taskListBox);
        for (let i = 0; i < tasks.length; i++) {
            let taskList = document.createElement('li');
            let taskInput = document.createElement('input');
            taskInput.type = "checkbox";
            if (tasks[i]["complete"] > 0) {
                taskInput.checked = true;
            } else {
                taskInput.checked = false;
            }
            
            taskInput.setAttribute("id", "task-item-" + tasks[i]["goal_id"]);
            taskInput.setAttribute("onchange", "updateTask(this.id)");
            let taskLabel = document.createElement('label');
            taskLabel.innerHTML = tasks[i]["info"];
            taskLabel.setAttribute("for", "task-item-" + tasks[i]["goal_id"]);
            taskList.appendChild(taskInput);
            let taskListBox = document.getElementById('taskListId');
            taskList.appendChild(taskLabel);
            taskListBox.appendChild(taskList);
        }

        // finally, initialize progress bar
        updateProgressBar()
    } catch (error) {
        console.error('Error fetching data:', error);
        let taskListBox = document.getElementById('taskListId');
        taskListBox.innerHTML = "Likely need to reload server";
    }
}

/// function that marks a task as complete, or undoes a completion and
/// saves it to mysql
function updateTask(id) {
    let taskObject = document.getElementById(id);
    let goalId = id.match(/\d+/);
    // Create an object with the data you want to send
    let data = {
        currentComplete: taskObject.checked ? 1 : 0,
        goalId: parseInt(goalId[0])
    };
    
    fetch('/setTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log("Task updated successfully.");
            updateProgressBar();
        } else {
            console.error("Error updating the task.");
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
}

/// function to update the progressBar
function updateProgressBar() {
    let progressBar = document.getElementById("progressMeterId");
    let taskListBox = document.getElementById("taskListId");
    let listItemElements = taskListBox.querySelectorAll("input");
    let totalTasks = listItemElements.length;
    let totalTasksCompleted = 0;
    listItemElements.forEach(function (checkbox) {
        if (checkbox.checked) {
          totalTasksCompleted = totalTasksCompleted + 1;
        }
      });
    let percentTasksCompleted = totalTasksCompleted / totalTasks * 100;
    let progressMeter = document.getElementById("progressId");
    // hardcoded 200 because that is the width of the progress-meter on home.html
    let newWidth = percentTasksCompleted / 100 * 200;
    progressMeter.style.width = newWidth + "px";
}