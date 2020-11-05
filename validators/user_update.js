module.exports = {
  type: "object",
  properties: {
    id: { type: "string", required: true },
    username: { type: "string" },
    password: { type: "string" },
    permission: { type: "integer" }, // 0 : disabled, 1 : writer, 2 : edit, 3 : manage topics, 4 : manage users, 5 : high user, 6 : super user
    access: { type: "integer" },
    sum: { type: "string" },
    base: { type: "integer" },
  },
};
