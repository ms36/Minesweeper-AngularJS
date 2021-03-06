
angular.module('minesweeper', []);

angular.module('minesweeper')
    .controller('minesweeperController', 
        function ($scope) {
            $scope.hasLostMessageVisible = false;
            $scope.isWinMessageVisible = false;
            $scope.minefield = createMinefield();
            $scope.handleClick = function(event, spot, row, column) {

                // Determines which mouse click is pressed
                switch(event.which) {
                    case 1: // Left click
                        if(!spot.isFlagged) {
                            spot.isCovered = false;
                            spot.isChecked = true;   
                        
                            if(spot.content === "empty") {
                                openEmptySpot($scope.minefield, row, column);
                            }
                            
                            if(spot.content === "mine") {
                                $scope.hasLostMessageVisible = true;
                                uncoverAllMines($scope.minefield);
                            } else if(checkIfPlayerHasWon($scope.minefield)) {
                                    $scope.isWinMessageVisible = true;
                            }                            
                        }
                        break;
                    case 2: // Middle click
                        break;
                    case 3: // Right click
                        if(spot.isCovered) {
                            spot.isFlagged = !spot.isFlagged;
                            
                            if(spot.isFlagged) {
                                $scope.minefield.numberOfMines--;
                            } else {
                                $scope.minefield.numberOfMines++;
                            }
                        }                
                        break;
                    default:                
                        break
                }          
            };
            // Reset the game to play again
            $scope.replay = function(mineCount = 10) {   
                console.log("Replay");
                $scope.hasLostMessageVisible = false;
                $scope.isWinMessageVisible = false;
                $scope.minefield = createMinefield(mineCount);
            }

            $scope.enterMines = function(mineCount) {
                $scope.minefield.numberOfMines = mineCount;
            }
        });

function createMinefield(mineCount = 10) {
    // Size of the rows/columns
    const gridSize = 10;        
    let minefield = {};
    minefield.maxNumberOfSpots = (gridSize -1) * (gridSize -1);
    minefield.rows = [];    
    // Shifted to account for 0 based index
    minefield.gridSize = gridSize - 1;
    // Number of mines grows/shrinks with the size of the gameboard
    minefield.numberOfMines = clamp(10, mineCount, minefield.maxNumberOfSpots - 1);
    
    for(let i = 0; i < minefield.gridSize; i++) {
        let row = {};
        row.spots = [];
        
        for(let j = 0; j < minefield.gridSize; j++) {
            let spot = {};
            spot.isCovered = true;
            // Determines what is displayed on a spot
            // i.e. mine, number, empty
            spot.content = "empty";
            spot.isChecked = false;
            spot.isFlagged = false;
            row.spots.push(spot);
        }        
        minefield.rows.push(row);
    }        
    placeManyRandomMines(minefield);
    calculateAllNumbers(minefield);
    return minefield;
}

// Keeps a value within a min/max
function clamp(min, value, max) {

    if(value < min) {
        return min;
    }
    if(value > max) {
        return max;
    }
    return value;
}
function getSpot(minefield, row, column) {
    return minefield.rows[row].spots[column];
}

// Places multiple mines 
function placeManyRandomMines(minefield) {
    for(let i = 0; i < minefield.numberOfMines; i++) {
        placeRandomMine(minefield);
    }
}

// Randomly places a mine on the gameboard
function placeRandomMine(minefield) {
    const row = Math.round(Math.random() * (minefield.gridSize - 1));
    const column = Math.round(Math.random() * (minefield.gridSize - 1));
    let spot = getSpot(minefield, row, column);
    if(spot.content === "mine") {
        placeRandomMine(minefield);
    }
    spot.content = "mine";
}

// Caluculates the number of mines around a spot
function calculateNumber(minefield, row, column) {
    let thisSpot = getSpot(minefield, row, column);
    
    // If this spot contains a mine, then we can't place a number here
    if(thisSpot.content === "mine") {
        return;
    }
    
    let mineCount = 0;

    // Counts mines around a spot
    for(let i = -1; i < 2; i++) {
        for(let j = -1; j < 2; j++) {   
            // Not out of bounds     
            if(row + i >= 0 && row + i < minefield.gridSize) {
                // Not out of bounds
                if(column + j >= 0 && column + j < minefield.gridSize) {    
                    // Checks spot next to for a mine                
                    let spot = getSpot(minefield, row + i, column + j);
                    if(spot.content === "mine") {
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
    for(let y = 0; y < minefield.gridSize; y++) {
        for(let x = 0; x < minefield.gridSize; x++) {
            calculateNumber(minefield, x, y);
        }
    }
}

// Uncovers spots surrounding an empty spot
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
                                        
                    if(!spot.isFlagged) {
                        spot.isCovered = false;
                    }                                        
                    // If the spot surrounding this spot is empty
                    // and has not been checked, then check around
                    // that spot as well
                    if(!spot.isChecked && spot.content === 'empty') {                        
                            spot.isChecked = true;  
                            openEmptySpot(minefield, row + i, column + j);                                                                                             
                    }                    
                }
            }
        }                    
    }   
}

function uncoverAllMines(minefield) {
    for(let x = 0; x < minefield.gridSize; x++) {
        for(let y = 0; y < minefield.gridSize; y++) {
            const spot = getSpot(minefield, x, y);
            if(spot.content === 'mine') {
                spot.isCovered = false;
                spot.isFlagged = false;
            }
        }
    }
}

function checkIfPlayerHasWon(minefield) {
    for(let x = 0; x < minefield.gridSize; x++) {
        for(let y = 0; y < minefield.gridSize; y++) {
            let spot = getSpot(minefield, x, y);
            if(spot.isCovered && spot.content !== "mine") {
                return false;
            }
        }
    }    
    return true;
}