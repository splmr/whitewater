document.addEventListener("DOMContentLoaded", function() {
    var player = document.getElementById("player");
    var game = document.getElementById("game");
    var trailContainer = document.getElementById("trail");

    var playerWidth = player.offsetWidth;
    var mouseX = 0;
    var angleDeg = 0;
    var threshold = 10;
    var speed = 0.05;

    var trailLength = 100; // Length of the trail
    var trailPoints = []; // Array to store trail points
    var trailOffset = 10; // Offset of the trail above the character

    var prevDirection = ""; // Keep track of previous direction

    game.addEventListener("mousemove", function(e) {
        mouseX = e.clientX;
        
        var currentDirection = mouseX > player.offsetLeft + playerWidth / 2 ? "right" : "left";

        var thresholdFactor = 1.5; // Adjust this factor as needed
var thresholdRight = threshold * thresholdFactor;

// Change skin only when direction changes and movement exceeds threshold
if (currentDirection !== prevDirection && Math.abs(mouseX - (player.offsetLeft + playerWidth / 2)) > (currentDirection === "right" ? thresholdRight : threshold)) {
    prevDirection = currentDirection;
    var skin = currentDirection === "right" ? "Rsurfer" : "Lsurfer";
    player.style.backgroundImage = "url('assets/" + skin + ".png')";
}
    });

    function updateTrail() {
        // Clear previous trail
        trailContainer.innerHTML = "";
      
        // Draw the trail
        for (var i = 1; i < trailPoints.length; i++) {
            var trailSegment = document.createElementNS("http://www.w3.org/2000/svg", "path");
            trailSegment.setAttribute("fill", "none");
            trailSegment.setAttribute("stroke", "#c7c7c7");
            trailSegment.setAttribute("stroke-width", "3");

            // Calculate trail position with vertical offset
            var trailX1 = trailPoints[i - 1].x;
            var trailY1 = trailPoints[i - 1].y - game.scrollTop;
            var trailX2 = trailPoints[i].x;
            var trailY2 = trailPoints[i].y - game.scrollTop;

            // Gradually increase the y-coordinate of each segment to simulate the trail moving away from the skier
            var yOffset = (trailPoints.length - i) * 2; // Adjust the factor to control the steepness of the slope
            trailY1 -= yOffset;
            trailY2 -= yOffset;

            var d = "M" + trailX1 + "," + trailY1 + " L" + trailX2 + "," + trailY2;
            trailSegment.setAttribute("d", d);

            // Calculate opacity based on segment position (start strong and get weaker)
            var opacity = i / trailPoints.length;
            trailSegment.style.opacity = opacity;

            trailContainer.appendChild(trailSegment);
        }

        requestAnimationFrame(updateTrail);
    }

    function updatePlayerPosition() {
        var distance = mouseX - (player.offsetLeft + playerWidth / 2);
        var newX = player.offsetLeft + distance * speed;

        player.style.top = "50%"; // Set the vertical position to the center of the screen
        // Constrain player movement within the game container
        if (newX < 0) {
            newX = 0;
        } else if (newX > game.offsetWidth - playerWidth) {
            newX = game.offsetWidth - playerWidth;
        }

        player.style.left = newX - 10 + "px";
        player.style.transform = "translate(-50%, -50%) rotate(" + angleDeg + "deg)";

        // Store the current player position for drawing the trail
        var playerPosition = {
            x: player.offsetLeft + playerWidth / 2,
            y: player.offsetTop - trailOffset // Offset the trail above the character
        };

        // Add current player position to trail points
        trailPoints.push(playerPosition);

        // Limit the number of trail points to the trailLength
        if (trailPoints.length > trailLength) {
            trailPoints.shift(); // Remove the oldest trail point
        }

        requestAnimationFrame(updatePlayerPosition);
    }

    // Start updating player position
    updatePlayerPosition();

    // Start updating the trail
    updateTrail();
});