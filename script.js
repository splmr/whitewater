document.addEventListener("DOMContentLoaded", function () {
  var player = document.getElementById("player");
  var game = document.getElementById("game");
  var trailContainer = document.getElementById("trail");
  var timerValue = document.getElementById("timer-value");
  var nearMissValue = document.getElementById("nearmiss-value");
  var speedValue = document.getElementById("speed-value");
  var altitudeValue = document.getElementById("altitude-value");
  var nearMissValue = document.getElementById("nearmiss-value");
  var overlay = document.getElementById("overlay");
  // add distamce variable aswell to add semse of achievememt
  var playerWidth = player.offsetWidth;
  var mouseX = 0;
  var angleDeg = 0;
  var threshold = 10;
  var speed = 0.05;
  var baseSpeed = speed;
  var difficulty = 1;
  var difficultyTimeout;
  var altitude = 1000;
  var speeddisplay = 10;
  var trailLength = 75; // Length of the trail
  var trailPoints = []; // Array to store trail points
  var trailOffset = 10; // Offset of the trail above the character
  var gamePeriod = 0; // Initialize game period
  var nearMissCounter = 0; // Initialize near miss counter
  var nearMissRegistered = false;
  var intervald = 500;
  var prevDirection = ""; // Keep track of previous direction
  var isPaused = false;
  var treesInterval; // Variable to store the interval for moving trees
  var startTime; // Variable to store the start time of the game
  var createtree = 1000;
  // Function to handle pausing and unpausing the game
  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      stopDifficultyTimeout(); // Pause difficulty increase
      stopTreeTimeout();
      console.log("closed tree timeout");
      clearInterval(treesInterval); // Pause tree movement
      overlay.style.opacity = "0.7";
    } else {
      startDifficultyTimeout(); // Resume difficulty increase
      startTreeTimeout();
      startTime = Date.now() - gamePeriod * 1000; // Adjust start time to account for paused time
      overlay.style.opacity = "0";
      var interval = 500 / (difficulty * 2);
      console.log(interval);
      treesInterval = setInterval(function () {
        createTree();
      }, interval); // Resume tree movement
    }
  }
  // Function to count the trees
  function countTrees() {
    var f = 1 - 1;
  }
  // Event listener for space bar key press to toggle pause
  document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      togglePause();
    }
  });

  game.addEventListener("mousemove", function (e) {
    if (!isPaused) {
      mouseX = e.clientX;

      var currentDirection =
        mouseX > player.offsetLeft + playerWidth / 2 ? "right" : "left";

      var thresholdFactor = 1.5; // Adjust this factor as needed
      var thresholdRight = threshold * thresholdFactor;

      // Change skin only when direction changes and movement exceeds threshold
      if (
        currentDirection !== prevDirection &&
        Math.abs(mouseX - (player.offsetLeft + playerWidth / 2)) >
          (currentDirection === "right" ? thresholdRight : threshold)
      ) {
        prevDirection = currentDirection;
        var skin = currentDirection === "right" ? "Rsurfer" : "Lsurfer";
        player.style.backgroundImage = "url('assets/" + skin + ".png')";
      }
    }
  });

  function updateTrail() {
    // Clear previous trail
    trailContainer.innerHTML = "";

    // Draw the trail
    for (var i = 1; i < trailPoints.length; i++) {
      var trailSegment = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      trailSegment.setAttribute("fill", "none");
      trailSegment.setAttribute("stroke", "#c7c7c7");
      trailSegment.setAttribute("stroke-width", "3");

      // Calculate trail position with vertical offset
      var trailX1 = trailPoints[i - 1].x;
      var trailY1 = trailPoints[i - 1].y - game.scrollTop;
      var trailX2 = trailPoints[i].x;
      var trailY2 = trailPoints[i].y - game.scrollTop;

      // Gradually increase the y-coordinate of each segment to simulate the trail moving away from the skier

      var yOffset = speed * (40 * difficulty) * (trailPoints.length - i); // Adjust the factor to control the steepness of the slope
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
    if (!isPaused) {
      var distance = mouseX - (player.offsetLeft + playerWidth / 2);
      var newX = player.offsetLeft + distance * speed;

      player.style.top = "50%"; // Set the vertical position to the center of the screen
      // Constrain player movement within the game container
      if (newX < 0) {
        newX = 0;
      } else if (newX > game.offsetWidth - playerWidth) {
        newX = game.offsetWidth - playerWidth;
      }

      player.style.left = newX + "px";
      player.style.transform =
        "translate(-50%, -50%) rotate(" + angleDeg + "deg)";

      // Store the current player position for drawing the trail
      var playerPosition = {
        x: player.offsetLeft + playerWidth / 2,
        y: player.offsetTop - trailOffset, // Offset the trail above the character
      };

      // Add current player position to trail points
      trailPoints.push(playerPosition);

      // Limit the number of trail points to the trailLength
      if (trailPoints.length > trailLength) {
        trailPoints.shift(); // Remove the oldest trail point
      }
    }

    requestAnimationFrame(updatePlayerPosition);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      togglePause(); // Pause the game when the page becomes hidden
    }
  });
  function createTree() {
    var tree = document.createElement("div");
    tree.nearlyHit = false; // Assign nearlyHit property directly to the tree element
    tree.className = "tree";
    tree.style.backgroundImage = "url('assets/tree.png')";

    // Randomly position the tree within the game container
    var randomX = Math.floor(Math.random() * (game.offsetWidth - 50)); // Adjust width of the tree as needed
    tree.style.left = randomX + "px";
    tree.style.bottom = "-20"; // Start at the bottom of the game container

    game.appendChild(tree);

    return tree;
  }

  function removeTrees() {
    var trees = document.querySelectorAll(".tree");

    trees.forEach(function (tree) {
      if (!isPaused) {
        var currentBottom = parseInt(tree.style.bottom, 10);
        if (currentBottom > game.offsetHeight) {
          tree.remove();
        }
      }
    });
    countTrees();
    requestAnimationFrame(removeTrees);
  }

  function moveTrees() {
    var trees = document.querySelectorAll(".tree");

    trees.forEach(function (tree) {
      if (!isPaused) {
        var currentBottom = parseInt(tree.style.bottom, 10);
        var newBottom = currentBottom + speed * (50 * difficulty); // Adjust speed as needed
        tree.style.bottom = "0px";
        tree.style.bottom = newBottom + "px";
      }
    });

    requestAnimationFrame(moveTrees);
  }

  setInterval(function () {
    if (!isPaused) {
      gamePeriod++; // Increment game period
      altitude = altitude - 5 * (1 * difficulty);
      if (altitude < 5) {
        altitude = 0;
      }
      timerValue.textContent = gamePeriod; // Update timer value
      speedValue.textContent = speeddisplay + "mph";
      let roundedAltitude = altitude.toFixed(0);
      altitudeValue.textContent = roundedAltitude + "m";
      if (altitude < 1) {
        resetGame();
      }
    }
  }, 1000);

  // Start updating player position
  updatePlayerPosition();

  // Start updating the trail
  updateTrail();

  function startTreeTimeout() {
    console.log("started");
    difficultyTimeout = setInterval(function () {
      createtree = 500 / difficulty;
      createTree();
      console.log(createtree);
    }, createtree); // 30 seconds
  }
  function stopTreeTimeout() {
    clearTimeout(startTreeTimeout);
  }
  startTreeTimeout();
  // Start moving trees
  moveTrees();
  removeTrees();

  function checkCollision() {
    var playerRect = player.getBoundingClientRect();

    var trees = document.querySelectorAll(".tree");
    trees.forEach(function (tree) {
      var treeRect = tree.getBoundingClientRect();
      var bufferZone = -45;
      // Adjust player hitbox to include buffer zone
      var playerHitbox = {
        top: playerRect.top - bufferZone,
        right: playerRect.right + bufferZone,
        bottom: playerRect.bottom + bufferZone,
        left: playerRect.left - bufferZone,
      };

      // Check for collision between adjusted player hitbox and tree
      if (
        playerHitbox.bottom >= treeRect.top &&
        playerHitbox.top <= treeRect.bottom &&
        playerHitbox.right >= treeRect.left &&
        playerHitbox.left <= treeRect.right
      ) {
        if (playerHitbox.bottom < treeRect.top + treeRect.height / 2) {
          if (tree.nearlyHit == false) {
            nearMissCounter++;
            updateNearMissCounter();
            tree.nearlyHit = true;
          }
        } else {
          // Reset game if player hits the bottom half of a tree
          speeddisplay = 10;
          difficulty = 1;
          createtree = 1000;
          stopTreeTimeout();
          console.log("closed tree timeout");
          resetGame();
          
         
        }
      }
    });

    requestAnimationFrame(checkCollision);
  }

  function updateNearMissCounter() {
    nearMissValue.textContent = nearMissCounter;
  }

  // Set up the timeout for changing difficulty
  function startDifficultyTimeout() {
    console.log("started");
    difficultyTimeout = setTimeout(function () {
      difficulty *= 1.5; // 25% increase difficulty every 30 secs
      speeddisplay *= 2;
      startDifficultyTimeout();
      console.log(difficulty);
      console.log("test1: changing difficulty");
    }, 20000); // 30 seconds
  }
  function endGame() {
    endGame = setTimeout(function () {
      resetGame();
    }, 60000); // 30 seconds
  }
  // Clear the difficulty change timeout
  function stopDifficultyTimeout() {
    clearTimeout(difficultyTimeout);
  }

  function resetGame() {
    // Clear trail
 stopTreeTimeout();
 console.log("closed tree timeout");
 stopDifficultyTimeout();
    difficulty = 1;
  
    // Reset timer
    gamePeriod = 0;
    createtree = 1000;
    altitude = 1000;
    timerValue.textContent = gamePeriod;
    speeddisplay = 10;
    // Reset difficulty

    mouseX = 0;
    angleDeg = 0;
    threshold = 10;
    speed = 0.05;
    baseSpeed = speed;
   
    
    // Reset near-miss counter and update its display value
    nearMissCounter = 0;
    nearMissValue.textContent = nearMissCounter;
startTreeTimeout();
startDifficultyTimeout();
    // Remove all trees
    var trees = document.querySelectorAll(".tree");
    trees.forEach(function (tree) {
      tree.remove();
    });
    
  }

  // Start checking for collisions
  checkCollision();
 
  endGame();

  // Add event listeners for mouse down and mouse up to adjust speed
  game.addEventListener("mousedown", function () {
    difficulty += 1;
    console.log(difficulty);
    speeddisplay += 10;
    speedValue.textContent = speeddisplay + "mph";
  });

  game.addEventListener("mouseup", function () 
  {
    if (speeddisplay > 10){
      difficulty -= 1;
      speeddisplay -= 10;
      trailPoints = [];
      console.log(difficulty);
      speedValue.textContent = speeddisplay + "mph";
    }
    
  });
});
