///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //
var START_TIME = currentTime();
var BOARD_SIZE = 8;
var TILE_SIZE = 140;
var SCORE_PER_GEM = 5;
var GRID_A_COLOR = makeColor(.7, .7, .7, .5);
var GRID_B_COLOR = makeColor(.4, .4, .4, .5);
var EXPLODE_COLOR = makeColor(.8, .2, .05, .8);
var EXPLODE_THICKNESS = 5;
var HYPER_COLOR = makeColor(.2, .2, .5, .8);
var HYPER_THICKNESS = 7;
var BACKGROUND = loadImage("puppies.jpg");
var SELECT_IMAGE = loadImage("select.png");
var EMPTY_ARRAY = new Array();
var JEWEL_A = loadImage("gemA.png");
var JEWEL_B = loadImage("gemB.png");
var JEWEL_C = loadImage("gemC.png");
var JEWEL_D = loadImage("gemD.png");
var JEWEL_E = loadImage("gemE.png");
var JEWEL_F = loadImage("gemF.png");
const SCARY = loadImage("scary.jpg");
const EVIL_LAUGH = loadSound("evil_laugh.mp3");
var JEWELS = [JEWEL_A,
    JEWEL_B,
    JEWEL_C,
    JEWEL_D,
    JEWEL_E,
    JEWEL_F];


///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                         //
var gameState;
var startTime;
var mousePull;
var piecesToSwap;
var piecesToMoveDown;
var piecesToRemove;
var piecesToAdd;
var board;
var explodeBoard;
var hyperBoard;
var scoreBoard;
var score;
var scoreMultiplier;
var currentLevel;

///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //
function onSetup() {
    //Game states:
    //0 is waiting for input
    //1 is swapping pieces
    //2 is removing pieces
    //3 is moving pieces down
    gameState = 0;
    score = 0;
    scoreMultiplier = 1;
    currentLevel = 1;

    mousePull = new Object();
    mousePull.startX = 0;
    mousePull.startY = 0;
    mousePull.started = false;
    mousePull.endX = 0;
    mousePull.endY = 0;
    mousePull.ended = false;
    mousePull.dX = 0;
    mousePull.dY = 0;

    startTime = -1;
    swapBack = false;
    piecesToAdd = new Array();
    piecesToSwap = new Array();
    piecesToRemove = new Array();
    piecesToMoveDown = new Array();

    board = new Array();
    explodeBoard = new Array();
    hyperBoard = new Array();
    scoreBoard = new Array();
    for (x = 0; x < BOARD_SIZE; x++) {
        board[x] = new Array();
        explodeBoard[x] = new Array();
        hyperBoard[x] = new Array();
        scoreBoard[x] = new Array();
        for (y = 0; y < BOARD_SIZE; y++) {
            board[x][y] = -1;
            explodeBoard[x][y] = false;
            hyperBoard[x][y] = false;
            scoreBoard[x][y] = -1;
        }
    }
    for (e = 0; e < BOARD_SIZE; e++) {
        for (f = 0; f < BOARD_SIZE; f++) {
            board[e][f] = randomInteger(0, JEWELS.length - 1);
            //weird bug, x and y in teh for loops being overwritten by checkboards x and y
            if (checkBoard()) {
                f--;
            }
        }
    }
}

function onTouchStart(x, y, id) {
    if (gameState == 0) {
        mousePull.startX = x;
        mousePull.startY = y;
        mousePull.started = true;
    }
}

function onTouchMove(x, y, id) {
    if (gameState == 0) {
        mousePull.dX = x;
        mousePull.dY = y;
    }
}

function onTouchEnd(x, y, id) {
    if (gameState == 0) {
        mousePull.endX = x;
        mousePull.endY = y;
        mousePull.ended = true;
    }
}

