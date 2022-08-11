const ApiError = require("../exceptions/api-error");

module.exports = function(err, req, res, next) {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({message: err.message, errors: err.errors });
  } else if (err.kind === "ObjectId"){
    return res.status(400).json({ message: "Invalid Id" });
  } else if (err._message.split(" ")[1] === "validation"){ // error message ex: "Post validation failed"
    return res.status(400).json({ message: "Credentials are required" });
  }
  return res.status(500).json({ message : 'Server error' });
}