const express = require("express");
const router = express.Router();
const validate = require("express-jsonschema").validate;
const validators = require("../validators");
const auth = require("./_auth");
const { user_context } = require("../services");
const { pack } = require("../utils");

const routes = {
  "/:id": ["get", (req, res) => pack(req, res, user_context.get, req.param.id)],
  "/": ["get", (req, res) => pack(req, res, user_context.query, req.query)],
  "/verify": ["post", (req, res) => pack(req, res, user_context.verify, req.body)],
  "/clean": ["post", auth, validate({ body: validators.user_clean }), (req, res) => pack(req, res, user_context.clean, req.agent, req.body)],
  "/create": ["post", auth, validate({ body: validators.user_create }), (req, res) => pack(req, res, user_context.create, req.agent, req.body)],
  "/delete": ["post", auth, validate({ body: validators.user_delete }), (req, res) => pack(req, res, user_context.delete, req.agent, req.body)],
  "/recover": ["post", auth, validate({ body: validators.user_recover }), (req, res) => pack(req, res, user_context.recover, req.agent, req.body)],
  "/update": ["post", auth, validate({ body: validators.user_update }), (req, res) => pack(req, res, user_context.update, req.agent, req.body)],
};

for (let path in routes) {
  let route = routes[path];
  let method = route[0];
  let handlers = route.slice(1);
  router[method](path, ...handlers);
}

module.exports = router;
