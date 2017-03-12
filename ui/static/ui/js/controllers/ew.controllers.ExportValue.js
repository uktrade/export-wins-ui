ew.controllers.ExportValue = (function(){
	
	function errorMessage( param ){

		return ( param  + ' is required for ExportValueController' );
	}

	function ExportValueController( fields, dates ){

		if( !fields.exportValue ){ throw new Error( errorMessage( 'fields.exportValue' ) ); }
		if( !fields.nonExportValue ){ throw new Error( errorMessage( 'fields.nonExportValue' ) ); }
		if( !fields.odiValue ){ throw new Error( errorMessage( 'fields.odiValue' ) ); }

		if( !dates.winDate ){ throw new Error( errorMessage( 'dates.winDate' ) ); }
		if( !dates.labels ){ throw new Error( errorMessage( 'dates.labels' ) ); }

		this.setupFields( fields );
		this.setupDates( dates );
	}

	ExportValueController.prototype.setupFields = function( fields ){

		fields.exportValue.toggler.events.hide.subscribe( function(){

			fields.exportValue.calculator.resetValues();
		} );

		fields.nonExportValue.toggler.events.hide.subscribe( function(){

			fields.nonExportValue.calculator.resetValues();
		} );

		fields.odiValue.toggler.events.hide.subscribe( function(){

			fields.odiValue.calculator.resetValues();
		} );
	};

	ExportValueController.prototype.setupDates = function( dates ){

		var labels = dates.labels;
		var l = labels.length;

		dates.winDate.events.yearChange.subscribe( function( newYear ){

			var i = 0;

			for( ; i < l; i++ ){
				labels[ i ].updateLabels( newYear );
			}
		} );
	};

	return ExportValueController;
}());