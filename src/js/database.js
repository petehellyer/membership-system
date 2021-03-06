"use strict";

var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId,
	crypto = require( 'crypto' );

exports.connect = function( url ) {
	mongoose.connect( url );
	var db = mongoose.connection;
	db.on( 'connected', console.error.bind( console, 'Connected to Mongo database.' ) );
	db.on( 'error', console.error.bind( console, 'Error connecting to Mongo database.' ) );
}

var permissionsSchema = mongoose.Schema( {
	_id: {
		type: ObjectId,
		default: function() { return new mongoose.Types.ObjectId() },
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		unique: true,
		required: true
	},
	description: String,
	superadmin_only: Boolean,
	group: {
		id: String,
		name: String
	}
} );

var memberSchema = mongoose.Schema( {
	_id: {
		type: ObjectId,
		default: function() { return new mongoose.Types.ObjectId() },
		required: true,
		unique: true
	},
	uuid: {
		type: String,
		unique: true,
		default: function () { // pseudo uuid4
			function s4() {
				return Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 );
			};
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: function ( v ) {
				return /[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,}/.test( v );
			},
			message: '{VALUE} is not a valid email address'
		}
	},
	password: {
		hash: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		},
		reset_code: {
			type: String,
		}
	},
	activated: {
		type: Boolean,
		default: false
	},
	activation_code: {
		type: String,
	},
	firstname: {
		type: String,
		required: true
	},
	lastname: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	tag: {
		id: {
			type: String,
			validate: {
				validator: function ( v ) {
					if ( v == '' ) return true;
					return /[A-z0-9]{8}/.test( v );
				},
				message: '{VALUE} is not a valid tag ID'
			}
		},
		hashed: {
			type: String,
			required: false
		}
	},
	joined: {
		type: Date,
		default: Date.now,
		required: true
	},
	emergency_contact: {
		firstname: {
			type: String
		},
		lastname: {
			type: String
		},
		telephone: {
			type: String
		}
	},
	discourse: {
		id: String,
		email: String,
		activated: {
			type: Boolean,
			default: false
		},
		activation_code: String,

	},
	gocardless: {
		redirect_flow_id: {
			type: String
		},
		mandate_id: {
			type: String
		},
		subscription_id: {
			type: String
		},
		session_token: {
			type: String
		},
		minimum: {
			type: Number
		},
		transactions: [ {
			date: {
				type: Date
			},
			description: {
				type: String
			},
			payment_id: {
				type: String
			},
			subscription_id: {
				type: String
			},
			amount: {
				type: Number
			},
			status: {
				type: String
			}
		} ]
	},
	permissions: [ {
		permission: {
			type: ObjectId,
			ref: 'Permissions',
			required: true
		},
		date_added: {
			type: Date,
			default: Date.now,
			required: true
		},
		date_updated: {
			type: Date,
			default: Date.now,
			required: true
		},
		date_expires: {
			type: Date
		}
	} ]
} );

memberSchema.virtual( 'fullname' ).get( function() {
	return this.firstname + ' ' + this.lastname;
} );

memberSchema.virtual( 'gravatar' ).get( function() {
	var md5 = crypto.createHash( 'md5' ).update( this.email ).digest( 'hex' );
	return '//www.gravatar.com/avatar/' + md5;
} );

exports.permissionsSchema = permissionsSchema;
exports.memberSchema = memberSchema;

exports.Permissions = mongoose.model( 'Permissions', exports.permissionsSchema );
exports.Members = mongoose.model( 'Members', exports.memberSchema );
