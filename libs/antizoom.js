const lg = require('./log');
const shell = require('shelljs');
const fs = require('fs-extra');
const cron = require('node-cron');

function enumeration(start, max, mod, folder = `${process.env.MAP_FOLDER}/9`) {
  for (let i = 8; i > 0; i--) {
    for (let x = start; x <= max; x += mod) {
      for (let y = start; y <= max; y += mod) {
        // lg.debug('=======================');
        // lg.debug(`${x}.${y}; ${x + 1}.${y}`);
        // lg.debug(`${x}.${y + 1}; ${x + 1}.${y + 1}`);
        // lg.debug(`New coord: ${x / 2}.${y / 2}`);
        appendImages([
          `${process.env.MAP_FOLDER}/${i + 1}/tile_${x}_${y}`,
          `${process.env.MAP_FOLDER}/${i + 1}/tile_${x + 1}_${y}`,
          `${process.env.MAP_FOLDER}/${i + 1}/tile_${x}_${y + 1}`,
          `${process.env.MAP_FOLDER}/${i + 1}/tile_${x + 1}_${y + 1}`
        ], x / 2, y / 2, i)
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

function appendImages(arr, new_x, new_y, lvl) {
  let tmp1 = makeid(10);
  let tmp2 = makeid(10);
  let tmp3 = makeid(10);
  let blackCount = 0;
  for (let i in arr) {
    if (!fs.existsSync(arr[i])) {
      arr[i] = './black.png';
      blackCount++;
    }
  }
  if (blackCount === 4) return;
  shell.exec(`convert ${arr[0]} ${arr[1]} +append ${tmp1}`);
  shell.exec(`convert ${arr[2]} ${arr[3]} +append ${tmp2}`);
  shell.exec(`convert ${tmp1} ${tmp2} -append ${tmp3}`);
  shell.exec(`convert ${tmp3} -resize 100x100 ${process.env.MAP_FOLDER}/${lvl}/tile_${new_x}_${new_y}.png`);
}



module.exports = cron.schedule('* * * * * *', () => {
  enumeration(-10, 10, 2, `${process.env.MAP_FOLDER}/9`);
});
