var express = require('express');
var router = express.Router();
const indexrouter = require('../controller/index'); // Import the controller
const multer = require('multer'); // Import multer
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
      callback(null, './uploads');
  },
  filename: (req, file, callback) => {
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }); // Create the upload middleware
/* GET home page. */
router.get('/', indexrouter.getIndexPage);
router.post('/upload', upload.single('file'), indexrouter.uploadfile);
router.get('/download/:id', indexrouter.downloadfile);

module.exports = router;
