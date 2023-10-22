from flask import Flask, render_template, jsonify, request
import mysql.connector
from datetime import datetime

app = Flask(__name__, template_folder='templates', static_url_path="/static")

# MySQL Configuration
db_config = {
    'host': '107.180.1.16',
    'user': 'fall2023team4',
    'password': 'fall2023team4',
    'database': 'fall2023team4',
    'port': 3306,
}

# Create a MySQL connection
mysql = mysql.connector.connect(**db_config)

# Web page navigation
@app.route("/")
def index():
    return render_template('index.html')

@app.route("/home")
def home():
    return render_template('home.html')

@app.route("/tasks")
def tasks():
    return render_template('tasks.html')

# SQL queries
@app.route('/getGoals')
def getGoals():
    stored_id = request.args.get('userId')
    print(stored_id)
    cursor = mysql.cursor(dictionary=True)

    # Initialize data variables
    data1 = []
    data2 = []
    check = ""  # Initialize check variable
    data3 = []

    # First query to retrieve initial data
    query1 = 'SELECT g.id AS goal_id, g.complete, g.priority, g.info, r.mentee_id, r.mentor_id \
              FROM Goals AS g \
              JOIN Relationships AS r ON g.relationship_id = r.id \
              ORDER BY mentee_id, priority;'

    cursor.execute(query1)
    data1 = cursor.fetchall()

    query2 = 'SELECT role \
              FROM Users \
              WHERE id = ' + stored_id

    cursor.execute(query2)
    data2 = cursor.fetchall()

    # Perform a query based on the results of the first query
    for row in data2:
        if row['role'] == "mentee":
            check = 'mentee'
            break
        elif row['role'] == "mentor":
            check = 'mentor'
            break
    print(check)

    # Drop the temporary table if it exists
    cursor.execute("DROP TABLE IF EXISTS temp_query1")

    # Create a temporary table (or a CTE) with the results from query1
    cursor.execute("CREATE TEMPORARY TABLE temp_query1 AS " + query1)

    # Construct query3 based on the temporary table and the filter from query2
    if check == 'mentee':
        query3 = 'SELECT goal_id, complete, priority, info, mentee_id, mentor_id ' \
                 'FROM temp_query1 ' \
                 'WHERE mentee_id = %s' + ' ORDER BY mentee_id, priority'
    elif check == 'mentor':
        query3 = 'SELECT goal_id, complete, priority, info, mentee_id, mentor_id ' \
                 'FROM temp_query1 ' \
                 'WHERE mentor_id = %s' + ' ORDER BY mentee_id, priority'

    if check:
        # Execute the query with the parameter from stored_id
        cursor.execute(query3, (stored_id,))
        data3 = cursor.fetchall()

    # cursor.close()

    # You can return all sets of data as needed
    result = {
        "data1": data1,
        "data2": data2,
        "data3": data3
    }

    return jsonify(result)

@app.route('/setTask', methods=['POST'])
def setTask():
    data = request.get_json()
    currentComplete = data.get('currentComplete')
    goalId = data.get('goalId')
    cursor = mysql.cursor(dictionary=True)

    try:
        # Use a parameterized query to avoid SQL injection
        query = "UPDATE Goals SET complete = %s WHERE id = %s"
        cursor.execute(query, (currentComplete, goalId))
        
        if currentComplete == 1:
            # Get the current date
            current_date = datetime.now()
            # formatted_date = current_date.strftime("%Y-%m-%d")

            # Update the complete_date column with the formatted date
            query = "UPDATE Goals SET complete_date = %s WHERE id = %s"
            cursor.execute(query, (current_date, goalId))
        else:
            # Set complete_date to NULL
            query = "UPDATE Goals SET complete_date = NULL WHERE id = %s"
            cursor.execute(query, (goalId,))

        mysql.commit()  # Commit the changes to the database

        return jsonify({"message": "Task updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.debug = True
    app.run(host="127.0.0.1", port=8080, debug=True)