require('dotenv').config();

const db = require('./db');
const lg = require('./log');
const fs = require('fs-extra');

function read(path) {
  fs.readdir(path, (err, files) => {
    if (err) return err;
    files.forEach((f) => {
      toMap(`${path}/${f}`)
    })
  })
}

async function toMap(path) {
  lg.debug(`${path}`);
  if (fs.existsSync(`${path}/ids.txt`)) {
    let idsTmp = fs.readFileSync(`${path}/ids.txt`, 'utf8');
    idsTmp = idsTmp.split('\n');
    let ids = [];
    let grids = [];
    idsTmp.forEach(id => {
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
    let knownGrids = await checkGrids(grids);
    // lg.debug(knownGrids);
    if (knownGrids.length === 0) {
      lg.debug('Создаю новый слой');
      let layoutId = await createNewLayout();
      ids.forEach((i) => i.layout_id = layoutId[0]);
      await addCoords(ids);
    } else {
      ids = setCoord(ids, knownGrids)
    }
    ids.forEach((item) => {
      let source = `${path}/tile_${item.offset_x}_${item.offset_y}.png`;
      let dest = `${process.env.MAP_9_FOLDER}/tile_${item.x}_${item.y}.png`;
      fs.copyFile(source, dest, (err) => {
        if(err) lg.error(err);
      })
    })
  }
}

function setCoord(ids, knownGrids) {
  let knownTitle = knownGrids[0];
  let knownTitleOffset = ids.find((curr, i, arr) => {
    return curr.grid_id === knownTitle.grid_id;
  });
  let zeroTitleX = knownTitle.x - knownTitleOffset.x;
  let zeroTitleY = knownTitle.y - knownTitleOffset.y;
  let zeroTitle;
  ids.forEach((curr, i) => {
    if (curr.grid_id === knownTitle.grid_id) zeroTitle = i;
  });
  lg.debug('zeroTitle', zeroTitle);
  ids[zeroTitle].x = zeroTitleX;
  ids[zeroTitle].y = zeroTitleY;
  ids.forEach((item, i) => {
    if (item.grid_id !== knownTitle.grid_id) {
      item.x = zeroTitleX - item.x;
      item.y = zeroTitleY - item.y;
    }
  });


  return ids
  //   .filter((item) => {
  //   return gridsArr.indexOf(item.grid_id) === -1
  // });


  // lg.debug(zeroTitle);
  // ids.forEach()

}

async function addCoords(ids) {
  return db('titles').insert(ids)
}

async function createNewLayout() {
  return db('layouts').insert({name: Date().toString()})
}

async function checkGrids(grids) {
  let sql = db.select().from('titles').whereIn('grid_id', grids);
  lg.debug(sql.toString());
  let result = await sql;
  // lg.debug(result);
  return result;
}


read(`${process.env.TMP_SESSION_FOLDER}`);
