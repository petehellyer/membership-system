{% extends '../../../../../src/views/base.swig' %}

{% set title = 'Members' %}
{% set heading = 'Members' %}
{% set activeApp = 'admin' %}

{% block scripts %}
	{% parent %}
	<script type="text/javascript">
		jQuery(document).ready(function($) {
			$("tr[data-href]").click(function() {
				window.document.location = $(this).data("href");
			});
		});
		jQuery( document ).ready( function () {
			jQuery.extend( jQuery.expr[":"], {
				"containsIN": function(elem, i, match, array ) {
				return ( elem.textContent || elem.innerText || "" ).toLowerCase().indexOf( ( match[3] || "" ).toLowerCase() ) >= 0;
				}
			} );

			jQuery( "#filter" ).on( "input", function () {
				// split the current value of searchInput
				var data = this.value.split( " " );
				
				// create a jquery object of the rows
				var jo = $( "tbody" ).find( "tr" );
				
				if ( this.value == "" ) {
					jo.show();
					return;
				}

				// hide all the rows
				jo.hide();

				// Recusively filter the jquery object to get results.
				jo.filter( function ( i, v ) {
					var $t = jQuery( this );
					for ( var d = 0; d < data.length; ++d ) {
						if ( $t.is( ":containsIN('" + data[d] + "')" ) ) {
							return true;
						}
					}
					return false;
				}).show();
			});
		});
	</script>
{% endblock %}

{% block content %}
	{% if access == 'superadmin' %}
		<p><a href="/admin/members/create" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span> Create Member</a></p>

		<hr />
	{% endif %}

	<input id="filter" placeholder="Filter" class="form-control" style="max-width: 200px" />

	<hr />

	{% include 'partials/member-table.swig' %}
{% endblock %}