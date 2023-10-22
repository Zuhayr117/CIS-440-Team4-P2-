async function getTasks() {
    localStorage.setItem("currentUserId", 2); // Set the value for the "currentUserId" key
    let currentUserId = localStorage.getItem("currentUserId");
    
    try {
        let response = await fetch(`/getGoals?userId=${currentUserId}`);
        let data = await response.json();

        console.log(data); // Now 'data' is a JavaScript object
        console.log(data["data3"]);

        let tasks = data["data3"];
        console.log(tasks);

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
    } catch (error) {
        console.error('Error fetching data:', error);
        let taskListBox = document.getElementById('taskListId');
        taskListBox.innerHTML = "Likely need to reload server";
    }
}

function updateTask(id) {
    console.log("updateTask");
    console.log(id);
    let taskObject = document.getElementById(id);
    console.log(taskObject);
    console.log(taskObject.checked);
    let goalId = id.match(/\d+/);
    console.log(goalId[0]);
    
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
        } else {
            console.error("Error updating the task.");
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
}