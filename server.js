const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const puppeteer = require('puppeteer');
const marked = require('marked').marked;
const router = express.Router();
const app = express();
const { compressCSV } = require('./compressFile');
app.use(cors());
const port = process.env.PORT ||5000;




app.get("/", (req, res) => res.send("Server is live 🚀"));

// for doc to odt 
function convertDocxToOdt(inputPath, outputDir, callback) {
  const outputFileName = path.parse(inputPath).name + ".odt";
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to odt "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) return callback(error);

    callback(null, outputPath);
  });
}





// Create necessary folders if they don't exist
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'converted');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Multer setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// for csv compress 
app.post('/compress-csv', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;

  try {
    const outputPath = await compressCSV(filePath, originalName);

    res.download(outputPath, path.basename(outputPath), (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {});
      fs.unlink(outputPath, () => {});
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Compression failed');
  }
});


// for pdf yo word conversion 
app.post('/convert-pdf-to-word', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;

    const outputDir = path.resolve('converted');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputFileName = path.parse(req.file.originalname).name + '.docx';
    const outputPath = path.join(outputDir, outputFileName);

    // 👇 Command passes output folder, not full file name
    const command = `python convert_pdf.py "${inputPath}" "${outputDir}"`;

    exec(command, (error, stdout, stderr) => {
        console.log("stdout:", stdout);
        console.error("stderr:", stderr);

        if (error) {
            console.error('❌ Conversion error:', error);
            return res.status(500).send('Conversion failed.');
        }

        if (!fs.existsSync(outputPath)) {
            return res.status(404).send('Converted file not found.');
        }

        res.download(outputPath, outputFileName, (err) => {
            if (err) console.error("❌ Download error:", err);
            fs.unlinkSync(inputPath);       // delete uploaded file
            fs.unlinkSync(outputPath);      // delete converted file
        });
    });
});

app.post('/convert-word-to-pdf', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputPath = path.join(__dirname, 'converted', outputFileName);

  const outputDir = path.resolve('converted');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  const { exec } = require("child_process");
  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath); // delete original upload
      fs.unlinkSync(outputPath); // delete converted file
    });
  });
});
app.post('/convert-odt-to-pdf', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve("converted");
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});
// text to pdf 
app.post('/convert-txt-to-pdf', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

// doc to odt 
app.post('/convert-doc-to-odt', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".odt";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to odt "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});
// odt to doc

app.post('/convert-odt-to-doc', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".doc";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to doc "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});
// pptx to pdf 

app.post('/convert-pptx-to-pdf', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});
// pptx to odp 

app.post('/convert-pptx-to-odp', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".odp";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to odp "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

// odt to pptx 
app.post('/convert-odp-to-pptx', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pptx";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pptx "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});


 // rtf to pdf
app.post('/convert-rtf-to-pdf', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

//html to pdf 
app.post('/convert-html-to-pdf', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputPath = path.join(__dirname, 'converted', outputFileName);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // for Linux hosting
    });

    const page = await browser.newPage();

    await page.goto(`file://${inputPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);      // clean uploaded .html
      fs.unlinkSync(outputPath);     // clean generated .pdf
    });
  } catch (err) {
    console.error("❌ Puppeteer error:", err);
    res.status(500).send("Conversion failed.");
  }
});

//MD to pdf 

app.post('/convert-md-to-pdf', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputPath = path.join(__dirname, 'converted', outputFileName);

  try {
    // ✅ Step 1: Read Markdown
    const markdown = fs.readFileSync(inputPath, 'utf-8');

    // ✅ Step 2: Convert Markdown to HTML
    const htmlContent = marked(markdown);

    // ✅ Step 3: Wrap in full HTML + CSS
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: auto;
            }
            pre {
              background-color: #f4f4f4;
              padding: 10px;
              overflow-x: auto;
            }
            code {
              font-family: Consolas, monospace;
              color: #d6336c;
            }
            h1, h2, h3 {
              color: #333;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    // ✅ Step 4: Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // ✅ Step 5: Send PDF
    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);     // clean .md
      fs.unlinkSync(outputPath);    // clean .pdf
    });
  } catch (err) {
    console.error("❌ Markdown to PDF error:", err);
    res.status(500).send("Conversion failed.");
  }
});

//xlsx to pdf 
app.post('/convert-xlsx-to-pdf', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error) => {
    if (error) {
      console.error("❌ Conversion error:", error);
      return res.status(500).send("Conversion failed.");
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

//csv to pdf 
// const csv = require('csv-parser');
// const { Readable } = require('stream');

// app.post('/convert-csv-to-pdf', upload.single('file'), async (req, res) => {
//   const file = req.file;
//   if (!file) return res.status(400).send("No file uploaded");

//   const inputPath = file.path;
//   const outputFileName = path.parse(file.originalname).name + ".pdf";
//   const outputPath = path.join(__dirname, 'converted', outputFileName);

//   const rows = [];

//   try {
//     // ✅ Step 1: Read and parse CSV
//     const fileContent = fs.readFileSync(inputPath, 'utf-8');
//     await new Promise((resolve, reject) => {
//       Readable.from(fileContent)
//         .pipe(csv())
//         .on('data', (data) => rows.push(data))
//         .on('end', resolve)
//         .on('error', reject);
//     });

//     // ✅ Step 2: Convert rows to HTML table
//     const headers = Object.keys(rows[0] || {});
//     const tableRows = rows.map(row =>
//       `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`
//     ).join('');

//     const html = `
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 40px; }
//           table { width: 100%; border-collapse: collapse; }
//           th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
//           th { background-color: #f5f5f5; }
//         </style>
//       </head>
//       <body>
//         <h2>CSV to PDF</h2>
//         <table>
//           <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
//           <tbody>${tableRows}</tbody>
//         </table>
//       </body>
//       </html>
//     `;

//     // ✅ Step 3: Convert HTML to PDF using Puppeteer
//     const browser = await puppeteer.launch({
//       headless: 'new',
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     await page.pdf({
//       path: outputPath,
//       format: 'A4',
//       printBackground: true,
//     });

//     await browser.close();

//     // ✅ Step 4: Download response
//     res.download(outputPath, outputFileName, (err) => {
//       if (err) console.error("❌ Download error:", err);
//       fs.unlinkSync(inputPath);
//       fs.unlinkSync(outputPath);
//     });

//   } catch (err) {
//     console.error("❌ CSV to PDF error:", err);
//     res.status(500).send("Conversion failed.");
//   }
// });
const csv = require('csv-parser');

const { Readable } = require('stream');
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag]));
}

