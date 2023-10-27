function logInUser() {
    let username = $("#inputUserName").val(); // Get the username from the input field

    $.get("/getUser?username=" + username, function (users) {
        console.log("Printing retrieved:");
        console.log(users);
    })
    .fail(function (error) {
        console.error("Error fetching users: " + error);
    });
}

function addUser() {
    var newName = $("#newName").val();
    var newUsername = $("#newUsername").val();
    var newPassword = $("#newPassword").val();

    // Create an object to send in the POST request
    var newRow = {
        user_name: newName,
        user_username: newUsername,
        user_password: newPassword
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
        },
        error: function (error) {
            console.error("Error adding a new row: " + error.responseText);
        }
    });
}