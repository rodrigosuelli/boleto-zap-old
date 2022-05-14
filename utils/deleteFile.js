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
    console.log(`successfully deleted ${filePath}`);
  } catch (error) {
    console.error('there was an error:', error.message);
  }
}

module.exports = deleteFile;
