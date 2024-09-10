// const chalk = require('chalk');

// /**
//  * Adds mark check symbol
//  */
// function addCheckMark(callback) {
//   process.stdout.write(chalk.green(' ✓'));
//   if (callback) callback();
// }

// module.exports = addCheckMark;

/**
 * Adds mark check symbol
 */
async function addCheckMark(callback) {
  const { default: chalk } = await import('chalk'); // Dynamically import chalk

  process.stdout.write(chalk.green(' ✓'));
  if (callback) callback();
}

module.exports = addCheckMark;
