function buildStoragePath(folder, fileName) {
  const safeName = String(fileName || "upload.png").replace(/\s+/g, "_");
  return `/${folder}/${Date.now()}_${safeName}`;
}

function uploadImage({ folder, fileName, dataUrl }) {
  return {
    url: dataUrl,
    storagePath: buildStoragePath(folder, fileName)
  };
}

module.exports = {
  uploadImage,
  buildStoragePath
};
