const { access, constants } = require('fs');
const { unlink } = require('fs/promises');

const file = 'package.json';

// Check if the file exists in the current directory.
access(file, constants.F_OK, (err) => {
  console.log(`${file} ${err ? 'file does not exist' : 'file exists'}`);
});

async function deleteFile(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error('there was an error deleting the file:', error.message);
  }
}

module.exports = deleteFile;
