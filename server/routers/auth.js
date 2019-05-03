const session = require('express-session');
const express = require('express');
const fs = require('fs');
const passwordHash = require('password-hash');
const path = require("path");

const sessionConfig = {
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}
const AUTH_FILE_NAME = path.join(__dirname, '../db', 'auth.json');
let USERNAME = 'admin';
let PASSWORD = 'admin';
let PASSWORDHASH = passwordHash.generate(PASSWORD);

function authFunction(req, res, next) {
    if (req.session && req.session.user === USERNAME && req.session.admin && req.session.hashedPassword === PASSWORDHASH)
      return next();
    else
      return res.redirect('/auth/login');
  }; 

function authFunctionAjax(req, res, next) {
    if (req.session && req.session.user === USERNAME && req.session.admin && req.session.hashedPassword === PASSWORDHASH)
        return next();
    else
        return res.sendStatus(401);
}; 

function init() {
    const router = express.Router();

    if(!fs.existsSync(AUTH_FILE_NAME)) {
        console.log("File not found");
        USERNAME = 'admin';
        PASSWORD = 'admin';
        PASSWORDHASH = passwordHash.generate(PASSWORD);
    }
    
    // The file *does* exist
    else {
    // Read the file and do anything you want
        data = fs.readFileSync(AUTH_FILE_NAME);
        fileData = JSON.parse(data);
        USERNAME = fileData.USERNAME;
        PASSWORD = fileData.PASSWORD;
        PASSWORDHASH = passwordHash.generate(PASSWORD);
    }

    router
        .route('/login')
            .post(postLogin)
            .get(getLogin);
    router
        .route('/new')
            .post(postNewLogin);
    router
        .route('/logout')
            .get(getLogout);
    router
        .route('/loginapp')
            .post(postLoginApp);        
    router
        .route('/checkLogged')
            .get(checkLogged);        
    
    return router;

    function checkLogged(req, res) {
        authFunctionAjax(req, res, function() {
            res.sendStatus(200);
        })
    }

    function postNewLogin(req, res) {
        const username = req.body.login;
        const password = req.body.password;
        USERNAME = username;
        PASSWORD = password;
        PASSWORDHASH = passwordHash.generate(PASSWORD);
        const data = {
            USERNAME: USERNAME,
            PASSWORD: PASSWORD
        };
        fs.writeFile(AUTH_FILE_NAME, JSON.stringify(data), (err) => {  
            if (err) throw err;
            console.log('Data written to file');
            req.session.destroy();

            res.redirect("/admin"); 
        });

        
    }

    function postLoginApp(req, res) {
        const username = req.body.login;
        const password = req.body.password;
        let status = "401";
        
        if(username && password && username === USERNAME && passwordHash.verify(password, PASSWORDHASH)) {
            req.session.user = USERNAME;
            req.session.hashedPassword = PASSWORDHASH;
            req.session.admin = true;
            status = '200';
        } 
        res.sendStatus(status); 
    }
    function postLogin(req, res) {
        const username = req.body.login;
        const password = req.body.password;
        let redirectUrl = "/auth/login";
        
        if(username && password && username === USERNAME && passwordHash.verify(password, PASSWORDHASH)) {
            req.session.user = USERNAME;
            req.session.hashedPassword = PASSWORDHASH;
            req.session.admin = true;
            redirectUrl = "/admin";
        } 
        res.redirect(redirectUrl); 
    }

    function getLogin(req, res) {
        res.render('pages/loginPage', {
            page: 'loginPage'
        });
    }

    function getLogout(req, res) {
        req.session.destroy();
        res.redirect("/admin"); 
    }
}

module.exports = {
    init: init,
    sessionConf: session(sessionConfig),
    authFunction: authFunction,
    authFunctionAjax: authFunctionAjax
};