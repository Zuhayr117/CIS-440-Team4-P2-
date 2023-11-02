
function unhide(){
    document.getElementById('taskAdd').style.visibility = 'visible';
}
  
// This will turn into if statement to seee which radio button is selescted
  // Get a reference to the radio buttons
const RadioButtonFeedbackSession = document.getElementById("feedbackSesh");
const RadioButtoncareerDev = document.getElementById("careerDev");
const RadioButtonplanning = document.getElementById("planning");
const RadioButtoncustom = document.getElementById("custom");
let currentUserInfo = localStorage.getItem("userInfo");
    let userInfoObject = JSON.parse(currentUserInfo);
    let currentUserId = userInfoObject[0].id;
    let currentRole = userInfoObject[0].role;

// Add a single event listener to handle radio button changes
function handleRadioButtonChange() {
    switch (this.value) {
        case "Feedback Session":
            // Code to handle Option 1
            document.getElementById('addTaskButton').addEventListener('click', function() {
              const relationshipId = localStorage.getItem("currentRelationshipId");
              const priority = 3
              const info = document.getElementById('feedbackSesh').value;
              const currentComplete = 0;
              const deadlineDate = document.getElementById('deadlineDate').value;
              const createdBy = currentRole;
            
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
          
            console.log("Feedback Session selected");
            break;
        case "Career Development":
            // Code to handle Option 2
            console.log("Career Development selected");
            break;
        case "Planning":
            // Code to handle Option 1
            console.log("Planning selected");
            break;
        case "Custom":
            // Code to handle Option 2
            document.getElementById('unhide').style.visibility = 'visible';
            document.getElementById('addCustomTaskButton').addEventListener('click', function() {
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
            
            console.log("Custom selected");
            break;

        default:
            // Handle unexpected cases
            console.log("Unknown option selected");
    }
}

RadioButtonFeedbackSession.addEventListener("change", handleRadioButtonChange);
RadioButtoncareerDev.addEventListener("change", handleRadioButtonChange);
RadioButtonplanning.addEventListener("change", handleRadioButtonChange);
RadioButtoncustom.addEventListener("change", handleRadioButtonChange);
