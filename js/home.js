/// function to get tasks and their saved data from mysql
async function getTasks(relationshipId) {
    try {
        // Make an HTTP request to your Node.js server
        let response = await fetch(`/getGoals?relationship_id=${relationshipId}`);
        if (response.ok) {
            let data = await response.json();
            // Process the data and update your DOM as needed
            let tasks = data;
            let taskListBox = document.getElementById('taskListId');
            
            // Clear the taskListBox before adding new tasks
            taskListBox.innerHTML = "";
            if (tasks.length > 0) {
                for (let i = 0; i < tasks.length; i++) {
                    let taskList = document.createElement('li');
                    let taskInput = document.createElement('input');
                    taskInput.type = "checkbox";
                    taskInput.checked = tasks[i]["complete"] > 0;
                    taskInput.setAttribute("id", "task-item-" + tasks[i]["id"]);
                    taskInput.addEventListener("change", function () {
                        updateTask(this.id);
                    });
    
                    let taskLabel = document.createElement('label');
                    taskLabel.innerHTML = tasks[i]["info"];
                    taskLabel.setAttribute("for", "task-item-" + tasks[i]["id"]);
    
                    taskList.appendChild(taskInput);
                    taskList.appendChild(taskLabel);
                    taskListBox.appendChild(taskList);
                }
    
                // Finally, initialize the progress bar
                updateProgressBar();
            } else {
                taskListBox.innerHTML = "No tasks assigned.";
                taskListBox.style.marginLeft = "20px";
                taskListBox.style.marginTop = "20px";

                let noProgress = document.getElementById("progressId");
                noProgress.style.width = 0;
            }

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
    let newWidth = percentTasksCompleted / 100;
    newWidth = Math.ceil(newWidth * 0.95 * 100); // Round up to the nearest integer
    if (newWidth != 0)
    {
        newWidth = newWidth + 5;
    }
    progressMeter.style.width = newWidth + "%";
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
    if (currentTaskId == taskCheckBoxes.length)
    {
        taskCheckBoxes[currentTaskId - 1].disabled = false;
    }
}
// log out
function logOut (){
    fetch('/logOut', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }
    );
    localStorage.clear();
    window.location.href = "/index.html";// changes page to login page after logging out
}

async function getRelationships() {
    console.log("current user info: ");
    console.log(localStorage.getItem("userInfo"));
    let currentUserInfo = localStorage.getItem("userInfo");
    let userInfoObject = JSON.parse(currentUserInfo);
    let currentUserId = userInfoObject[0].id;
    let currentRole = userInfoObject[0].role;
    // populates the Relationships dropdown
    try {
        // Make an HTTP request to your Node.js server
        let response = await fetch(`/getRelationships?userId=${currentUserId}&userRole=${currentRole}`);
        if (response.ok) {
            let data = await response.json(); // Await the JSON parsing
            console.log("relationships retrieved");
            console.log(data);
            let relationshipDropdown = document.getElementById("relationshipDropdown");
            relationshipDropdown.innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                let relationshipId = data[i].id;
                if (i == 0) {
                    localStorage.setItem("currentRelationshipId", relationshipId);
                }
                let mentorName = data[i].mentor_name;
                let menteeName = data[i].mentee_name;
                let relationshipParser = document.createElement("option");
                relationshipParser.innerHTML = `${mentorName} (Mentor) and ${menteeName} (Mentee)`;
                relationshipParser.value = relationshipId;
                relationshipDropdown.appendChild(relationshipParser);
            }
            if (currentRole == "mentor") {
                let addNewRelationship = document.createElement("option");
                addNewRelationship.innerHTML = "Initiate New Relationship..."
                addNewRelationship.value = 0;
                relationshipDropdown.appendChild(addNewRelationship);
            }
        } else {
            console.error('Response not OK:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    getTasks(localStorage.getItem("currentRelationshipId"));
}

function dropdownChanged(value) {
    if (value == 0) {
        console.log("initiate a new relationship -- to be written");
        // initiate a new relationship
        // TODO Write the code to initiate a new relationship
       // Change the selected option to the first one (index 0)
       let relationshipDropdown = document.getElementById("relationshipDropdown");
       relationshipDropdown.selectedIndex = 0;
    } else {
        localStorage.setItem("currentRelationshipId", value);
        getTasks(localStorage.getItem("currentRelationshipId"));
    }
}