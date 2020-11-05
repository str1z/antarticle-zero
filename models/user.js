const { Schema } = require("mongoose");

const User = require("mongoose").model("User", {
  username: { type: String, unique: true },
  password: String,
  meta: Schema.Types.Mixed,
  sum: String,
  level: { type: Number, default: 0 }, // 0 : disabled, 1 : writer, 2 : edit, 3 : manage topics, 4 : manage users, 5 : high user, 6 : super user
  create: { type: Date, default: Date.now },
  access: { type: Number, default: 0 },
  base: { type: Number, default: 0 },
  articles: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
});

module.exports = User;
