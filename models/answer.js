const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./users");

const answerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  solution: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 300,
  },
  upVotes: {
    type: Map,
    of: Boolean,
    default: {},
  },
  downVotes: {
    type: Map,
    of: Boolean,
    default: {},
  },
  upVotesCount: {
    type: Number,
    required: true,
    default: 0,
  },
  postedOn: {
    type: Date,
    default: Date.now,
  },
});

const Answer = mongoose.model("Answer", answerSchema);

function validateAnswer(solution) {
  const schema = Joi.object({
    solution: Joi.string().min(10).max(300).required(),
  });
  return schema.validate(solution);
}

module.exports.validate = validateAnswer;
module.exports.Answer = Answer;