// 📤 Route handler
app.post('/convert-csv-to-pdf', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + '.pdf';
  const outputPath = path.join(__dirname, 'converted', outputFileName);

  const rows = [];

  try {
    // ✅ Step 1: Read CSV
    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    await new Promise((resolve, reject) => {
      Readable.from(fileContent)
        .pipe(csv())
        .on('data', data => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      fs.unlinkSync(inputPath);
      return res.status(400).send('CSV is empty or malformed.');
    }

    // ✅ Step 2: Build HTML table
    const headers = Object.keys(rows[0]);
    const tableRows = rows.map(row =>
      `<tr>${headers.map(h => `<td>${escapeHTML(row[h])}</td>`).join('')}</tr>`
    ).join('');

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; word-wrap: break-word; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h2>CSV to PDF</h2>
        <table>
          <thead><tr>${headers.map(h => `<th>${escapeHTML(h)}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `;

    // 🧪 Step 3 (optional): Dump HTML for debugging
    fs.writeFileSync('debug_csv_render.html', html);

    // ✅ Step 4: Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--js-flags="--max-old-space-size=2048"'
      ],
      timeout: 60000,
    });

    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
      });
    } catch (pdfErr) {
      throw new Error('PDF generation failed: ' + pdfErr.message);
    } finally {
      try {
        await browser.close();
      } catch (closeErr) {
        if (closeErr.code !== 'EBUSY') {
          console.warn('⚠️ Browser close warning:', closeErr.message);
        }
      }
    }

    // ✅ Step 5: Send PDF
    res.download(outputPath, outputFileName, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      if (err) console.error('❌ Download error:', err);
    });

  } catch (err) {
    console.error('❌ CSV to PDF error:', err);
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).send('Conversion failed: ' + err.message);
  }
});

  
//image to pdf 
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

app.post('/convert-image-to-pdf', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No image uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  try {
    const imageBuffer = fs.readFileSync(inputPath);

    // Ensure image is in PNG or JPEG format via Sharp
    const { data: pngBuffer, info } = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .png()
      .toBuffer({ resolveWithObject: true });

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedPng(pngBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error("❌ Image to PDF error:", err);
    res.status(500).send("Conversion failed.");
  }
});

