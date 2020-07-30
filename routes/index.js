var express = require('express');
var router = express.Router();
let fs = require('fs')

const { v4: uuidv4, v1: uuidv1 } = require('uuid');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/camera', function (req, res, next) {
  res.render('camera');
});


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
    res.status(200).json({ success: true, nonce: nonce })
  } catch (e) {
    console.log(e)
    res.status(500).json({ success: false, message: e.message });
  }
})

router.get('/nonce', function (req, res, next) {
  try {
    const { nonce } = req.query;
    if (Nonces[nonce]) {
      let fileName = `public/images/${Nonces[nonce].filename}`;
      if (!fs.existsSync(fileName)) {
        throw new Error("Invalid file, restart the process..");
      }
      var stat = fs.statSync(fileName);
      res.status(200).json({ size: stat.size })
    } else {
      throw new Error("Invalid nonce..")
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
})

/**
 * @description: Save all chunks with respect to nonce
 */
router.post('/upload', function (req, res, next) {
  try {
    const { nonce, chunk } = req.body;
    if (Nonces[nonce]) {
      let fileName = `public/images/${Nonces[nonce].filename}`;
      const fileStream = fs.createWriteStream(fileName, { flags: 'a' });
      let data = Buffer.from(chunk.split(`;base64,`)[1], 'base64');
      fileStream.write(data);

      res.status(200).json({ success: true });
    } else {
      throw new Error("Invalid nonce..")
    }

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * @description: Merge all chunks in a file
 */
router.post('/save', function (req, res, next) {
  try {
    const { nonce } = req.body;
    let fileName = `public/images/${Nonces[nonce].filename}`;
    res.status(200).json({ success: true, a: 1, name: Nonces[nonce].filename });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }

});



module.exports = router;
