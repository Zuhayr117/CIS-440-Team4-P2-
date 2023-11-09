document.addEventListener("DOMContentLoaded", function() {
    let inputItems = [];
    inputItems.push(document.getElementById("inputUserName"));
    inputItems.push(document.getElementById("inputPassword"));
    inputItems.push(document.getElementById("newName"));
    inputItems.push(document.getElementById("newUsername"));
    inputItems.push(document.getElementById("newPassword"));

    inputItems.forEach(function(inputItem) {
        resetBorder(inputItem);
    })
});

function logInUser() {
    let username = $("#inputUserName").val(); // Get the username from the input field
    let password = $("#inputPassword").val();

    $.get("/getUser?username=" + username, function (users) {
        console.log("Printing retrieved:");
        console.log(users);
        if (users.length == 0) {
            $("#loginStatus").text("Username not found.");
            $("#loginStatus").css("color", "#A00000");
            $("#loginStatus").css("visibility", "visible");
        } else if (users[0].password != password) {
            $("#loginStatus").text("Incorrect password.");
            $("#loginStatus").css("color", "#A00000");
            $("#loginStatus").css("visibility", "visible");
        } else { // username and password match
            $("#loginStatus").text("placeholder");
            $("#loginStatus").css("visibility", "hidden");
            $("signupStatus").text("placeholder");
            $("#signupStatus").css("visibility", "hidden");
            
            localStorage.setItem("userInfo", JSON.stringify(users));
            window.location.href = "./html/home.html";
        }
    })
    .fail(function (error) {
        console.error("Error fetching users: " + error);
    });
}

function showSignUp() {
    $("#signupvis").css("display", "block");
    $("#divider").css("display", "block");
}

function validateForm() {
    let inputItems = [];
    inputItems.push(document.getElementById("newName"));
    inputItems.push(document.getElementById("newUsername"));
    inputItems.push(document.getElementById("newPassword"));
    
    inputItems.forEach(function (inputItem) {
        if (inputItem.value === "") {
            setRedBorder(inputItem);
        } else {
            resetBorder(inputItem);
        }
    });
}

function setRedBorder(item) {
    item.style.border = "2px solid #A00000";
    item.style.borderRadius = "5px";
    item.style.textAlign = "left";
    item.style.fontFamily = "monospace";
    item.style.fontSize = "1.2em";
    item.style.width = "15em";
    item.style.height = "1.5em";
}

function resetBorder(item) {
    item.style.border = "2px solid rgba(0, 0, 0, 0.5)";
    item.style.borderRadius = "5px";
    item.style.textAlign = "left";
    item.style.fontFamily = "monospace";
    item.style.fontSize = "1.2em";
    item.style.width = "15em";
    item.style.height = "1.5em";
}

function addUser() {
    let newName = $("#newName").val();
    let newUsername = $("#newUsername").val();
    let newPassword = $("#newPassword").val();
    let newRole = document.querySelector('input[name="role"]:checked');
 
    validateForm()
    if (newName == "" || newUsername == "" || newPassword == "") {
        $("#signUpStatus").text("Sign up form incomplete.");
        $("#signUpStatus").css("color", "#A00000");
        $("#signUpStatus").css("visibility", "visible");
        return;
    }
    if (!newRole) {
        $("#signUpStatus").text("Please select a role.");
        $("#signUpStatus").css("color", "#A00000");
        $("#signUpStatus").css("visibility", "visible");
        return;
    }
    // Create an object to send in the POST request
    let newRow = {
        user_name: newName,
        user_username: newUsername,
        user_password: newPassword,
        user_role: newRole.value
    };

    // Send an AJAX POST request to update the server-side database with the new data
    $.ajax({
        type: "POST",
        url: "/insertUser",
        contentType: "application/json", // Set content type to JSON
        data: JSON.stringify(newRow), // Convert the JavaScript object to JSON
        success: function (response) {
            console.log("New row added to the database");
            $("#loginStatus").text("Account created. Proceed to login.");
            $("#loginStatus").css("color", "#00A000");
            $("#loginStatus").css("visibility", "visible");
            $("#signupvis").css("display", "none");
            $("#newName").text("");
            $("#newUsername").text("");
            $("#newPassword").text("");
        },
        error: function (error) {
            console.error("Error adding a new row: " + error.responseText);
            if (error.responseText == "Username is already taken")
            {
                $("#signUpStatus").text("Username already taken.");
                $("#signUpStatus").css("color", "#A00000");
                $("#signUpStatus").css("visibility", "visible");
            }
        }
    });
}

function unhide(){
document.getElementById('hide').style.visibility = 'visible';
document.getElementById('unhide').style.visibility = 'hidden';
}