// Called 30 times or more per second
function onTick() {
    clearScreen();
    drawImage(BACKGROUND, 0, 0, canvas.width, canvas.height);
    drawPlayerScore();
    drawLevelMeter();
    switch (gameState) {
        case 0: //Waiting for input
            drawBoard(EMPTY_ARRAY);
            if (mousePull.ended) {
                pt1 = new Object();
                pt1.x = Math.floor(mousePull.startX / TILE_SIZE);
                pt1.y = Math.floor(mousePull.startY / TILE_SIZE);

                pt2 = new Object();
                pt2.x = Math.floor(mousePull.endX / TILE_SIZE);
                pt2.y = Math.floor(mousePull.endY / TILE_SIZE);

                adjacentX = Math.abs(pt1.x - pt2.x) == 1;
                sameX = Math.abs(pt1.x - pt2.x) == 0;
                adjacentY = Math.abs(pt1.y - pt2.y) == 1;
                sameY = Math.abs(pt1.y - pt2.y) == 0;

                if (adjacentX && sameY || adjacentY && sameX) {
                    gameState = 1;
                    piecesToSwap.push(pt2);
                    piecesToSwap.push(pt1);
                }
                mousePull.started = false;
                mousePull.ended = false;
            }
            break;
        case 1: //Swapping pieces
            drawBoard(piecesToSwap);
            max = 7;
            if (startTime == -1) {
                startTime = 0;
                drawPiecesSwapping(startTime, max, piecesToSwap);
            } else if (startTime <= max) {
                drawPiecesSwapping(startTime, max, piecesToSwap);
                startTime++;
            } else {
                drawPiecesSwapping(startTime, max, piecesToSwap);
                startTime = -1;
                swapPieces(piecesToSwap[0], piecesToSwap[1]);
                if (checkBoard()) {
                    gameState = 3;
                    scoreMultiplier = 1;
                    piecesToSwap.pop();
                    piecesToSwap.pop();
                    runs = getRuns();
                    for (i = 0; i < runs.length; i++) {
                        if (runs[i].pts.length >= 3) {
                            explodeIndex = -1;
                            hyperIndex = -1;
                            if (runs[i].pts.length == 4) {
                                console.log("found a run of 4");
                                explodeIndex = randomInteger(0, 3);
                            } else if (runs[i].pts.length >= 5) {
                                console.log("found a run of more than 4");
                                hyperIndex = randomInteger(0, runs[i].pts.length - 1);
                            }
                            console.log("explodeIndex: " + explodeIndex + ", hyperIndex: " + hyperIndex);
                            for (j = 0; j < runs[i].pts.length; j++) {
                                console.log("run" + i + " pt" + j + "(" + runs[i].pts[j].x + "," + runs[i].pts[j].y + ")");
                                if (j == explodeIndex) {
                                    console.log("explode pt at(" + runs[i].pts[j].x + "," + runs[i].pts[j].y + ")");
                                    explodeBoard[runs[i].pts[j].x][runs[i].pts[j].y] = true;
                                    expPt = new Object();
                                    expPt.x = runs[i].pts[j].x;
                                    expPt.y = runs[i].pts[j].y;
                                    piecesToRemove.push(expPt);
                                } else if (j == hyperIndex) {
                                    console.log("hyper pt at(" + runs[i].pts[j].x + "," + runs[i].pts[j].y + ")");
                                    hyperBoard[runs[i].pts[j].x][runs[i].pts[j].y] = true;
                                    hypPt = new Object();
                                    hypPt.x = runs[i].pts[j].x;
                                    hypPt.y = runs[i].pts[j].y;
                                    piecesToRemove.push(hypPt);
                                } else if (explodeBoard[runs[i].pts[j].x][runs[i].pts[j].y]) {
                                    console.log("exploding!");
                                    explodeBoard[runs[i].pts[j].x][runs[i].pts[j].y] = false;
                                    tempX = runs[i].pts[j].x
                                    tempY = runs[i].pts[j].y
                                    for (q = -1; q < 2; q++) {
                                        for (u = -1; u < 2; u++) {
                                            tempPt = new Object();
                                            tempPt.x = clamp(tempX + q, 0, BOARD_SIZE);
                                            tempPt.y = clamp(tempY + u, 0, BOARD_SIZE);
                                            piecesToRemove.push(tempPt);
                                        }
                                    }
                                } else if (hyperBoard[runs[i].pts[j].x][runs[i].pts[j].y]) {
                                    console.log("hypering!");
                                    hyperBoard[runs[i].pts[j].x][runs[i].pts[j].y] = false;
                                    hyperedPiece = board[runs[i].pts[j].x][runs[i].pts[j].y];
                                    for (q = 0; q < BOARD_SIZE; q++) {
                                        for (u = 0; u < BOARD_SIZE; u++) {
                                            if (board[q][u] == hyperedPiece) {
                                                tempPt = new Object();
                                                tempPt.x = q;
                                                tempPt.y = u;
                                                piecesToRemove.push(tempPt);
                                            }
                                        }
                                    }
                                } else {
                                    piecesToRemove.push(runs[i].pts[j]);
                                }
                            }
                        }
                    }
                } else {
                    gameState = 2;
                }

            }
            break;
        case 2: //Swapping piece back if illegal move
            drawBoard(piecesToSwap);
            max = 7;
            if (startTime == -1) {
                startTime = 0;
                drawPiecesSwapping(startTime, max, piecesToSwap);
            } else if (startTime <= max) {
                drawPiecesSwapping(startTime, max, piecesToSwap);
                startTime++;
            } else {
                drawPiecesSwapping(startTime, max, piecesToSwap);
                startTime = -1;
                swapPieces(piecesToSwap[0], piecesToSwap[1]);
                gameState = 0;
                piecesToSwap.pop();
                piecesToSwap.pop();
            }
            break;
        case 3: //removing pieces
            drawBoard(piecesToRemove);
            max = 12;
            if (startTime == -1) {
                drawPiecesBeingRemoved(startTime, max, piecesToRemove);
                for (i = 0; i < piecesToRemove.length; i++) {
                    scoreBoard[piecesToRemove[i].x][piecesToRemove[i].y] = SCORE_PER_GEM << scoreMultiplier;
                    score += SCORE_PER_GEM << scoreMultiplier;
                }
                startTime = 0;
            } else if (startTime <= max) {
                drawPiecesBeingRemoved(startTime, max, piecesToRemove);
                drawScores(startTime, max);
                startTime++;
            } else {
                drawPiecesBeingRemoved(startTime, max, piecesToRemove);
                for (i = 0; i < piecesToRemove.length; i++) {
                    board[piecesToRemove[i].x][piecesToRemove[i].y] = -1;
                    scoreBoard[piecesToRemove[i].x][piecesToRemove[i].y] = -1;
                }
                piecesToRemove = new Array();
                piecesToMoveDown = piecesToBeMovedDown();
                startTime = -1;
                gameState = 4;
                drawScores(startTime, max);
            }
            break;
        case 4: //Moving pieces down
            drawBoard(piecesToMoveDown);
            max = 7;
            if (startTime == -1) {
                if (piecesToMoveDown.length == 0) {
                    startTime = max + 1;
                }
                drawFallingPieces(startTime, max, piecesToMoveDown);
                startTime = 0;
            } else if (startTime <= max) {
                drawFallingPieces(startTime, max, piecesToMoveDown);
                startTime++;
            } else {
                drawFallingPieces(startTime, max, piecesToMoveDown);
                movePiecesDown();
                piecesToMoveDown = new Array();
                startTime = -1;
                runs = getRuns();
                for (i = 0; i < runs.length; i++) {
                    if (runs[i].pts.length >= 3) {
                        for (j = 0; j < runs[i].pts.length; j++) {
                            piecesToRemove.push(runs[i].pts[j]);
                        }
                    }
                }
                if (piecesToRemove.length == 0) {
                    for (e = 0; e < BOARD_SIZE; e++) {
                        for (f = 0; f < BOARD_SIZE; f++) {
                            if (board[e][f] == -1) {
                                board[e][f] = randomInteger(0, JEWELS.length - 1);
                                pt = new Object();
                                pt.x = e;
                                pt.y = f;
                                piecesToAdd.push(pt);
                            }
                        }
                    }
                    gameState = 5;
                } else {
                    scoreMultiplier++;
                    gameState = 3;
                }
            }
            break;
        case 5: //Add new pieces
            drawBoard(piecesToAdd);
            max = 7;
            if (startTime == -1) {
                drawPiecesBeingAdded(startTime, max, piecesToAdd);
                startTime = 0;
            } else if (startTime <= max) {
                drawPiecesBeingAdded(startTime, max, piecesToAdd);
                startTime++;
            } else {
                drawPiecesBeingAdded(startTime, max, piecesToAdd);
                piecesToAdd = new Array();
                startTime = -1;
                runs = getRuns();
                for (i = 0; i < runs.length; i++) {
                    if (runs[i].pts.length >= 3) {
                        for (j = 0; j < runs[i].pts.length; j++) {
                            piecesToRemove.push(runs[i].pts[j]);
                        }
                    }
                }
                if (piecesToRemove.length == 0) {
                    gameState = 0;
                } else {
                    scoreMultiplier++;
                    gameState = 3;
                }

            }
            break;

    }
    if (score > 1000) {
        drawImage(SCARY, 0, 0, canvas.width, canvas.height);
        playSound(EVIL_LAUGH);
    }
}


