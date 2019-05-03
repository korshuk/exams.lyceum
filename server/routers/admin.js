const express = require('express');
const DataService = require('../dataService')

function init() {
    const router = express.Router();

    router.route('/lists.html')
        .get(function (req, res) {
            res.render('pages/lists', {
                page: 'lists',
                corps: DataService.db.corpsesS,
                dictionary: DataService.generateDictionary()
            })
        });
    router.route('/cleandata.html')
        .get(function (req, res) {
            res.render('pages/cleandata', {
                page: 'cleandata'
            })
        });
    router.route('/settings.html')
        .get(function (req, res) {
            res.render('pages/settings', {
                page: 'settings'
            })
        });    
    router.route('/')
        .get(function (req, res) {
            res.render('pages/index', {
                page: 'index'
            })
        });
    return router;
}


module.exports = {
    init: init
};