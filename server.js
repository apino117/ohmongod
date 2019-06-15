var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// =================== ROUTES =================== //

// A GET route for scraping the website

app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.cracked.com/humor-music.html").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // var results = [];

        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        // $(".content-card-content").each(function (i, element) {

        //     var title = $(element).find("a").text();
        //     var link = $(element).find("a").attr("href");



        //     // Save these results in an object that we'll push into the results array we defined earlier
        //     results.push({
        //         title: title,
        //         link: link
        //     });

        //     console.log(results);
        // });

        // Now, we grab every h2 within an article tag, and do the following:
        $(".content-card-content").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.headline = $(element).find("h3").find("a").text();
            result.link = $(element).find("a").attr("href");
            result.summary = $(element).find("p").find("a").text();

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db

// Route for grabbing a specific Article by id, populate it with it's note

// Route for saving/updating an Article's associated Note


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});