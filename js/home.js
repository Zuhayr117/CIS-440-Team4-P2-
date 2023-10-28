/// function to get tasks and their saved data from mysql
async function getTasks() {
    // Replace this line with your actual login functionality
    localStorage.setItem("currentUserId", 2);
    let currentUserId = localStorage.getItem("currentUserId");

    try {
        // Make an HTTP request to your Node.js server
        let response = await fetch(`/getGoals?userId=${currentUserId}`);
        if (response.ok) {
            let data = await response.json();

            // Process the data and update your DOM as needed
            let tasks = data["data3"];
            let taskListBox = document.getElementById('taskListId');
            
            // Clear the taskListBox before adding new tasks
            taskListBox.innerHTML = "";
            
            for (let i = 0; i < tasks.length; i++) {
                let taskList = document.createElement('li');
                let taskInput = document.createElement('input');
                taskInput.type = "checkbox";
                taskInput.checked = tasks[i]["complete"] > 0;
                taskInput.setAttribute("id", "task-item-" + tasks[i]["goal_id"]);
                taskInput.addEventListener("change", function () {
                    updateTask(this.id);
                });

                let taskLabel = document.createElement('label');
                taskLabel.innerHTML = tasks[i]["info"];
                taskLabel.setAttribute("for", "task-item-" + tasks[i]["goal_id"]);

                taskList.appendChild(taskInput);
                taskList.appendChild(taskLabel);
                taskListBox.appendChild(taskList);
            }

            // Finally, initialize the progress bar
            updateProgressBar();
        } else {
            console.error('Error fetching data:', response.statusText);
            let taskListBox = document.getElementById('taskListId');
            taskListBox.innerHTML = "Likely need to reload the server";
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        let taskListBox = document.getElementById('taskListId');
        taskListBox.innerHTML = "Likely need to reload the server";
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
    updateDisabled(listItemElements, totalTasksCompleted);
}

function updateDisabled(taskCheckBoxes, currentTaskId) {
    for (let i=0; i < taskCheckBoxes.length; i++) {
        if (i == currentTaskId) {
            if (i != 0) {
                taskCheckBoxes[i-1].disabled = false;
            }
            taskCheckBoxes[i].disabled = false;
        } else {
            taskCheckBoxes[i].disabled = true;
        }
    }
}

// log out
function logout (){

    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
       

    }
    
)

window.location.href = "/index.html";// changes page to login page after logging out
}
