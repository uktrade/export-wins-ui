ew.components.AddContributors = (function(){
	
	function AddContributorsComponent( opts ){

		if( !opts ){ throw new Error( 'opts are required to create AddContributorsComponent' ); }
		if( !opts.contributorsSelector ){ throw new Error( 'contributorsSelector is required for AddContributorsComponent' ); }
		if( !opts.nameInputSelector ){ throw new Error( 'nameInputSelector is required for AddContributorsComponent'); }

		var self = this;
		this.$contributors = $( opts.contributorsSelector );
		this.contributorsSelector = opts.contributorsSelector;
		this.nameInputSelector = opts.nameInputSelector;

		this.shownContributors = 0;
		this.contributorsLength = this.$contributors.length;

		this.createAddButton();
		this.hideContributingLines();
		this.showCloseButton();

		this.$contributors.on( 'click', '.close', function( e ){

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
		
		var buttonHtml = '<button type="button" class="close" aria-label="Remove contributor" title="Remove contributor"><span aria-hidden="true">&times;</span></button>';

		$( this.contributorsSelector + ':visible' ).last().prepend( buttonHtml );
	};

	AddContributorsComponent.prototype.removeCloseButton = function(){
		
		$( this.contributorsSelector + ' .close' ).remove();
	};

	AddContributorsComponent.prototype.updateCloseButton = function(){
	
		this.removeCloseButton();
		this.showCloseButton();
	};

	AddContributorsComponent.prototype.createAddButton = function(){
		
		this.$addButton = $( '<button class="btn btn-default">Add another contributor</button>' );
		this.$contributors.parent().append( this.$addButton );
		this.$addButton.on( 'click', $.proxy( this.addContributor, this ) );
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
}());