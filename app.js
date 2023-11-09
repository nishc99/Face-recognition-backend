const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { createCanvas, Image, ImageData } = require('canvas');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors())

// Configure file upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(express.json());

// Set up CORS for cross-origin requests (adjust origins as needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Initialize face-api.js
(async () => {
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights/faceapi');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights/faceapi');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./weights/faceapi');
    console.log('face-api.js models loaded successfully');
  } catch (error) {
    console.error('Error during face-api.js initialization:', error);
  }
})();

// Define a route for image upload and facial recognition
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Load the uploaded image and perform facial recognition
    const image = await canvas.loadImage(req.file.path);

    // Check if the image is of type HTMLImageElement
    if (image.constructor.name !== 'HTMLImageElement') {
      return res.status(400).json({ error: 'Invalid image type' });
    }

    // Detect faces in the image
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

    if (detections.length === 0) {
      return res.status(400).json({ error: 'No faces detected' });
    }

    // For demonstration purposes, we'll return a simple response with the number of detected faces
    const recognitionResult = {
      recognized: true,
      message: `${detections.length} face(s) detected`,
    };

    res.status(200).json(recognitionResult);
  } catch (error) {
    console.error('Error during facial recognition:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Clean up uploaded image file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting uploaded file:', err);
        }
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const faceapi = require('face-api.js');
// const canvas = require('canvas');
// const { createCanvas, Image, ImageData } = canvas;
// const app = express();
// const port = 5000;

// // Configure file upload using multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Specify the destination folder for uploaded images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// app.use(express.json());

// // Set up CORS for cross-origin requests (adjust origins as needed)
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

// // Initialize face-api.js
// faceapi.env.monkeyPatch({ Canvas: createCanvas, Image, ImageData });
// (async () => {
//   await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights/faceapi');
//   await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights/faceapi');
//   await faceapi.nets.faceRecognitionNet.loadFromDisk('./weights/faceapi');
// })();

// // Define a route for image upload and facial recognition
// app.post('/api/upload', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file provided' });
//     }

//     // Load the uploaded image and perform facial recognition
//     const image = await canvas.loadImage(req.file.path);

//     // Detect faces in the image
//     const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

//     if (detections.length === 0) {
//       return res.status(400).json({ error: 'No faces detected' });
//     }

//     // For demonstration purposes, we'll return a simple response with the number of detected faces
//     const recognitionResult = {
//       recognized: true,
//       message: `${detections.length} face(s) detected`,
//     };

//     res.status(200).json(recognitionResult);
//   } catch (error) {
//     console.error('Error during facial recognition:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   } finally {
//     // Clean up uploaded image file
//     if (req.file) {
//       fs.unlink(req.file.path, (err) => {
//         if (err) {
//           console.error('Error deleting uploaded file:', err);
//         }
//       });
//     }
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });





