
// global variables
let relationshipId = "";
let priority = "";
let info = "";
let currentComplete ="";
let deadlineDate ="";
let createdBy = "";
let data ="";
 // to get user info
 let currentUserInfo = localStorage.getItem("userInfo");
 let userInfoObject = JSON.parse(currentUserInfo);
 let currentUserId = userInfoObject[0].id;
 const today = new Date();
 const oneMonthFromNow = new Date(today);
 const options = { year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = oneMonthFromNow.toLocaleDateString('en-US', options);



function unhide(){
    document.getElementById('taskAdd').style.visibility = 'visible';
}
  

function unhideCustom(){
// get radio button
const selectedValue = document.querySelector('input[name="task"]:checked').value;

//date info
// Create a Date object for today

// Calculate a date one month from now

oneMonthFromNow.setMonth(today.getMonth() + 1);
// Handle edge cases where the day doesn't exist in the target month
if (today.getDate() !== oneMonthFromNow.getDate()) {
    // Set the day to the last day of the previous month
    oneMonthFromNow.setDate(0);
}
// You can format the result for display if needed

//

// data
relationshipId = localStorage.getItem("currentRelationshipId");
priority = 3;
info = selectedValue;
currentComplete = 0;
deadlineDate = formattedDate;
createdBy = currentUserId;
  
     data = {
      relationshipId,
      priority,
      info,
      currentComplete,
      deadlineDate,
      createdBy,
    };
//
  switch (selectedValue){
     
    //option 1
    case "Feedback Session":
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
      console.log("Handling Feedback Session");
      break;

   //option 2
    case "Career Development":
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
      console.log("Handling Career Development");
      break;

   //option 3
    case "Planning": 
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
    console.log("Handling Planning");
      break;

      //option 4
    case "Custom":
      document.getElementById('unhide').style.visibility = 'visible';
       console.log("Allow Custom");
      break;

      //option5
      default:
        console.log("error");

  }
 
}



function addCustomTaskButton(){

//date info
// Create a Date object for today

// Calculate a date one month from now

oneMonthFromNow.setMonth(today.getMonth() + 1);
// Handle edge cases where the day doesn't exist in the target month
if (today.getDate() !== oneMonthFromNow.getDate()) {
    // Set the day to the last day of the previous month
    oneMonthFromNow.setDate(0);
}
// You can format the result for display if needed


//
      relationshipId = localStorage.getItem("currentRelationshipId");
      priority = document.getElementById('priority').value;
      info = document.getElementById('info').value;
      currentComplete = document.getElementById('currentComplete').checked ? 1 : 0;
      deadlineDate = document.getElementById('deadlineDate').value;
      createdBy = currentUserId;
    
      data = {
        relationshipId,
        priority,
        info,
        currentComplete,
        deadlineDate,
        createdBy,
      };
    
      fetch("/addTask", {
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
      console.log("Handling Custom Task");
    }
