const models = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HASH_SALT_ROUNDS = +process.env.HASH_SALT_ROUNDS;
const JWT_SECRET = process.env.JWT_SECRET;
const { root, levels, errors, search } = require("../config");

const manager = {
  id: async (_id, fields) => {
    const target = await models.User.findOne({ _id, deleted: false }, fields).catch(() => {
      throw errors.not_object_id;
    });
    if (!target) throw errors.user_not_found;
    return target;
  },
  verify: async ({ user, pass }) => {
    const target = await models.User.findOne({ username: user });
    if (!target || !bcrypt.compareSync(pass, target.password)) throw errors.bad_creds;
    return { token: jwt.sign({ id: target._id }, JWT_SECRET) };
  },
  auth: async ({ token }) => {
    if (!token) throw errors.missing_token;
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw errors.invalid_token;
    }
    if (!decoded || !decoded.id) throw errors.invalid_token;
    return await manager.id(decoded.id).catch(() => errors.invalid_token);
  },
  get: (_id) => manager.id(_id, "meta views articles"),
  query: async (query) => {
    const { search, page = 0, size = search.default_page_size } = query;
    const find = {};
    if (search) find.sum = { $regex: search };
    return await models.User.find(find)
      .sort("-views")
      .limit(size)
      .skip(page * size)
      .select("meta views articles create")
      .exec();
  },
  createRoot: () =>
    models.User.updateOne(
      { username: "root" },
      {
        username: "root",
        password: bcrypt.hashSync(process.env.ROOT_PASS, HASH_SALT_ROUNDS),
        ...root,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ),
  create: async (agent, { username, password, base = 0, meta, level = 0, access = 0, sum = "" }) => {
    if (agent.level < levels.user_manager) throw errors.level_too_low;
    if (level >= agent.level) throw errors.perm_violation;
    if (access > agent.access) throw errors.access_violation;
    if (base > agent.base) throw errors.base_violation;
    if (await models.User.findOne({ username })) throw errors.username_taken;
    models.User.create({
      username,
      password: bcrypt.hashSync(password, HASH_SALT_ROUNDS),
      meta,
      level,
      access,
      sum: search.summator(sum),
      base,
    });
    return { success: "user_created" };
  },
  update: async (agent, { id, username, password, meta, base, level, access, sum }) => {
    if (agent.level < levels.user_manager) throw errors.level_too_low;

    const target = await manager.id(id);

    if (target.level >= agent.level) throw errors.user_not_found;

    if (username)
      if (await models.User.findOne({ username })) throw errors.username_taken;
      else target.username = username;
    if (level)
      if (level >= agent.level) throw errors.perm_violation;
      else target.level = level;
    if (access)
      if (access > agent.access) throw errors.access_violation;
      else target.access = access;
    if (base)
      if (base > agent.base) throw errors.base_violation;
      else target.base = base;
    if (password) target.password = bcrypt.hashSync(pass, HASH_SALT_ROUNDS);
    if (meta) target.meta = meta;
    if (sum) target.sum = search.summator(sum);
    target.save();
    return { success: "user_updated" };
  },
  delete: async (agent, { id }) => {
    if (agent.level < levels.user_manager) throw errors.level_too_low;
    const target = await manager.id(id);
    if (target.level >= agent.level) throw errors.user_not_found;
    target.deleted = true;
    target.save();
    return { success: "user_deleted" };
  },
  recover: async (agent, { id }) => {
    if (agent.level < levels.user_manager) throw errors.level_too_low;
    const target = await manager.id(id);
    if (target.level >= agent.level) throw errors.user_not_found;
    target.deleted = false;
    target.save();
    return { success: "user_recovered" };
  },
  clean: async (agent) => {
    if (agent.level < levels.high_user) throw errors.level_too_low;
    await models.User.deleteMany({ deleted: true });
    return { success: "users_cleaned" };
  },
};

module.exports = manager;
