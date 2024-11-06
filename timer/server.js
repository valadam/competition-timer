const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

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

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle image upload and save configuration
app.post('/upload-config', upload.single('logo-upload'), (req, res) => {
  console.log("Request Body:", req.body);  // Log other form fields
  console.log("File Information:", req.file);  // Log file information

  if (req.file) {
    console.log("File uploaded successfully:", req.file.path);
    req.body.logo = `img/uploads/${req.file.originalname}`;
  } else {
    console.error("File upload failed.");
    return res.status(400).send('File upload failed');
  }

  const configPath = path.join(__dirname, 'data', 'config.json');
  fs.writeFile(configPath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      console.error("Error writing to config.json:", err);
      return res.status(500).send('Error saving configuration');
    }
    res.send('Configuration saved');
  });
});


// Serve the configuration
app.get('/config', (req, res) => {
  const configPath = path.join(__dirname, 'data', 'config.json');
  fs.readFile(configPath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading config.json:", err);
      return res.status(500).send('Error reading configuration');
    }
    res.json(JSON.parse(data));
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});