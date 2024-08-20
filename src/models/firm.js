"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require("../configs/dbConnection");
/* ------------------------------------------------------- *
{
    "name": "Firm -1"
}
/* ------------------------------------------------------- */
// Firm Model:

const FirmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "firms",
    timestamps: true,
  }
);

/* ------------------------------------------------------- */
module.exports = mongoose.model("Firm", FirmSchema);
