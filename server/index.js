const express = require('express');
const auth = require('./auth');

//const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3000;
const fileUpload = require('express-fileupload');
const openDB = require('json-file-db');
const jsonfile = require('jsonfile');
const https = require("https");
const request = require("request");

const corpsesRouter = express.Router(); 
const pupilsRouter = express.Router();

const DataService = require('./dataService');
const S3Service = require('./routers/s3');

//const DB_DIRECTORY = './db/';
//const DB_FILE = './db/json.json';

let generateStatus = false;

const uploadRouter = S3Service.init();
const authRouter = require('./routers/auth').init();
const adminUiRouter = require('./routers/admin').init();

const sessionConf = require('./routers/auth').sessionConf;
const authFunction = require('./routers/auth').authFunction;
const authFunctionAjax = require('./routers/auth').authFunctionAjax;

S3Service.loadCleanData(appStart);

pupilsRouter.route('/')
    .get(function (req, res) {
        let responsePupils = getFilteredPupils(req, 'generated');
        sendResp(res, responsePupils);
    }) 
pupilsRouter.route('/:id')
    .options(function (req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.send(200);
    })
    .post(function (req, res) {
        const id = req.params.id;
        const length = DataService.db.pupilsS.length;
        let i = 0;

        for (i; i < length; i++) {
            if (DataService.db.pupilsS[i]._id === id) {
                DataService.db.pupilsS[i].examStatus = req.body.examStatus;
                
                request.post({
                        url: 'https://lyceum.by/admin/pupils/api/examStatus/' + id,
                    //    url: 'http://localhost:3000/admin/pupils/api/examStatus/' + id,
                        form: req.body
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            S3Service.updateDBFile();                            
                            sendResp(res, 'ok')
                        }
                    }
                );
                
                
                return;
            }
        }
        sendResp(res, {error: 'nothing found'});
}) 
        
pupilsRouter.route('/saved')
    .get(function (req, res) {
        let responsePupils = getFilteredPupils(req, 'saved');
        sendResp(res, responsePupils);
    })
pupilsRouter.route('/search/:type/')
    .get(function (req, res) {
        const type = req.params.type;
        const search = req.query.search;
        let data = [];
        
        let pupilsArray = getPupilArrayByType(type);

        if (search.length > 0) {
            data = pupilsArray
                        .filter(function(pupil){
                            return pupil.firstName.toLowerCase().indexOf(search.toLowerCase()) > -1;
                        })
                        /*.map(function(pupil){
                            pupil.profile = 'df';
                            return pupil;     
                        });*/
        }
        sendResp(res, data);
    });       


corpsesRouter.route('/')
    .get(function (req, res) {
        sendResp(res, DataService.db.corpsesG);
    });
corpsesRouter.route('/saved')
    .get(function (req, res) {
        sendResp(res, DataService.db.corpsesS);
    });       
corpsesRouter.route('/:id')
    .get(function (req, res) {
        const id = req.params.id;
        const length = DataService.db.corpsesG.length;
        let i = 0;

        for (i; i < DataService.db.corpsesG.length; i++) {
            if (DataService.db.corpsesG[i].alias === id) {
                sendResp(res, DataService.db.corpsesG[i])
                return;
            }
        }
        sendResp(res, {error: 'nothing found'});
    });
corpsesRouter.route('/saved/:id')
    .get(function (req, res) {
        const id = req.params.id;
        const length = DataService.db.corpsesS.length;
        let i = 0;

        for (i; i < DataService.db.corpsesS.length; i++) {
            if (DataService.db.corpsesS[i].alias === id) {
                sendResp(res, DataService.db.corpsesS[i])
                return;
            }
        }
        sendResp(res, {error: 'nothing found'});
    });    
