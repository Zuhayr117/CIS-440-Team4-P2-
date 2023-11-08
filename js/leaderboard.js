function populateLeaderboardComponent(data, id) {
    let roleContainer = document.getElementById(id);
    for (let i = 0; i < data.length; i++) {
        let userLeader = document.createElement("li");
        userLeader.innerHTML = `${data[i].name}: ${data[i].points} point(s)`;
        roleContainer.appendChild(userLeader);
    }
}

/// function to set up leaderboard
async function populateLeaderboard() {
    console.log("inside populateLeaderboard");
    try {
        let response = await fetch(`/getTopMentees`);
        if (response.ok) {
            let data = await response.json();
            console.log(data);
            populateLeaderboardComponent(data, "topMentees");
        }
        response = await fetch(`/getTopMentors`);
        if (response.ok) {
            let data = await response.json();
            console.log(data);
            populateLeaderboardComponent(data, "topMentors");
        }
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

document.addEventListener("DOMContentLoaded", populateLeaderboard);