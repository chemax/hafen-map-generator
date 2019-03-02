require('dotenv').config();

const q = require('./libs/query');
const lg = require('./libs/log');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const shell = require('shelljs');
const sleep = require('sleep');


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function read(path) {
  lg.debug('Читаю список сессий');
  let files = fs.readdirSync(path);

  asyncForEach(files, async (f) => {
    try {
      await toMap(path, f);
    } catch (e) {
      lg.error('toMap', e)
    }
  })

  // files.forEach(async (f) => {
  //   try {
  //     return await toMap(path, f);
  //   } catch (e) {
  //     lg.error(e);
  //   }
  // })
}

async function toMap(path2, f) {
  let path = `${path2}/${f}`;
  let readdir = fs.readdirSync(path);
  if (readdir.length < 8) return rimraf(path, fs, (err) => {
    if (err) lg.error(err)
  });

  if (fs.existsSync(`${path}/ids.txt`)) {
    let ids = [];
    let layoutName;
    let grids = [];
    let idstmp = [];
    let z = fs.readFileSync(`${path}/ids.txt`, 'utf8').split('\n');
    if (z.length > 1) {

      z.forEach(id => {
        let i = id.split(',');
        if (i.length < 3) {
        } else {
          // lg.debug(i[2]);
          idstmp.push(i[2])
        }
      });

      let sorted_arr = idstmp.slice().sort();
      let results = [];
      for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] === sorted_arr[i]) {
          results.push(sorted_arr[i]);
        }
      }

    }


    fs.readFileSync(`${path}/ids.txt`, 'utf8').split('\n').forEach(id => {
      let i = id.split(',');
      if (i.length < 3) {
      } else {
        grids.push(i[2]);
        ids.push({
          x: i[0],
          y: i[1],
          offset_x: i[0],
          offset_y: i[1],
          grid_id: i[2]
        })
      }

    });
    if (ids.length < 8) {
      rimraf(path, fs, (err) => {
        if (err) lg.error(err)
      });
      return lg.error('Слишком короткий массив данных');
    }
    // return;
    let rightIds = [];
    let knownGrids;
    try {
      knownGrids = await q.checkGrids(grids);
    } catch (e) {
      return lg.error('checkGrids', e);
    }
    let layoutId;

    if (knownGrids.length === 0) {
      return
    } else {
      let newCoord = await setCoord(ids, knownGrids);
      if (!newCoord) return;
      ids = newCoord.ids;
      layoutName = newCoord.layoutName;
      layoutId = newCoord.layoutId;
      // lg.warn(layoutName);
    }
    try {
      fs.mkdirSync(`${process.env.MAP_FOLDER}${layoutName}/9`);
    } catch (e) {
      lg.error(e)
    }

    ids.forEach((item) => {
      rightIds.push({grid_id: item.grid_id, x: item.x, y: item.y, layout_id: layoutId});
      let source = `${path}/tile_${item.offset_x}_${item.offset_y}.png`;
      let dest = `${process.env.MAP_FOLDER}${layoutName}/9/tile_${item.x}_${item.y}.png`;
      lg.debug(`Copy tyle from ${source} to ${dest}`);
      fs.copyFile(source, dest, (err) => {
        if (err) {
          lg.error(err);
          lg.error(layoutName);
        }
      })
    });

    try {

      shell.exec(`find ${path2}/ -type d -empty -delete`);
      shell.mv('-f', `${path}/`, `${process.env.SESSION_FOLDER}/`);
      shell.mv('-f', `${path}/*`, `${process.env.SESSION_FOLDER}/${f}/`)

      // shell.exec(`mv ${path}/ ${process.env.SESSION_FOLDER}/ -r`)
    } catch (e) {
      lg.error(e);
      lg.error(`${path}/`);
      lg.error(`${process.env.SESSION_FOLDER}/`)
    }

    // .then().catch(e => lg.error(path, process.env.SESSION_FOLDER, e));
    try {
      await q.addCoords(rightIds);
    } catch (e) {
      lg.error('addCoords', e);
    }

  }
}

//
// async function getLayoutName(id) {
//   return db('layouts').select().where('id', id);
// }

async function setCoord(ids, knownGrids) {
  let knownTitle = knownGrids[0];

  let knownTitleOffset = ids.find((curr, i, arr) => {
    // lg.debug(knownTitle.grid_id, curr.grid_id);
    return curr.grid_id === knownTitle.grid_id;
  });
  let zeroTitleX = knownTitle.x - knownTitleOffset.x;
  let zeroTitleY = knownTitle.y - knownTitleOffset.y;
  // lg.debug('knownTitleOffset', knownTitleOffset);
  // lg.debug('knownTitle', knownTitle);
  let layoutId = knownTitle.layout_id;
  let layoutName;
  try {
    layoutName = await q.getLayoutName(layoutId);
  } catch (e) {
    return lg.error('getLayoutName', e);
  }
  if (layoutName[0]) {
    layoutName = layoutName[0].name;
  } else {
    return;
  }

  let zeroTitle;
  ids.forEach((curr, i) => {
    if (curr.grid_id === knownTitle.grid_id) zeroTitle = i;
  });
  // lg.debug('zeroTitle', zeroTitle);
  ids[zeroTitle].x = zeroTitleX;
  ids[zeroTitle].y = zeroTitleY;
  ids.forEach((item, i) => {
    if (item.grid_id !== knownTitle.grid_id) {
      // lg.warn(item);
      item.x = parseInt(zeroTitleX) + parseInt(item.x);
      item.y = parseInt(zeroTitleY) + parseInt(item.y);
      item.layout_id = layoutId;
    } else {
      delete ids[i];
    }
  });


  return {ids: ids, layoutName: layoutName, layoutId: layoutId}

}

// let interval = setInterval(() => {
//   lg.debug('generate time!');
//   read(`${process.env.TMP_SESSION_FOLDER}`);
// }, 10000);
read(`${process.env.TMP_SESSION_FOLDER}`);