///////////////////////////////////////////////////////////////
//                                                           //
//                      HELPER RULES                         //
function clamp(num, min, max) {
    if (num > max) {
        return max;
    } else if (num < min) {
        return min;
    } else {
        return num;
    }
}

function drawFallingPieces(currentTick, endTick, pieces) {
    tempArray = new Array();
    i = 0;
    for (x = 0; x < BOARD_SIZE; x++) {
        for (; i < pieces.length; i++) {
            if (pieces[i].x == x) {
                tempArray.push(pieces[i]);
            } else {
                break;
            }
        }
        if (tempArray.length > 0) {
            for (y = BOARD_SIZE - 1; y >= 0; y--) {
                if (board[x][y] == -1) {
                    for (; y >= 0 && tempArray.length > 0; y--) {
                        piece = tempArray.shift();
                        image = JEWELS[board[piece.x][piece.y]]
                        dest = new Object();
                        dest.x = x;
                        dest.y = y;
                        drawMovingPiece(currentTick, endTick, image, piece, dest);
                    }
                    break;
                }
            }
        }
    }
}

function drawPiecesSwapping(currentTick, endTick, pieces) {
    pieceA = pieces[0];
    pieceB = pieces[1];

    drawMovingPiece(currentTick, endTick, JEWELS[board[pieceA.x][pieceA.y]], pieceA, pieceB);
    drawMovingPiece(currentTick, endTick, JEWELS[board[pieceB.x][pieceB.y]], pieceB, pieceA);
}

