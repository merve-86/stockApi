"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// User Controllers:

const User = require("../models/user");
const Token = require("../models/token");

const passwordEncrypt = require("../helpers/passwordEncrypt");

const jwt = require("jsonwebtoken");

/* ------------------------------------------------------- */

// data = req.body
const checkUserEmailAndPassword = function (data) {
  return data;

  // Email Control:
  const isEmailValidated = data.email
    ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)
    : true;

  if (isEmailValidated) {
    const isPasswordValidated = data.password
      ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
          data.password
        )
      : true;

    if (isPasswordValidated) {
      data.password = passwordEncrypt(data.password);

      return data;
    } else {
      throw new Error("Password is not validated.");
    }
  } else {
    throw new Error("Email is not validated.");
  }
};

/* ------------------------------------------------------- */

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=asc&sort[field2]=desc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    const data = await res.getModelList(User);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User),
      data,
    });
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create User"
            #swagger.description = `
                Password Format Type: It must has min.1 lowercase, min.1 uppercase, min.1 number and min.1 specialChars.
            `
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "firstName": "test",
                    "lastName": "test",
                }
            }
        */

    // const data = await User.create(req.body)
    const data = await User.create(checkUserEmailAndPassword(req.body));

    /* AUTO LOGIN */
    // SimpleToken:
    const tokenData = await Token.create({
      userId: data._id,
      token: passwordEncrypt(data._id + Date.now()),
    });
    // JWT:
    const accessToken = jwt.sign(data.toJSON(), process.env.ACCESS_KEY, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(
      { _id: data._id, password: data.password },
      process.env.REFRESH_KEY,
      { expiresIn: "3d" }
    );
    /* AUTO LOGIN */

    res.status(201).send({
      error: false,
      token: tokenData.token,
      bearer: { accessToken, refreshToken },
      data,
    });
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get Single User"
        */

    // Admin olmayan başkasınıın kaydına erişemez:
    req.params.id = req.user.isAdmin ? req.params.id : req.user._id;

    const data = await User.findOne({ _id: req.params.id });

    res.status(200).send({
      error: false,
      data,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Update User"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "firstName": "test",
                    "lastName": "test",
                }
            }
        */

    // Admin olmayan başkasınıın kaydına erişemez:
    req.params.id = req.user.isAdmin ? req.params.id : req.user._id;

    // const data = await User.updateOne({ _id: req.params.id }, req.body, { runValidators: true })
    const data = await User.updateOne(
      { _id: req.params.id },
      checkUserEmailAndPassword(req.body),
      { runValidators: true }
    );

    res.status(202).send({
      error: false,
      data,
      new: await User.findOne({ _id: req.params.id }),
    });
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Delete User"
        */

    const data = await User.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
};
