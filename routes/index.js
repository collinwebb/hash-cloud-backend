var express = require('express');
var twitter = require('twitter');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function twitterClient(params){
  return new twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: params.access_token_key,
    access_token_secret: params.access_token_secret
  });
}

router.post("/tweet", function(req, res, next){
  var client = twitterClient(req.body);
  client.post('statuses/update', {status: req.body.tweet}, function(error, tweets, response){
    if (!error) {
      res.json(tweets);
    }
  });
});

router.post("/search", function(req, res, next){
  var client = twitterClient(req.body);
  var words = req.body.words.split(" ");

  client.get('search/tweets', {q: words.join(" OR "), count: 100}, function(error, tweets, response){
    if (!error) {
      var stats = {tags: {}, people: {}}, tweetText = "", regexp, matches;

      tweets.statuses.forEach(function(tweet){
        tweetText += + " " + tweet.text.toLowerCase();
        stats.people[tweet.user.name] = tweet.user;
      });
      words.forEach(function(word){
        regexp = new RegExp("(\\b[\\#\\@]?" + word + "\\b)+", "g");
        matches = tweetText.match(regexp);
        stats.tags[word] = matches.length;
      });

      // console.log(stats);
      res.json(stats);
    }
  });
});

module.exports = router;
