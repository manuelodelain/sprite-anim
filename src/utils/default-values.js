module.exports = function(scope, defaultValues, values){
  for (var key in defaultValues){
    scope[key] = typeof values[key] !== 'undefined' ? values[key] : defaultValues[key];
  }
};