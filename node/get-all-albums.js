const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const download = require('download');
var shell = require('shelljs');
var dateFormat = require('dateformat');
var async = require('async');
var downloadFileSync = require('download-file-sync');
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = [0, 1, 6, 9, 14, 17, 21];
rule.minute = 5;


var mkdirp = require('mkdirp');


// var moment = require('moment');
var moment = require('moment-timezone');

moment.tz.setDefault('Asia/Shanghai');

var taskRunningTimes = 1;

var dbindex = 1;
// var j = schedule.scheduleJob('0 * * * * *', function() { // "Runs job every minute"

// var j = schedule.scheduleJob('*/5 * * * *', function() { // "Runs job every 5 minute"
// var j = schedule.scheduleJob(rule, function() { // every hour at 5 minutes

// var j = schedule.scheduleJob('0 5 * * * *', function() { // // "Runs job every 5 minute"
// var j = schedule.scheduleJob('0 0 * * * *', function() { //// "Runs job every hour"
var now = moment().format('MMMM Do YYYY, h:mm:ss a');
console.log(now + ' taskRunningTimes:' + taskRunningTimes++);
var albums = JSON.parse(fs.readFileSync('./albums.json', 'utf8'));
albums.forEach(function(album) {

    // if (artist.id == 49) { // 空中门训
    //     return;
    // }
    x('http://txly2.net/' + album.shortName, 'tbody tr', [{
            "albumtitle": '.ss-title a',
            "title": '.ss-title p',
            "downUrl": '.ss-dl a@href'
        }])
        .paginate('.active + .hidden-phone a@href')
        .limit(3)
        // .write('results.json')
        (function(err, audios) {
            if (err !== null) {
                return;
            }

            audios = audios.reverse();
            audios.forEach(function(audio, arrayIndex) {

                    var index = audio.downUrl.indexOf('?');
                    var sub = audio.downUrl.substring(0, index);
                    var lastIndex = audio.downUrl.lastIndexOf('/');
                    var fileName = sub.substring(lastIndex + 1);
                    audio.downUrl = sub;
                    // audio.albumtitle = audio.time.substring(audio.time.lastIndexOf('-') + 1);
                    console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + audio.albumtitle);
                    // var today = dateFormat(new Date(), "yyyymmdd");
                    var today = moment().format("YYYYMMDD");
                    // if (audio.time === today) {
                    var file = album.shortName + '/' + fileName;

                    if (!fs.existsSync(file)) { //

                        console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + "downloading..." + file);

                        var data = require('child_process').execFileSync('curl', ['--silent', '-L', audio.downUrl]);

                        mkdirp.sync(album.shortName);

                        fs.writeFileSync(album.shortName + '/' + fileName, data);

                        // var commitTag = album.shortName + audio.time
                        var commitTag = "170519";


                        // var year = moment().format('YYYY');
                        // var week = moment().format('WW');

                        audio.duration = album.duration;
                        audio.size = album.size;
                        audio.artistId = album.artistId;
                        audio.artistName = album.artistName;
                        audio.albumId = album.id;
                        audio.albumName = album.name;
                        audio.path = "https://rawcdn.githack.com/quiet324/LiangyouAlbums" + "/" + commitTag + "/" + album.shortName + "/" + fileName;
                        audio.id = album.id * 1000000 + (dbindex++);

                        // fs.writeFileSync("./" + album.shortName + ".json", JSON.stringify(audio, null, '\t'));



                    } else {
                        console.log(file + " exit");
                    }
                }





            );

            var jsonfile = './' + album.shortName + ".json";

            if (!fs.existsSync(jsonfile)) { //
                fs.writeFileSync(jsonfile, JSON.stringify(audios, null, '\t'));
            }


            // }

        });

});