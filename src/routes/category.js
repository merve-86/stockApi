"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes/category:

const category = require("../controllers/category");
const permissions = require("../middlewares/permissions");

// URL: /categorys

router.use(permissions.isAdmin);

router.route("/").get(category.list).post(category.create);

router
  .route("/:id")
  .get(category.read)
  .put(category.update)
  .patch(category.update)
  .delete(category.delete);

/* ------------------------------------------------------- */
// Exports:
module.exports = router;
