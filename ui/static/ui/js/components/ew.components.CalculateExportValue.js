ew.components.CalculateExportValue = (function( doc, $, toLocaleString ){

	var zeros = /^0+$/;
	
	function errorMessage( field ){
		return ( field + ' is required for CalculateExportValueComponent' );
	}

	function CalculateExportValueComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.values ){ throw new Error( errorMessage( 'opts.values' ) ); }
		if( !opts.total ){ throw new Error( errorMessage( 'opts.total' ) ); }

		this.values = opts.values;
		this.$total = $( '#' + opts.total );
		this.currency = '£';
		this.$values = [];

		this.updateHtml();
		this.getValueElems();
		this.setupListeners();
		this.updateValue();
	}

	CalculateExportValueComponent.prototype.resetValues = function(){
		
		var $value;
		var i = 0;

		while( ( $value = this.$values[ i++ ] ) ){

			$value.val( 0 );
		}

		this.updateValue();
	};

	CalculateExportValueComponent.prototype.updateHtml = function(){

		var totalYearsClass = 'export-total-years';
		var totalValueClass = 'export-total-value';
		var $formGroup = this.$total.parents( '.form-group' );
		var totalInfo = doc.createElement( 'p' );//create <p> with DOM API for IE7
		
		this.$total.hide();

		$formGroup.find( '.help-text' ).hide();
		$formGroup.find( 'label' ).hide();
		$formGroup.find( '.required' ).hide();

		totalInfo.className = 'export-total';
		totalInfo.innerHTML = ( 'Totaling over <span class="'+ totalYearsClass +'"></span>: <span class="'+ totalValueClass +'"</span>' );

		$formGroup[ 0 ].appendChild( totalInfo );

		this.$totalYears = $formGroup.find( '.' + totalYearsClass );
		this.$totalValue = $formGroup.find( '.' + totalValueClass );
	};

	CalculateExportValueComponent.prototype.getValueElems = function(){
		
		var ids = [];
		var i = 0;
		var id;

		while( ( id = this.values[ i++ ] ) ){

			id = ( '#' + id );
			this.$values.push( $( id ) );
		}
	};

	CalculateExportValueComponent.prototype.setupListeners = function(){
		
		var self = this;
		var i = 0;
		var $value;
		var proxiedUpdate = $.proxy( this.updateValue, this );

		function createHandlers( $elem ){

			$value.on( 'keyup', proxiedUpdate );

			$elem.on( 'focus', function(){
				self.handleFocus( $elem );
			} );

			$elem.on( 'blur', function(){
				self.handleBlur( $elem );
			} );
		}

		while( ( $value = this.$values[ i++] ) ){
			createHandlers( $value );
		}
	};

	CalculateExportValueComponent.prototype.handleBlur = function( $elem ){

		var val = $elem.val();

		if( val === '' || zeros.test( val ) ){

			$elem.val( 0 );
		}
	};

	CalculateExportValueComponent.prototype.handleFocus = function( $elem ){
		
		if( zeros.test( $elem.val() ) ){
			$elem.val( '' );
		}
	};

	CalculateExportValueComponent.prototype.updateValue = function(){
		
		var total = 0;
		var i = 0;
		var years = 0;
		var $value;
		var yearAmount;

		while( ( $value = this.$values[ i++ ] ) ){

			yearAmount = parseInt( $value.val(), 10 );

			if( yearAmount > 0 ){

				total += yearAmount;
				years++;
			}
		}

		this.$totalYears.text( years + ( years === 1 ? ' year' : ' years' ) );
		this.$totalValue.text( this.currency + toLocaleString( total ) );
		this.$total.val( total );
	};

	return CalculateExportValueComponent;

}( document, jQuery, ew.tools.toLocaleString ));