/* module.exports.toKebabCase = function (value) {
  return value.replace(new RegExp("(\\s|_|-)+", "gmi"), "-");
}; */

module.exports.toKebabCase = function (value) {
  return value
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("-");
};
