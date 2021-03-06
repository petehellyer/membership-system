"use strict";

var __root = '../..';
var __src = __root + '/src';
var __js = __src + '/js';
var __config = __root + '/config';

var	express = require( 'express' ),
	app = express(),
	formBodyParser = require( 'body-parser' ).urlencoded( { extended: true } );

var swig = require( 'swig' );
var nodemailer = require( 'nodemailer' );

var	Members = require( __js + '/database' ).Members;

var auth = require( __js + '/authentication' );

var messages = require( __src + '/messages.json' );

var config = require( __config + '/config.json' );

var app_config = {};

app.set( 'views', __dirname + '/views' );

app.use( function( req, res, next ) {
	res.locals.app = app_config;
	res.locals.activeApp = app_config.uid;
	next();
} );

app.get( '/' , function( req, res ) {
	if ( req.user ) {
		req.flash( 'warning', messages['already-logged-in'] );
		res.redirect( '/profile' );
	} else {
		res.render( 'join', { user: req.session.join } );
		delete req.session.join;
	}
} );

app.post( '/', formBodyParser, function( req, res ) {
	if ( req.user ) {
		req.flash( 'warning', messages['already-logged-in'] );
		res.redirect( '/profile' );
	} else {
		var user = {
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			address: req.body.address,
		};

		if ( req.body.password != req.body.verify ) {
			req.flash( 'danger', messages['password-err-mismatch'] );
			req.session.join = user;
			res.redirect( app.mountpath );
			return;
		}

		var passwordRequirements = auth.passwordRequirements( req.body.password );
		if ( passwordRequirements != true ) {
			req.flash( 'danger', passwordRequirements );
			req.session.join = user;
			res.redirect( app.mountpath );
			return;
		}

		// Generate email code salt
		auth.generateActivationCode( function( code ) {
			user.activation_code = code;
			auth.generatePassword( req.body.password, function( password ) {
				user.password = password;

				// Store new member
				new Members( user ).save( function( status ) {
					if ( status != null && status.errors != undefined ) {
						var keys = Object.keys( status.errors );
						for ( var k in keys ) {
							var key = keys[k];
							req.flash( 'danger', status.errors[key].message );
						}
						req.session.join = user;
						res.redirect( app.mountpath );
					} else {
						var message = {};
						
						message.text = swig.renderFile( __dirname + '/email-templates/join.swig', {
							firstname: req.body.firstname,
							organisation: config.globals.organisation,
							activation_url: config.audience + '/activate/' + user.activation_code
						} );

						var transporter = nodemailer.createTransport( config.smtp.url );

						message.from = config.smtp.from;
						message.to = req.body.email;
						message.subject = 'Activation Email – ' + config.globals.organisation;
						
						req.flash( 'success', messages['account-created'] );
						res.redirect( '/' );
						
						transporter.sendMail( message, function( err, info ) {} );
					}
				} );
			} );
		} );
	}
} );

module.exports = function( config ) {
	app_config = config;
	return app;
};