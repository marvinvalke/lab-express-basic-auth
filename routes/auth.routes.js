const router = require("express").Router();
const UserModel = require('../models/User.model')
const bcrypt = require('bcryptjs');

// Route when the user click on Sign up
router.get('/signup', (req, res, next) => {
    res.render('auth/signup.hbs')
  })

//Post request for the user to sign up and store info
router.post('/signup' , (req,res,next)=>{
const {username, password} = req.body 

let passRegEx = /'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$'/
if (!passRegEx.test(password)) {
    res.render('auth/signup.hbs', {error: 'Please enter all minimum eight characters, at least one letter and one number for your password'})
}

const salt = bcrypt.genSaltSync(10) 
const hash = bcrypt.hashSync(password, salt)



UserModel.create({username, password: hash})
.then(() => {
    res.redirect('/')
})
.catch((err) => {
    next(err)
})

})

router.get('/login', (req,res,next)=>{
    res.render('../views/auth/login.hbs')
})


router.post('/login' , (req,res,next)=>{
    const {username, password} = req.body
    UserModel.find({username})
    .then((userResponse) => {
        if (userResponse.length) {
            let userObj = userResponse[0]
            let matches = bcrypt.compareSync(password, userObj.password);
            if (matches) {
                req.session.myProperty = userObj
                res.redirect('/account')
            } else {
                res.render('auth/login.hbs', {error: 'Ooopsy Password is not matching'})
                return;
            }
            
        } else {
            res.render('auth/login.hbs', {error: 'Username does not exist'})
            return;
            
        }
        
    }).catch((err) => {
        
    });

})

const isLoggedIn = (req, res, next) => {
    if (req.session.myProperty ) {
      //invokes the next available function
      next()
    }
    else {
      res.redirect('/login')
    }
}

router.get('/account',isLoggedIn, (req, res, next) => {
    let theUserName = req.session.myProperty  
    res.render('auth/account.hbs' , {username: theUserName.username})
})

router.get('/main',isLoggedIn, (req, res, next) => {
    let theUserName = req.session.myProperty  
    res.render('auth/main.hbs' , {username: theUserName.username})
})

router.get('/private',isLoggedIn, (req, res, next) => {
    let theUserName = req.session.myProperty  
    res.render('auth/private.hbs' , {username: theUserName.username})
})

module.exports = router