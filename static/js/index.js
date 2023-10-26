function logInUser(form) {
    // Access the username and password input elements by their IDs
    const userNameInput = form.querySelector("#inputUserName");
    const passwordInput = form.querySelector("#inputPassword");

    // Get the values entered by the user
    const username = userNameInput.value;
    const password = passwordInput.value;

    // Example: Log the values to the console
    console.log("Username: " + username);
    console.log("Password: " + password);

    try {
        fetch(`/getUser?username=${username}&password=${password}`, {
            method: 'GET',  // Use 'GET' for retrieving data
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Assuming the response is JSON
            } else {
                console.error("Error retrieving user.");
            }
        })
        .then(data => {
            // Handle the retrieved data here
            console.log(data);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}