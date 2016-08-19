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

		return function officeFormPage(){

			// Auto filter the hq-team lists
			// Officer
			$("#id_team_type").on("change", function(){
				var type = $(this).val();
				$("#id_hq_team option").addClass("hidden");
				$("#id_hq_team option[value^=" + type + "]").removeClass("hidden");
				$("#id_hq_team").val($("#id_hq_team option[value^=" + type + "]").first().val());
			});

			// Advisor(s)
			$("#advisors .advistor-team-type select").on("change", function(){
				var $this = $(this);
				var type = $this.val();
				var i = $this.attr("id").replace("id_advisor_", "").replace("_team_type", "");
				$("#id_advisor_" + i + "_hq_team option").addClass("hidden");
				$("#id_advisor_" + i + "_hq_team option[value^=" + type + "]").removeClass("hidden");
				$("#id_advisor_" + i + "_hq_team").val($("#id_advisor_" + i + "_hq_team option[value^=" + type + "]").first().val());
			});
		};
}());