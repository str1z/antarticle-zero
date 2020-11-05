const { user_context, logger } = require("../services");
const { debug } = require("../config");

module.exports = async (req, res, next) => {
  user_context
    .auth(req.body)
    .then((agent) => {
      req.agent = agent;
      next();
    })
    .catch((err) => {
      if (err instanceof Array) {
        if (debug.handled) logger(`${req.originalUrl} ${err[0]} ${JSON.stringify(err[1])}`, "yellow");
        res.status(err[0]).json(err[1]);
      } else {
        if (debug.unhandled) logger(`${req.originalUrl} ${err}`, "red");
        res.status(errors.system_error[0]).json(errors.system_error[1]);
      }
    });
};
