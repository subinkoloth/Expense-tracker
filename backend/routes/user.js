const express = require("express");

const UserModel = require("../models/userModel");
const SaveData = require("../models/saveData");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // To generate Token
const tokenSecret = process.env.JWT_KEY || "raghav_garg_first_mean_project_this_can_be_anything";

const authMiddleware = require('../middleware/expenseMiddleWare');


router.post("/SIGN_UP", (req, res, next) => {
  //   console.log(req.body);
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const User = new UserModel({
        name: req.body.name,
        username: req.body.username,
        gmail: req.body.gmail,
        password: hash, //the password should be encrypted so that no one can access the user account not even us(Admin)
        userFirstSignUp: req.body.userFirstSignUp,
        category: [...req.body.category],
      });
      User.save()
        .then((result) => {
          const token = jwt.sign(
            { gmail: result.gmail, userId: result._id },
            tokenSecret,
            { expiresIn: '1h' } // 1 hour
          );
          res.status(200).json({
            message: "Account Created",
            status: true,
            data: {
              UserSince: result.userFirstSignUp,
              username: result.username,
              name: result.name,
              token: token,
              expiredToken: 3600,
              userId: result._id,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            message: 'Failed to create user',
            error: err.message,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

router.post("/LOGIN", (req, res, next) => {
  UserModel.findOne({ gmail: req.body.gmail })
    .then((user) => {
      if (!user) {
        //app crash now good..
        return res.status(401).json({
          message: "Invalid Email Address",
          status: false,
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((validate) => {
          if (!validate) {
            return res.status(401).json({
              message: "Invalid Email Address or Password",
              status: false,
            });
          }
          //Valid Case generate token
          const token = jwt.sign(
            { gmail: user.gmail, userId: user._id },
            tokenSecret,
            { expiresIn: '1h' } // 1 hour
          );
          res.status(200).json({
            message: "Login Successfully!",
            data: {
              token: token,
              latestLoginDate: new Date(),
              userId: user._id,
              email: user.gmail,
              expiredToken: 3600,
            },
            status: true,
          });
        })
        .catch((err) => {
          return res.status(401).json({
            message: "Something Went Wrong! Please Try Again",
            status: false,
          });
        });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Something Weird! Please Try Again",
        status: false,
      });
    });
});

router.delete("/DELETE_ACCOUNT/:id", (req, res, next) => {
  UserModel.findOneAndDelete({ _id: req.params.id })
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "User not found",
          status: false,
        });
      }
      res.status(200).json({
        message: "Successfully deleted account",
        status: true,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
        status: false,
      });
    });
});

router.get("/APP_VERSION", (req, res, next) => {
  res.status(200).json({
    message: 'App Version successfully fetched',
    version: 'v1.1.0',
    status: true,
  });
});


router.post('/SAVE_DATA', (req, res, next) => {
  const allData = new SaveData({
    username: req.body.username,
    name: req.body.name,
    firstLoginDate: req.body.firstLoginDate,
    lastLoginDate: req.body.lastLoginDate,
    userId: req.body.userId,
    expenseLogged: req.body.expenseLogged,
  });
  UserModel.updateOne({ _id: req.body.userId }, {
    $push: { userData: allData }
  }).then((result) => {
    res.status(200).json({
      message: 'Save',
      status: true,
    })
  }).catch((err) => {
    res.status(501).json({
      message: err,
      status: false,
    });
  });
});

router.get('/GET_SAVE_DATA/:id', (req, res, next) => {
  UserModel.findOne({ _id: req.params.id },).then((user) => {
    res.status(200).json({
      message: 'Fetch one',
      data: user.userData[0],
      status: true,
    })
  })
    .catch((err) => {
      res.status(501).json({
        message: err,
        status: false,
      })
    })
});

module.exports = router;
