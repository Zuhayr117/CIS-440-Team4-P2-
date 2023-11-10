// document.getElementById('addTaskButton').addEventListener('click', function() {
//     const relationshipId = document.getElementById('relationshipId').value;
//     const priority = document.getElementById('priority').value;
//     const info = document.getElementById('info').value;
//     const currentComplete = document.getElementById('currentComplete').checked ? 1 : 0;
//     const deadlineDate = document.getElementById('deadlineDate').value;
//     const createdBy = document.getElementById('createdBy').value;
  
//     const data = {
//       relationshipId,
//       priority,
//       info,
//       currentComplete,
//       deadlineDate,
//       createdBy,
//     };
  
//     fetch('/addTask', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     })
//     .then(response => {
//       if (response.ok) {
//         console.log("Task added successfully.");
//         // Optionally, you can reset the form fields or perform other actions here.
//       } else {
//         console.error("Error adding the task.");
//       }
//     })
//     .catch(error => {
//       console.error("Fetch error:", error);
//     });
//   });




function unhide(){
    document.getElementById('taskAdd').style.visibility = 'visible';
}
  

function unhideCustom(){
// get radio button
const selectedValue = document.querySelector('input[name="task"]:checked').value;

  // to get user info
  let currentUserInfo = localStorage.getItem("userInfo");
  let userInfoObject = JSON.parse(currentUserInfo);
  let currentUserId = userInfoObject[0].id;

//date info
// Create a Date object for today
const today = new Date();
// Calculate a date one month from now
const oneMonthFromNow = new Date(today);
oneMonthFromNow.setMonth(today.getMonth() + 1);
// Handle edge cases where the day doesn't exist in the target month
if (today.getDate() !== oneMonthFromNow.getDate()) {
    // Set the day to the last day of the previous month
    oneMonthFromNow.setDate(0);
}
// You can format the result for display if needed
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = oneMonthFromNow.toLocaleDateString('en-US', options);
//

// data
const relationshipId = localStorage.getItem("currentRelationshipId");
    const priority = 3;
    const info = selectedValue;
    const currentComplete = 0;
    const deadlineDate = formattedDate;
    const createdBy = currentUserId;
  
    const data = {
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
       console.log("Handling Custom");
      break;

      //option5
      default:
        console.log("error");

  }
 
}



function addCustomTaskButton(){
  //date info
// Create a Date object for today
console.log("Inside addCustomTaskButton");

const today = new Date();

// You can format the result for display if needed
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = today.toLocaleDateString('en-US', options);

// to get user info
let currentUserInfo = localStorage.getItem("userInfo");
let userInfoObject = JSON.parse(currentUserInfo);
let currentUserId = userInfoObject[0].id;



      const relationshipId = localStorage.getItem("currentRelationshipId");
      const priority = document.getElementById('priority').value;
      const info = document.getElementById('info').value;
      const currentComplete = document.getElementById('currentComplete').checked ? 1 : 0;
      const deadlineDate = document.getElementById('deadlineDate').value;
      const createdBy = currentUserId;
    
      const data = {
        relationshipId,
        priority,
        info,
        currentComplete,
        deadlineDate,
        createdBy,
      };
    
 console.log("Handling Custom");


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
  }


document.addEventListener("DOMContentLoaded", function() {

  addCustomTaskButton();
});


