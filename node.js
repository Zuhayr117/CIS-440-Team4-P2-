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

app.post('/insertUser', function (req, res) {
    console.log("inside insertUser");
    let newName = req.body.user_name;
    let newUsername = req.body.user_username;
    let newPassword = req.body.user_password;
    let userRole = req.body.user_role;

    // Define your SQL query to check if the username already exists
    let usernameQuery = "SELECT COUNT(*) AS count FROM Users WHERE username = ?";
    con.query(usernameQuery, [newUsername], function(err, result) {
        if (err) {
            console.error("Error checking for duplicate username: " + err);
            res.status(500).send("Error checking for duplicate username");
        } else {
            if (result[0].count > 0) {
                // Username is already taken, send an error response
                console.log("Username is already taken.");
                res.status(400).send("Username is already taken");
            } else {
                // Username is not taken, proceed to insert the new user
                // Define your SQL query to insert data
                let insertQuery = "INSERT INTO Users (name, username, password, role) VALUES (?, ?, ?, ?)";
                con.query(insertQuery, [newName, newUsername, newPassword, userRole], function(err, insertResult) {
                    if (err) {
                        console.error("Error adding a new user: " + err);
                        res.status(500).send("Error adding a new user");
                    } else {
                        console.log("New user added to the database");
                        res.status(200).send("New user added to the database");
                    }
                });
            }
        }
    });
});

app.get('/getGoals', (req, res) => {
    const stored_id = req.query.userId;
    console.log("stored_id: ", stored_id);

    const checkQuery = 'SELECT role FROM Users WHERE id = ?';

    con.query(checkQuery, [stored_id], (err, data2) => {
        if (err) {
            console.error('Error executing checkQuery: ' + err);
            return res.status(500).json({ error: 'Error fetching data' });
        }

        let check = '';

        if (data2.length > 0) {
            check = data2[0].role;

            let query1 = `
              SELECT g.id AS goal_id, g.complete, g.priority, g.info, r.mentee_id, r.mentor_id
              FROM Goals AS g
              JOIN Relationships AS r ON g.relationship_id = r.id
              ORDER BY mentee_id, priority;
            `;

            con.query(query1, (err, data1) => {
                if (err) {
                    console.error('Error executing query1: ' + err);
                    return res.status(500).json({ error: 'Error fetching data' });
                }

                // Filter the data based on 'check' and 'stored_id' in JavaScript
                const data3 = data1.filter(item => {
                    if (check === 'mentee') {
                        return item.mentee_id == stored_id;
                    } else if (check === 'mentor') {
                        return item.mentor_id == stored_id;
                    }
                    return false;
                });

                const result = {
                    data1,
                    data2,
                    data3,
                };

                return res.json(result);
            });
        } else {
            return res.json({
                data1: [],
                data2: [],
                data3: [],
            });
        }
    });
});

app.post('/setTask', (req, res) => {
    const data = req.body;
    const currentComplete = data.currentComplete;
    const goalId = data.goalId;
  
    const updateGoalQuery = 'UPDATE Goals SET complete = ? WHERE id = ?';
    const params = [currentComplete, goalId];
  
    con.query(updateGoalQuery, params, (err, result) => {
      if (err) {
        console.error('Error updating goal: ' + err);
        return res.status(500).json({ error: 'Error updating goal' });
      }
  
      if (currentComplete === 1) {
        // Get the current date
        const current_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
        // Update the complete_date column with the formatted date
        const updateDateQuery = 'UPDATE Goals SET complete_date = ? WHERE id = ?';
        const dateParams = [current_date, goalId];
  
        con.query(updateDateQuery, dateParams, (dateErr, dateResult) => {
          if (dateErr) {
            console.error('Error updating goal complete_date: ' + dateErr);
            return res.status(500).json({ error: 'Error updating goal complete_date' });
          }
  
          return res.json({ message: 'Task updated successfully' });
        });
      } else {
        // Set complete_date to NULL
        const clearDateQuery = 'UPDATE Goals SET complete_date = NULL WHERE id = ?';
        const clearDateParams = [goalId];
  
        con.query(clearDateQuery, clearDateParams, (clearDateErr, clearDateResult) => {
          if (clearDateErr) {
            console.error('Error clearing goal complete_date: ' + clearDateErr);
            return res.status(500).json({ error: 'Error clearing goal complete_date' });
          }
  
          return res.json({ message: 'Task updated successfully' });
        });
      }
    });
  });



  app.get('logout', (req, res)=>{

    req.session.destroy();

    res.redirect('/login')
  })

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(__dirname));

app.listen(8000, function() {
    console.log("\nThe Web server is alive!!!\n" + "It's listening on http://127.0.0.1:8000 or http://localhost:8000");
});