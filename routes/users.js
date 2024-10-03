const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");

const { User, validate } = require("../models/users");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -_id");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) return res.status(400).send("User already registered");

  user = new User({
    firstName,
    lastName,
    email,
    password,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(
      _.pick(user, ["_id", "firstName", "lastName", "email", "reputationScore"])
    );
});

module.exports = router;
