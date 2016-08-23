ew.components.WordCounter = (function( $ ){
	
	function WordCounterComponent( opts ){

		if( !opts ){ throw new Error( 'opts is required for WordCounterComponent' ); }
		if( !opts.limit ){ throw new Error( 'You need to specify a limit for WordCounterComponent' ); }
		if( !opts.id ){ throw new Error( 'You need to provide an id for WordCounterComponent' ); }

		this.limit = opts.limit;
		this.$input = $( '#' + opts.id );

		this.createCounter();
		this.$input.on( 'keyup', $.proxy( this.handleKeyUp, this ) );
	}

	WordCounterComponent.prototype.createCounter = function(){
		
		this.$counter = $( '<span class="word-counter">0 characters</span>' );
		this.$counter.insertAfter( this.$input );
	};

	WordCounterComponent.prototype.handleKeyUp = function(){

		var val = this.$input.val();
		var count = ( val ? val.length : 0 );
		var text = ( count === 1 ? 'character' : 'characters' );
		
		this.$counter.text( count + ' ' + text );
	};

	return WordCounterComponent;

}( jQuery ));