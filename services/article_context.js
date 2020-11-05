const models = require("../models");
const { levels, errors, search } = require("../config");
const { default_page_size } = search;

const manager = {
  id: async (_id) => {
    const target = await models.Article.findOne({ _id, deleted: false }).catch(() => {
      throw errors.not_object_id;
    });
    if (!target) throw errors.article_not_found;
    return target;
  },
  topicId: async (_id) => {
    const target = await models.Topic.findOne({ _id, deleted: false }).catch(() => {
      throw errors.not_object_id;
    });
    if (!target) throw errors.topic_not_found;
    return target;
  },
  get: async (_id) => {
    const target = await models.User.findOne({ deleted: false, _id })
      .populate("author", models.User)
      .populate("topic", models.Topic)
      .select("meta data views articles author topic update create visibility")
      .exec();
    if (!target) throw errors.article_not_found;
    target.views++;
    target.author.views++;
    target.author.save();
    target.topic.views++;
    target.topic.save();
    target.score += search.view_bonus;
    target.save();
    return target;
  },
  query: async (query) => {
    const { search, author, topic, page = 0, size = default_page_size } = query;
    const find = { deleted: false };
    if (search) find.sum = { $regex: search };
    if (author) find.author = author;
    if (topic) find.topic = topic;
    return await models.User.find(find)
      .sort("-score")
      .limit(size)
      .skip(page * size)
      .populate("author", models.User)
      .populate("topic", models.Topic)
      .select("meta views articles author topic update create visibility")
      .exec();
  },
  create: async (agent, { topic, data, meta, sum = "", visibility }) => {
    if (agent.level < levels.writer) throw errors.level_too_low;
    const topicDoc = await manager.topicId(topic);
    if (agent.access < topicDoc.access) throw errors.access_too_low;
    const created = await models.User.create({
      author: agent._id,
      topic,
      data,
      meta,
      sum: search.summator(sum),
      visibility,
      score: Date.now() + topicDoc.base + agent.base,
    });
    topicDoc.articles++;
    topicDoc.save();
    agent.articles++;
    agent.save();
    return { success: "article_created" };
  },
  update: async (agent, { id, topic, sum, visibility, meta, data }, force) => {
    if (agent.level < force ? levels.article_manager : levels.editor) throw errors.level_too_low;
    const target = await manager.id(id);
    if (!(target.author === agent._id || force)) throw errors.article_not_found;
    if (topic) {
      const topicDoc = await manager.topicId(topic);
      if (agent.access < topicDoc.access) throw errors.access_too_low;
      target.topic = topic;
    }
    if (sum) target.sum = search.summator(sum);
    if (visibility) target.visibility = visibility;
    if (meta) target.meta = meta;
    if (data) target.data = data;
    target.update = Date.now();
    target.save();
    return { success: "article_updated" };
  },
  delete: async (agent, { id }, force) => {
    if (agent.level < force ? levels.moderator : levels.editor) throw errors.level_too_low;
    const target = await manager.id(id);
    if (!(target.author === agent._id || force)) throw errors.article_not_found;
    target.deleted = true;
    target.save();
    const topicDoc = await manager.topicId(target.topic);
    topicDoc.articles--;
    topicDoc.views -= target.views;
    topicDoc.save();
    agent.articles--;
    agent.views -= target.views;
    agent.save();
    return { success: "article_deleted" };
  },
  recover: async (agent, { id }) => {
    if (agent.level < levels.moderator) throw errors.level_too_low;
    const target = await manager.id(id);
    target.deleted = false;
    target.save();
    const topicDoc = await manager.topicId(target.topic);
    topicDoc.articles++;
    topicDoc.views += target.views;
    topicDoc.save();
    agent.articles++;
    agent.views += target.views;
    agent.save();
    return { success: "article_recovered" };
  },
  clean: async (agent) => {
    if (agent.level < levels.high_user) throw errors.level_too_low;
    await models.User.deleteMany({ deleted: true });
    return { success: "articles_cleaned" };
  },
};

module.exports = manager;