function drawMovingPiece(currentTick, endTick, image, initialGrid, finalGrid) {
    initPtX = initialGrid.x * TILE_SIZE;
    initPtY = initialGrid.y * TILE_SIZE;
    finalPtX = finalGrid.x * TILE_SIZE;
    finalPtY = finalGrid.y * TILE_SIZE;
    drawImage(image,
        initPtX + ((finalPtX - initPtX) * (currentTick / endTick)),
        initPtY + ((finalPtY - initPtY) * (currentTick / endTick)),
        TILE_SIZE,
        TILE_SIZE);

}

function drawPiecesBeingRemoved(currentTick, endTick, pieces) {
    for (i = 0; i < pieces.length; i++) {
        image = JEWELS[board[pieces[i].x][pieces[i].y]];
        drawShrinkingPiece(currentTick, endTick, image, pieces[i]);
    }
}

function drawPiecesBeingAdded(currentTick, endTick, pieces) {
    for (i = 0; i < pieces.length; i++) {
        image = JEWELS[board[pieces[i].x][pieces[i].y]];
        drawGrowingPiece(currentTick, endTick, image, pieces[i]);
    }
}

function drawShrinkingPiece(currentTick, endTick, image, initialGrid) {
    initPtX = initialGrid.x * TILE_SIZE;
    initPtY = initialGrid.y * TILE_SIZE;
    drawImage(image,
        initPtX + TILE_SIZE / 2 * (currentTick / endTick),
        initPtY + TILE_SIZE / 2 * (currentTick / endTick),
        TILE_SIZE * (1 - (currentTick / endTick)),
        TILE_SIZE * (1 - (currentTick / endTick)));
}

function drawGrowingPiece(currentTick, endTick, image, initialGrid) {
    initPtX = initialGrid.x * TILE_SIZE;
    initPtY = initialGrid.y * TILE_SIZE;
    drawImage(image,
        initPtX + TILE_SIZE / 2 * (1 - currentTick / endTick),
        initPtY + TILE_SIZE / 2 * (1 - currentTick / endTick),
        TILE_SIZE * (currentTick / endTick),
        TILE_SIZE * (currentTick / endTick));
}