corpsesRouter.route('/print/:id.html')
    .get(function(req, res){
        const id = req.params.id;
        const length = DataService.db.corpsesS.length;
        let i = 0;

        for (i; i < DataService.db.corpsesS.length; i++) {
            if (DataService.db.corpsesS[i].alias === id) {
                const dictionary = DataService.generateDictionary();
                let responsePupils = JSON.parse(JSON.stringify(DataService.db.pupilsS));

                responsePupils = responsePupils
                    .filter(function(pupil){
                        if (+req.query.index > -1) {
                            var isInCorps = pupil.corps === id;
                            
                            var audienceName = dictionary.audiences[ pupil.audience ];
                            var isInSubCorps = true;
                            if (audienceName) {
                                isInSubCorps = +(audienceName.split('_')[0]) === +req.query.index
                            }
                            return isInCorps && isInSubCorps
                        } else {
                            return pupil.corps === id;
                        }
                        
                    })
                    .sort(function(a,b){
                        if (a.audience < b.audience) {
                            return -1;
                        }
                        if (a.audience > b.audience) {
                            return 1;
                        }
                        return 0;
                    })

                res.render('pages/corpsPrint', {
                    corpsIndex: req.query.index,
                    pupils: responsePupils,
                    corps: DataService.db.corpsesS[i],
                    dictionary: DataService.generateDictionary()
                })
                return;
            }
        }
        res.render('pages/notFound')
    });

function appStart() {
    express()
    .use(sessionConf)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(express.static(path.join(__dirname, 'public')))
    .use(fileUpload())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .use('/admin', authFunction, adminUiRouter)
    .use('/auth', authRouter)
    .use('/api/corpses', authFunctionAjax, corpsesRouter)
    .use('/api/pupils', authFunctionAjax, pupilsRouter)
    .use('/admin/upload', uploadRouter)
    .post('/api/changeaudience', authFunctionAjax, changeAudience)
    .get('/api/dictionary', authFunctionAjax, getDictionary)
    .get('/api/generate', authFunctionAjax, generate)
    .get('/api/savecurrentseats', authFunctionAjax, saveCurrentSeats)
    .get('/api/saved-seats.json', authFunctionAjax, returnSavedFile)
    .get('/api/generateStatus', authFunctionAjax, function (req, res) {
        sendResp(res, {
            generateStatus: generateStatus,
            timestemp: DataService.db.timestemp
        });
    })
    .get('/api/profiles', authFunctionAjax, function (req, res) {
        sendResp(res, DataService.db.profiles);
    })
    .get('/api/places', authFunctionAjax, function (req, res) {
        sendResp(res, DataService.db.places);
    })
    .listen(PORT, function() {
        console.log(`Listening on ${ PORT }`)
    });

}

function getPupilArrayByType(type) {
    if (type === 'generated') {
        return DataService.db.pupilsG;
    }
    if (type === 'saved') {
        return DataService.db.pupilsS
    }

}

function getFilteredPupils(req, type) {
    const query = req.query;
    const corpsQuery = query.corps;
    const placeQuery = query.place;

    let pupilsArray = getPupilArrayByType(type);

    let responsePupils = JSON.parse(JSON.stringify(pupilsArray));

    if (corpsQuery && corpsQuery.length) {
        responsePupils = responsePupils.filter(function(pupil){
            return pupil.corps === corpsQuery;
        });
    }

    if (placeQuery && placeQuery.length) {
        responsePupils = responsePupils.filter(function(pupil){
            return pupil.place === placeQuery;
        });
    }

    return responsePupils;
}

function sendResp(res, data) {
   /* res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");*/
    res.json(data);
}

function getDictionary (req, res) {
    const data = DataService.generateDictionary();

    sendResp(res, data)
}

function saveCurrentSeats(req, res) {
    var timestemp = req.query.time;
    DataService.db.timestemp = timestemp;
    DataService.db.pupilsS = JSON.parse(JSON.stringify(DataService.db.pupilsG));
    for (var i = 0; i < DataService.db.pupilsS.length; i++) {
        DataService.db.pupilsS[i].examStatus = undefined;
    }
    DataService.db.corpsesS = JSON.parse(JSON.stringify(DataService.db.corpsesG));
    S3Service.updateDBFile(function (err, data) {
        sendResp(res, {
            timestemp: DataService.db.timestemp
        });
    });

    
}

function saveseats(req, res) {
    DataService.db.pupilsS = JSON.parse(JSON.stringify(DataService.db.pupilsG))
    DataService.db.corpsesS = JSON.parse(JSON.stringify(DataService.db.corpsesG))
    sendResp(res, DataService.db.pupilsS)
}

function returnSavedFile(req, res) {
    var response = {
        pupils: DataService.db.pupilsS,
        corpses: DataService.db.corpsesS
    }
    
    sendResp(res, response)
}

