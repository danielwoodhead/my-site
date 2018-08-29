(function() {
    var directionEnum = Object.freeze({ none: {}, up: {}, down: {}, left: {}, right: {} });

    var canvasSettings = {
        width: 500,
        height: 200
    };

    var running = false;
    var tickTimeMilliseconds = 30;
    var player = {};
    var playerMoveSpeed = 3;
    var playerMoveDirection = directionEnum.none;
    var walls = [];
    var wallMoveSpeed = 1;
    var score = 0;

    var canvas = document.getElementById('myCanvas');
    var canvasContext = canvas.getContext('2d');

    canvas.setAttribute('width', canvasSettings.width);
    canvas.setAttribute('height', canvasSettings.height);

    var scoreElement = document.getElementById('score');

    reset();

    var startStopButton = document.getElementById('buttonStartStop');
    startStopButton.addEventListener('click', startStop);

    var resetButton = document.getElementById('buttonReset');
    resetButton.addEventListener('click', reset);

    var upButton = document.getElementById('buttonUp');
    upButton.onmousedown = () => playerMoveDirection = directionEnum.up;
    upButton.onmouseup = () => playerMoveDirection = directionEnum.none;

    var leftButton = document.getElementById('buttonLeft');
    leftButton.onmousedown = () => playerMoveDirection = directionEnum.left;
    leftButton.onmouseup = () => playerMoveDirection = directionEnum.none;

    var rightButton = document.getElementById('buttonRight');
    rightButton.onmousedown = () => playerMoveDirection = directionEnum.right;
    rightButton.onmouseup = () => playerMoveDirection = directionEnum.none;

    var downButton = document.getElementById('buttonDown');
    downButton.onmousedown = () => playerMoveDirection = directionEnum.down;
    downButton.onmouseup = () => playerMoveDirection = directionEnum.none;

    setButtonsEnabled();

    document.onkeydown = function(event) {
        if (!running) {
            return;
        }

        switch (event.keyCode) {
            // left
            case 37:
                player.x = player.x - playerMoveSpeed;
                break;

            // up
            case 38:
                player.y = player.y - playerMoveSpeed;
                break;

            // right
            case 39:
                player.x = player.x + playerMoveSpeed;
                break;
            
            // down
            case 40:
                player.y = player.y + playerMoveSpeed;
                break;
        }
    };

    function drawPlayer() {
        canvasContext.beginPath();
        canvasContext.fillStyle = 'red';
        canvasContext.fillRect(player.x, player.y, player.size, player.size);
    }

    function drawAllWalls() {
        walls.forEach(wall => {
            drawWall(wall.x, wall.yStart, wall.yEnd, wall.thickness);
        });
    }

    function drawWall(x, yStart, yEnd, thickness) {
        canvasContext.beginPath();
        canvasContext.fillStyle = 'green';
        canvasContext.fillRect(x, yStart, thickness, yEnd - yStart);
    }

    function startStop() {
        setGameState(!running);
    }

    function setGameState(shouldRun) {
        running = shouldRun;
        startStopButton.setAttribute('value', running ? 'Stop': 'Start');
        setButtonsEnabled();

        if (running) {
            step();
        }
    }

    function setButtonsEnabled() {
        upButton.disabled = !running;
        downButton.disabled = !running;
        leftButton.disabled = !running;
        rightButton.disabled = !running;
    }

    function step() {
        updateWallPositions();
        updatePlayerPosition();
        blankCanvas();
        drawAllWalls();
        drawPlayer();

        if (isGameOver()) {
            setGameState(false);
            return;
        }

        updateScore(score + 1);

        if (running) {
            setTimeout(function() {
                step();
            }, tickTimeMilliseconds);
        }
    }

    function updatePlayerPosition() {
        switch (playerMoveDirection) {
            case directionEnum.up:
                var newY = player.y - playerMoveSpeed;
                if (newY >= 0) {
                    player.y = newY;
                } else {
                    player.y = 0;
                }
                break;
            case directionEnum.down:
                var newY = player.y + playerMoveSpeed;
                if (newY + player.size <= canvasSettings.height) {
                    player.y = newY;
                } else {
                    player.y = canvasSettings.height - player.size;
                }
                break;
            case directionEnum.left:
                var newX = player.x - playerMoveSpeed;
                if (newX >= 0) {
                    player.x = newX;
                } else {
                    player.x = 0;
                }
                break;
            case directionEnum.right:
                var newX = player.x + playerMoveSpeed;
                if (newX + player.size <= canvasSettings.width) {
                    player.x = newX;
                } else {
                    player.x = canvasSettings.width - player.size;
                }
                break;
        }
    }

    function updateWallPositions() {
        walls.forEach(wall => {
            wall.x = wall.x - wallMoveSpeed;

            if ((wall.x + wall.thickness) < 0) {
                wall.x = walls[walls.length - 1].x + wall.originalX;
            }
        });
    }

    function blankCanvas() {
        canvasContext.beginPath();
        canvasContext.fillStyle = 'white';
        canvasContext.fillRect(0, 0, canvasSettings.width, canvasSettings.height);
    }

    function reset() {
        player = {
            x: 50,
            y: 50,
            size: 20
        };
    
        walls = [
            { x: 150, originalX: 150, yStart: 0, yEnd: 70, thickness: 10 },
            { x: 300, originalX: 300, yStart: 70, yEnd: canvasSettings.height, thickness: 10 },
            { x: 450, originalX: 450, yStart: 0, yEnd: 70, thickness: 10 },
            { x: 600, originalX: 600, yStart: 70, yEnd: canvasSettings.height, thickness: 10 },
        ];

        updateScore(0);
        blankCanvas();
        drawPlayer();
        drawAllWalls();
    }

    function updateScore(newScore) {
        score = newScore;
        scoreElement.innerHTML = score;
    }

    function isGameOver() {
        var i;
        for (i = 0; i < walls.length; i++) {
            var wall = walls[i];

            if (wall.x <= 0 || wall.x >= canvasSettings.width) {
                continue;
            }

            var playerXStart = player.x;
            var playerXEnd = player.x + player.size;
            var playerYStart = player.y;
            var playerYEnd = player.y + player.size;
            var wallXStart = wall.x;
            var wallXEnd = wall.x + wall.thickness;
            var wallYStart = wall.yStart;
            var wallYEnd = wall.yEnd;

            if (
                ((playerXStart >= wallXStart && playerXStart <= wallXEnd)
                    || (playerXEnd >= wallXStart && playerXEnd <= wallXEnd))
                && 
                ((playerYStart >= wallYStart && playerYStart <= wallYEnd)
                    || (playerYEnd >= wallYStart && playerYEnd <= wallYEnd))
            ) {
                return true;
            }
        }

        return false;
    }
})();