// utils/handlers/pdfToOdt.js (create this file if you want to keep it modular)
const path = require("path");
const { spawn } = require("child_process");

const handlePdfToOdt = async (req, res) => {
  try {
    const inputFile = req.file.path; // multer-stored file path
    const outputDir = path.join(__dirname, "..", "converted"); // update as needed

    const python = spawn("python", ["pdf_to_odt.py", inputFile, outputDir]);

    python.stderr.on("data", (data) => {
      console.error(`Python error: ${data}`);
    });

    python.on("close", (code) => {
      if (code === 0) {
        const fileName = path.basename(inputFile, path.extname(inputFile)) + ".odt";
        const outputFilePath = path.join(outputDir, fileName);
        return res.download(outputFilePath);
      } else {
        return res.status(500).json({ error: "Conversion failed" });
      }
    });
  } catch (err) {
    console.error("Error in handlePdfToOdt:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = handlePdfToOdt;
