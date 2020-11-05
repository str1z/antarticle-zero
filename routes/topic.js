const express = require("express");
const router = express.Router();
const validate = require("express-jsonschema").validate;
const validators = require("../validators");
const auth = require("./_auth");
const { topic_context } = require("../services");
const { pack } = require("../utils");

const routes = {
  "/:id": ["get", (req, res) => pack(req, res, topic_context.get, req.param.id)],
  "/": ["get", (req, res) => pack(req, res, topic_context.query, req.query)],
  "/clean": ["post", auth, (req, res) => pack(req, res, topic_context.clean, req.agent, req.body)],
  "/create": ["post", auth, (req, res) => pack(req, res, topic_context.create, req.agent, req.body)],
  "/delete": ["post", auth, (req, res) => pack(req, res, topic_context.delete, req.agent, req.body)],
  "/recover": ["post", auth, (req, res) => pack(req, res, topic_context.recover, req.agent, req.body)],
  "/update": ["post", auth, (req, res) => pack(req, res, topic_context.update, req.agent, req.body)],
};

for (let path in routes) {
  let route = routes[path];
  let method = route[0];
  let handlers = route.slice(1);
  router[method](path, ...handlers);
}

module.exports = router;
