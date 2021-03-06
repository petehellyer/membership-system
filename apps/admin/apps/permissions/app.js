"use strict";

var __root = '../../../..';
var __src = __root + '/src';
var __js = __src + '/js';
var __config = __root + '/config';

var	express = require( 'express' ),
	app = express(),
	formBodyParser = require( 'body-parser' ).urlencoded( { extended: true } );

var Permissions = require( __js + '/database' ).Permissions,
	Members = require( __js + '/database' ).Members;

var auth = require( __js + '/authentication' );

var messages = require( __src + '/messages.json' );

var config = require( __config + '/config.json' );

var app_config = {};

app.set( 'views', __dirname + '/views' );

app.use( function( req, res, next ) {
	res.locals.app = app_config;
	res.locals.breadcrumb.push( {
		name: app_config.title,
		url: app.parent.mountpath + app.mountpath
	} );
	res.locals.activeApp = app_config.uid;
	next();
} );

app.get( '/', auth.isAdmin, function( req, res ) {
	Permissions.find( function( err, permissions ) {
		res.render( 'permissions', { permissions: permissions } );
	} );
} );

app.get( '/create', auth.isSuperAdmin, function( req, res ) {
	res.locals.breadcrumb.push( {
		name: 'Create'
	} );
	res.render( 'create-permission' );
} );

app.get( '/:slug', auth.isAdmin, function( req, res ) {
	Permissions.findOne( { slug: req.params.slug }, function( err, permission ) {
		if ( permission == undefined ) {
			req.flash( 'warning', messages['permission-404'] );
			res.redirect( app.parent.mountpath + app.mountpath );
			return;
		}

		res.locals.breadcrumb.push( {
			name: permission.name
		} );

		Members.find( { permissions: { $elemMatch: { permission: permission._id } } }, function( err, members ) {
			res.render( 'permission', { permission: permission, members: members } );
		} );
	} );
} );

app.post( '/create', [ auth.isSuperAdmin, formBodyParser ], function( req, res ) {
	var permission = {
		name: req.body.name,
		slug: req.body.slug,
		description: req.body.description,
		superadmin_only: ( req.body.superadmin_only ? true : false ),
		group: {
			id: req.body.group_id,
			name: req.body.group_name
		}
	};

	new Permissions( permission ).save( function( err, permission ) {
		req.flash( 'success', messages['permission-created'] );
		res.redirect( app.parent.mountpath + app.mountpath );
	} );
} );

app.get( '/:slug/edit', auth.isSuperAdmin, function( req, res ) {
	Permissions.findOne( { slug: req.params.slug }, function( err, permission ) {
		if ( permission == undefined ) {
			req.flash( 'warning', messages['permission-404'] );
			res.redirect( app.parent.mountpath + app.mountpath );
			return;
		}

		res.locals.breadcrumb.push( {
			name: permission.name
		} );
		res.render( 'edit-permission', { permission: permission } );
	} );
} );

app.post( '/:slug/edit', [ auth.isSuperAdmin, formBodyParser ], function( req, res ) {
	var permission = {
		name: req.body.name,
		slug: req.body.slug,
		description: req.body.description,
		superadmin_only: req.body.superadmin_only,
		group: {
			id: req.body.group_id,
			name: req.body.group_name
		}
	};

	Permissions.update( { slug: req.params.slug }, permission, function( status ) {
		req.flash( 'success', messages['permission-update'] );
		res.redirect( app.parent.mountpath + app.mountpath );
	} );
} );

module.exports = function( config ) {
	app_config = config;
	return app;
};