//tiff to pdf 

app.post('/convert-tiff-to-pdf', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No TIFF file uploaded");

  const inputPath = file.path;
  const outputFileName = path.parse(file.originalname).name + ".pdf";
  const outputDir = path.resolve('converted');
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  try {
    const tiffBuffer = fs.readFileSync(inputPath);

    // Load all pages (TIFF frames)
    const { pages } = await sharp(tiffBuffer, { pages: -1 }).metadata();
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < pages; i++) {
      const imageBuffer = await sharp(tiffBuffer, { page: i })
        .png()
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

      const embeddedImage = await pdfDoc.embedPng(imageBuffer);
      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);

      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error("❌ Download error:", err);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error("❌ TIFF to PDF error:", err);
    res.status(500).send("Conversion failed.");
  }
});

// for compress pdf 
app.post('/convert-compress-pdf', upload.single('file'), (req, res) => {
  const file = req.file;
  const quality = parseInt(req.body.quality) || 60;

  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = "compressed_" + Date.now() + ".pdf";
  const outputDir = path.join(__dirname, 'compressed');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const outputPath = path.join(outputDir, outputFileName);

  const { spawn } = require("child_process");

  const python = spawn("python", [
    "compress_pdf.py",
    inputPath,
    outputPath,
    quality.toString()
  ]);

  python.stdout.on("data", (data) => console.log(`stdout: ${data}`));
  python.stderr.on("data", (data) => console.error(`stderr: ${data}`));

  python.on("close", (code) => {
    if (code === 0) {
      res.download(outputPath, outputFileName, (err) => {
        if (err) console.error("❌ Download error:", err);
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    } else {
      res.status(500).send("Compression failed");
    }
  });
});

// for make .zip file
const archiver = require("archiver");

app.post("/convert-to-zip", upload.array("files"), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).send("No files uploaded");

  const zipName = "archive_" + Date.now() + ".zip";
  const outputPath = path.join(__dirname, "converted", zipName);

  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    res.download(outputPath, zipName, (err) => {
      if (err) console.error("Download error:", err);
      req.files.forEach((f) => fs.unlinkSync(f.path));
      fs.unlinkSync(outputPath);
    });
  });

  archive.pipe(output);
  req.files.forEach((file) => {
    archive.file(file.path, { name: file.originalname });
  });
  archive.finalize();
});


// for extract zip files 
const AdmZip = require("adm-zip");

app.post("/extract-zip", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No ZIP uploaded");

  const inputPath = req.file.path;
  const zip = new AdmZip(inputPath);

  const extractFolder = path.join(__dirname, "extracted_" + Date.now());
  fs.mkdirSync(extractFolder);

  zip.extractAllTo(extractFolder, true);

  // Re-zip to send extracted files back
  const newZipPath = extractFolder + ".zip";
  const newZip = new AdmZip();
  newZip.addLocalFolder(extractFolder);
  newZip.writeZip(newZipPath);

  res.download(newZipPath, "unzipped_files.zip", (err) => {
    fs.unlinkSync(inputPath); // original uploaded zip
    fs.rmSync(extractFolder, { recursive: true, force: true });
    fs.unlinkSync(newZipPath); // zip sent to user
  });
});


// for compress img 
const { spawn } = require("child_process");

