// Singleton objects

////////////////////////
// CheckersGame object
////////////////////////
var CheckersGame = function() {
	this.players = [new Player("Player 1", true),new Player("Player 2", false)];
	this.currentPlayerIndex = 0;
	this.currentPlayerWalked = 0;
	this.currentPlayerLastCollected = -1;
	this.board = new Board();
	this.moves = [];
	
	var arWhitePos = ['g1', 'e1', 'c1', 'a1', 'h2', 'f2', 'd2', 'b2', 'g3', 'e3', 'c3', 'a3'];
	var arBlackPos = ['h8', 'f8', 'd8', 'b8', 'g7', 'e7', 'c7', 'a7', 'h6', 'f6', 'd6', 'b6'];
	this.players[0].generateFigures(arWhitePos);
	this.players[1].generateFigures(arBlackPos);
	
	this.drawGame();
}

CheckersGame.prototype.drawGame = function() {
	$('#board').append(this.board.getBoard());
	
	for (playerIndex in this.players) {
		var player = this.players[playerIndex];
		//alert(player.checkers.length);
		for (playerCheckerIndex in player.checkers) {
			var playerChecker = player.checkers[playerCheckerIndex];
			var checker = $('<div>', {}).addClass('checker')
							.addClass('checker-' + (player.isWhite?'white':'black'))
							//.addClass('checker-kinged')
							.attr('kinged', 0)
							.attr('cell', playerChecker.currentPosition)
							.attr('checkerColor', (player.isWhite?'white':'black'));
			
			//var testCheckerB = $('<div>', {}).addClass('checker checker-black');
					
			this.board.getBoard().find('.board-cell-' + playerChecker.currentPosition).append(checker);
			//alert(playerChecker.currentPosition);
			//elemBoard.find('.board-cell-h8').append(testCheckerB);
			
			this.makeDraggable(checker);
			
			//checker
		}
	}
		
	var gameRef = this; // reference for listener
	$(".board-cell").droppable({
		drop: function( event, ui ) {
				
				var uiElem = $(ui.draggable)[0]; // get checker
				var uiChecker = $($(ui.draggable)[0]);
				var uiCell = $(this);
				
				// Validity
				
				
				// 1. Check for cell color
				if (uiCell.hasClass( 'board-cell-color-black' )) {
					console.log('Drop warning: player can only use white cells');
					return;
				}
				
				// 2. Check if no other checkers on the same spot
				if (uiCell.find('.checker').length > 0) {
					console.log('Drop warning: existing checker conflict');
					return;
				}
				
				// 3. Check current player
				if (!
				 (((gameRef.currentPlayerIndex == 0) && (uiChecker.attr("checkerColor") == 'white')) ||
				 ((gameRef.currentPlayerIndex == 1) && (uiChecker.attr("checkerColor") == 'black')))
				) {
					console.log('Drop warning: wrong player turn');
					return;
				}
				
				// 4. If second move or higher, check for previously collected
				if (gameRef.currentPlayerLastCollected != gameRef.currentPlayerWalked - 1) {
					console.log('Drop warning: no more legal moves left. End your turn!');
					return;
				}
				
				var letterDir = (uiChecker.attr("checkerColor") == 'white')?1:-1;
				var oldCell = (uiChecker.attr("cell"));
				var newCell = (uiCell.attr("cellId"));
				
				// 5. Same cell move
				if (oldCell == newCell) {
					console.log('Drop warning: same cell move exception');
					return;
				}
				
				// 6. Check legality of taking other checker: opposite color and correct direction
				if (uiChecker.attr('kinged') == 1) { // kinged functionality
					// a. Kinged can move
					var diffVert = parseInt(newCell.charAt(1)) - parseInt(oldCell.charAt(1));
					var diffHoriz = parseInt(newCell.charCodeAt(0)) - parseInt(oldCell.charCodeAt(0));
					if (Math.abs(diffVert) != Math.abs(diffHoriz)){
						console.log('King drop warning: wrong position');
						return;
					}
					
					// check for legality of move
					var dirVert = Math.abs(diffVert)/diffVert;
					var dirHoriz  = Math.abs(diffHoriz)/diffHoriz;
					
					var res = '';
					for (var i = 1; i < Math.abs(diffVert); i++) {
						var horLetter = String.fromCharCode(parseInt(oldCell.charCodeAt(0)) + dirHoriz*i);
						var vertNumber = parseInt(oldCell.charAt(1)) + dirVert*i;
						//res += horLetter + vertNumber +'; ';
						//uiCell.find('.checker');
						var checkerToTake = $('li.board-cell-' + horLetter + vertNumber).find('.checker');
						if ((i < Math.abs(diffVert)-1) && (checkerToTake.length == 1)) {
							console.log('King drop warning: should stop after taken');
							return;
						}
						else if ((i == Math.abs(diffVert)-1) && (checkerToTake.length == 1)) {
							if (checkerToTake.attr("checkerColor") == uiChecker.attr("checkerColor")) {
								console.log('King drop warning: checkers of the same color');
								return;
							}
							
							checkerToTake.remove();
							gameRef.currentPlayerLastCollected = gameRef.currentPlayerWalked;
						}
					}
					//alert(res);
				}
				else {
				
					if (((letterDir * (parseInt(newCell.charAt(1)) - parseInt(oldCell.charAt(1)))) == 2)  ||
							((Math.abs(parseInt(newCell.charCodeAt(0)) - parseInt(oldCell.charCodeAt(0)))) == 2) // horizontal
					){
						
						// TODO: prevent collection both ways? Research
						var vertLetter = String.fromCharCode(parseInt(newCell.charCodeAt(0)) - 
							((parseInt(newCell.charCodeAt(0)) - parseInt(oldCell.charCodeAt(0)))/2));
						var horNumber = parseInt(newCell.charAt(1)) -
							((parseInt(newCell.charAt(1)) - parseInt(oldCell.charAt(1)))/2);
						var checkerToTake = $('li.board-cell-' + vertLetter + horNumber).find('.checker');
						
						// a. Check if checkers exists
						if (checkerToTake.length == 0) {
							console.log('Collection warning: no checker to collect at ' + vertLetter + horNumber);
							return;
						}
							
						// b. Check if checker of opposite color
						if (checkerToTake.attr("checkerColor") == uiChecker.attr("checkerColor")) {
							console.log('Collection warning: checkers of the same color');
							return;
						}
						
						// c. Checker collection 
						checkerToTake.remove();
						gameRef.currentPlayerLastCollected = gameRef.currentPlayerWalked;
					}
					else {
						// 7. Check legality of simple move: direction and jump
						if (((letterDir * (parseInt(newCell.charAt(1)) - parseInt(oldCell.charAt(1)))) != 1)  ||
							((Math.abs(parseInt(newCell.charCodeAt(0)) - parseInt(oldCell.charCodeAt(0)))) != 1) // horizontal
						){
							console.log('Drop warning: checker move exception');
							return;
						}
					}
				}
				
				
				
				// if legal
				
				
				uiChecker.draggable("option", "revert", false);
				
				uiChecker.attr("style", "");
				uiCell.html(uiChecker.parent().html());
				uiChecker.parent().html("");
				//this.makeDraggable($(this).find('.checker'));
				
				// TODO: make it user oiginal makeDraggable function
				/*
				uiCell.find('.checker').draggable({
					cursor: "move",
					containment: ".board-main",
					scroll: false,
					revert: true,
					snap: ".board-cell", // maybe remove for mobile
					stop: function(event, ui) {
						if (!$(ui.helper).draggable("option", "revert")) {
						}
						$(ui.helper).draggable("option", "revert", true);
						//alert($(ui.helper).draggable("option", "revert"));
					}
				});
				*/
				var checkerNew = uiCell.find('.checker');
				gameRef.makeDraggable(checkerNew);
				checkerNew.attr("cell", newCell); // update
				
				// kinged check
				var rowToBeKing = (uiChecker.attr("checkerColor") == 'white')?8:1;
				if (parseInt(newCell.charAt(1)) == rowToBeKing) {
					gameRef.makeKinged(checkerNew);
				} 
				
				// update game details
				//gameRef.endTurn();
				gameRef.currentPlayerWalked++;
				
		}
	});
}

