const express = require('express');
const router = express.Router();
const lg = require('./log');
const fs = require('fs');
const Zip = require('adm-zip');

router.use(function timeLog(req, res, next) {
  // console.log('Time: ', Date.now());
  next();
});

router.post('/session', function (req, res) {
  if (Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let error = 0;
  for (let f in req.files) {
    let file = req.files[f];
    let name = file.name;
    if (!name.includes('.zip')) return res.status(408).send('not zip archieve');
    lg.debug(`try to upload ${name}`);
    file.mv(`${process.env.TMP_ARCHIEVE_FOLDER}/${name}`, function (err) {
      if (err) {
        error++
      } else {
        unzip(name)
      }
    });
  }
  if (error) {
    return res.status(500).send('error')
  }
  return res.send('File uploaded!');
});

router.get('/', function (req, res) {
  res.send('Birds home page');
});

router.get('/about', function (req, res) {
  res.send('About birds');
});

module.exports = router;

async function unzip(file) {
  let zip = new Zip(`${process.env.TMP_ARCHIEVE_FOLDER}/${file}`);
  // let zipEntries = zip.getEntries();
  zip.extractAllTo(/*target path*/`${process.env.SESSION_FOLDER}`, /*overwrite*/true);
  fs.unlink(`${process.env.TMP_ARCHIEVE_FOLDER}/${file}`, (err) => {
    if(err) lg.error(err);
  })
}
