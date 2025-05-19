const mongoose = require("mongoose");

const SocialLinksSchema = new mongoose.Schema(
  {
    instagram: { type: String },
    linkedin: { type: String },
    facebook: { type: String },
    other: { type: String },
  },{ _id: false }); //per evitare la generazione automatica di _id

module.exports = SocialLinksSchema;
