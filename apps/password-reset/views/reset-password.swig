{% extends '../../../src/views/base.swig' %}

{% set title = app.title %}
{% set heading = app.title %}

{% block content %}
	<p>
		To reset your password enter your email address and you will receive an email with a link to reset your password.
	</p>

	<form method="post" style="max-width: 300px;">
		<p>
			<label for="email">Email address:</label> <input type="email" id="email" name="email" class="form-control" required />
		</p>

		<p>
			<button class="btn btn-primary">Reset Password</button>
		</p>
	</form>
{% endblock %}
