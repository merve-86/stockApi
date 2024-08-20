"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require("../configs/dbConnection");
/* ------------------------------------------------------- *
{
    "username": "admin",
    "password": "aA?123456",
    "email": "admin@site.com",
    "firstName": "admin",
    "lastName": "admin",
    "isActive": true,
    "isStaff": true,
    "isAdmin": true
}
{
    "username": "staff",
    "password": "aA?123456",
    "email": "staff@site.com",
    "firstName": "staff",
    "lastName": "staff",
    "isActive": true,
    "isStaff": true,
    "isAdmin": false
}
{
    "username": "test",
    "password": "aA?123456",
    "email": "test@site.com",
    "firstName": "test",
    "lastName": "test",
    "isActive": true,
    "isStaff": false,
    "isAdmin": false
}
/* ------------------------------------------------------- */
// User Model:

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },

    firstName: {
      type: String,
      trim: true,
      required: true,
    },

    lastName: {
      type: String,
      trim: true,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isStaff: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

/* ------------------------------------------------------- */
// https://mongoosejs.com/docs/middleware.html

const passwordEncrypt = require("../helpers/passwordEncrypt");

UserSchema.pre(["save", "updateOne"], function (next) {
  // console.log('pre-save çalıştı.')
  // console.log(this)

  // Güncellerken: data = this._update || Kaydederken: data = this
  const data = this?._update ?? this;

  // Email Control:
  const isEmailValidated = data.email
    ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)
    : true;

  if (isEmailValidated) {
    // console.log('Email is OK')

    const isPasswordValidated = data.password
      ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
          data.password
        )
      : true;

    if (isPasswordValidated) {
      if (this?._update) {
        // UPDATE:
        this._update.password = passwordEncrypt(data.password);
      } else {
        // CREATE:
        this.password = passwordEncrypt(data.password);
      }

      next();
    } else {
      // throw new Error('Password is not validated.')
      next(new Error("Password is not validated."));
    }
  } else {
    // throw new Error('Email is not validated.')
    next(new Error("Email is not validated."));
  }
});

/* ------------------------------------------------------- */
// Exports:
module.exports = mongoose.model("User", UserSchema);
