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
    // console.log("inside insertUser");
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

app.post('/insertRelationship', (req, res) => {
  let newMentor = req.body.mentor_id;
  let newMentee = req.body.mentee_id;
  let newStartDate = req.body.start_date;
  let newEndDate = req.body.end_date;
  let insertQuery = "INSERT INTO Relationships \
                      (mentor_id, mentee_id, start_date, end_date) VALUES (?, ?, ?, ?)";

  con.query(insertQuery, [newMentor, newMentee, newStartDate, newEndDate], function(err, insertResult) {
    if (err) {
      console.error("Error adding a new relationship: " + err);
      res.status(500).send("Error adding a new relationship");
    } else {
      console.log("New relationship added to the database");
      
      // Query the newly inserted row's ID
      con.query("SELECT LAST_INSERT_ID() AS last_id", (err, result) => {
        if (err) {
          console.error('Error fetching new relationship ID: ' + err);
          res.status(500).send('Error fetching new relationship ID');
        } else {
          const lastId = result[0].last_id;
          console.log('Fetched new relationship ID from the database:', lastId);
          res.status(200).json({lastId});
        }
      });
    }
  });
});

app.get('/getRelationship', (req, res) => {
  const relationshipId = req.query.relationshipId;
  const myQuery = 'SELECT r.start_date, r.end_date FROM Relationships AS r WHERE r.id = ?';

  con.query(myQuery, [relationshipId], (err, result, fields) => {
    if (err) {
      console.error('Error fetching relationship: ' + err);
      res.status(500).send('Error fetching relationships');
    } else {
      console.log('Fetched relationship from the database');
      res.status(200).json(result);
    }
  });
});

app.get('/getRelationships', (req, res) => {
    const userId = req.query.userId;
    const userRole = req.query.userRole;

    let myQuery1 = "";

    if (userRole == "mentor") {
        myQuery1 = "SELECT id FROM Mentors WHERE user_id = ?";
    } else if (userRole == "mentee") {
        myQuery1 = "SELECT id FROM Mentees WHERE user_id = ?";
    }

    con.query(myQuery1, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching user role: ' + err);
            res.status(500).send('Error fetching user role');
        } else {
            const roleId = result[0].id;

            let myQuery2 = "";

            if (userRole === "mentor") {
                myQuery2 = 'SELECT r.id,\
                m.name AS mentee_name, tees.id AS \
                mentee_id, tors.id AS mentor_id, t.name AS\
                mentor_name\
                FROM Relationships AS r\
                JOIN Mentees AS tees ON r.mentee_id = tees.id\
                JOIN Mentors AS tors ON r.mentor_id = tors.id\
                JOIN Users AS m ON m.id = tees.user_id\
                JOIN Users AS t ON t.id = tors.user_id\
                WHERE tors.id = ?';
            } else if (userRole === "mentee") {
                myQuery2 = 'SELECT r.id,\
                m.name AS mentee_name, tees.id AS \
                mentee_id, tors.id AS mentor_id, t.name AS\
                mentor_name\
                FROM Relationships AS r\
                JOIN Mentees AS tees ON r.mentee_id = tees.id\
                JOIN Mentors AS tors ON r.mentor_id = tors.id\
                JOIN Users AS m ON m.id = tees.user_id\
                JOIN Users AS t ON t.id = tors.user_id\
                WHERE tees.id = ?';
            }

            con.query(myQuery2, [roleId], (err, result) => {
                if (err) {
                    console.error('Error fetching relationships: ' + err);
                    res.status(500).send('Error fetching relationships');
                } else {
                    console.log('Fetched relationships from the database');
                    res.status(200).json(result);
                }
            });
        }
    });
});

app.get('/getGoals', (req, res) => {
  const stored_id = req.query.relationship_id;
  //console.log("stored_id: ", stored_id);

  const checkQuery = 'SELECT * FROM Goals WHERE \
                      relationship_id = ? ORDER BY priority;';

  con.query(checkQuery, [stored_id], (err, result) => {
      if (err) {
          console.error('Error fetching relationships: ' + err);
          res.status(500).send('Error fetching relationships');
      } else {
          console.log('Fetched goals from the database');
          res.status(200).json(result); // Use data2 instead of result
      }
  });
});

