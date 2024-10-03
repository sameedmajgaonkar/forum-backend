const Joi = require("joi");
const postSchema = Joi.object({
  title: Joi.string().min(5).max(55),
  problem: Joi.string().min(10).max(300),
  experiment: Joi.string().min(10).max(300),
  tag: Joi.string().min(5).max(55),
});

const putSchema = postSchema.keys({
  upVote: Joi.number(),
  downVote: Joi.number(),
});

const result = postSchema.validate(
  {
    title: "Change State in React",
    problem:
      "I am unable to change state in react while dealing with arrays and objects",
    experiment:
      "I changed the state using useState() but the ui was not updating in real time",
    tag: "react",
  },
  { presence: "required" }
);
console.log(result.error);
