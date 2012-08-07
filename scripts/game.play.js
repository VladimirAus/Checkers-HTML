
$(document).ready(function() {
	//alert('Bangarang!');
	var game = new CheckersGame();
	
	$('#game-end-turn').click(function() {
		if (game.endTurn()) {
			$('#game-current-player').text((game.currentPlayerIndex == 0)?'white':'black');
		}
	});
	
});

