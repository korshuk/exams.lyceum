let db = {
    places: [],
    profiles: [],
    pupils: [],
    corpses: [],
    pupilsG: [],
    corpsesG: [],
    pupilsS: [],
    corpsesS: []
};

let createCorpses = createCorpsesFn;
let toUTF8Array = toUTF8ArrayFn;

module.exports = {
    db : db,
    generateDictionary: generateDictionary,
    setData: setData
};

function setData(obj) {
    db.places = obj.places || [];
    db.profiles = obj.profiles || [];
    db.pupils = obj.pupils || [];
    db.corpses = createCorpses(obj.places || []);
    db.pupilsG=  obj.pupilsG || [];
    db.corpsesG= obj.corpsesG || createCorpses(obj.places || []);
    db.pupilsS=  obj.pupilsS || [];
    db.corpsesS= obj.corpsesS || [];
    db.timestemp = obj.timestemp || '';
}
function generateDictionary() {
    let data = {
        corpses: {},
        places: {},
        audiences: {},
        profiles: {}
    }

    for (let i = 0; i < db.corpses.length; i++) {
        data.corpses[db.corpses[i].alias] = db.corpses[i].name;

        for (let j = 0; j < db.corpses[i].places.length; j++) {
            data.places[db.corpses[i].places[j]._id] = {
                code: db.corpses[i].places[j].code,
                name: db.corpses[i].places[j].name
            }

            for (let k = 0; k < db.corpses[i].places[j].audience.length; k++) {
                data.audiences[db.corpses[i].places[j].audience[k]._id] = db.corpses[i].places[j].audience[k].name;
            }
        }
    }

    for (i = 0; i < db.profiles.length; i++) {
      data.profiles[db.profiles[i]._id] = db.profiles[i].name;
    }

    return data;
}

function createCorpsesFn (places) {
    let corpsesMap = {};
    let corpses = [];
    let corps;
    let i = 0;
    let length = places.length;

    for (i; i < length; i++) {
        places[i].audience = places[i].audience.sort(function(a,b){
            if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
        })
        corps = places[i];
        if (corpsesMap[corps.name]) {
            corpsesMap[corps.name].places.push(corps)
        } else {
            corpsesMap[corps.name] = {
                name: corps.name,
                alias: toUTF8Array(corps.name),
                places: [corps]
            }
        }
    }
    for (corps in corpsesMap) {
        if (corpsesMap.hasOwnProperty(corps)) {
            corpses.push(corpsesMap[corps]);
        }
    }

    return Array.from(corpses);
}

function toUTF8ArrayFn(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8.join('');
}