const express = require('express');
const router = express.Router();
const lg = require('./log');
const fs = require('fs-extra');
const Zip = require('adm-zip');
const db = require('./db');

router.use(function timeLog(req, res, next) {
  // console.log('Time: ', Date.now());
  next();
});

router.get('/grid_ids.txt', function (req, res) {
  db.select().from('titles').then(data => {
    let file = "";
    for(d in data){
      file += `${data[d].x},${data[d].y},${data[d].grid_id}\n`;
    }
    res.send(file);
  }).catch(err=>res.sendStatus(503));
});

router.post('/session', function (req, res) {
  try {
    if (Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  } catch (e) {
    return res.status(400).send(JSON.stringify(e));
  }

  let error = 0;
  for (let f in req.files) {
    let file = req.files[f];
    let name = file.name;
    if (!name.includes('.zip')) return res.status(408).send('not zip archieve');
    try {
      fs.mkdirSync(`${process.env.SESSION_FOLDER}`, {recursive: true});
    } catch (e) {

    }
    try {
      fs.mkdirSync(`${process.env.MAP_FOLDER}`, {recursive: true});
    } catch (e) {

    }
    try {
      fs.mkdirSync(`${process.env.TMP_SESSION_FOLDER}`, {recursive: true});
    } catch (e) {

    }



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
    return res.status(500).send(JSON.stringify(error))
  }
  return res.send('File uploaded!');
});

module.exports = router;

async function unzip(file) {
  let zip = new Zip(`${process.env.TMP_ARCHIEVE_FOLDER}/${file}`);
  // let zipEntries = zip.getEntries();
  zip.extractAllTo(/*target path*/`${process.env.TMP_SESSION_FOLDER}`, /*overwrite*/true);
  fs.unlink(`${process.env.TMP_ARCHIEVE_FOLDER}/${file}`, (err) => {
    if(err) lg.error(err);
  })
}
