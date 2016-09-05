var ew = {
	components: {},
	pages: {},
	tools: {},
	controllers: {},
	application: {
		components: {},
		controllers: {}
	}
};
ew.CustomEvent = (function(){

	function CustomEvent(){

		this.subscribers = [];
	}

	var proto = CustomEvent.prototype;

	proto.subscribe = function( fn ){

		this.subscribers.push( fn );
	};

	proto.unSubscribe = function( fn ){

		var i = 0;
		var l = this.subscribers.length;

		for( ; i < l; i++ ) {

			if( this.subscribers[ i ] === fn ){

				this.subscribers.pop( i, 1 );

				break;
			}
		}
	};

	proto.publish = function() {

		var i = this.subscribers.length-1;

		for( ; i >= 0; i-- ){

			try {

				this.subscribers[ i ].apply( this, arguments );

			} catch( e ){}
		}
	};

	return CustomEvent;
}());
ew.tools.toLocaleString = function localeString( number, separator, grouping ){

    separator = ( separator || ',' );
    grouping = ( grouping === 0 ? grouping : 3);

    var numberParts = ( '' + number ).split( '.' );
    var i = numberParts[0].length;
    var s = '';
    var j;

    while( i > grouping ){
        j = i - grouping;
        s = separator + numberParts[ 0 ].slice( j, i ) + s;
        i = j;
    }

    s = numberParts[ 0 ].slice( 0, i ) + s;
    numberParts[ 0 ] = s;
    
    return numberParts.join( '.' );
};
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

	AddContributorsComponent.prototype.resetAll = function(){

		var self = this;
		
		this.$contributors.each( function(){

			self.resetContributor( $( this ) );
		} );
	};

	AddContributorsComponent.prototype.resetContributor = function( $contributor ){

		$contributor.find( 'input' ).val( '' );
		$contributor.find( 'select' ).each( function(){

			this.selectedIndex = 0;
		} );
	};

	AddContributorsComponent.prototype.removeContributor = function( e, elem ){
		
		var $contributor = $( elem ).parent( this.contributorsSelector );

		$contributor.hide();

		this.resetContributor( $contributor );
		this.shownContributors--;
		this.updateCloseButton();
		this.checkAddButtonState();
	};

	return AddContributorsComponent;

}( jQuery ));
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

		this.ensureSeqential();
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

	AddSelectComponent.prototype.ensureSeqential = function(){

		var total = this.count - 1;
		var $selects = this.$selects;
		
		$selects.each( function( i ){

			if( i < total ){

				var next;
				var nextIndex = ( i + 1 );

				next = $selects[ nextIndex ];

				//find the next select with a value
				while( nextIndex <= total && next && next.selectedIndex === 0 ){

					next = $selects[ nextIndex ];
					nextIndex++;
				}

				if( this.selectedIndex === 0 && next.selectedIndex > 0 ){

					this.selectedIndex = next.selectedIndex;
					next.selectedIndex = 0;
				}
			}
		} );
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
/*
ew.components.ToggleContentCheckbox = (function( $ ){

	function errorMessage( field ){
		return ( field + ' is required for ToggleContentCheckboxComponent' );
	}

	function ToggleContentCheckboxComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.checkboxId ){ throw new Error( errorMessage( 'opts.checkboxId' ) ); }
		if( !opts.contentId ){ throw new Error( errorMessage( 'opts.contentId' ) ); }

		this.$checkbox = $( opts.checkboxId );
		this.$content = $( opts.contentId );

		this.$checkbox.on( 'change', $.proxy( this.checkState, this ) );
		this.checkState();
	}

	ToggleContentCheckboxComponent.prototype.checkState = function(){
		
		if( this.$checkbox[ 0 ].checked ){

			this.$content.show();

		} else {

			this.$content.hide();
		}
	};

	return ToggleContentCheckboxComponent;
	
}( jQuery ));
*/
ew.components.ToggleContributors = (function( $, CustomEvent ){

	function errorMessage( field ){
		return ( field + ' is required for ToggleContributorsComponent' );
	}
	
	function ToggleContributorsComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.$contributingTeamDetails ){ throw new Error( errorMessage( 'opts.$contributingTeamDetails' ) ); }
		if( !opts.$someContributors ){ throw new Error( errorMessage( 'opts.$someContributors' ) ); }
		if( !opts.noContributorsSelector ){ throw new Error( errorMessage( 'opts.noContributorsSelector' ) ); }

		this.$contributingTeamDetails = opts.$contributingTeamDetails;
		this.$someContributors = opts.$someContributors;
		this.noContributorsSelector = opts.noContributorsSelector;

		this.events = {
			showDetails: new CustomEvent(),
			hideDetails: new CustomEvent()
		};

		this.checkContributingDetails();
		this.createListeners();
	}

	ToggleContributorsComponent.prototype.toggleContributingDetails = function( e ){

		if( this.$someContributors[ 0 ].checked ){

			this.$contributingTeamDetails.show();
			this.events.showDetails.publish();

		} else {

			this.$contributingTeamDetails.hide();
			this.events.hideDetails.publish();
		}
	};

	ToggleContributorsComponent.prototype.createListeners = function(){
		
		var $noContributors = $( this.noContributorsSelector );
		var proxiedToggle = $.proxy( this.toggleContributingDetails, this );

		this.$someContributors.on( 'click', proxiedToggle );
		$noContributors.on( 'click', proxiedToggle );
	};

	ToggleContributorsComponent.prototype.checkContributingDetails = function(){

		if( !this.$someContributors[ 0 ].checked ){

			this.$contributingTeamDetails.hide();
		}
	};

	return ToggleContributorsComponent;

}( jQuery, ew.CustomEvent ));	
ew.components.ToggleExportValue = (function( $, CustomEvent ){
	
	function errorMessage( label ){
		return ( label + ' is required for ToggleExportValueComponent' );
	}

	function ToggleExportValueComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.fieldName ){ throw new Error( errorMessage( 'opts.fieldName' ) ); }
		if( !opts.exportValue ){ throw new Error( errorMessage( 'opts.exportValue' ) ); }
		if( !opts.nonExportValue ){ throw new Error( errorMessage( 'opts.nonExportValue' ) ); }
		if( !opts.bothValue ){ throw new Error( errorMessage( 'opts.bothValue' ) ); }
		if( !opts.exportId ){ throw new Error( errorMessage( 'opts.exportId' ) ); }
		if( !opts.nonExportId ){ throw new Error( errorMessage( 'opts.nonExportId' ) ); }

		this.fieldName = opts.fieldName;
		this.exportValue = opts.exportValue;
		this.nonExportValue = opts.nonExportValue;
		this.bothValue = opts.bothValue;

		this.events = {
			hideExport: new CustomEvent(),
			hideNonExport: new CustomEvent()
		};

		this.$exportContent = $( '#' + opts.exportId );
		this.$nonExportContent = $( '#' + opts.nonExportId );
		this.$field = $( 'input[ name=' + this.fieldName + ']' );

		this.$field.on( 'change', $.proxy( this.showContent, this ) );

		this.showContent();
	}

	ToggleExportValueComponent.prototype.showContent = function(){
		
		var currentVal = $( 'input[ name=' + this.fieldName + ']:checked' ).val();

		switch( currentVal ){
			case this.exportValue:
				this.$exportContent.show();
				this.$nonExportContent.hide();
				this.events.hideNonExport.publish();
			break;

			case this.nonExportValue:
				this.$exportContent.hide();
				this.$nonExportContent.show();
				this.events.hideExport.publish();
			break;

			case this.bothValue:
				this.$exportContent.show();
				this.$nonExportContent.show();
			break;

			default:
				this.$exportContent.hide();
				this.$nonExportContent.hide();
				this.events.hideExport.publish();
				this.events.hideNonExport.publish();
		}
	};

	return ToggleExportValueComponent;

}( jQuery, ew.CustomEvent ));
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

		//For some reason the below doesn't work
		//this.$secondSelect.empty().append( '<option>Please choose a team type first</option>' );


		//so having to pull out the original select value and change the text in it
		var $options = this.$options.clone();
		var $newOptions = $options.filter( function(){

			return this.value === '';
		} );

		$newOptions.text( 'Please choose a team type first' );

		this.$secondSelect.empty().append( $newOptions );
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

