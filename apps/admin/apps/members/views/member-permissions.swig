{% extends '../../../../../src/views/base.swig' %}

{% set title = 'Permissions' %}
{% set activeApp = 'admin' %}

{% block content %}
	<div class="row">
		<div class="col-md-4">
			<div class="page-header">
				<h3>Grant Permission</h3>
			</div>
			{% set action = 'Grant' %}
			{% include 'partials/member-permission-form.swig' %}
		</div>
		<div class="col-md-8">
			<div class="page-header">
				<h3>Permissions</h3>
			</div>
			<div class="list-group">
				{% if member.permissions.length > 0 || superadmin %}
					{% if superadmin %}
						<span class="list-group-item">
							<h4 class="list-group-item-heading">Super Admin</h4>
								<p class="list-group-item-text">Has super admin permission granted in the config.json file.</p>
								<p style="position: absolute; top: 1em; right: 1em;">
									<small>Requires edit to config.json</small>
								</p>
						</span>
					{% endif %}
					{% for permission in member.permissions %}
						<span class="list-group-item">
							<h4 class="list-group-item-heading">{{ permission.permission.name }}</h4>
							<p class="list-group-item-text">{{ permission.permission.description }}</p>
							<p class="list-group-item-text"><strong>Added:</strong> {{ permission.date_added | date('d/m/Y') }}</p>
							{% if permission.date_expires %}
								<p class="list-group-item-text"><strong>Expires:</strong> {{ permission.date_expires | date('d/m/Y') }}
								</p>
							{% endif %}
							<p style="position: absolute; top: 1em; right: 1em;">
								{% if ! permission.permission.superadmin_only || access == 'superadmin' %}
									<a href="/admin/members/{{ member.uuid }}/permissions/{{ permission._id | raw }}/modify" style="margin-right: 1em;"><span class="glyphicon glyphicon-pencil"></span></a>
									<a href="/admin/members/{{ member.uuid }}/permissions/{{ permission._id | raw  }}/revoke"><span class="glyphicon glyphicon-remove"></span></a>
								{% else %}
									<small>Restricted to Super Admins</small>
								{% endif %}
							</p>
						</span>
					{% endfor %}
				{% else %}
					<p>This member has no permissions.</p>
				{% endif %}
			</ul>
		</div>
	</div>
{% endblock %}
