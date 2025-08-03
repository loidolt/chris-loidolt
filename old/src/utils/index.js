module.exports.toKebabCase = function (value) {
  return value
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-');
};

module.exports.groupBy = function (arr, criteria) {
  return arr.reduce(function (obj, item) {
    // Check if the criteria is a function to run on the item or a property of it
    var key = typeof criteria === 'function' ? criteria(item) : item[criteria];
    // If the key doesn't exist yet, create it
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = [];
    }
    // Push the value to the object
    obj[key].push(item);
    // Return the object to the next item in the loop
    return obj;
  }, {});
};

module.exports.truncateText = function (input, maxLength = 200) {
  if (input.length <= maxLength) {
    return input;
  }
  return input.substring(0, maxLength) + '...';
};

module.exports.getRandomColor = function () {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