ew.controllers.Contributors = (function(){

	function errorMessage( param ){

		return ( param + ' is a required parameter for ContributorsController' );
	}
	
	function ContributorsController( toggleContributors, addContributors ){

		if( !toggleContributors ){ throw new Error( errorMessage( 'toggleContributors' ) ); }
		if( !addContributors ){ throw new Error( errorMessage( 'addContributors' ) ); }

		//when the details are shown tell addContributors to focus on the first element
		//and tell it to update the remove button position
		toggleContributors.events.showDetails.subscribe( function(){

			addContributors.focusOnFirstNameInput();
			addContributors.updateCloseButton();
		} );

		toggleContributors.events.hideDetails.subscribe( function(){

			addContributors.resetAll();
		} );
	}

	return ContributorsController;
	
}());
ew.controllers.ExportValue = (function(){
	
	function errorMessage( param ){

		return ( param  + ' is required for ExportValueController' );
	}

	function ExportValueController( toggleExport, calculateExport, calculateNonExport ){

		if( !toggleExport ){ throw new Error( errorMessage( 'toggleExport' ) ); }
		if( !calculateExport ){ throw new Error( errorMessage( 'calculateExport' ) ); }
		if( !calculateNonExport ){ throw new Error( errorMessage( 'calculateNonExport' ) ); }

		toggleExport.events.hideExport.subscribe( function(){

			calculateExport.resetValues();
		} );

		toggleExport.events.hideNonExport.subscribe( function(){

			calculateNonExport.resetValues();
		} );
	}

	return ExportValueController;

}());
ew.pages.confirmationForm = function confirmationFormPage( agreeWithWinName ){
	
	var $infoBox = $( '#confirm-false-info' );
	var $agree = $( 'form input[name='+ agreeWithWinName + ']' );
	var $confirmFalseComments = $( '#confirm-false-details' );

	//hide the comments box on load
	if( !$agree[ 1 ].checked ) {

		$infoBox.hide();
	}

	//Toggle the comments box when the value of the radio changes
	$agree.on( 'change', function( e ){

		if( $agree[ 0 ].checked ){

			$infoBox.hide();

		} else {

			$infoBox.show();
		}
	} );
};
ew.pages.officerForm = (function(){

/*
		window.addEventListener( 'beforeunload', function( e ){

			//console.log( formHasChanges( 'win-form' ) );

			if( formHasChanges( 'win-form' ) ){
				console.log( 'changes made' );
				e.returnValue = 'You have unsaved edits, are you sure you want to leave?';
			} else {
				console.log( 'no changes' );
			}

		} );
*/

	function createContributingTeams(){

		var teams = [];

		$( '.contributing-officer-team-group' ).each( function(){

			var $group = $( this );

			teams.push( new ew.components.UpdateSelect({
				firstSelect: $group.find( '.contributing-team-type select' )[ 0 ],
				secondSelect: $group.find( '.contributing-team select' )[ 0 ]
			}) );
		} );

		return teams;
	}

	function createNonCompleteComponents( opts, appComponents, appControllers ){

		appComponents.descriptionWordCounter = new ew.components.WordCounter({
			id: opts.descriptionId,
			limit: 50
		});

		appComponents.exportValues = new ew.components.ToggleExportValue({
			fieldName: opts.exportType.name,
			exportValue: opts.exportType.exportValue,
			nonExportValue: opts.exportType.nonExportValue,
			bothValue: opts.exportType.bothValue,
			exportId: opts.exportContentId,
			nonExportId: opts.nonExportContentId
		});

		appComponents.calculateExportValue = new ew.components.CalculateExportValue({
			values: opts.exportValues,
			total: opts.exportTotal
		});

		appComponents.calculateNonExportValue = new ew.components.CalculateExportValue({
			values: opts.nonExportValues,
			total: opts.nonExportTotal
		});

		appControllers.exportValue = new ew.controllers.ExportValue(
			appComponents.exportValues,
			appComponents.calculateExportValue,
			appComponents.calculateNonExportValue
		);
	}

	function createComponents( opts, appComponents, appControllers ){

		appComponents.leadOfficerTeam = new ew.components.UpdateSelect({
			firstSelect: '#id_team_type',
			secondSelect: '#id_hq_team'
		});

		appComponents.contributingOfficerTeams = createContributingTeams();

		appComponents.toggleContributors = new ew.components.ToggleContributors({
			$contributingTeamDetails: $( '#contributing-teams-details' ),
			$someContributors: $( '#some-contributors' ),
			noContributorsSelector: '#no-contributors'
		});

		appComponents.addContributors = new ew.components.AddContributors({
			contributorsSelector: '.contributing-officer-group',
			nameInputSelector: '.contributing-officer-name input'
		});

		//appComponents.toggleHvoProgram = new ew.components.ToggleContentCheckbox( opts.hvoProgram );

		appControllers.contributors = new ew.controllers.Contributors( appComponents.toggleContributors, appComponents.addContributors );

		appComponents.supportSelects = new ew.components.AddSelect( opts.supportGroup );
		appComponents.programmeSelects = new ew.components.AddSelect( opts.programmeGroup );
	}

	function errorMessage( field ){
		return ( field + ' is required for officerFormPage' );
	}

	return function officerFormPage( opts ){

		//alert( 'officer page start' );

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }

		if( typeof opts.isComplete === 'undefined' ){ throw new Error( errorMessage( 'opts.isComplete' ) ); }
		
		if( !opts.supportGroup ){ throw new Error( errorMessage( 'opts.supportGroup' ) ); }
		if( !opts.programmeGroup ){ throw new Error( errorMessage( 'opts.programmeGroup' ) ); }

		if( !opts.isComplete ){

			if( !opts.descriptionId ){ throw new Error( errorMessage( 'opts.descriptionId' ) ); }

			if( !opts.exportType ){ throw new Error( errorMessage( 'opts.exportType' ) ); }
			if( !opts.exportType.name ){ throw new Error( errorMessage( 'opts.exportType.name' ) ); }
			if( !opts.exportType.exportValue ){ throw new Error( errorMessage( 'opts.exportType.exportValue' ) ); }
			if( !opts.exportType.nonExportValue ){ throw new Error( errorMessage( 'opts.exportType.nonExportValue' ) ); }
			if( !opts.exportType.bothValue ){ throw new Error( errorMessage( 'opts.exportType.bothValue' ) ); }

			if( !opts.exportContentId ){ throw new Error( errorMessage( 'opts.exportContentId' ) ); }
			if( !opts.nonExportContentId ){ throw new Error( errorMessage( 'opts.nonExportContentId' ) ); }

			if( !opts.exportValues || !opts.exportValues.length ){ throw new Error( errorMessage( 'opts.exportValue' ) ); }
			if( !opts.exportTotal ){ throw new Error( errorMessage( 'opts.exportTotal' ) ); }

			if( !opts.nonExportValues || !opts.nonExportValues.length ){ throw new Error( errorMessage( 'opts.nonExportValues' ) ); }
			if( !opts.nonExportTotal ){ throw new Error( errorMessage( 'opts.nonExportTotal' ) ); }
		}

		//alert( 'officer page ok' );
		
		var app = ew.application;
		var appComponents = app.components;
		var appControllers = app.controllers;

		createComponents( opts, appComponents, appControllers );

		if( !opts.isComplete ){

			createNonCompleteComponents( opts, appComponents, appControllers );
		}
	};
}());
//# sourceMappingURL=main.js.map