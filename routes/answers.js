const express = require("express");
const router = express.Router({ mergeParams: true }); // merge the parameters from the parent router into the child router
const mongoose = require("mongoose");

const auth = require("../middleware/auth");
const { Question, validateVote } = require("../models/question");
const { Answer, validate } = require("../models/answer");
const { User } = require("../models/users");

router.get("/:answer_id", async (req, res) => {
  const answer = await Answer.findById(req.params.answer_id);
  res.send(answer);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const question = await Question.findById(req.params.question_id);
  if (!question)
    return res.status(404).send("Question with the given id does not exist");

  const answer = new Answer({
    userId: req.user._id,
    solution: req.body.solution,
  });
  question.answers.push(answer._id);
  await question.save();
  await answer.save();
  res.send(question);
});

router.put("/edit/:answer_id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const answer = await Answer.findById(req.params.answer_id);
  answer.solution = req.body.solution;
  await answer.save();
  res.send(answer);
});

router.put("/:id/vote", auth, async (req, res) => {
  const { error } = validateVote(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { vote } = req.body;
  const answer = await Answer.findById(req.params.id);
  const isUpvoted = answer.upVotes.get(req.user._id);
  const isDownVoted = answer.downVotes.get(req.user._id);
  const user = await User.findById(answer.userId);

  if (vote) {
    if (isUpvoted) {
      answer.upVotes.delete(req.user._id);
      answer.upVotesCount = answer.upVotesCount - 1;
      user.reputationScore = user.reputationScore - 10;
    } else {
      answer.upVotes.set(req.user._id, true);
      answer.upVotesCount = answer.upVotesCount + 1;
      isDownVoted ? answer.downVotes.delete(req.user._id) : null;
      user.reputationScore = user.reputationScore + 10;
    }
  } else {
    if (isDownVoted) {
      answer.downVotes.delete(req.user._id);
      user.reputationScore = user.reputationScore + 2;
    } else {
      answer.downVotes.set(req.user._id, true);
      isUpvoted ? answer.isUpvoted.delete(req.user._id) : null;
      user.reputationScore = user.reputationScore - 2;
      const downVoteUser = await User.findById(req.user._id);
      downVoteUser.reputationScore = downVoteUser.reputationScore - 1;
      await downVoteUser.save();
    }
  }
  await user.save();
  await answer.save();
  res.send(answer);
});

router.delete("/:answer_id", auth, async (req, res) => {
  const question = await Question.findById(req.params.question_id);
  const index = question.answers.indexOf(
    new mongoose.Types.ObjectId(req.params.answer_id)
  );
  question.answers.splice(index, 1);
  question.save();
  const answer = await Answer.findByIdAndDelete(req.params.answer_id);
  res.send(answer);
});

module.exports = router;
