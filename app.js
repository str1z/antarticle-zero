require("dotenv").config();
const PORT = process.env.PORT || 8080;
console.log(`\x1b[36m
▄▀█ █▄░█ ▀█▀ ▄▀█ █▀█ ▀█▀ █ █▀▀ █░░ █▀▀
█▀█ █░▀█ ░█░ █▀█ █▀▄ ░█░ █ █▄▄ █▄▄ ██▄
v0.0.1\x1b[0m`);
const { debug } = require("./config");

const parser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const services = require("./services");
const app = express();

// Middlewares setup
app.use(require("cors")());
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));

if (debug.request)
  app.use((req, _, next) => {
    services.logger(`${req.method} ${req.originalUrl} ${req.ip}`);
    next();
  });
// Routes setup
app.use("/user", require("./routes/user"));
app.use("/topic", require("./routes/topic"));
app.use("/article", require("./routes/article"));

// Startup

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  services.logger("Connected to database", "green");
  app.listen(PORT, () => {
    if (debug.status) services.logger(`Listening on PORT ${PORT}`, "green");
    services.user_context.createRoot().then(() => {
      if (debug.status) services.logger("Root account created", "green");
    });
  });
});

app.use(function (err, req, res, next) {
  console.log(err);
  if (err.name === "JsonSchemaValidation") res.status(400).json({ error: "validation", details: err.validations });
  else res.status(500).json({ error: "unknown", details: err });
});
