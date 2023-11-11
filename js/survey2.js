var globalCurrentRole = ""
var currentMenteeId = "";
var currentMentorId = "";
var currentRelationshipId = localStorage.getItem("currentRelationshipId");

async function getRelationshipInfo() {
    let currentUserInfo = localStorage.getItem("userInfo");
    let userInfoObject = JSON.parse(currentUserInfo);
    let currentRole = userInfoObject[0].role;
    globalCurrentRole = currentRole;

    let response = await fetch(`/getRelationshipInfo?relationshipId=${currentRelationshipId}`);
        if (response.ok) {
            let data = await response.json();
            console.log(data);
            currentMenteeId = data[0].mentee_id;
            currentMentorId = data[0].mentor_id;
        }
}

async function showSurvey() {
    let currentUserInfo = localStorage.getItem("userInfo");
    let userInfoObject = JSON.parse(currentUserInfo);
    let currentUserId = userInfoObject[0].id;
    let currentRole = userInfoObject[0].role;
    globalCurrentRole = currentRole;
    

    console.log("current role: ", currentRole);
    if (currentRole == 'mentor') {
        let surveyForMentor = document.getElementById("surveyForMentor");
        //console.log(surveyForMentee);
        //console.log(surveyForMentor);
        console.log("mentor role");
        //document.getElementById("surveyForMentee").style.display = 'none';
        document.getElementById("surveyForMentor").style.display = 'block';
        /*surveyForMentor.style.display = 'block';
        surveyForMentee.style.display = 'none';*/
        console.log("currentR id: ");
        console.log(currentRelationshipId);
        let response = await fetch(`/getMenteeInfo?relationshipId=${currentRelationshipId}`);
        if (response.ok) {
            let data = await response.json();
            console.log(data);
            let mentorSurveyTitle = document.getElementById("mentorSurveyTitle");
            mentorSurveyTitle.innerHTML = `Feedback for ${data[0].name} (Mentee):`
        }
    } else if (currentRole == 'mentee') {
        console.log("mentee role");
        console.log("currentR id: ");
        console.log(currentRelationshipId);
        document.getElementById("surveyForMentee").style.display = 'block';
        //document.getElementById("surveyForMentor").style.display = 'none';
        let response = await fetch(`/getMentorInfo?relationshipId=${currentRelationshipId}`);
        if (response.ok) {
            let data = await response.json();
            console.log(data);
            let menteeSurveyTitle = document.getElementById("menteeSurveyTitle");
            menteeSurveyTitle.innerHTML = `Feedback for ${data[0].name} (Mentor):`
        }
    }
}

async function recordResponses(form) {
    // Create an object to store the responses
    var surveyResponses = {};

    // Iterate through each fieldset in the form
    form.querySelectorAll('fieldset').forEach(function (fieldset, index) {
        // Create an object for each fieldset
        var fieldsetResponses = {};

        // Iterate through the radio buttons in the fieldset
        fieldset.querySelectorAll('input[type="radio"]').forEach(function (radio) {
            // Check if the radio button is checked
            if (radio.checked) {
                // Add the value to the fieldsetResponses object
                fieldsetResponses[radio.name] = radio.value;
            }
        });

        // Add the fieldsetResponses object to the main responses object
        surveyResponses['fieldset' + (index + 1)] = fieldsetResponses;
    });

    // Get the value of the textarea for future improvement
    surveyResponses['extraComment'] = form.querySelector('textarea[name="commentsBox"]').value;

    surveyResponses['relationshipId'] = currentRelationshipId;
    surveyResponses['menteeId'] = currentMenteeId;
    surveyResponses['mentorId'] = currentMentorId;
    // Log the responses object
    console.log(surveyResponses);
    if(globalCurrentRole == "mentee") {
    // Send an AJAX POST request to update the server-side database with the new data
    $.ajax({
        type: "POST",
        url: "/insertFeedbackForMentor",
        contentType: "application/json", // Set content type to JSON
        data: JSON.stringify(surveyResponses), // Convert the JavaScript object to JSON
        success: function (response) {
            console.log("Feedback for mentor added to the database");
        },
        error: function (error) {
            console.error("Error adding a feedback for mentor to the database: "
                + error.responseText);
        }
    });
    }
    else if (globalCurrentRole == "mentor") {
        // Send an AJAX POST request to update the server-side database with the new data
        console.log(surveyResponses);

        $.ajax({
        type: "POST",
        url: "/insertFeedbackForMentee",
        contentType: "application/json", // Set content type to JSON
        data: JSON.stringify(surveyResponses), // Convert the JavaScript object to JSON
        success: function (response) {
            console.log("Feedback for mentee added to the database");
            /*window.location.href = "./home.html";*/
        },
        error: function (error) {
            console.error("Error adding a feedback for mentee to the database: "
                + error.responseText);
        }
    });
    }
       
}

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

document.addEventListener("DOMContentLoaded", showSurvey);
document.addEventListener("DOMContentLoaded", getRelationshipInfo);