CheckersGame.prototype.makeDraggable = function(checker) {
	checker.draggable({
			cursor: "move",
			containment: ".board-main",
			scroll: false,
			revert: true,
			snap: ".board-cell", // maybe remove for mobile
			stop: function(event, ui) {
				if (!$(ui.helper).draggable("option", "revert")) {
				}
				$(ui.helper).draggable("option", "revert", true);
				//alert($(ui.helper).draggable("option", "revert"));
			}
		});
	checker.addTouch(); //mobile fix
	
	//return checker;
};

CheckersGame.prototype.makeKinged = function(checker) {
	checker
		.addClass('checker-kinged')
		.attr('kinged', 1);
};

CheckersGame.prototype.gameLoop = function() {
	//waiting for turn
}

// Return result will be 
CheckersGame.prototype.endTurn = function() {
	if (this.currentPlayerWalked > 0) {
		this.currentPlayerIndex = Math.abs(this.currentPlayerIndex - 1);
		this.currentPlayerWalked = 0;
		this.currentPlayerLastCollected = -1;
		return true;
	}
	else {
		return false;
	}
}

////////////////////////
// End CheckersGame object
////////////////////////

////////////////////////
// Board object
////////////////////////

// Board object
var Board = function() {
	this.board = this.initBoard();
}

