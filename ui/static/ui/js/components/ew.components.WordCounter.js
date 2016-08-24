ew.components.WordCounter = (function( $ ){

	var DANGER_CLASS = 'text-danger';
	
	function WordCounterComponent( opts ){

		if( !opts ){ throw new Error( 'opts is required for WordCounterComponent' ); }
		if( !opts.limit ){ throw new Error( 'You need to specify a limit for WordCounterComponent' ); }
		if( !opts.id ){ throw new Error( 'You need to provide an id for WordCounterComponent' ); }

		this.limit = opts.limit;
		this.$input = $( '#' + opts.id );

		this.createCounter();
		this.$input.on( 'keyup', $.proxy( this.upateCharacterCount, this ) );
	}

	WordCounterComponent.prototype.createCounter = function(){
		
		this.$counter = $( '<span class="word-counter">0 characters</span>' );
		this.$counter.insertAfter( this.$input );
		this.upateCharacterCount();
	};

	WordCounterComponent.prototype.upateCharacterCount = function(){

		var val = this.$input.val();
		var count = ( val ? val.length : 0 );
		var text = ( count === 1 ? 'character' : 'characters' );
		
		this.$counter.text( count + ' ' + text );

		if( count > this.limit ){
			
			this.$counter.addClass( DANGER_CLASS ) ;

		} else {

			this.$counter.removeClass( DANGER_CLASS );
		}
	};

	return WordCounterComponent;

}( jQuery ));