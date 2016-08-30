ew.components.AddSelect = (function( $ ){

	var DISABLED = 'disabled';

	function errorMessage( field ){
		return ( field + ' is required for AddSelectComponent' );
	}
	
	function AddSelectComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.selector ){ throw new Error( errorMessage( 'opts.selector' ) ); }
		if( !opts.labelText ){ throw new Error( errorMessage( 'opts.labelText' ) ); }

		this.selector = opts.selector;
		this.required = !!opts.required;
		this.labelText = opts.labelText;
		this.buttonText = ( opts.buttonText || 'Add another' );
		this.minVisible = ( opts.minVisible === 0 ? 0 : ( opts.minVisible || 1 ) );

		this.$selects = $( this.selector );
		this.$groups = this.$selects.closest( '.form-group' );
		this.$group = this.$selects.closest( '.add-select-group' );
		this.count = this.$selects.length;
		this.visible = this.count;

		this.$addButton = $( '<button class="btn btn-default">' + this.buttonText + '</button>' );
		this.$removeButton = $( '<button class="btn btn-default remove-select">Remove</button>' );

		this.hideOthers();
		this.createLabel();
		this.$addButton.appendTo( this.$group );
		this.updateRemoveButton();
		this.checkAddButtonState();

		this.$addButton.on( 'click', $.proxy( this.addSelect, this ) );
		this.$groups.on( 'click', '.remove-select', $.proxy( this.removeSelect, this ) );
	}

	AddSelectComponent.prototype.createLabel = function(){
		
		this.$groups.find( 'label, span' ).remove();
		var $heading = $( '<h4 class="form-label">'+ this.labelText +'</h4>' );

		if( this.required ){
			$heading.prepend( '<span class="required">*</span>');
		}

		this.$group.prepend( $heading );
	};

	AddSelectComponent.prototype.removeSelect = function( e ){
		
		e.preventDefault();

		this.visible--;
		$( this.$groups[ this.visible ] ).hide();
		this.$selects[ this.visible ].selectedIndex = 0;

		if( this.visible < this.count ){

			this.$addButton.removeClass( DISABLED );
		}

		this.updateRemoveButton();
	};

	AddSelectComponent.prototype.hideOthers = function(){
		
		var i = this.minVisible;

		for( ; i < this.count; i++ ){

			if( this.$selects[ i ].selectedIndex === 0 ){

				$( this.$groups[ i ] ).hide();
				this.visible--;
			}
		}
	};

	AddSelectComponent.prototype.checkAddButtonState = function(){
		
		if( this.visible === this.count ){

			this.$addButton.addClass( DISABLED );
		}
	};

	AddSelectComponent.prototype.updateRemoveButton = function(){

		if( this.visible > this.minVisible ){

			this.$removeButton.insertAfter( this.$selects[ this.visible - 1 ] );

		} else {

			this.$removeButton.remove();
		}
	};

	AddSelectComponent.prototype.addSelect = function( e ){

		e.preventDefault();
		
		if( this.visible < this.count ){

			$( this.$groups[ this.visible ] ).show();
			this.visible++;

			this.updateRemoveButton();
			this.checkAddButtonState();
		}
	};

	return AddSelectComponent;

}( jQuery ));