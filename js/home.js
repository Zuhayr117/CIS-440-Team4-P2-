var currentRoadmap = ""; //global variable for roadmap functionality

function moveTaskUp(taskElement) {
    const previousTask = taskElement.previousElementSibling;
    if (previousTask) {
        taskElement.parentNode.insertBefore(taskElement, previousTask);
    }
}

function moveTaskDown(taskElement) {
    const nextTask = taskElement.nextElementSibling;
    if (nextTask) {
        taskElement.parentNode.insertBefore(nextTask, taskElement);
    }
}

function deleteTask(taskElement, goalId) {
    // You can remove the task from the DOM
    taskElement.parentNode.removeChild(taskElement);

    // Optionally, make an API call to delete the task from the server
    const taskId = goalId; // Extract the task ID
    fetch(`/deleteTask?id=${taskId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log(`Task with ID ${taskId} deleted successfully.`);
        } else {
            console.error(`Error deleting the task with ID ${taskId}.`);
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
}

function populateLeaderboardComponent(data, id) {
    let roleContainer = document.getElementById(id);
    for (let i = 0; i < data.length; i++) {
        let userLeader = document.createElement("li");
        userLeader.innerHTML = `${data[i].name}: ${data[i].points} point(s)`;
        roleContainer.appendChild(userLeader);
    }
}

/// function to set up leaderboard
async function populateLeaderboard() {
    //console.log("inside populateLeaderboard");
    try {
        let response = await fetch(`/getTopFiveMentees`);
        if (response.ok) {
            let data = await response.json();
            /*console.log("top mentees");
            console.log(data);*/
            populateLeaderboardComponent(data, "topFiveMentees");
        }
        response = await fetch(`/getTopFiveMentors`);
        if (response.ok) {
            let data = await response.json();
            /*console.log("top mentors");
            console.log(data);*/
            populateLeaderboardComponent(data, "topFiveMentors");
        }
    } catch (err) {
        console.error('Error fetching data:', error);
    }
}

/// function to get tasks and their saved data from mysql
async function getTasks(relationshipId) {
    try {
        // Make an HTTP request to your Node.js server
        let response = await fetch(`/getGoals?relationship_id=${relationshipId}`);
        if (response.ok) {
            let data = await response.json();
            /*console.log("printing tasks:");
            console.log(data);*/
            // Process the data and update your DOM as needed
            let tasks = data;
            let taskListBox = document.getElementById('taskListId');
            // Clear the taskListBox before adding new tasks
            taskListBox.innerHTML = "";
            if (tasks.length > 0) {
                for (let i = 0; i < tasks.length; i++) {
                    let taskList = document.createElement('li');

                    // up button that changes position of items
                    let moveUpButton = document.createElement('button');
                    moveUpButton.innerHTML = '↑';
                    moveUpButton.setAttribute("id", "task-up-" + tasks[i]["id"]);
                    moveUpButton.addEventListener('click', function() {
                        moveTaskUp(this.parentNode);
                    });

                    // down button that changes position of items
                    let moveDownButton = document.createElement('button');
                    moveDownButton.innerHTML = '↓';
                    moveDownButton.setAttribute("id", "task-down-" + tasks[i]["id"]);
                    moveDownButton.addEventListener('click', function() {
                        moveTaskDown(this.parentNode);
                    });

                    // X button to delete tasks
                    let  goalId = data.goalId;
                    let deleteButton = document.createElement('button');
                    deleteButton.innerHTML = 'X';
                    deleteButton.setAttribute("id", "task-x-" + tasks[i]["id"]);
                    deleteButton.addEventListener('click', function() {
                    deleteTask(this.parentNode, (i+1));
                    });

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
                    
                    // to save up down movement
                    taskList.appendChild(moveUpButton);
                    taskList.appendChild(moveDownButton);
                   
                    // to delete button                    
                    taskList.appendChild(deleteButton);
                    
                    // add task color functionality
                    if (tasks[i]["created_by"] == "mentor") {
                        taskLabel.style.color = "#007bff";
                    } else if (tasks[i]["created_by"] == "mentee") {
                        taskLabel.style.color = "green";
                    }

                    taskList.appendChild(taskInput);
                    taskList.appendChild(taskLabel);
                    taskListBox.appendChild(taskList);
                }
    
                // Finally, initialize the progress bar
                updateProgressBar();
            } else {
                taskListBox.innerHTML = "No assigned tasks.";
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

function hideProgress(role) {
    let progressChildren = document.getElementById("progress").children;
    console.log(progressChildren);
    // To hide child elements
    for (var i = 0; i < progressChildren.length; i++) {
        progressChildren[i].style.display = "none";
    }

    let noRelationshipsElement = "";
    if (role == "mentor") {
        noRelationshipsElement = document.getElementById("mentorNoRelationships");
    } else if (role == "mentee") {
        noRelationshipsElement = document.getElementById("menteeNoRelationships");
    }
    console.log(noRelationshipsElement);
    noRelationshipsElement.style.display = "block";
}

function showProgress() {
    let progressChildren = document.getElementById("progress").children;
    console.log(progressChildren);
    // To show child elements
    for (var i = 0; i < progressChildren.length; i++) {
        progressChildren[i].style.display = "block";
    }
}

async function getRelationships(selectedId) {
    /*console.log("current user info: ");
    console.log(localStorage.getItem("userInfo"));*/
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
            /*console.log("relationships retrieved");
            console.log(data);*/
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
            // if no relationship...
            if (data.length == 0) {
                console.log("No registered relationships");
                hideProgress(currentRole);
                return;
            }
            if (currentRole == "mentor") {
                let addNewRelationship = document.createElement("option");
                addNewRelationship.innerHTML = "Initiate New Mentorship..."
                addNewRelationship.value = 0;
                relationshipDropdown.appendChild(addNewRelationship);
            }
        } else {
            console.error('Response not OK:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    let relationshipId = localStorage.getItem("currentRelationshipId");
    if (selectedId > 0) {
        console.log("selectedId not 0");
        setDropdown(selectedId);
        localStorage.setItem("currentRelationshipId", selectedId);
        showProgress();
        document.getElementById("mentorNoRelationships").style.display = "none";
        document.getElementById("menteeNoRelationships").style.display = "none";
        relationshipId = selectedId;
    }
    getTasks(relationshipId);
    initializeRoadmap(relationshipId);
}

function initiateRelationship() {
    let modal = document.getElementById('popupModal');
    let span = document.getElementsByClassName('close')[0];

    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function dropdownChanged(value) {
    if (value == 0) {
        // initiate a new relationship
        initiateRelationship();
       // Change the selected option to the first one (index 0)
       let relationshipDropdown = document.getElementById("relationshipDropdown");
       relationshipDropdown.selectedIndex = 0;
    } else {
        localStorage.setItem("currentRelationshipId", value);
        let newRelationshipId = localStorage.getItem("currentRelationshipId");
        console.log("newRelationshipId", newRelationshipId);
        getTasks(newRelationshipId);
        initializeRoadmap(newRelationshipId);
    }
}

async function initializeRoadmap(relationshipId) {
    //console.log("printing relationship_id for roadmap: ", relationshipId);
    let currentQuarter = 0;
    try {
        //console.log(relationshipId);
        // Make an HTTP request to your Node.js server
        let response = await fetch(`/getRelationship?relationshipId=${relationshipId}`);
        if (response.ok) {
            let data = await response.json();
            /*console.log("printing single relationship:");
            console.log(data);
            console.log(data[0]);*/
            let startDate = data[0].start_date;
            let endDate = data[0].end_date;
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            // Calculate the time difference in milliseconds
            const timeDifference = endDate - startDate;

            // Calculate the number of days
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            //console.log("Number of days between the dates: ", daysDifference);
            const quarterLength = (daysDifference / 4).toFixed(0);
            //console.log("Split into four: ", quarterLength);

            // Calculate the starting date for each quarter
            const quarterStartDates = [];
            for (let i = 0; i < 4; i++) {
                const quarterStartDate = new Date(startDate.getTime() + i * quarterLength * 24 * 60 * 60 * 1000);
                quarterStartDates.push(quarterStartDate.toISOString().split('T')[0]);
            }

            //console.log("Starting dates for each quarter: ", quarterStartDates);
            let currentDate = Date.now();
            for (let i = 0; i < quarterStartDates.length; i++) {
                if (currentDate >= new Date(quarterStartDates[i])) {
                    currentQuarter = i + 1;
                } else {
                    break;  // Stop checking once we find the correct quarter
                }
            }

            //console.log("Current date falls into Quarter: ", currentQuarter);
            let roadMapInfoDiv;
            let roadMapColorDiv;
            //console.log('currentQuarter: ', currentQuarter);
            // reset colors
            // Get references to the elements
            const roadMap1 = document.getElementById('roadMap-1');
            const roadMap2 = document.getElementById('roadMap-2');
            const roadMap3 = document.getElementById('roadMap-3');
            const roadMap4 = document.getElementById('roadMap-4');

            // Set background color for roadMap-1, roadMap-2, roadMap-3, roadMap-4
            roadMap1.style.backgroundColor = 'rgba(0, 123, 255, 0.5)';
            roadMap2.style.backgroundColor = 'rgba(0, 123, 255, 0.5)';
            roadMap3.style.backgroundColor = 'rgba(0, 123, 255, 0.5)';
            roadMap4.style.backgroundColor = 'rgba(0, 123, 255, 0.5)';
            // change colors
            //console.log("currentQuarter: ", currentQuarter);
            if (currentRoadmap != "") {
                currentRoadmap.style.display = "none";
                currentRoadmap.addEventListener('mouseover', function () {
                    this.style.display = "block";
                });
                currentRoadmap.addEventListener('mouseout', function () {
                    this.style.display = "none";
                });
            }
            switch (currentQuarter) {
                case 3:
                    roadMapInfoDiv = document.getElementById("roadMap-q3");
                    roadMapColorDiv = document.getElementById("roadMap-3");
                    break;
                case 2:
                    roadMapInfoDiv = document.getElementById("roadMap-q2")
                    roadMapColorDiv = document.getElementById("roadMap-2");
                    break;
                case 1:
                case 0:
                    roadMapInfoDiv = document.getElementById("roadMap-q1")
                    roadMapColorDiv = document.getElementById("roadMap-1");
                    break;
                case 4:
                default:
                    roadMapInfoDiv = document.getElementById("roadMap-q4")
                    roadMapColorDiv = document.getElementById("roadMap-4");
            }
            currentRoadmap = roadMapInfoDiv
            roadMapInfoDiv.style.display = "block";
            roadMapColorDiv.style.backgroundColor = "rgba(0, 123, 255, .8)";

        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function initializeMenteeOptions() {
    //console.log("inside initializeMenteeOptions");
    try {
        let currentUserInfo = localStorage.getItem("userInfo");
        let userInfoObject = JSON.parse(currentUserInfo);
        let currentUserId = userInfoObject[0].id;
        let currentRole = userInfoObject[0].role;
        // Make an HTTP request to your Node.js server
        let response = await fetch(`/getMentees`);
        if (response.ok) {
            let data = await response.json();
            // find mentees already in a mentorship with mentor
            let check = await fetch(`/getRelationships?userId=${currentUserId}&userRole=${currentRole}`);
            if (check.ok) {
                let checkData = await check.json();
                let unavailableMentees = []
                for (let i = 0; i < checkData.length; i++) {
                    unavailableMentees.push(checkData[i].mentee_id)
                }
                let availableMentees = {}
                for (let i = 0; i < data.length; i++) {
                    availableMentees[data[i].mentee_id] = data[i].name;
                }
                unavailableMentees.forEach(function(id) {
                    if (availableMentees[id]) {
                        delete availableMentees[id];
                    }
                });
                // insert available mentees into dropDown
                insertMenteeOptions(availableMentees);
            }
        } 
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function insertMenteeOptions(mentees) {
    let menteeOptionsBox = document.getElementById("menteesRegistered");
    /*console.log("mentee: ");
    console.log(mentees);*/
    /*if (mentees.length == 0) {
        let noOption = document.createElement("option");
        noOption.innerHTML = "No Mentees";
        noOption.value = 0;
        menteeOptionsBox.appendChild(noOption);
    }*/
    for (let key in mentees) {
        let menteeOption = document.createElement("option");
        menteeOption.innerHTML = mentees[key];
        menteeOption.value = key;
        menteeOptionsBox.appendChild(menteeOption);
    }
}

async function addMentorship(form) {
    let selectedMenteeId = form.menteesRegistered.options[form.menteesRegistered.selectedIndex].value;
    let selectedMentee = form.menteesRegistered.options[form.menteesRegistered.selectedIndex].text;
    let startDate = form.startDate.value;
    let endDate = form.endDate.value;

    if (form.startDate.value == "" || form.endDate.value == "") {
        alert("Missing date(s) or date(s) are invalid.");
    }
    else if (form.menteesRegistered.value === "0") {
        alert("Please select a mentee.");
    }
    else if (form.startDate.value > form.endDate.value) {
        alert("End date CANNOT preclude start date");
    }
    else {
        let confirmationMessage = `Are you sure you wish to set sail with ${selectedMentee} from ${startDate} to ${endDate}?`;
        let confirm = window.confirm(confirmationMessage);
        if (confirm) {
            let currentUserInfo = localStorage.getItem("userInfo");
            let userInfoObject = JSON.parse(currentUserInfo);
            let currentUserId = userInfoObject[0].id;
            try {
                let response = await fetch(`/getMentor?userId=${currentUserId}`);
                if (response.ok) {
                    let mentorData = await response.json();
                    let mentorId = mentorData[0].mentor_id;
                    let newRow = {
                        mentor_id: mentorId,
                        mentee_id: selectedMenteeId,
                        start_date: startDate,
                        end_date: endDate
                    };
                    // Send an AJAX POST request to update the server-side database with the new data
                    $.ajax({
                        type: "POST",
                        url: "/insertRelationship",
                        contentType: "application/json", // Set content type to JSON
                        data: JSON.stringify(newRow), // Convert the JavaScript object to JSON
                        success: function (response) {
                            console.log("New mentorship added to the database");
                            let modal = document.getElementById('popupModal');
                            modal.style.display = "none";
                            //console.log(response);
                            let newRelationshipId = response.lastId;
                            //console.log(newRelationshipId);
                            getRelationships(newRelationshipId);
                        },
                        error: function (error) {
                            console.error("Error adding a new mentorship: "
                                + error.responseText);
                        }
                    });
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        }
        else {
            console.log("cancelling...");
        }
    }
}

function setDropdown(value) {
    console.log('inside setDropdown');
    let dropdown = document.getElementById("relationshipDropdown");

    for (let option of dropdown.options) {
        if (option.value == value) {
            option.selected = true;
        } else {
            option.selected = false;
        }
    }
}

const roadMapQElements = document.querySelectorAll('.roadMap-q');

roadMapQElements.forEach((roadMapQ) => {
    roadMapQ.addEventListener('mouseout', () => {
        roadMapQ.style.display = 'none'; // Reset the display style to none
    });
});

document.addEventListener("DOMContentLoaded", initializeMenteeOptions);
document.addEventListener("DOMContentLoaded", getRelationships(-1));
document.addEventListener("DOMContentLoaded", populateLeaderboard);