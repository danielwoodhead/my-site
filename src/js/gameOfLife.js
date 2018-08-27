(function() {

    var canvas = document.getElementById("myCanvas");
    var canvasContext = canvas.getContext("2d");
    var cells = [];
    var running = false;

    var gridSettings = {
        columnCount: 160,
        rowCount: 100,
        cellSize: 5,
        cellBorder: 1
    };
    var width = gridSettings.cellBorder + (gridSettings.columnCount * gridSettings.cellBorder) + (gridSettings.columnCount * gridSettings.cellSize);
    var height = gridSettings.cellBorder + (gridSettings.rowCount * gridSettings.cellBorder) + (gridSettings.rowCount * gridSettings.cellSize);

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    canvasContext.beginPath();
    canvasContext.fillStyle = "lightgrey";
    canvasContext.fillRect(0, 0, width, height);

    clearGrid();

    var stepButton = document.getElementById('buttonStep');
    stepButton.addEventListener('click', step);

    var runButton = document.getElementById('buttonRun');
    runButton.addEventListener('click', run);

    var clearButton = document.getElementById('buttonClear');
    clearButton.addEventListener('click', clearGrid);

    var acornPatternButton = document.getElementById('buttonAcornPattern');
    acornPatternButton.addEventListener('click', function() {
        clearGrid();

        setCellState(100, 50, true);
        setCellState(101, 50, true);
        setCellState(101, 48, true);
        setCellState(103, 49, true);
        setCellState(104, 50, true);
        setCellState(105, 50, true);
        setCellState(106, 50, true);
    });

    var gunPatternButton = document.getElementById('buttonGunPattern');
    gunPatternButton.addEventListener('click', function() {
        clearGrid();

        setCellState(20, 15, true);
        setCellState(20, 16, true);
        setCellState(21, 15, true);
        setCellState(21, 16, true);

        setCellState(30, 15, true);
        setCellState(30, 16, true);
        setCellState(30, 17, true);
        setCellState(31, 18, true);
        setCellState(32, 19, true);
        setCellState(33, 19, true);
        setCellState(31, 14, true);
        setCellState(32, 13, true);
        setCellState(33, 13, true);

        setCellState(34, 16, true);

        setCellState(35, 14, true);
        setCellState(36, 15, true);
        setCellState(36, 16, true);
        setCellState(36, 17, true);
        setCellState(35, 18, true);
        setCellState(37, 16, true);

        setCellState(40, 15, true);
        setCellState(40, 14, true);
        setCellState(40, 13, true);
        setCellState(41, 13, true);
        setCellState(41, 14, true);
        setCellState(41, 15, true);
        setCellState(42, 16, true);
        setCellState(42, 12, true);

        setCellState(44, 12, true);
        setCellState(44, 11, true);

        setCellState(44, 16, true);
        setCellState(44, 17, true);

        setCellState(54, 13, true);
        setCellState(55, 13, true);
        setCellState(54, 14, true);
        setCellState(55, 14, true);
    });

    var linePatternButton = document.getElementById('buttonLinePattern');
    linePatternButton.addEventListener('click', function() {
        clearGrid();
        var i = 0;
        for (i = 0; i < gridSettings.columnCount; i++) {
            setCellState(i, 50, true);
        }
    });

    canvas.addEventListener('click', function(event) {
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;

        var a = Math.floor(x / (gridSettings.cellSize + gridSettings.cellBorder));
        var b = Math.floor(y / (gridSettings.cellSize + gridSettings.cellBorder));

        setCellState(a, b, !cells[a][b]);
    });

    function setCellState(column, row, alive) {
        cells[column][row] = alive;
        drawCell(column, row);
    }

    function drawCell(column, row) {
        var x = gridSettings.cellBorder + (column * gridSettings.cellBorder) + (column * gridSettings.cellSize);
        var y = gridSettings.cellBorder + (row * gridSettings.cellBorder) + (row * gridSettings.cellSize);

        canvasContext.beginPath();
        if (cells[column][row]) {
            canvasContext.fillStyle = "lightblue";
            canvasContext.fillRect(x, y, gridSettings.cellSize, gridSettings.cellSize);
        } else {
            canvasContext.clearRect(x, y, gridSettings.cellSize, gridSettings.cellSize);
        }
    }

    function run() {
        running = !running;
        if (running) {
            runButton.setAttribute('value', 'Stop');
            stepButton.disabled = true;
            clearButton.disabled = true;
            acornPatternButton.disabled = true;
            gunPatternButton.disabled = true;
            linePatternButton.disabled = true;
        } else {
            runButton.setAttribute('value', 'Run');
            stepButton.disabled = false;
            clearButton.disabled = false;
            acornPatternButton.disabled = false;
            gunPatternButton.disabled = false;
            linePatternButton.disabled = false;
        }
        
        step();
    }

    function clearGrid() {
        var i, j;
        for (i = 0; i < gridSettings.columnCount; i++) {
            cells[i] = [];
            for (j = 0; j < gridSettings.rowCount; j++) {
                cells[i][j] = false;
                drawCell(i, j);
            }
        }
    }

    function step() {
        var cellsToUpdate = [];
        var i, j;
        for (i = 0; i < gridSettings.columnCount; i++) {
            for (j = 0; j < gridSettings.rowCount; j++) {
                var nextState = getNextState(i, j);

                if (cells[i][j] != nextState) {
                    cellsToUpdate.push({ x: i, y: j, alive: nextState });
                }
            }
        }

        cellsToUpdate.forEach(cell => {
            setCellState(cell.x, cell.y, cell.alive);
        });

        if (running) {
            setTimeout(function() { 
                step() 
            }, 0);
        }
    }

    function getNextState(column, row) {
        var liveNeighbourCount = getLiveNeighbourCount(column, row);

        if (cells[column][row] && liveNeighbourCount < 2)
            return 0;

        if (cells[column][row] && (liveNeighbourCount === 2 || liveNeighbourCount === 3))
            return 1;
        
        if (cells[column][row] && liveNeighbourCount > 3)
            return 0;

        if (!cells[column][row] && liveNeighbourCount === 3)
            return 1;

        return cells[column][row];
    }

    function getLiveNeighbourCount(column, row) {
        var liveNeighbourCount = 
            isCellAlive(column, row + 1) + 
            isCellAlive(column + 1, row + 1) +
            isCellAlive(column + 1, row) +
            isCellAlive(column + 1, row - 1) +
            isCellAlive(column, row - 1) +
            isCellAlive(column - 1, row - 1) +
            isCellAlive(column - 1, row) +
            isCellAlive(column - 1, row + 1);

        return liveNeighbourCount;
    }

    function isCellAlive(column, row) {
        if (column >= 0 && column < gridSettings.columnCount && row >= 0 && row < gridSettings.rowCount)
            return cells[column][row];
        else
            return 0;
    }
})();