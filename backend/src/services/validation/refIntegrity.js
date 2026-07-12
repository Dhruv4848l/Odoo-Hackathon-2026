const mongoose = require('mongoose');

/**
 * Reference integrity validation service. (Shared)
 */
exports.validateRefExists = async (Model, id) => {
  if (!id) return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const exists = await Model.exists({ _id: id });
  return !!exists;
};
