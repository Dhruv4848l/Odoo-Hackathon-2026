/**
 * Auto emission calculator based on EmissionFactors. (Dev A - Rule 7.1)
 */
exports.calculateEmission = (activityValue, factor) => {
  return activityValue * factor;
};
