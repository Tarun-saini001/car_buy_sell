const responseHandler = (req, res, next) => {
  res.success = (data = {}) => {
    res.status(200).json({
      message: data.message || "Your request successfully executed",
      data: data.data ?? null,
      statusCode: 200
    })
  }
  res.internalServerError = (data = {}) => {
    res.status(500).json({
      message: data.message || " internal server error",
      data: data.dat ?? null,
      statusCode: 500
    })
  }
  res.unautherized = (data = {}) => {
    res.status(401).json({
      message: data.message || "you are not autherized to access the request",
      data: data.data ?? null,
      statusCode: 401
    })
  }
  res.recordNotFound = (data = {}) => {
    res.status(404).json({
      message: data.message || "no data found",
      data: data.data ?? null,
      statusCode: 404
    })
  }
  res.validation = (data = {}) => {
    res.status(400).json({
      message: data.message || "invalid request",
      statusCode: 400
    })
  }
  next();
}

module.exports = { responseHandler }