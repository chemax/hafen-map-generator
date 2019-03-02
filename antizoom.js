require('dotenv').config();
const lg = require('./libs/log');
const shell = require('shelljs');
const fs = require('fs-extra');
const cron = require('node-cron');

function enumeration(start, max, mod, layout = `land`) {
  lg.debug('hi');
  for (let i = 8; i > 0; i--) {
    for (let x = start; x <= max; x += mod) {
      for (let y = start; y <= max; y += mod) {
        // lg.debug('=======================');
        // lg.debug(`${x}.${y}; ${x + 1}.${y}`);
        // lg.debug(`${x}.${y + 1}; ${x + 1}.${y + 1}`);
        // lg.debug(`New coord: ${x / 2}.${y / 2}`);
        try{
          fs.mkdirSync(`${process.env.MAP_FOLDER}${layout}/${i + 1}`);
        } catch (e) {

        }
        appendImages([
          `${process.env.MAP_FOLDER}${layout}/${i + 1}/tile_${x}_${y}.png`,
          `${process.env.MAP_FOLDER}${layout}/${i + 1}/tile_${x + 1}_${y}.png`,
          `${process.env.MAP_FOLDER}${layout}/${i + 1}/tile_${x}_${y + 1}.png`,
          `${process.env.MAP_FOLDER}${layout}/${i + 1}/tile_${x + 1}_${y + 1}.png`
        ], x / 2, y / 2, i, layout)
      }
    }
  }

}

function makeid(l = 5) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < l; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function appendImages(arr, new_x, new_y, lvl, layout) {
  lg.debug('hi', arr);
  let tmp1 = '/tmp/' + makeid(10) + '.png';
  let tmp2 = '/tmp/' + makeid(10) + '.png';
  let tmp3 = '/tmp/' + makeid(10) + '.png';
  let blackCount = 0;
  for (let i in arr) {
    if (!fs.existsSync(arr[i])) {
      arr[i] = '/root/black.png';
      blackCount++;
    }
  }
  if (blackCount === 4) return lg.debug('nothing do');
  lg.debug(`/usr/bin/convert ${arr[0]} ${arr[1]} +append ${tmp1}`);
  shell.exec(`/usr/bin/convert ${arr[0]} ${arr[1]} +append ${tmp1}`);
  shell.exec(`/usr/bin/convert ${arr[2]} ${arr[3]} +append ${tmp2}`);
  shell.exec(`/usr/bin/convert ${tmp1} ${tmp2} -append ${tmp3}`);
  shell.exec(`/usr/bin/convert ${tmp3} -resize 100x100 ${process.env.MAP_FOLDER}${layout}/${lvl}/tile_${new_x}_${new_y}.png`);
  shell.rm(tmp1);
  shell.rm(tmp2);
  shell.rm(tmp3);
}


module.exports = cron.schedule('*/30 * * * *', () => {
  enumeration(-100, 100, 2, `land`);
});

let interval = setInterval(() => {
  lg.debug('antizoom time!');
  enumeration(-200, 200, 2, `land`);
}, 1800000);


// enumeration(-100, 100, 2, `land`);
