document.getElementById('addTaskButton').addEventListener('click', function() {
    const relationshipId = document.getElementById('relationshipId').value;
    const priority = document.getElementById('priority').value;
    const info = document.getElementById('info').value;
    const currentComplete = document.getElementById('currentComplete').checked ? 1 : 0;
    const deadlineDate = document.getElementById('deadlineDate').value;
    const createdBy = document.getElementById('createdBy').value;
  
    const data = {
      relationshipId,
      priority,
      info,
      currentComplete,
      deadlineDate,
      createdBy,
    };
  
    fetch('/addTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (response.ok) {
        console.log("Task added successfully.");
        // Optionally, you can reset the form fields or perform other actions here.
      } else {
        console.error("Error adding the task.");
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
  });

function unhide(){
    document.getElementById('taskAdd').style.visibility = 'visible';
}
  

function unhideCustom(){
  document.getElementById('unhide').style.visibility = 'visible';
}
