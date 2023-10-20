from flask import Flask, render_template
app = Flask(__name__,  template_folder='templates', static_url_path="/static")

#log in page
@app.route("/")
# link index page to website
def index():
    return render_template('index.html')





if __name__ == '__main__':
    app.debug = True
    app.run(host="127.0.0.1", port=8080, debug=True)