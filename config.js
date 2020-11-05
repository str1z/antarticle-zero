const time = {};
time.second = 1000;
time.minute = 60 * time.second;
time.hour = 60 * time.minute;
time.day = 24 * time.hour;

const levels = {
  disabled: 0,
  writer: 1,
  editor: 2,
  moderator: 3,
  article_manager: 4,
  topic_manager: 5,
  user_manager: 6,
  high_user: 7,
  super_user: 8,
  root_user: 9,
};

const root = {
  sum: "",
  access: 2 ** 16,
  level: levels.root_user,
  base: time.day,
};
const errors = {
  username_taken: [409, { error: "username_taken" }],
  level_too_low: [403, { error: "level_too_low" }],
  access_too_low: [403, { error: "access_too_low" }],
  //auth
  bad_creds: [401, { error: "bad_creds" }],
  missing_token: [400, { error: "missing_token" }],
  invalid_token: [401, { error: "invalid_token" }],
  //db
  not_object_id: [400, { error: "not_object_id" }],
  article_not_found: [404, { error: "article_not_found" }],
  user_not_found: [404, { error: "user_not_found" }],
  topic_not_found: [404, { error: "topic_not_found" }],
  //user
  level_violation: [400, { error: "level_violation" }],
  access_violation: [400, { error: "access_violation" }],
  base_violation: [400, { error: "base_violation" }],
  //system
  system_error: [500, { error: "system_error" }],
};
const search = {
  view_bonus: time.minute,
  summator: (t) => t,
  default_page_size: 50,
};

const session = {
  jwt_expire: time.day,
};

const config = {
  levels,
  root,
  errors,
  search,
  session,
  debug: {
    status: true,
    unhandled: true,
    handled: true,
    response: true,
    request: true,
  },
};

module.exports = config;
