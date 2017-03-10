var mongoose = require('mongoose');
var db = require('../config');
var crypto = require('crypto');

var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/shortlydb', (err) => {
  if (err) {
    console.log('error connecting with mongodb: ', err);
  }
  console.log('success connecting with mongodb================>>');
});

var linkSchema = new Schema({
  url: String,
  title: String,
  baseUrl: String,
  visit: Number,
  code: String
});
// pre                                                                                                                                                                         
linkSchema.pre('save', function(next) {  
  console.log('entering first middleware (pre save)');
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);                                                                                                                                                 
  next();                                                                                                                                                                     
});    



var Link = mongoose.model('Link', linkSchema);
console.log('link table is created');

// var newLine = new Link({url: 'http://www.roflzoo.com/'});
// newLine.save(function(err) {
//   if (err) {
//     throw err;
//   }
//   console.log('new link is saved');
// });

// Link.findOne({'url': 'http://www.roflzoo.com/'})
// .then(function(result) {
//   console.log('output of findOne', result, result.url);
// });

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

module.exports = Link;
