ew.components.AddContributors = (function( $ ){

	function errorMessage( field ){
		return ( field + ' is required for AddContributorsComponent' );
	}
	
	function AddContributorsComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.contributorsSelector ){ throw new Error( errorMessage( 'opts.contributorsSelector' ) ); }
		if( !opts.nameInputSelector ){ throw new Error( errorMessage( 'opts.nameInputSelector' ) ); }

		var self = this;
		this.$contributors = $( opts.contributorsSelector );
		this.contributorsSelector = opts.contributorsSelector;
		this.nameInputSelector = opts.nameInputSelector;

		this.shownContributors = 0;
		this.contributorsLength = this.$contributors.length;
		this.$removeButton = $( '<button type="button" class="btn btn-xs btn-default remove-contributor" aria-label="Remove contributor" title="Remove contributor">Remove</button>' );

		this.createAddButton();
		this.hideContributingLines();
		this.showCloseButton();

		this.$addButton.on( 'click', $.proxy( this.addContributor, this ) );

		this.$contributors.on( 'click', '.remove-contributor', function( e ){

			self.removeContributor( e, this );
		} );
	}

	AddContributorsComponent.prototype.focusOnFirstNameInput = function(){
		
		var $nameInput = $( this.$contributors[ 0 ] ).find( this.nameInputSelector );

		if( !$nameInput.val() ){

			$nameInput.focus();
		}
	};

	AddContributorsComponent.prototype.showCloseButton = function(){

		//TODO: Optimise this to track the last visible item so we don't need to use this expensive selector
		// it will make it better for IE7
		var $lastVisible = $( this.contributorsSelector + ':visible' ).last();

		if( !$lastVisible.is( this.$contributors[ 0 ] ) ){

			$lastVisible.prepend( this.$removeButton );
		}
	};

	AddContributorsComponent.prototype.removeCloseButton = function(){
		
		this.$removeButton.remove();
	};

	AddContributorsComponent.prototype.updateCloseButton = function(){
	
		var self = this;

		this.removeCloseButton();

		//IE7 is VERY slow with showing the button, so let it paint before trying to update the position
		window.setTimeout( function(){
			self.showCloseButton();
		}, 1 );
	};

	AddContributorsComponent.prototype.createAddButton = function(){
		
		this.$addButton = $( '<button class="btn btn-default">Add another contributor</button>' );
		this.$contributors.parent().append( this.$addButton );
	};

	AddContributorsComponent.prototype.hideContributingLines = function(){

		var self = this;

		self.$contributors.each( function( index ){

			var $contributor = $( this );
			var $nameInput;

			//always show the first group
			if( index === 0 ){

				$contributor.show();

			} else if( index > self.shownContributors ){

				//if the name has some content, then we need to show it (edit mode)
				$nameInput = $contributor.find( self.nameInputSelector );
				
				if( $nameInput.val().length > 0 ){

					$contributor.show();
					self.shownContributors++;

				} else {

					$contributor.hide();
				}

			} else {

				//otherwise hide the group
				$contributor.hide();
			}
		} );
	};

	AddContributorsComponent.prototype.addContributor = function( e ){

		var $currentContributor;

		e.preventDefault();

		if( this.shownContributors < this.contributorsLength ){

			this.shownContributors++;
			$currentContributor = $( this.$contributors[ this.shownContributors ] );
			$currentContributor.show();
			$currentContributor.find( this.nameInputSelector ).focus();
			this.updateCloseButton();
			this.checkAddButtonState();

		} else {

			alert( 'Sorry, the system can\'t add more than 5 contributing teams. Please choose teams that contributed the most.' );
		}
	};

	AddContributorsComponent.prototype.checkAddButtonState = function(){

		var isDisabled = ( this.shownContributors === ( this.contributorsLength - 1 ) );
		
		this.$addButton[ 0 ].disabled = isDisabled;
	};

	AddContributorsComponent.prototype.removeContributor = function( e, elem ){
		
		var $contributor = $( elem ).parent( this.contributorsSelector );

		$contributor.hide();
		$contributor.find( 'input' ).val( '' );
		$contributor.find( 'select' ).each( function(){

			this.selectedIndex = 0;
		} );

		this.shownContributors--;
		this.updateCloseButton();
		this.checkAddButtonState();
	};

	return AddContributorsComponent;

}( jQuery ));