function generate (req, res) {
    const profilesMap = createProfilesMap(DataService.db.profiles);
    const corpses = JSON.parse(JSON.stringify(DataService.db.corpses));
    
    let responseErrors = [];
    let responsePupils = [];
    let response = {};
    
    let i = 0, corps;
    let belErrors;
    let seededPupils;
    let corpsesLength = corpses.length;
    
    for (i; i < corpsesLength; i++) {
        belErrors = checkPlaces(corpses[i], profilesMap);
        responseErrors = responseErrors.concat(belErrors);
    }

    if (responseErrors.length > 0) {
        console.log('responseErrors', responseErrors)
        response = {
            errors: responseErrors
        };
    } else {
        for (i = 0; i < corpsesLength; i++) {
            seededPupils = seedPupilsInCorpse(corpses[i], profilesMap);
            console.log(i)
            responsePupils = responsePupils.concat(seededPupils);
        }

        response = {
            corpses: corpses
        };
    
        //TODO remove with save
    
        DataService.db.pupilsG = JSON.parse(JSON.stringify(responsePupils))
        DataService.db.corpsesG = JSON.parse(JSON.stringify(corpses))
    
        generateStatus = true;
        S3Service.updateDBFile();
    }

    

    console.log('send resp', response)
    sendResp(res, response)

}

function checkPlaces(corps, profilesMap) {
    const placesLength = corps.places.length;
    let profiledPupils;
    let belPupilsLength;
    let audienceForBelLang;
    let responseErrors = [];
    let i = 0, place, profileId, profile, max;

    for (i; i < placesLength; i++) {
        place = corps.places[i]
        profile = profilesMap[place._id];
        profileId = profile._id;
        profiledPupils = getProfiledPupils(profileId);
        belPupilsLength = profiledPupils.filter(function(pupil){
            return pupil.needBel === true
        }).length;

        audienceForBelLang = place.audience.filter((aud) => aud.bel === true)[0] 
        max = 0;
        if (audienceForBelLang) {
            max = audienceForBelLang.max;
        }
        if (max < belPupilsLength) {
            responseErrors.push({
                corpsName: corps.name,
                profileName: profile.name,
                belPupilsLength: belPupilsLength,
                audienceForBelLang: audienceForBelLang
            })
        }
    }

    return responseErrors;
}
function seedPupilsInCorpse(corps, profilesMap) {
    const placesLength = corps.places.length;
    let responsePupils = [];
    let seededPupils;
    let i = 0, place, profileId;
console.log('seedPupilsInCorpse', corps.name, placesLength)
    for (i; i < placesLength; i++) {
        place = corps.places[i]
        profileId = profilesMap[place._id]._id;
        seededPupils = seedPupilsInPlace(place, profileId, corps);
        responsePupils = responsePupils.concat(seededPupils);
    }

    return responsePupils;
}

function seedPupilsInPlace(place, profileId, corps) {
    let profiledPupils;
    profiledPupils = getProfiledPupils(profileId);
    generatePupilPicks(profiledPupils, place, corps);

    seedPupilsInAudiences(profiledPupils, {
        audiences: place.audience,
        placeId: place._id, 
        corpsId: corps.alias
    });
    return profiledPupils;
}

function getProfiledPupils (profileId, belLangFlag) {
    let pupils = JSON.parse(JSON.stringify(DataService.db.pupils)).filter(filterPupilsByProfileAndLang);       
    
    return  pupils;

    function filterPupilsByProfileAndLang(pupil) {
        let profileFlag = pupil.profile === profileId;

        return  profileFlag;
    }
}

function seedPupilsInAudiences(pupils, options) {
    const audiences = options.audiences;
    const audiencesLength = audiences.length;
    let i = 0;

    for(i; i < audiencesLength; i++) {
        seedPupilsInAudience(pupils, {
            audience: audiences[i],
            placeId: options.placeId,
            corpsId: options.corpsId,
        });
           
    }
}

function seedPupilsInAudience(pupils, options) {
    const audienceId = options.audience._id;
    const placeId = options.placeId;
    const corpsId = options.corpsId;
    const picks = options.audience.picks;
    const picksLength = picks.length;
    let i = 0, pick;

    for(i; i < picksLength; i++) {
        pick = picks[i];
        pupils[pick].audience = audienceId;
        pupils[pick].place = placeId;
        pupils[pick].corps = corpsId;
    } 
}

