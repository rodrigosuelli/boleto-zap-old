const OneDayInMilliseconds = 86400000;

// GMT -03:00 (Brasilia Standard Time)
const currentDate = new Date(new Date() - 3600 * 1000 * 3 + 1000)
  .toISOString()
  .split('T')[0];

const currentDatePlus7Days = new Date(
  currentDate.getTime() + OneDayInMilliseconds * 7
)
  .toISOString()
  .split('T')[0];

module.exports = {
  currentDate,
  currentDatePlus7Days,
};
