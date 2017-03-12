
ew.components.WinValueLabels = (function( $ ){

	function errorMessage( field ){
		return ( field + 'is required for WinValueLabelsComponent' );
	}

	function WinValueLabelsComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.valueIds ){ throw new Error( errorMessage( 'opts.valueIds' ) ); }

		this.$labels = this.getLabels( opts.valueIds );
	}

	WinValueLabelsComponent.prototype.getLabels = function( valueIds ){

		var i = 0;
		var l = valueIds.length;
		var $labels = [];

		for( ; i < l; i++ ){

			$labels.push( $( '#' + valueIds[ i ] + '-label' ) );
		}

		return $labels;
	};

	WinValueLabelsComponent.prototype.updateLabels = function( year ){

		var i = 0;
		var l = this.$labels.length;
		var text;

		year = Number( year );

		for( ; i < l; i++ ){

			text = ( year + '/' + ( year + 1 ).toString().substr( -2 ) );
			this.$labels[ i ].html( text );
			year++;
		}
	};

	return WinValueLabelsComponent;

}( jQuery ));
