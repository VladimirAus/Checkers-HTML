// Singleton objects

////////////////////////
// CheckersGame object
////////////////////////
var CheckersGame = function() {
	this.players = [new Player("Player 1", true),new Player("Player 2", false)];
	this.currentPlayerIndex = 0;
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
			var checker = $('<div>', {}).addClass('checker checker-' + (player.isWhite?'white':'black'))
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
		
	$(".board-cell").droppable({
		drop: function( event, ui ) {
				
				var uiElem = $(ui.draggable)[0]; // get checker
				var uiChecker = $($(ui.draggable)[0]);
				var uiCell = $(this);
				
				// Validity
				// 1. Check for cell color
				if (uiCell.hasClass( 'board-cell-color-black' )) {
					return;
				}
				
				// 2. Check if no other checkers on the same spot
				if (uiCell.find('.checker').length > 0) {
					return;
				}
				
				// 3. Check current player
				
				
				// 4. Check legality of simple move: direction and jump
				var letterDir = (uiChecker.attr("checkerColor") == 'white')?-1:1;
				var newCell = (uiChecker.attr("cell"));
				var oldCell = (uiCell.attr("cellId"));
				if ((letterDir * (parseInt(newCell.charAt(1)) - parseInt(oldCell.charAt(1)))) != 1)  // vertical
				{
					console.log('vert: ' +oldCell.charAt(1) +'; '+newCell.charAt(1)+ ';' + (letterDir * (parseInt(newCell.charAt(1)) - parseInt(oldCell.charAt(1)))));
					return;
				}
				
				if ((Math.abs(parseInt(newCell.charCodeAt(0)) - parseInt(oldCell.charCodeAt(0)))) != 1) // horizontal
				{
					console.log('horiz');
					return;
				}
				
				// 5. Check legality of taking other checker: opposite color and correct direction
				
				// if legal
				
				
				uiChecker.draggable("option", "revert", false);
				
				uiChecker.attr("style", "");
				uiCell.html(uiChecker.parent().html());
				uiChecker.parent().html("");
				//this.makeDraggable($(this).find('.checker'));
				
				// TODO: make it user oiginal makeDraggable function
				$(this).find('.checker').draggable({
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
				
				// update game details
				
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
}

CheckersGame.prototype.gameLoop = function() {
	//waiting for turn
}

CheckersGame.prototype.endTurn = function() {
	this.currentPlayerIndex = Math.abs(this.currentPlayerIndex - 1);
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
	
	for (var row = 1; row <= 8; row++) {
		//elemRowCont = $('<li>', {}).addClass('board-row-container');
		//elemBoard.append(elemRowCont);
		//elemBoardRow = $('<ul>', {}).addClass('board-row')
		//							.addClass('board-row-' + row);
		//for(
		for (var cell = 1; cell <= 8; cell++) {
			var cellId = String.fromCharCode(cell + 96) + (9-row);
			elemBoardCell = $('<li>', {}).addClass('board-cell')
										.addClass('board-cell-color-'+(((row*8 + cell + ((row %2 ==0)?1:0) ) % 2 == 0)?'white':'black'))
										.addClass('board-cell-' + cellId)
										.addClass('board-row-'  + 9-row)
										.attr('cellId', cellId);
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