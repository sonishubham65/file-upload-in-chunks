var express = require('express');
var router = express.Router();
let fs = require('fs')

const { v4: uuidv4, v1: uuidv1 } = require('uuid');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


var Chunks = [];
var Nonces = {};
/**
 * @description: Create a nonce for new upload
 */
router.post('/nonce', function (req, res, next) {
  try {
    const { filename, size } = req.body;
    let nonce = uuidv4();
    Nonces[nonce] = {
      filename: uuidv1() + filename,
      size: size
    }
    Chunks[nonce] = {};
    res.status(200).json({ success: true, nonce: nonce })
  } catch (e) {
    console.log(e)
    res.status(500).json({ success: false, message: e.message });
  }
})
/**
 * @description: Save all chunks with respect to nonce
 */
router.post('/upload', function (req, res, next) {
  try {
    const { nonce, start, end, file } = req.body;
    Chunks[nonce][end] = file;
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * @description: Merge all chunks in a file
 */
router.post('/save', function (req, res, next) {
  try {
    const { nonce, filename } = req.body;
    let fileName = `public/images/${Nonces[nonce].filename}`;

    const fileStream = fs.createWriteStream(fileName, { flags: 'a' });

    Object.keys(Chunks[nonce]).forEach(key => {
      let chunk = Chunks[nonce][key];
      let data = Buffer.from(chunk.split(`;base64,`)[1], 'base64');
      fileStream.write(data);
    });

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }

});

module.exports = router;
