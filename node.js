var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require("mysql");

// Configure body-parser middleware to parse JSON data
app.use(bodyParser.json());

// Your MySQL configuration
var con = mysql.createConnection({
    host: "107.180.1.16",
    user: "fall2023team4",
    password: "fall2023team4",
    database: "fall2023team4"
});
con.connect();

app.get('/getUser', function (req, res) {
    const username = req.query.username; // Get the username from the query parameter
    const myQuery = "SELECT * FROM Users AS u WHERE u.username = ?"; // Use a parameterized query

    con.query(myQuery, [username], function(err, result, fields) {
        if (err) {
            console.error("Error fetching users: " + err);
            res.status(500).send("Error fetching users");
        } else {
            console.log("Fetched users from the database");
            res.status(200).json(result);
        }
    });
});

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(__dirname));

app.listen(8000, function() {
    console.log("\nThe Web server is alive!!!\n" + "It's listening on http://127.0.0.1:8000 or http://localhost:8000");
});