const mongoose = require("mongoose");
const Joi = require("joi");

const { User } = require("./users");

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 55,
    trim: true,
  },
  problem: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 300,
  },
  experiment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 300,
  },
  tag: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 55,
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
  answers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Answer",
  },
});

const Question = mongoose.model("Question", questionSchema);

function validateQuestion(question) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(55).required(),
    problem: Joi.string().min(10).max(300).required(),
    experiment: Joi.string().min(10).max(300).required(),
    tag: Joi.string().min(5).max(55).required(),
  });
  return schema.validate(question);
}

function validateVote(vote) {
  const schema = Joi.object({
    vote: Joi.boolean().required(),
  });
  return schema.validate(vote);
}
module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.validateVote = validateVote;