function drawScores(currentTick, endTick) {
    percentDone = currentTick / endTick;
    alpha = percentDone >= .5 ? 1 - percentDone : percentDone;
    size = percentDone >= .5 ? 1 - percentDone : percentDone;
    for (x = 0; x < BOARD_SIZE; x++) {
        for (y = 0; y < BOARD_SIZE; y++) {
            if (scoreBoard[x][y] != -1) {
                drawX = x * TILE_SIZE;
                drawY = y * TILE_SIZE;
                fillText("" + scoreBoard[x][y],
                    drawX + TILE_SIZE / 2,
                    drawY + TILE_SIZE / 2,
                    makeColor(.1, .3, .7, 1),
                    (400 * size) + "px Times New Roman",
                    "center",
                    "middle");
            }
        }
    }
}

function drawBoard(ptsNotToDraw) {
    for (x = 0; x < BOARD_SIZE; x++) {
        for (y = 0; y < BOARD_SIZE; y++) {
            drawX = x * TILE_SIZE;
            drawY = y * TILE_SIZE;
            gridColor = (x + y) % 2 == 0 ? GRID_B_COLOR : GRID_A_COLOR;
            fillRectangle(drawX,
                drawY,
                TILE_SIZE,
                TILE_SIZE,
                gridColor);
            if (board[x][y] != -1) {
                drawPoint = true;
                for (i = 0; i < ptsNotToDraw.length; i++) {
                    if (ptsNotToDraw[i].x == x && ptsNotToDraw[i].y == y) {
                        drawPoint = false;
                        break;
                    }
                }
                if (drawPoint) {
                    drawImage(JEWELS[board[x][y]],
                        drawX,
                        drawY,
                        TILE_SIZE,
                        TILE_SIZE);
                }
                if (explodeBoard[x][y]) {
                    strokeCircle(drawX + TILE_SIZE / 2,
                        drawY + TILE_SIZE / 2,
                        TILE_SIZE / 2,
                        EXPLODE_COLOR,
                        EXPLODE_THICKNESS);
                }
                if (hyperBoard[x][y]) {
                    fillCircle(drawX + TILE_SIZE / 2,
                        drawY + TILE_SIZE / 2,
                        TILE_SIZE / 3,
                        HYPER_COLOR);
                }
            }
            if (gameState == 0) {
                if (mousePull.started) {
                    withinWidth = mousePull.startX > drawX && mousePull.startX < drawX + TILE_SIZE;
                    withinHeight = mousePull.startY > drawY && mousePull.startY < drawY + TILE_SIZE;
                    if (withinWidth && withinHeight) {
                        drawImage(SELECT_IMAGE,
                            drawX,
                            drawY,
                            TILE_SIZE,
                            TILE_SIZE);
                    }

                    if (checkAdjacency(mousePull.startX, mousePull.startY, mousePull.dX, mousePull.dY)) {
                        withinWidth = mousePull.dX > drawX && mousePull.dX < drawX + TILE_SIZE;
                        withinHeight = mousePull.dY > drawY && mousePull.dY < drawY + TILE_SIZE;
                        if (withinWidth && withinHeight) {
                            drawImage(SELECT_IMAGE,
                                drawX,
                                drawY,
                                TILE_SIZE,
                                TILE_SIZE);
                        }
                    }
                }
            }
        }
    }
}

function movePiecesDown() {
    for (x = 0; x < BOARD_SIZE; x++) {
        for (y = BOARD_SIZE - 1; y >= 0; y--) {
            currentY = y;
            if (board[x][y] == -1) {
                for (y -= 1; y >= 0; y--) {
                    if (board[x][y] != -1) {
                        temp = board[x][y];
                        board[x][y] = board[x][currentY];
                        board[x][currentY] = temp;
                        break;
                    }
                }
                y = currentY;
            }
        }
    }
}

function piecesToBeMovedDown() {
    pts = new Array();
    for (x = 0; x < BOARD_SIZE; x++) {
        for (y = BOARD_SIZE - 1; y >= 0; y--) {
            if (board[x][y] == -1) {
                for (y -= 1; y >= 0; y--) {
                    if (board[x][y] != -1) {
                        pt = new Object();
                        pt.x = x;
                        pt.y = y;
                        pts.push(pt);
                    }
                }
                break;
            }
        }
    }
    return pts;
}

function checkBoard() {
    runs = getRuns();
    for (i = 0; i < runs.length; ++i) {
        if (runs[i].pts.length >= 3) {
            return true;
        }
    }
    return false;
}

