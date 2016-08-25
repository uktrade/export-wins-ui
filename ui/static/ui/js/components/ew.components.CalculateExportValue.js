ew.components.CalculateExportValue = (function( $, toLocaleString ){

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

	CalculateExportValueComponent.prototype.updateHtml = function(){

		var totalYearsClass = 'export-total-years';
		var totalValueClass = 'export-total-value';
		var $formGroup = this.$total.parents( '.form-group' );
		
		this.$total[ 0 ].type = 'hidden';

		$formGroup.find( '.help-text' ).hide();
		$formGroup.find( 'label' ).hide();
		$formGroup.find( '.required' ).hide();
		
		this.$totalInfo = $( '<p class="export-total">Totaling over <span class="'+ totalYearsClass +'"></span>: <span class="'+ totalValueClass +'"</span></p>' );
		this.$totalYears = this.$totalInfo.find( '.' + totalYearsClass );
		this.$totalValue = this.$totalInfo.find( '.' + totalValueClass );

		$formGroup.prepend( this.$totalInfo );
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

		while( ( $value = this.$values[ i++] ) ){

			yearTotal = Number( $value.val() );

			if( yearTotal > 0 ){

				total += yearTotal;
				years++;
			}
		}

		this.$totalYears.text( years + ( years === 1 ? ' year' : ' years' ) );
		this.$totalValue.text( this.currency + toLocaleString( total ) );
		this.$total.val( total );
	};

	return CalculateExportValueComponent;

}( jQuery, ew.tools.toLocaleString ));