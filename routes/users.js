var express = require('express');
var router = express.Router();
const sqlite = require('sqlite3').verbose();
var models = require('../models');
const auth = require('../config/auth');
const passport = require('passport');
const connectEnsure = require('connect-ensure-login');

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get("/signup", function (req, res, next) {
  res.render('signup')
});

router.post('/signup', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users.findOne({
    where: {
      Username: req.body.username
    }
  }).then(user => {
    if (user) {
      res.send('this user already exists')
    } else {
      models.users.create({
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Username: req.body.username,
        Password: req.body.password
      }).then(createdUser => {
        const isMatch = createdUser.comparePassword(req.body.password);
        if (isMatch) {
          const userId = createdUser.UserId
          console.log(userId);
          const token = auth.signUser(createdUser);
          res.cookie('jwt', token);
          res.redirect('profile/' + userId)
        } else {
          console.error('not a match');
        }

      });
    }
  });

});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users.findOne({
    where: {
      Username: req.body.username,
      Password: req.body.password
    }
  }).then(user => {
    const isMatch = user.comparePassword(req.body.password)
    console.log('login found a user')
    if (!user) {
      return res.status(401).json({
        message: "Login Failed"
      });
    }
    if (isMatch) {
      const userId = user.UserId;
      const token = auth.signUser(user);
      res.cookie('jwt', token);
      res.redirect('profile/' + userId)
    } else {
      console.log(req.body.password);
      res.redirect('login')
    }

  });
});

router.get('/profile/:id', auth.verifyUser, function (req, res, next) {
  if (req.params.id !== String(req.user.UserId)) {
    res.send('This is not your profile')
  } else {
    res.render('profile', {
      FirstName: req.user.FirstName,
      LastName: req.user.LastName,
      Email: req.user.Email,
      UserId: req.user.UserId,
      Username: req.user.Username
    });
  }

});
router.get('/profile/:id', connectEnsure.ensureLoggedIn(), function (req, res) {
  if (req.user.UserId === parseInt(req.params.id)) {
    res.render('profile', {
      FirstName: req.user.FirstName,
      LastName: req.user.LastName,
      Email: req.user.Email,
      UserId: req.user.UserId,
      Username: req.user.Username
    });
  } else {
    res.send('This is not your profile');
  }
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/profile/login'
}),
  function (req, res, next) {
    res.redirect('profile/' + req.user.UserId);
  }
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/profile/login');
});

router.get('/users/admin',
  // requireAdmin(), passport.authenticate('local'), 
  function (req, res, next) {
    models.users.findAll({}).then(usersFound => {
      res.render('adminProfile', {
        users: usersFound
      });
    });
  });

router.get('/profile/:id',
  // requireAdmin(), passport.authenticate('local'), 
  connectEnsure.ensureLoggedIn(), function (req, res) {
    if (req.user.UserId === parseInt(req.params.id)) {
      res.render('profile', {
        FirstName: req.user.FirstName,
        LastName: req.user.LastName,
        Email: req.user.Email,
        UserId: req.user.UserId,
        Username: req.user.Username,
        Admin: req.user.Admin
      });
    } else {
      res.send('You do not have Admin access');
    }
  });

router.delete('/adminProfile/:id/delete',
  // requireAdmin(), passport.authenticate('local'), 
  (req, res) => {
    let userId = parseInt(req.params.id);
    models.users
      .update(
        {
          Deleted: 'true'
        },
        {
          where: {
            UserId: userId
          }
        }
      )
      .then(user => {
        models.users
          .update(
            {
              Deleted: 'true'
            },
            {
              where: {
                UserId: userId
              }
            }
          )
          .then(user => {
            res.redirect('/users');
          });
      });
  });


module.exports = router;