function generatePupilPicks(profiledPupils, place, corps) {
    let profiledPupilsLength = profiledPupils.length;
    let belPupilsLength = profiledPupils.filter(function(pupil){
        return pupil.needBel === true
    }).length;
    let numbersArr = [];
    let audiences = place.audience.sort(audienceSort); 
    
    let i = 0, picksArray;
    const audiencesLength = audiences.length;

    if (!corps.count) {
        corps.count = 0;
    }
    if (!place.count) {
        place.count = 0;
    }
    if (!corps.max) {
        corps.max = 0;
    }
    if (!place.max) {
        place.max = 0;
    }
    
    for (i; i < profiledPupilsLength; i++ ) { 
        numbersArr.push(i);
    }

    for (i = 0; i < audiencesLength; i++) {
        picksArray = generatePicksForAudience(audiences[i]);
        audiences[i].count = picksArray.length;
        audiences[i].picks = picksArray;
        console.log('generatePicksForAudience completed', audiences[i].name, audiences[i].count)
        place.count = place.count + picksArray.length;  
        place.max = place.max + audiences[i].max;        
    }
    corps.count = corps.count + place.count;
    corps.max = corps.max + place.max;

    function generatePicksForAudience(audience) {
        let audienceMax = audience.max;
        let picksArray = [];
        let randomIndex;
        let belAudienceFlag = audience.bel === true;
        let belPupilFlag;

        if (numbersArr.length <= audienceMax) {
            audienceMax = numbersArr.length
        }
        if (belAudienceFlag) {
            if (belPupilsLength <= audienceMax) {
                audienceMax = belPupilsLength
            }
        }
        console.log(audienceMax,' * ' ,numbersArr.length)

        while (picksArray.length < audienceMax){
            randomIndex = Math.floor(Math.random() * numbersArr.length);
            belPupilFlag = profiledPupils[numbersArr[randomIndex]].needBel === true;
            //console.log('belPupilsFlag detected')
            if (belAudienceFlag === belPupilFlag) {
                picksArray.push(numbersArr[randomIndex]);
                numbersArr.splice(randomIndex, 1);
                if (belPupilFlag === true) {
                    
                    belPupilsLength = belPupilsLength - 1;
                }
            }
        }
        return picksArray.filter(notEmptyPick);
    }

    function notEmptyPick(pick) {
        return pick >= 0;
    }
}

function audienceSort(a, b){
    let value = a.max - b.max;

    if (a.bel !== b.bel ) {
        value = a.bel === true ? -1 : 1;
    }

    return value;
}

function createProfilesMap(profiles) {
    const map = {};
    let i = 0;
    let length = profiles.length;
    let profile;

    for (i; i < length; i++) {
        profile = profiles[i];

        map[profile.examPlace] = profile;
    }

    return map;
}

function changeAudience(req, res) {
    var response;

    var pupilId = req.body.pupilId;
    var audienceId = req.body.audienceId;

    var pupil;
    var corps;
    var oldPlace;
    var oldAudience;
    var newPlace;
    var newAudience;

    for (var i = 0; i < DataService.db.pupilsG.length; i++) {
        if ( DataService.db.pupilsG[i]._id === pupilId) {
            pupil = DataService.db.pupilsG[i]
        }
    }

    for (var i = 0; i < DataService.db.corpsesG.length; i++) {
        if ( DataService.db.corpsesG[i].alias === pupil.corps) {
            corps = DataService.db.corpsesG[i]
        }
    }

    for (var i = 0; i < corps.places.length; i++) {
        if (corps.places[i]._id === pupil.place) {
            oldPlace = corps.places[i];
        }
        for (var j = 0; j < corps.places[i].audience.length; j++) {
            if (corps.places[i].audience[j]._id === audienceId) {
                newPlace = corps.places[i];
                newAudience = corps.places[i].audience[j];
            }
            if (corps.places[i].audience[j]._id === pupil.audience) {
                oldAudience = corps.places[i].audience[j];
            }
        }
    }
    oldPlace.count = oldPlace.count - 1;
    oldAudience.count = oldAudience.count - 1;
    newPlace.count = newPlace.count + 1;
    newAudience.count = newAudience.count + 1;

    pupil.place = newPlace._id;
    pupil.audience = newAudience._id;

    
    response = {
        corpses: DataService.db.corpsesG,
        pupils: getFilteredPupils(req, 'generated')
    };

    S3Service.updateDBFile();

    sendResp(res, response)
}