ew.components.UpdateSelect = (function( $ ){
	
	function errorMessage( param ){
		return ( param + ' is required for UpdateSelectComponent' );
	}

	//Take two select boxes and update the <option>s in the second one based on a value from the first
	//Clone <option>s and add/remove from the DOM to ensure it works in IE 11

	function UpdateSelectComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.firstSelect ){ throw new Error( errorMessage( 'opts.firstSelect' ) ); }
		if( !opts.secondSelect ){ throw new Error( errorMessage( 'opts.secondSelect' ) ); }

		var self = this;

		self.delimiter = ( opts.delimiter || ':' );
		self.$firstSelect = $( opts.firstSelect );
		self.$secondSelect = $( opts.secondSelect );
		self.$secondSelectOptions = self.$secondSelect.find( 'option' );

		if( !self.$firstSelect.length ){ throw new Error( 'firstSelect not found' ); }
		if( !self.$secondSelect.length){ throw new Error( 'secondSelect not found' ); }

		self.$options = self.$secondSelectOptions.clone();

		if( !self.$options.length ){ throw new Error( 'Select contains no options' ); }

		self.$firstSelect.on( 'change', function(){

			self.handleChange( this );
		} );

		self.setInitialState();
	}

	UpdateSelectComponent.prototype.setInitialState = function(){
		
		var val = this.$firstSelect.val();

		this.setOptions( val );
	};

	UpdateSelectComponent.prototype.setOptions = function( val ){

		if( val ){

			this.updateOptions( val );

		} else {

			this.chooseTeamMessage();
		}
	};

	UpdateSelectComponent.prototype.chooseTeamMessage = function(){

		this.$secondSelect.empty().append( '<option>Please choose a team type first</option>' );
	};

	UpdateSelectComponent.prototype.updateOptions = function( val ){
		
		var $options = this.$options.clone();
		var match = ( val + this.delimiter );
		var matchLength = match.length;

		var $newOptions = $options.filter( function( index ){

			//if the value is '' = 'Please choose...'
			//otherwise if the first part of the value matches the chosen value with a delimiter
			return this.value === '' || this.value.substring( 0, matchLength ) === match;
		} );

		//remove all <option>s
		this.$secondSelect.empty();

		//add back in our cloned <option>s
		$newOptions.appendTo( this.$secondSelect );

	};

	UpdateSelectComponent.prototype.handleChange = function( opt ){
		
		var val = opt.value;

		this.setOptions( val );

		//select the first option
		this.$secondSelect[ 0 ].selectedIndex = 0;
	};

	return UpdateSelectComponent;

}( jQuery ));