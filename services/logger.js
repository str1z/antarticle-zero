const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

module.exports = (message, color = "\x1b[0m") => {
  let colorCode = colors[color] || color;
  console.log(`\x1b[35m${new Date().toISOString()} ${colorCode}${message}\x1b[0m`);
};
