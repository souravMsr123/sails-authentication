/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt');
module.exports = {

  new: function (req, res) {
    //res.locals.flash = _.clone(req.session.flash);
    res.view();
    //req.session.flash = {};
  },
  create: function (req, res, next) {
    let body = req.body;

    if (body.confirmation !== body.password) {
      req.session.flash = {
        err: ["Password and Confirm Password does not match"]
      }
    } else {
      bcrypt.hash(body.password, 10, function (err, hash) {
        if (!err) {
          body.encryptedpassword = hash;
          User.create(body)
            .exec((err, user) => {
              if (err) {

                req.session.flash = {
                  err: err
                }
                console.log(err);

                res.redirect('/user/new');
              }
              res.redirect('/user/index');
              req.session.flash = {};


            })
        }
      });

    }



  },
  edit: function (req, res) {
    var id = req.param('id');
    console.log('id', id);

    User.findOne({
      id: id
    }).exec((err, user) => {
      if (err) {
        res.redirect('/user/index');
      }
      if (!user) {
        res.redirect('/user/index');
      }
      res.view({
        user: user
      });
    })


  },
  update: function (req, res) {
    var data = req.body;
    var id = req.param('id');

    console.log('data', data);

    if (data.admin) {
      var isAdmin = true;
    } else {
      var isAdmin = false;
    }

    User.findOne({
      id: id
    }).exec(async (err, user) => {
      if (err) {
        res.redirect('/user/edit/'.id);
      }
      if (!user) {
        res.redirect('/user/edit/'.id);
      }
      let updateUser = await User.updateOne({
        id: id
      }).set({
        title: data.title,
        name: data.name,
        email: data.email,
        admin: isAdmin
      })
      if (updateUser) {
        res.redirect('/user/index')
      } else {
        res.redirect('/user/edit/'.id)
      }
    })
  },
  delete: function (req, res) {

  },
  index: function (req, res) {
    User.find({})
      .exec((err, users) => {
        if (err) {
          res.redirect('/');
        }

        res.view({
          users: users
        });

        console.log('user session', req.session.User);
      })

  },

  login: function (req, res) {

    res.view();
  },
  signIn: function (req, res) {
    let body = req.body;
    User.findOne({
      email: body.email
    }).exec((err, user) => {
      if (err) {
        console.log('err', err);
      }
      console.log('user', user);

      if (!user) {
        res.redirect('/user/login');
      }
      bcrypt.compare(body.password, user.encryptedpassword, function (err, matched) {
        if (err) {

        }
        if (matched == true) {
          //console.log('user', user);

          req.session.User = user;
          res.redirect('/user/profile');
        }
      })
    })
  },
  profile: function (req, res) {
    if (req.session.User) {
      var user = req.session.User;
      res.view({
        user: user
      })
    }
  },
  logout: function (req, res) {
    req.session.User = '';

    res.redirect('/');
  }

};