function getRuns() {
    runs = new Array();
    for (x = 0; x < BOARD_SIZE; x++) {
        for (y = 0; y < BOARD_SIZE; y++) {
            pt = new Object();
            pt.x = x;
            pt.y = y;
            if (y == 0) {
                if (x != 0) {
                    runs.push(currentRun);
                }
                currentRun = new Object();
                currentRun.piece = board[x][y];
                currentRun.pts = new Array();
                currentRun.pts.push(pt);
            } else {
                if (currentRun.piece != -1 && board[x][y] == currentRun.piece) {
                    currentRun.pts.push(pt);
                } else {
                    runs.push(currentRun);
                    currentRun = new Object();
                    currentRun.piece = board[x][y];
                    currentRun.pts = new Array();
                    currentRun.pts.push(pt);
                }
            }
        }
    }
    runs.push(currentRun);
    for (y = 0; y < BOARD_SIZE; y++) {
        for (x = 0; x < BOARD_SIZE; x++) {
            pt = new Object();
            pt.x = x;
            pt.y = y;
            if (x == 0) {
                if (y != 0) {
                    runs.push(currentRun);
                }
                currentRun = new Object();
                currentRun.piece = board[x][y];
                currentRun.pts = new Array();
                currentRun.pts.push(pt);
            } else {
                if (currentRun.piece != -1 && board[x][y] == currentRun.piece) {
                    currentRun.pts.push(pt);
                } else {
                    runs.push(currentRun);
                    currentRun = new Object();
                    currentRun.piece = board[x][y];
                    currentRun.pts = new Array();
                    currentRun.pts.push(pt);
                }
            }
        }
    }
    runs.push(currentRun);
    return runs;
}


function swapPieces(piece1, piece2) {
    temp = board[piece1.x][piece1.y];
    board[piece1.x][piece1.y] = board[piece2.x][piece2.y];
    board[piece2.x][piece2.y] = temp;
}

function getPiece(x, y) {
    return board[Math.floor(x / TILE_SIZE)][Math.floor(y / TILE_SIZE)];
}

function setPiece(x, y, piece) {
    board[Math.floor(x / TILE_SIZE)][Math.floor(y / TILE_SIZE)] = piece;
}

function checkAdjacency(x1, y1, x2, y2) {
    gridX1 = Math.floor(x1 / TILE_SIZE);
    gridY1 = Math.floor(y1 / TILE_SIZE);
    gridX2 = Math.floor(x2 / TILE_SIZE);
    gridY2 = Math.floor(y2 / TILE_SIZE);
    adjacentX = Math.abs(gridX1 - gridX2) == 1;
    sameX = Math.abs(gridX1 - gridX2) == 0;
    adjacentY = Math.abs(gridY1 - gridY2) == 1;
    sameY = Math.abs(gridY1 - gridY2) == 0;
    return adjacentX && sameY || adjacentY && sameX;
}

function drawPlayerScore() {
    xpos = (TILE_SIZE * BOARD_SIZE) + ((canvas.width - (TILE_SIZE * BOARD_SIZE)) / 2);
    fillText("Score",
        xpos,
        0,
        makeColor(0.6, 0.0, 0.9, 1.0),
        "100px Times New Roman",
        "center",
        "top");

    fillText("" + score,
        xpos,
        100,
        makeColor(0.6, 0.0, 0.9, 1.0),
        "100px Times New Roman",
        "center",
        "top");

    fillText("For Vicky",
        xpos,
        800,
        makeColor(0.8, 0.0, 0.0, 1.0),
        "80px Times New Roman",
        "center",
        "top");

}

function drawLevelMeter() {
    xpos = (TILE_SIZE * BOARD_SIZE) + ((canvas.width - (TILE_SIZE * BOARD_SIZE)) / 2);
    fillRectangle(xpos,
        300,
        -((canvas.width - (TILE_SIZE * BOARD_SIZE)) / 3),
        60,
        makeColor(.5, .5, .5)
    );
    fillRectangle(xpos,
        300,
        ((canvas.width - (TILE_SIZE * BOARD_SIZE)) / 3),
        60,
        makeColor(.5, .5, .5)
    );
    fillRectangle(xpos,
        290,
        ((canvas.width - (TILE_SIZE * BOARD_SIZE)) / 3) - 20,
        50,
        makeColor(1, 1, 0)
    );
}


