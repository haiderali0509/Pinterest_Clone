const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  pfp: {
    type: String, // Can be a URL or filename
    default: "",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post", // Refers to another model called Post
    },
  ],
});

userSchema.plugin(plm, { usernameField: "email" });

module.exports = mongoose.model("user", userSchema);