app.post("/compress-image", upload.single("file"), (req, res) => {
  const file = req.file;
  const quality = parseInt(req.body.quality) || 70;

  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = file.path;
  const outputFileName = "compressed_" + Date.now() + ".jpg";
  const outputPath = path.join(__dirname, "compressed", outputFileName);

  if (!fs.existsSync("compressed")) fs.mkdirSync("compressed");

  const python = spawn("python", [
    "compress_image.py",
    inputPath,
    outputPath,
    quality.toString()
  ]);

  python.stdout.on("data", (data) => console.log(`stdout: ${data}`));
  python.stderr.on("data", (data) => console.error(`stderr: ${data}`));

  python.on("close", (code) => {
    if (code === 0) {
      const originalSize = fs.statSync(inputPath).size;
      const compressedSize = fs.statSync(outputPath).size;

      res.setHeader("Content-Disposition", `attachment; filename=${outputFileName}`);
      res.setHeader("X-Original-Size", originalSize.toString());      
      res.setHeader("X-Compressed-Size", compressedSize.toString());
      res.sendFile(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    } else {
      res.status(500).send("Compression failed");
    }
  });
});

// for merged pdf
// const { spawn } = require("child_process");
const uploadMulti = upload.array("files");

app.post("/merge-pdf", uploadMulti, (req, res) => {
  const files = req.files;
  if (!files || files.length < 2) {
    return res.status(400).send("Upload at least two PDF files");
  }

  const outputDir = path.join(__dirname, "merged");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const outputFileName = `merged_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  const args = [outputPath, ...files.map((f) => f.path)];
  const python = spawn("python", ["merge_pdfs.py", ...args]);

  python.stderr.on("data", (data) => console.error(`stderr: ${data}`));
  python.on("close", (code) => {
    if (code === 0) {
      res.download(outputPath, outputFileName, (err) => {
        if (err) console.error("Download error:", err);
        files.forEach((f) => fs.unlinkSync(f.path));
        fs.unlinkSync(outputPath);
      });
    } else {
      res.status(500).send("PDF merge failed");
    }
  });
});

// for pdf to odt 
app.post('/convert-pdf-to-odt', upload.single('file'), (req, res) => {
  const inputPDF = req.file.path;
  const originalName = path.parse(req.file.originalname).name;
  const docxPath = path.join('converted', `${originalName}.docx`);
  const outputDir = 'converted';

  const pythonCmd = `python pdf_to_docx.py "${inputPDF}" "${outputDir}"`;

  exec(pythonCmd, (err, stdout, stderr) => {
    if (err || !fs.existsSync(docxPath)) {
      console.error("❌ PDF to DOCX error:", stderr);
      return res.status(500).send("PDF to DOCX failed");
    }

    // ✅ Reuse the same DOCX to ODT logic
    convertDocxToOdt(docxPath, outputDir, (err2, odtPath) => {
      if (err2 || !fs.existsSync(odtPath)) {
        console.error("❌ DOCX to ODT error:", err2);
        return res.status(500).send("DOCX to ODT failed");
      }

      // ✅ Send the ODT file back
      res.download(odtPath, path.basename(odtPath), (err3) => {
        if (err3) console.error("❌ Download error:", err3);

        // Clean up files
        fs.unlinkSync(inputPDF);
        fs.unlinkSync(docxPath);
        fs.unlinkSync(odtPath);
      });
    });
  });
});

// for pdf to text 
app.post('/convert-pdf-to-text', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const inputPath = path.resolve(file.path); 
  const outputDir = path.resolve('converted');
  const baseName = path.parse(file.originalname).name; 
  const outputFileName = `${baseName}.txt`;
  const outputPath = path.join(outputDir, outputFileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // 🔍 Log command
  const command = `python pdf_to_text.py "${inputPath}" "${outputDir}"`;
  console.log("🐍 Running command:", command);

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    console.log(stdout);
    if (error) {
      console.error('❌ Python error:', stderr);
      return res.status(500).send('Conversion failed');
    }

    if (!fs.existsSync(outputPath)) {
      console.error('❌ Output .txt file not found:', outputPath);
      return res.status(404).send('Text file not created');
    }

    // ✅ Download
    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error('❌ Download error:', err);

      // Cleanup
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  });
});


// pdf to pptx 
app.post('/convert-pdf-to-pptx', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;

    const outputFileName = path.parse(req.file.originalname).name + '.pptx';
    const outputPath = path.join('uploads', outputFileName);

    // ✅ Python script is in the same folder as server.js
    const scriptPath = path.join(__dirname, 'pdf_to_pptx.py');
    console.log('Running script:', scriptPath);

    const python = spawn('python', [scriptPath, inputPath, outputPath]);

    python.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
            res.download(outputPath, outputFileName, (err) => {
                if (err) console.error('Download error:', err);

                // Cleanup
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        } else {
            console.error(`❌ Conversion failed with code ${code}`);
            res.status(500).send('Conversion failed.');
        }
    });
});

// pdf to rtf 
// const uploadDir = path.resolve(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.post("/convert-pdf-to-rtf", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const inputPath = path.resolve(file.path);
  const outputDir = path.resolve("uploads"); // Same folder for simplicity
  const baseName = path.parse(file.originalname).name;

  const scriptPath = path.join(__dirname, "pdf_to_rtf.py");
  const command = `python "${scriptPath}" "${inputPath}" "${outputDir}"`;

  console.log("🔁 Running:", command);

  exec(command, (error, stdout, stderr) => {
    console.log("stdout:", stdout);
    console.error("stderr:", stderr);

    if (error) {
      console.error("❌ Conversion error:", error.message || stderr);
      return res.status(500).send("Conversion failed");
    }

    const expectedRTF = path.join(outputDir, baseName + ".rtf");

    if (!fs.existsSync(expectedRTF)) {
      console.error("❌ RTF file not found");
      return res.status(404).send("RTF file not created");
    }

    res.download(expectedRTF, `${baseName}.rtf`, (err) => {
      if (err) console.error("❌ Download error:", err);

      // Clean up
      fs.unlinkSync(inputPath);
      fs.unlinkSync(expectedRTF);
    });
  });
});

// fetch from google drive 
const fetch = require("node-fetch");
// const { Readable } = require("stream");

app.use(express.json());

app.post("/fetch-drive-file", async (req, res) => {
  const { fileId, accessToken } = req.body;

  if (!fileId || !accessToken) {
    return res.status(400).json({ error: "Missing fileId or accessToken" });
  }

  const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  try {
    const driveRes = await fetch(driveUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!driveRes.ok) {
      throw new Error(`Google Drive fetch failed: ${driveRes.statusText}`);
    }

    res.setHeader("Content-Type", driveRes.headers.get("content-type") || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileId}.pdf"`);

    // ✅ Works directly in node-fetch@2
    driveRes.body.pipe(res);
  } catch (err) {
    console.error("Drive fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch file from Google Drive" });
  }
});


