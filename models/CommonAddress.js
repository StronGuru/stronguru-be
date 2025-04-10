const mongoose = require("mongoose");

const CommonAddressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    cap: { type: String },
    province: { type: String },
    country: { type: String },
  },{ _id: false }); //per evitare la generazione automatica di _id

module.exports = CommonAddressSchema;
