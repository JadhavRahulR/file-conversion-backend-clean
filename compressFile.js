const { exec } = require('child_process');
const path = require('path');

function compressCSV(inputPath, originalName) {
  return new Promise((resolve, reject) => {
    const outputFolder = path.join(__dirname, 'compressed');
    const outputFileName = originalName.replace('.csv', '_compressed.csv');
    const outputPath = path.join(outputFolder, outputFileName);

    const script = path.join(__dirname, 'compress_csv.py');
    const command = `python "${script}" "${inputPath}" "${outputFolder}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(outputPath);  // Full path to compressed file
    });
  });
}

module.exports = { compressCSV };