// for pptx compress 
app.post('/compress-pptx', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const quality = parseInt(req.body.quality) || 30;
  const outputType = req.body.outputType === '7z' ? '7z' : 'pptx';

  const outputFolder = path.join(__dirname, 'compressed');
  const outputFileName = originalName.replace('.pptx', `_compressed.pptx${outputType === '7z' ? '.7z' : ''}`);
  const outputPath = path.join(outputFolder, outputFileName);

  const script = path.join(__dirname, 'compress_pptx.py');
  const command = `python "${script}" "${filePath}" "${outputFolder}" "${quality}" "${outputType}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr || err.message);
      return res.status(500).send('Compression failed');
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {});
      fs.unlink(outputPath, () => {});
    });
  });
});


// for docx compress 
app.post('/compress-docx', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const quality = parseInt(req.body.quality) || 30;
  const outputType = req.body.outputType === '7z' ? '7z' : 'docx';

  const outputFolder = path.join(__dirname, 'compressed');
  const outputFileName = originalName.replace('.docx', `_compressed.docx${outputType === '7z' ? '.7z' : ''}`);
  const outputPath = path.join(outputFolder, outputFileName);

  const script = path.join(__dirname, 'compress_docx_user_config.py');
  const command = `python "${script}" "${filePath}" "${outputFolder}" "${quality}" "${outputType}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr || err.message);
      return res.status(500).send('Compression failed');
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {});
      fs.unlink(outputPath, () => {});
    });
  });
});