Board.prototype.initBoard = function() {
// Init variables
	var elemBoard = $('<ul>', {}).addClass('board-main');
	var elemBoardCell; //elemRowCont, elemBoardRow;
	//var arCellLetters = ['a','b','c','d','e','f','g'];
	
	// TODO: make numbering an option
	for (var row = 1; row <= 9; row++) {
		//elemRowCont = $('<li>', {}).addClass('board-row-container');
		//elemBoard.append(elemRowCont);
		//elemBoardRow = $('<ul>', {}).addClass('board-row')
		//							.addClass('board-row-' + row);
		//for(
		for (var cell = 1; cell <= 9; cell++) {
			var cellId = String.fromCharCode(cell + 96) + (9-row);
			if ((cell <= 8) && (row <= 8)) {
				elemBoardCell = $('<li>', {}).addClass('board-cell')
											.addClass('board-cell-color-'+(((row*8 + cell + ((row %2 ==0)?1:0) ) % 2 == 0)?'white':'black'))
											.addClass('board-cell-' + cellId)
											.addClass('board-row-'  + 9-row)
											.attr('cellId', cellId);
			}
			else {
				elemBoardCell = $('<li>', {}).addClass('board-cell-letter');
				if (!((cell == 9) && (row == 9))) {
					elemBoardCell.text((cell == 9)?(9-row):String.fromCharCode(cell + 96));
				}
				if ((row == 9)) {
					elemBoardCell.addClass('cell-no-letter');
				}
				else {
					elemBoardCell.addClass('cell-no-number');
				}
			}
			
			if (cell == 1) {
				elemBoardCell.addClass('board-row-first');
			}
			else if (cell == 8) {
				elemBoardCell.addClass('board-row-last');
			}
			
			elemBoard.append(elemBoardCell);
		}
	}
	
	return elemBoard;
}

Board.prototype.getBoard = function() {
	return this.board;
}

////////////////////////
// End Board object
////////////////////////

// Other objects

////////////////////////
// Player object
////////////////////////

// Player object
function Player(name, isWhite) {
	this.name = name;
	//this.color = "";//substitute for  2 colors
	this.isWhite = isWhite;
	this.checkers = [];
}

Player.prototype.generateFigures = function(arFigures) {
	for (figurePosIndex in arFigures) {
		var figurePos = arFigures[figurePosIndex];
		this.checkers.push(new Checker(figurePos));
	}
}

////////////////////////
// End Player object
////////////////////////

// Checker object
function Checker(pos) {
	this.currentPosition = pos;
	this.kinged = false;
	this.captured = false;
}

// Move object: state
function Move(playerId, startPosition, endPosition) {
	this.playerId = playerId;
	this.startPosition = startPosition;
	this.endPosition = endPosition;
}

// Position object
/*
function Position() {
	this.x = "";
	this.y = "";
}
*/