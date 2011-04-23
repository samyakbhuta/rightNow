/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

/**
 * Schema definition
 */

var UpdateSchema = new Schema({
    id	      : ObjectId	
  , timestamp : Date
  , location  : String
  , activity  : String
});


mongoose.model('Update', UpdateSchema);
exports.myModel = mongoose.model('Update');



