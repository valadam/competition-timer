
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer to save uploaded files to the "public/img/uploads" directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'img', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Save with original filename
  }
});
const upload = multer({ storage: storage });

// Route to handle saving config data
app.post('/save-config', express.json(), (req, res) => {
  const configData = req.body;
  const configDir = path.join(__dirname, 'public', 'data');
  const configPath = path.join(configDir, 'config.json');

  // Ensure the 'public/data' directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true }); // Create directory if it doesn't exist
  }

  // Write the config data to config.json
  fs.writeFile(configPath, JSON.stringify(configData, null, 2), (err) => {
    if (err) {
      console.error("Error saving config:", err);
      return res.status(500).json({ message: "Failed to save config data" });
    }
    res.json({ message: "Config data saved successfully!" });
  });
});

// Endpoint to handle logo upload
app.post('/upload-logo', upload.single('file'), (req, res) => {
  res.json({ message: "Logo uploaded successfully!", filePath: `/img/uploads/${req.file.originalname}` });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});