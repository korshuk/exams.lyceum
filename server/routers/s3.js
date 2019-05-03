
const express = require('express');
const fs = require('fs');
const path = require("path");

const DataService = require('../dataService');

const CLEAN_FILE_NAME = path.join(__dirname, '../db', 'clean-data.json');
const DB_FILE_NAME = path.join(__dirname, '../db', 'db.json');

function init() {
    const router = express.Router();
    router
        .route('/cleanData')
            .post(postCleanData)

    return router;

    function postCleanData(req, res) {
        if (!req.files) {
            return res.status(400).send('No files were uploaded.');
        }
    
        var uploadedFile = req.files.cleanDataFile;
        
        fs.writeFile(CLEAN_FILE_NAME, uploadedFile.data.toString(), (err) => {  
            if (err) throw err;
            setCleanData(JSON.parse(uploadedFile.data))
            res.redirect('/admin/');
        });
    }
}

function loadCleanData(appStart) {

    let fileData;

    fs.readFile(CLEAN_FILE_NAME, (err, data) => {  
        if (err) {
           fileData = [];
        } else {
            fileData = JSON.parse(data);
        }

        fs.readFile(DB_FILE_NAME, (err, data) => {  
            if (err) {

            } else {
                fileData = JSON.parse(data);
                setCleanData(fileData, appStart);
            }
        });        
    });
}

function setCleanData(data, next) {
    var json = data;
    readDbFromDisk(json, next)
}

function readDbFromDisk(obj, next) {
    if (obj) {
        DataService.setData(obj)
       
        updateDBFile(next);
    }
}

function updateDBFile(next) {
    const data = JSON.stringify(DataService.db);
    fs.writeFile(DB_FILE_NAME, data, (err) => {  
        if (err) throw err;
        console.log('Data written to file');
        if (next) {
            next(err, data);
        }
    });
}

module.exports = {
    init: init,
    loadCleanData: loadCleanData,
    updateDBFile: updateDBFile
};
