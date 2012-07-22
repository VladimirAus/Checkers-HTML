// Singleton objects

// CheckersGame object
var CheckersGame = function() {
	this.players = [new Player(),new Player()];
	this.currentPlayerIndex = 0;
	this.board = new Board();
	this.moves = [];
}

// Board object
var Board = function() {
	this.squares = [];
}

// Other objects

// Player object
function Player() {
	this.name = "";
	this.color = "";
	this.checkers = [];
}

// Checker object
function Checker() {
	this.currentPosition = new Position();
	this.kinged = false;
	this.captured = false;
}

// Move object: state
function Move() {
	this.playerColor = "";
	this.startPosition = new Position();
	this.endPosition = new Position();
}

// Position object
function Position() {
	this.x = "";
	this.y = "";
}