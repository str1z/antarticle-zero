const models = require("../models");
const { levels, errors, search } = require("../config");

const manager = {
  id: async (_id) => {
    const target = await models.Topic.findOne({ _id, deleted: false }).catch(() => {
      throw errors.not_object_id;
    });
    if (!target) throw errors.topic_not_found;
    return target;
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
  create: async (agent, { base = 0, meta, access = 0, sum = "" }) => {
    if (agent.level < levels.topic_manager) throw errors.level_too_low;
    if (access > agent.access) throw errors.access_violation;
    if (base > agent.base) throw errors.base_violation;
    models.Topic.create({
      meta,
      sum: search.summator(sum),
      access,
      base,
    });
    return { success: "topic_created" };
  },
  update: async (agent, { base, meta, access, sum }) => {
    if (agent.level < levels.topic_manager) throw errors.level_too_low;
    const target = await manager.id(id);
    if (target.access > agent.access) throw errors.topic_not_found;
    if (access)
      if (access > agent.access) throw errors.access_violation;
      else target.access = access;
    if (base)
      if (base > agent.base) throw errors.base_violation;
      else target.base = base;
    if (meta) target.meta = meta;
    if (sum) target.sum = search.summator(sum);
    target.save();
    return { success: "topic_updated" };
  },
  delete: async (agent, { id }) => {
    if (agent.level < levels.topic_manager) throw errors.level_too_low;
    const target = await manager.id(id);
    target.deleted = true;
    target.save();
    return { success: "topic_deleted" };
  },
  recover: async (agent, { id }) => {
    if (agent.level < levels.topic_manager) throw errors.level_too_low;
    const target = await manager.id(id);
    target.deleted = false;
    target.save();
    return { success: "topic_recovered" };
  },
  clean: async (agent) => {
    if (agent.level < levels.high_user) throw errors.level_too_low;
    await models.Topic.deleteMany({ deleted: true });
    return { success: "topics_cleaned" };
  },
};

module.exports = manager;
