
function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded." });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}

module.exports = { uploadFile };