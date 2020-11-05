const { logger } = require("../services");
const { debug, errors } = require("../config");

module.exports = (req, res, handler, ...args) => {
  handler(...args)
    .then((data) => {
      if (debug.response) logger(`${req.originalUrl} ${JSON.stringify(data)}`);
      res.json(data);
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
