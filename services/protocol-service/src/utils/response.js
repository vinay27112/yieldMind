export const success = (res, data, statusCode = 200, message = "Success") => {
  res.status(statusCode).json({ message, data });
};

export const error = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ message });
};
