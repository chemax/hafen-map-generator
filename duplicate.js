const fs = require('fs-extra');


fs.readdir(path, (err, files) => {
  if (err) return lg.error(err);
  files.forEach((f) => {
    try {
      toMap(path, f)
    } catch (e) {
      lg.error(e);
    }
  })
})