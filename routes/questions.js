const express = require("express");
const router = express.Router();
const answers = require("./answers");

const auth = require("../middleware/auth");
const { Question, validate, validateVote } = require("../models/question");
const { User } = require("../models/users");

// Get all the questions from the database
router.get("/", async (req, res) => {
  const questions = await Question.find().sort("postedOn");
  res.send(questions);
});

// Get the question with the given id and populate the answers from the 'answers' collections for the given question_id
router.get("/:id", async (req, res) => {
  const qnas = await Question.findById(req.params.id)
    .populate("answers")
    .sort("upVotesCount");
  res.send(qnas);
});

// Post a question
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, problem, experiment, tag } = req.body;
  const question = new Question({
    userId: req.user._id,
    title: title,
    problem: problem,
    experiment: experiment,
    tag: tag,
  });
  await question.save();
  res.send(question);
});

// Update a question
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, problem, experiment, tag } = req.body;
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    {
      title,
      problem,
      experiment,
      tag,
    },
    { new: true }
  );
  await question.save();
  res.send(question);
});

router.put("/:id/vote", auth, async (req, res) => {
  const { error } = validateVote(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { vote } = req.body;
  const question = await Question.findById(req.params.id);
  const isUpvoted = question.upVotes.get(req.user._id);
  const isDownVoted = question.downVotes.get(req.user._id);
  const user = await User.findById(question.userId);

  if (vote) {
    if (isUpvoted) {
      question.upVotes.delete(req.user._id);
      question.upVotesCount = question.upVotesCount - 1;
      user.reputationScore = user.reputationScore - 10;
    } else {
      question.upVotes.set(req.user._id, true);
      question.upVotesCount = question.upVotesCount + 1;
      isDownVoted ? question.downVotes.delete(req.user._id) : null;
      user.reputationScore = user.reputationScore + 10;
    }
  } else {
    if (isDownVoted) {
      question.downVotes.delete(req.user._id);
      user.reputationScore = user.reputationScore + 2;
    } else {
      question.downVotes.set(req.user._id, true);
      isUpvoted ? question.isUpvoted.delete(req.user._id) : null;
      user.reputationScore = user.reputationScore - 2;
      const downVoteUser = await User.findById(req.user._id);
      downVoteUser.reputationScore = downVoteUser.reputationScore - 1;
      await downVoteUser.save();
    }
  }
  await user.save();
  await question.save();
  res.send(question);
});
// Delete a question
router.delete("/:id", auth, async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  res.send(question);
});

router.use("/:question_id/answers", answers);
module.exports = router;
