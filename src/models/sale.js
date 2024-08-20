"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require("../configs/dbConnection");
/* ------------------------------------------------------- */
// Sale Model:

const SaleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      set: function () {
        return this.price * this.quantity;
      }, // Data gönderilmediğinde çalışmaz.
      default: function () {
        return this.price * this.quantity;
      }, // Sadece Create'de çalışır.
      transform: function () {
        return this.price * this.quantity;
      }, // Update yaparken de hesaplasın.
    },
  },
  {
    collection: "sales",
    timestamps: true,
  }
);

/* ------------------------------------------------------- */
module.exports = mongoose.model("Sale", SaleSchema);
