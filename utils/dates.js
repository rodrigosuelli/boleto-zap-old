const OneDayInMilliseconds = 86400000;

// GMT -03:00 (Brasilia Standard Time)
const currentDate = new Date(new Date() - 3600 * 1000 * 3 + 1000)
  .toISOString()
  .split('T')[0];

function currentDatePlus(days) {
  return new Date(currentDate.getTime() + OneDayInMilliseconds * days)
    .toISOString()
    .split('T')[0];
}

module.exports = {
  currentDate,
  currentDatePlus,
};
