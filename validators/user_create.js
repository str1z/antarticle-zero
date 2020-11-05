module.exports = {
  type: "object",
  properties: {
    username: { type: "string", required: true },
    password: { type: "string", required: true },
    permission: { type: "integer" },
    access: { type: "integer" },
    sum: { type: "string" },
    base: { type: "integer" },
  },
};
