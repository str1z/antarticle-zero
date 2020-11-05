const { debug } = require("../config");

module.exports = (error) => {
  if (debug) console.log(error);
};
