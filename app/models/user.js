var mongoose = require('mongoose');
var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, index: {unique: true}},
  password: String
});
userSchema.pre('save', function(next) {
  console.log('user middleware working now===============');
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      console.log('hashed password', hash);
      this.password = hash;
      return next();
    });
});

var User = mongoose.model('User', userSchema);


User.prototype.comparePassword = function(attemptedPassword, callback) {
  console.log('entering comparePassword', attemptedPassword);
  console.log('this is   ', this);
  var that = this;
  bcrypt.compare(attemptedPassword, that.password, function(err, isMatch) {
    console.log('isMatch  ', isMatch);
    console.log('attemptedPassword', attemptedPassword);
    console.log('comparePassword that.password', that.password);
    // console.log('comparePassword isMatch', isMatch);
    callback(isMatch);
  });
};

  
// User.prototype.comparePasswordAsync = Promise.promisify(User.prototype.comparePassword);

// ---------------------------------------------------
// var linkSchema = new Schema({
//   url: String,
//   title: String,
//   baseUrl: String,
//   visit: Number,
//   code: String
// });                                                                                                         
// linkSchema.pre('save', function(next) {  
//   console.log('entering first middleware (pre save)');
//   var shasum = crypto.createHash('sha1');
//   shasum.update(this.url);
//   this.code = shasum.digest('hex').slice(0, 5);                                                                                                                                                 
//   next();                                                                                                                                                                     
// });    
// var Link = mongoose.model('Link', linkSchema);
// ---------------------------------------------------

// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function() {
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function() {
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });

module.exports = User;



