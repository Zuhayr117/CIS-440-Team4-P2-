const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.use(bodyParser.json());

// Create a MySQL connection with reconnection logic
const con = mysql.createPool({
    host: "107.180.1.16",
    user: "fall2023team4",
    password: "fall2023team4",
    database: "fall2023team4",
  waitForConnections: true,
  connectionLimit: 100, // Adjust this limit as needed
  queueLimit: 0,
});

// Function to handle reconnection
function handleReconnection() {
  console.log('Reconnecting to MySQL...');
  con.getConnection((err, connection) => {
    if (err) {
      console.error('Reconnection failed:', err);
      setTimeout(handleReconnection, 2000); // Attempt reconnection after 2 seconds
    } else {
      console.log('Reconnected to MySQL');
      connection.release();
    }
  });
}

// Set up a reconnection mechanism
con.on('connection', () => {
  console.log('Connected to MySQL');
});

con.on('error', (err) => {
  console.error('MySQL con error:', err);
  handleReconnection();
});

app.get('/getUser', (req, res) => {
  const username = req.query.username;
  const myQuery = 'SELECT * FROM Users AS u WHERE u.username = ?';

  con.query(myQuery, [username], (err, result, fields) => {
    if (err) {
      console.error('Error fetching users: ' + err);
      res.status(500).send('Error fetching users');
    } else {
      console.log('Fetched users from the database');
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



  app.get('logOut', (req, res)=>{

    req.session.destroy();

    res.redirect('/login')
  })

// add tasks
  app.post('/addTask', (req, res) => {
    const data = req.body;

    const relationshipId = data.relationshipId;
    const priority = data.priority;
    const info = data.info;
    const currentComplete = data.currentComplete;
    const deadlineDate = data.deadlineDate;
    const completeDate = data.completeDate;
    const createdBy = data.createdBy;

    const addGoalQuery = "INSERT INTO Goals (relationship_id, priority, info, complete, deadline_date, complete_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [relationshipId, priority, info, currentComplete, deadlineDate, completeDate, createdBy];

    con.query(addGoalQuery, params, (err, result) => {
        if (err) {
            console.error('Error updating goal: ' + err);
            return res.status(500).json({ error: 'Error updating goal' });
        }

        if (currentComplete === 1) {
            // Get the current date
            const current_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Update the complete_date column with the formatted date
            const updateDateQuery = 'UPDATE Goals SET complete_date = ? WHERE id = ?';
            const dateParams = [current_date, result.insertId];

            con.query(updateDateQuery, dateParams, (dateErr, dateResult) => {
                if (dateErr) {
                    console.error('Error adding goal complete_date: ' + dateErr);
                    return res.status(500).json({ error: 'Error adding goal complete_date' });
                }

                return res.json({ message: 'Task added successfully' });
            });
        } else {
            // Set complete_date to NULL
            const clearDateQuery = 'UPDATE Goals SET complete_date = NULL WHERE id = ?';
            const clearDateParams = [result.insertId];

            con.query(clearDateQuery, clearDateParams, (clearDateErr, clearDateResult) => {
                if (clearDateErr) {
                    console.error('Error clearing goal complete_date: ' + clearDateErr);
                    return res.status(500).json({ error: 'Error clearing goal complete_date' });
                }

                return res.json({ message: 'Task added successfully' });
            });
        }
    });
});

// Define other routes and handlers as needed
app.use(express.static(__dirname));
app.listen(8000, () => {
  console.log('The Web server is running on http://localhost:8000');
});