// for xlsx compress
app.post('/compress-xlsx', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const quality = parseInt(req.body.quality) || 30;
  const outputType = req.body.outputType === '7z' ? '7z' : 'xlsx';

  const outputFolder = path.join(__dirname, 'compressed');
  const outputFileName = originalName.replace('.xlsx', `_compressed.xlsx${outputType === '7z' ? '.7z' : ''}`);
  const outputPath = path.join(outputFolder, outputFileName);

  const script = path.join(__dirname, 'compress_xlsx_user_config.py');
  const command = `python "${script}" "${filePath}" "${outputFolder}" "${quality}" "${outputType}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr || err.message);
      return res.status(500).send('Compression failed');
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {});
      fs.unlink(outputPath, () => {});
    });
  });
});



// for odt compress 
const odtStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const odtUpload = multer({ storage: odtStorage });
app.post('/compress-odt', odtUpload.single('file'), (req, res) => {
  const file = req.file;
  const quality = req.body.quality || '70';
  const outputType = req.body.outputType || 'odt';
  const outputDir = path.join(__dirname, 'converted');

  if (!file) {
    return res.status(400).send('❌ No file uploaded');
  }

  const originalUploadedName = path.basename(file.filename, '.odt'); // Use actual uploaded name

  const script = 'compress_odt_user.py';
  const command = `python ${script} "${file.path}" "${outputDir}" ${quality} ${outputType}`;
  console.log('🔧 Running command:', command);

  exec(command, (err, stdout, stderr) => {
    console.log('📜 Python stdout:', stdout);
    console.error('🐞 Python stderr:', stderr);

    if (err) {
      return res.status(500).send('❌ Compression failed');
    }

    const compressedOdtPath = path.join(outputDir, `${originalUploadedName}_compressed.odt`);
    const finalOutput = outputType === '7z' ? `${compressedOdtPath}.7z` : compressedOdtPath;

    // Check if output file was created
    if (!fs.existsSync(finalOutput)) {
      console.error('❌ File not found:', finalOutput);
      return res.status(500).send('❌ Output file not created');
    }

    console.log('✅ Sending file:', finalOutput);
    res.download(finalOutput);
  });
});


// for odp compress 
app.post('/compress-odp', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { quality, outputType } = req.body;

    if (!file || !quality || !outputType) {
      return res.status(400).send('Missing file or parameters');
    }

    const inputPath = file.path;
    const outputFolder = path.join(__dirname, 'converted');
    const baseName = path.parse(file.originalname).name;
    const outputOdp = path.join(outputFolder, `${baseName}_compressed.odp`);
    const output7z = outputOdp + '.7z';

    const cmd = `python compress_odp_user.py "${inputPath}" "${outputFolder}" ${quality} ${outputType}`;

    exec(cmd, (error, stdout, stderr) => {
      console.log('📜 Python stdout:', stdout);
      console.log('🐞 Python stderr:', stderr);

      if (error) {
        return res.status(500).send('Compression failed');
      }

      const finalPath = outputType === '7z' ? output7z : outputOdp;

      if (!fs.existsSync(finalPath)) {
        return res.status(500).send('❌ File not created');
      }

      res.download(finalPath, path.basename(finalPath), (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        fs.unlinkSync(inputPath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Server error');
  }
});

// for compress tiff 
const tiffStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname}`)
});
const uploadTiff = multer({ storage: tiffStorage });

app.post("/compress-tiff", uploadTiff.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputDir = path.join(__dirname, "converted");
  const quality = req.body.quality || 85;
  const export7z = req.body.export7z === "true";

  const command = `python compress_tiff.py "${inputPath}" "${outputDir}" ${quality} ${export7z}`;
  console.log("📦 Running command:", command);

  exec(command, (err, stdout, stderr) => {
    console.log("📜 stdout:", stdout);
    console.error("🐞 stderr:", stderr);

    if (err) {
      console.error("❌ Compression failed:", err.message);
      return res.status(500).json({ error: "Compression failed", detail: stderr });
    }

    const baseName = path.basename(inputPath).split(".")[0];
    const compressedFile = path.join(outputDir, `${baseName}_compressed.tiff`);
    const zipFile = `${compressedFile}.7z`;

    const fileToSend = export7z && fs.existsSync(zipFile) ? zipFile : compressedFile;

    res.download(fileToSend, path.basename(fileToSend), (err) => {
      if (err) console.error("File download error:", err);
      fs.unlinkSync(inputPath);
    });
  });
});


// for .bmp compress 
const bmpStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname}`)
});
const uploadBmp = multer({ storage: bmpStorage });

app.post("/compress-bmp", uploadBmp.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputDir = path.join(__dirname, "converted");
  const quality = req.body.quality || 85;
  const format = req.body.format || "jpg"; // bmp, jpg, webp
  const export7z = req.body.export7z === "true";

  const command = `python compress_bmp.py "${inputPath}" "${outputDir}" ${quality} ${format} ${export7z}`;

  exec(command, (err, stdout, stderr) => {
    console.log("📜 Python stdout:", stdout);
    console.error("🐞 Python stderr:", stderr);

    if (err) {
      return res.status(500).json({ error: "Compression failed" });
    }

    const baseName = path.basename(inputPath).split(".")[0];
    const compressedPath = path.join(outputDir, `${baseName}_compressed.${format}`);
    const zipPath = `${compressedPath}.7z`;

    const fileToSend =
      export7z && fs.existsSync(zipPath) ? zipPath : compressedPath;

    res.download(fileToSend, path.basename(fileToSend), (err) => {
      if (err) console.error("File download error:", err);
      fs.unlinkSync(inputPath);
    });
  });
});



// app.listen(5000, () => console.log('Server started on port 5000'));
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
