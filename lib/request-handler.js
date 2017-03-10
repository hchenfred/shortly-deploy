var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }
  
  Link.findOne({'url': uri}).exec(function(found) {
  // new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          visit: 0
        });

        newLink.save(function(err, link) {
          console.log('saving now ==================-------------');
          res.status(200).send(link);
        });

        // newLink.save().then(function(newLink) {
        //   Links.add(newLink);
        //   res.status(200).send(newLink);
        // });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username': username})
    .exec(function(err, user) {
      console.log('this is loginUser:', user);
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(isMatch) {
          console.log('===========', username, password, isMatch);
          if (isMatch) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
        // .then(function(isMatch) {
        //   if (isMatch) {
        //     util.createSession(req, res, user);
        //   } else {
        //     res.redirect('/login');
        //   }
        // })
        // .catch(function(error) {
        //   console.log('There is error when logging in user: ', error);
        // });
      }
    });


  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username': username})
    .exec(function(err, user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, newUser) {
          console.log('newUser is******************88 ', newUser);
          util.createSession(req, res, newUser);
          // res.send(302, newUser);
        });
      } else {
        res.redirect('/');
      }
    });
};
//   new User({ username: username })
//     .fetch()
//     .then(function(user) {
//       if (!user) {
//         var newUser = new User({
//           username: username,
//           password: password
//         });
//         newUser.save()
//           .then(function(newUser) {
//             Users.add(newUser);
//             util.createSession(req, res, newUser);
//           });
//       } else {
//         console.log('Account already exists');
//         res.redirect('/signup');
//       }
//     });
// };


exports.navToLink = function(req, res) {
  console.log('code is ===============', req.params[0]);
  Link.findOne({ code: req.params[0] }).then(function(link) {
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};