const { Schema } = require("mongoose");

const Topic = require("mongoose").model("Topic", {
  meta: Schema.Types.Mixed,
  sum: String,
  access: { type: Number, default: 0 },
  create: { type: Date, default: Date.now },
  base: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  articles: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
});

module.exports = Topic;
