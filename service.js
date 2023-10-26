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

// Define a route to handle the GET request for fetching orders
app.get('/getOrders', function (req, res) {
    var myQuery = "SELECT * FROM Orders;";
    
    con.query(myQuery, function(err, result, fields) {
        if (err) {
            console.error("Error fetching orders: " + err);
            res.status(500).send("Error fetching orders");
        } else {
            console.log("Fetched orders from the database");
            res.status(200).json(result);
        }
    });
});

// Define a route to handle the GET request for fetching orders
app.get('/getProducts', function (req, res) {
    var myQuery = "SELECT * FROM Products;";
    
    con.query(myQuery, function(err, result, fields) {
        if (err) {
            console.error("Error fetching products: " + err);
            res.status(500).send("Error fetching orders");
        } else {
            console.log("Fetched products from the database");
            res.status(200).json(result);
        }
    });
});

// Define a route to handle the GET request for fetching orders
app.get('/getMostRecentOrder', function (req, res) {
    var myQuery = "SELECT order_id FROM Orders ORDER BY order_id DESC LIMIT 1;";
    
    con.query(myQuery, function(err, result, fields) {
        if (err) {
            console.error("Error fetching products: " + err);
            res.status(500).send("Error fetching orders");
        } else {
            console.log("Fetched products from the database");
            res.status(200).json(result);
        }
    });
});

// Define a route to handle the GET request for fetching customers
app.get('/getCustomers', function (req, res) {
    var myQuery = "SELECT * FROM Customers;";
    
    con.query(myQuery, function(err, result, fields) {
        if (err) {
            console.error("Error fetching customers: " + err);
            res.status(500).send("Error fetching customers");
        } else {
            console.log("Fetched customers from the database");
            res.status(200).json(result);
        }
    });
});

// Define a route to handle the GET request for fetching orders
app.get('/getOrders', function (req, res) {
    var myQuery = "SELECT o.id, o.order_id, o.order_date, c.customer_username, c.customer_name, p.product_name, o.order_amount, o.order_status, o.Notes " +
    "FROM Orders AS o " +
    "JOIN Customers AS c ON o.customer_id = c.customer_id " +
    "JOIN Products AS p ON o.product_id = p.product_id " +
    "ORDER BY o.order_id DESC;";
    
    con.query(myQuery, function(err, result, fields) {
        if (err) {
            console.error("Error fetching products: " + err);
            res.status(500).send("Error fetching orders");
        } else {
            console.log("Fetched products from the database");
            res.status(200).json(result);
        }
    });
});

// Define a route to handle the POST request for adding a new user
app.post('/insertCustomer', function (req, res) {
    console.log("inside insertCustomers");
    var newName = req.body.customer_name;
    var newUsername = req.body.customer_username;
    var newPassword = req.body.customer_password;

    // Define your SQL query to insert data
    var myQuery = "INSERT INTO Customers (customer_name, customer_username, customer_password) VALUES (?, ?, ?)";
    
    con.query(myQuery, [newName, newUsername, newPassword], function(err, result){
        if (err) {
            console.error("Error adding a new user: " + err);
            res.status(500).send("Error adding a new user");
        } else {
            console.log("New user added to the database");
            res.status(200).send("New user added to the database");
        }
    });
});

// Define a route to handle the POST request for adding a new user
app.post('/insertOrder', function (req, res) {
    console.log("inside insertOrder");
    var customer_id = req.body.customerId;
    var order_id = req.body.orderId;
    var product_id = req.body.productId;
    var order_amount = req.body.orderAmount;
    var order_date = req.body.orderDate;

    // new values to add
    var address = req.body.address;
    var paymentMethod = req.body.paymentMethod;
    var cardNumber = req.body.cardNumber;
    var paymentCVV = req.body.CVV;
    var extraNotes = req.body.notes;
    
    // Define your SQL query to insert data
    var myQuery = "INSERT INTO Orders (customer_id, order_id, product_id, order_amount, order_date, address, payment_method, card_number, cvv, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    con.query(myQuery, [customer_id, order_id, product_id, order_amount, order_date, 
        address, paymentMethod, cardNumber, paymentCVV, extraNotes], function(err, result){
        if (err) {
            console.error("Error adding a new order: " + err);
            res.status(500).send("Error adding a new order");
        } else {
            console.log("New order added to the database");
            res.status(200).send("New order added to the database");
        }
    });
});

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(__dirname));

/*app.listen(8000, function() {
    console.log("\nThe Web server is alive!!!\n" + "It's listening on http://127.0.0.1:8000 or http://localhost:8000");
});*/
const port = 8080;
app.listen(port, 'localhost', () => {
  console.log(`Server is running on http://localhost:${port} or http://10.159.32.68:${port}`);
});
/*app.listen(80, '192.168.0.126', function()
{
    console.log("\nThe Web server is alive!!!\n" + "It's listening on http://192.168.0.126:80");
});*/

/*app.listen(8080, '10.159.81.71', function()
{
    console.log("\nThe Web server is alive!!!\n" + "It's listening on http://10.159.81.71:8080");
});*/