ew.components.AddContributors = (function(){
	
	function AddContributorsComponent( opts ){

		if( !opts ){ throw new Error( 'opts are required to create AddContributorsComponent' ); }
		if( !opts.$addButton ){ throw new Error( '$addButton is required for AddContributorsComponent' ); }
		if( !opts.$contributors ){ throw new Error( '$contributors is required for AddContributorsComponent' ); }

		this.$contributors = opts.$contributors;
		this.$addButton = opts.$addButton;

		this.shownContributors = 0;
		this.contributorsLength = this.$contributors.length;

		this.$addButton.on( 'click', $.proxy( this.addContributor, this ) );

		this.hideContributingLines();
	}

	AddContributorsComponent.prototype.hideContributingLines = function(){

		this.$contributors.hide();
		$( this.$contributors[ 0 ] ).show();
	};

	AddContributorsComponent.prototype.addContributor = function( e ){

		var $currentContributor;

		e.preventDefault();

		if( this.shownContributors < this.contributorsLength ){

			this.shownContributors++;
			$currentContributor = $( this.$contributors[ this.shownContributors ] );
			$currentContributor.show();
			$currentContributor.find( '.contributing-officer-name input' ).focus();

			if( this.shownContributors === ( this.contributorsLength - 1 ) ){

				this.$addButton[ 0 ].disabled = true;
			}
		}
	};

	return AddContributorsComponent;
}());