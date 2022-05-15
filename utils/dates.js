const OneDayInMilliseconds = 86400000;

// GMT -03:00 (Brasilia Standard Time)
const date = new Date(new Date() - 3600 * 1000 * 3 + 1000);

const currentDate = date.toISOString().split('T')[0];

function currentDatePlus(days) {
  return new Date(date.getTime() + OneDayInMilliseconds * days)
    .toISOString()
    .split('T')[0];
}

module.exports = {
  currentDate,
  currentDatePlus,
};
