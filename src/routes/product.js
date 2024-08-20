"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes/product:

const product = require("../controllers/product");
const permissions = require("../middlewares/permissions");

// URL: /products

router.use(permissions.isStaff);

router.route("/").get(product.list).post(product.create);

router
  .route("/:id")
  .get(product.read)
  .put(product.update)
  .patch(product.update)
  .delete(product.delete);

/* ------------------------------------------------------- */
// Exports:
module.exports = router;
