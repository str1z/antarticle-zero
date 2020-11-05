const { Schema } = require("mongoose");

const Article = require("mongoose").model("Article", {
  author: { type: Schema.Types.ObjectId, ref: "User" },
  topic: { type: Schema.Types.ObjectId, ref: "Topic" },
  sum: String,
  score: Number,
  update: Date,
  meta: Schema.Types.Mixed,
  data: Schema.Types.Mixed,
  create: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
  visibility: { type: Number, default: 3 }, // 0: link, 1: author, 2: topic, 3: public
});

module.exports = Article;
