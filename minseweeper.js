function MinesweeperController($scope) {
    $scope.minefield = createMinefield();
    $scope.uncoverSpot = function(spot, row, column) {
        spot.isCovered = false;
        

        if(spot.content == "empty") {
            openEmptySpot($scope.minefield, row, column);
        }
        
        if(spot.content == "mine") {
            $scope.hasLostMessageVisible = true;
            uncoverALlMines($scope.minefield);
        } else {
            if(hasWon($scope.minefield)) {
                $scope.isWinMessageVisible = true;
            }
        }
    };
    // Reset the game to play again
    $scope.replay = function() {
        console.log("Replay");
        $scope.hasLostMessageVisible = false;
        $scope.isWinMessageVisible = false;
        MinesweeperController($scope);
    }
};

function createMinefield() {
    // Size of the rows/columns
    let gridSize = 11;    
    var minefield = {};
    minefield.rows = [];    
    // Shifted to account for 0 based index
    minefield.gridSize = gridSize - 1;
    // Number of mines grows/shrinks with the size of the gameboard
    minefield.numberOfMines = Math.ceil(gridSize * gridSize / 10);
    
    for(var i = 0; i < minefield.gridSize; i++) {
        var row = {};
        row.spots = [];
        
        for(var j = 0; j < minefield.gridSize; j++) {
            var spot = {};
            spot.isCovered = true;
            // Determines what is displayed on a spot
            // i.e. mine, number, empty
            spot.content = "empty";
            row.spots.push(spot);
        }
        
        minefield.rows.push(row);
    }        
    placeManyRandomMines(minefield);
    calculateAllNumbers(minefield);
    return minefield;
}

function getSpot(minefield, row, column) {
    return minefield.rows[row].spots[column];
}

// Places multiple mines 
function placeManyRandomMines(minefield) {
    for(var i = 0; i < minefield.numberOfMines; i++) {
        placeRandomMine(minefield);
    }
}

// Randomly places a mine on the gameboard
function placeRandomMine(minefield) {
    var row = Math.round(Math.random() * (minefield.gridSize - 1));
    var column = Math.round(Math.random() * (minefield.gridSize - 1));
    var spot = getSpot(minefield, row, column);
    spot.content = "mine";
}

// Caluculates the number of mines around a spot
function calculateNumber(minefield, row, column) {
    var thisSpot = getSpot(minefield, row, column);
    
    // If this spot contains a mine then we can't place a number here
    if(thisSpot.content == "mine") {
        return;
    }
    
    var mineCount = 0;

    // Counts mines around a spot
    for(let i = -1; i < 2; i++) {
        for(let j = -1; j < 2; j++) {   
            // Not out of bounds     
            if(row + i >= 0 && row + i < minefield.gridSize) {
                // Not out of bounds
                if(column + j >= 0 && column + j < minefield.gridSize) {    
                    // Checks spot next to for a mine                
                    var spot = getSpot(minefield, row + i, column + j);
                    if(spot.content == "mine") {
                        mineCount++;
                    }
                }
            }
        }                    
    }   
    
    if(mineCount > 0) {
        thisSpot.content = mineCount;
    }
}

function calculateAllNumbers(minefield) {
    for(var y = 0; y < minefield.gridSize; y++) {
        for(var x = 0; x < minefield.gridSize; x++) {
            calculateNumber(minefield, x, y);
        }
    }
}

// Uncovers spots surronding an empty spot
function openEmptySpot(minefield, row, column) {
    for(let i = -1; i < 2; i++) {
        for(let j = -1; j < 2; j++) { 
            // Don't check spot's self
            if( i === 0 && j === 0) {
                continue;
            }  
            // Not out of bounds     
            if(row + i >= 0 && row + i < minefield.gridSize) {
                // Not out of bounds
                if(column + j >= 0 && column + j < minefield.gridSize) {                                      
                    let spot = getSpot(minefield, row + i, column + j);
                    spot.isCovered = false;
                    // if(spot.content === 'empty') {
                    //     openEmptySpot(minefield, row + i, column + j);
                    // }
                }
            }
        }                    
    }   
}

function uncoverALlMines(minefield) {
    for(let x = 0; x < minefield.gridSize; x++) {
        for(let y = 0; y < minefield.gridSize; y++) {
            let spot = getSpot(minefield, x, y);
            if(spot.content === 'mine') {
                spot.isCovered = false;
            }
        }
    }
}

function hasWon(minefield) {
    for(var y = 0; y < minefield.gridSize; y++) {
        for(var x = 0; x < minefield.gridSize; x++) {
            var spot = getSpot(minefield, y, x);
            if(spot.isCovered && spot.content != "mine") {
                return false;
            }
        }
    }    
    return true;
}