app.get('/getMentees', (req, res) => {
  const checkQuery = 'SELECT m.id AS mentee_id, \
                      u.name FROM Mentees AS m\
                      JOIN Users AS u\
                      ON m.user_id = u.id\
                      ORDER BY u.name';

  con.query(checkQuery, (err, result) => {
      if (err) {
          console.error('Error fetching mentees: ' + err);
          res.status(500).send('Error fetching mentees');
      } else {
          console.log('Fetched mentees from the database');
          res.status(200).json(result); // Use data2 instead of result
      }
  });
});

app.get('/getMentor', (req, res) => {
  let userId = req.query.userId;
  const checkQuery = 'SELECT m.id AS mentor_id, u.id AS user_id\
                      FROM Mentors AS m\
                      JOIN Users AS u\
                      ON u.id = m.user_id\
                      WHERE u.id = ?;';
  

  con.query(checkQuery, [userId], (err, result) => {
      if (err) {
          console.error('Error fetching mentor data: ' + err);
          res.status(500).send('Error fetching mentees');
      } else {
          console.log('Fetched mentor data from the database');
          res.status(200).json(result); // Use data2 instead of result
      }
  });
});

app.get('/getTopFiveMentees', (req, res) => {
  const query = 'SELECT u.name, m.points FROM Users AS u \
    JOIN Mentees AS m ON u.id = m.user_id \
    ORDER BY m.points DESC, u.name ASC \
    LIMIT 5';

  con.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching top 5 mentees data: ' + err);
          res.status(500).send('Error fetching mentees');
      } else {
          console.log('Fetched top 5 mentees data from the database');
          res.status(200).json(result);
      }
  });
});

app.get('/getTopFiveMentors', (req, res) => {
  const query = 'SELECT u.name, m.points FROM Users AS u \
    JOIN Mentors AS m ON u.id = m.user_id \
    ORDER BY m.points DESC, u.name ASC \
    LIMIT 5';

  con.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching top 5 mentors data: ' + err);
          res.status(500).send('Error fetching mentors');
      } else {
          console.log('Fetched top 5 mentors data from the database');
          res.status(200).json(result);
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




 // Function to update complete_date or clear it
 const updateCompleteDate = (taskId, completeStatus) => {
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const updateDateQuery = 'UPDATE Goals SET complete_date = ? WHERE id = ?';
    const clearDateQuery = 'UPDATE Goals SET complete_date = NULL WHERE id = ?';

    const dateParams = [currentDate, taskId];

    const query = completeStatus === 1 ? updateDateQuery : clearDateQuery;
    con.query(query, dateParams, (dateErr, dateResult) => {
        if (dateErr) {
            console.error(`Error ${completeStatus ? 'adding' : 'clearing'} goal complete_date: ${dateErr}`);
            return res.status(500).json({ error: `Error ${completeStatus ? 'adding' : 'clearing'} goal complete_date` });
        }

        return res.json({ message: 'Task added successfully' });
    });
};




    //     if (currentComplete === 1) {
    //         // Get the current date
    //         const current_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    //         // Update the complete_date column with the formatted date
    //         const updateDateQuery = 'UPDATE Goals SET complete_date = ? WHERE id = ?';
    //         const dateParams = [current_date, result.insertId];

    //         con.query(updateDateQuery, dateParams, (dateErr, dateResult) => {
    //             if (dateErr) {
    //                 console.error('Error adding goal complete_date: ' + dateErr);
    //                 return res.status(500).json({ error: 'Error adding goal complete_date' });
    //             }

    //             return res.json({ message: 'Task added successfully' });
    //         });
    //     } else {
    //         // Set complete_date to NULL
    //         const clearDateQuery = 'UPDATE Goals SET complete_date = NULL WHERE id = ?';
    //         const clearDateParams = [result.insertId];

    //         con.query(clearDateQuery, clearDateParams, (clearDateErr, clearDateResult) => {
    //             if (clearDateErr) {
    //                 console.error('Error clearing goal complete_date: ' + clearDateErr);
    //                 return res.status(500).json({ error: 'Error clearing goal complete_date' });
    //             }

    //             return res.json({ message: 'Task added successfully' });
    //         });
    //     }
    });
});

// Define other routes and handlers as needed
app.use(express.static(__dirname));
app.listen(8000, () => {
  console.log('The Web server is running on http://localhost:8000');
});