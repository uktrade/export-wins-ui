
ew.components.WordCounter = (function( $ ){

	var DANGER_CLASS = 'text-danger';

	function errorMessage( field ){
		return ( field + 'is required for WordCounterComponent' );
	}
	
	function WordCounterComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.limit ){ throw new Error( errorMessage( 'opts.limit' ) ); }
		if( !opts.id ){ throw new Error( errorMessage( 'opts.id' ) ); }

		this.limit = opts.limit;
		this.$input = $( '#' + opts.id );

		this.createCounter();
		this.$input.on( 'keyup', $.proxy( this.upateCount, this ) );
	}

	WordCounterComponent.prototype.createCounter = function(){
		
		this.$counter = $( '<span class="word-counter">0 words</span>' );
		this.$counter.insertAfter( this.$input );
		this.upateCount();
	};

	WordCounterComponent.prototype.getWordCount = function( val ){

		return val.replace( /\s+$/, '' ).split( ' ' ).length;
	};

	WordCounterComponent.prototype.upateCount = function(){

		var val = this.$input.val();
		var count = ( val ? this.getWordCount( val ) : 0 );
		var text = ( count === 1 ? 'word' : 'words' );
		
		this.$counter.text( count + ' ' + text );

		if( count > this.limit ){
			
			this.$counter.addClass( DANGER_CLASS ) ;

		} else {

			this.$counter.removeClass( DANGER_CLASS );
		}
	};

	return WordCounterComponent;

}( jQuery ));
