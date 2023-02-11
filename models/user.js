const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  // Validate user info using mongoose
  name: {
    type: String,
    required: [true, "Please enter a name!"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "No email provided"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email!",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "No password provided"],
    minlength: 6,
  },
});

// Using the old function syntax is required, beacuse 'this' is scoped to the document.
userSchema.pre("save", async function () {
  // Generate random bytes * 10
  // More rounds means stronger salt, but also more processing power
  const salt = await bcrypt.genSalt(10);
  // 'this' points to the current docuemnt
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.createJWT = function () {
  return jwt.sign(
    { userID: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

userSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
