/********************************************************************************
*  WEB700 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
*  Name: Katariya Dhruvkumar vinodkumar      Student ID:135914240      Date: 2025-07-09
*  Published URL: https://assignment-5-web700.vercel.app/
********************************************************************************/

const express = require("express");
const path = require("path");
const LegoData = require("./modules/legoSets");
const legoData = new LegoData();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to parse urlencoded bodies
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine and views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes

app.get("/", (req, res) => {
    res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get("/lego/sets", async (req, res) => {
    try {
        let sets;
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
            sets = await legoData.getAllSets();
        }
        res.render("sets", { sets, page: "/lego/sets" });
    } catch (err) {
        res.status(404).send(err.message);
    }
});

app.get('/lego/add-test', async (req, res) => {
    let testSet = {
        set_num: "123",
        name: "testSet name",
        year: "2024",
        theme_id: "366",
        num_parts: "123",
        img_url: "https://fakeimg.pl/375x375?text=[+Lego+]"
    };

    try {
        await legoData.addSet(testSet);
        res.redirect('/lego/sets');
    } catch (err) {
        res.status(422).send(err);
    }
});

// GET Add Set page — pass themes array properly
app.get("/lego/sets/add", async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { page: "/lego/sets/add", themes });
    } catch (err) {
        res.status(500).send("Failed to load themes");
    }
});

app.get("/lego/sets/:set_num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.set_num);
        res.render("set", { set, page: "" });
    } catch (err) {
        res.status(404).send(err.message);
    }
});

// POST Add Set — assign theme name before adding
app.post("/lego/sets/add", async (req, res) => {
    try {
        const foundTheme = await legoData.getThemeById(req.body.theme_id);
        req.body.theme = foundTheme.name;
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(400).send("Error adding set: " + err);
    }
});

// Delete Set route
app.get("/lego/deleteSet/:set_num", async (req, res) => {
    try {
        await legoData.deleteSetByNum(req.params.set_num);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(404).send(err);
    }
});

// 404 Route (last)
app.use((req, res) => {
    res.status(404).render("404", { page: "" });
});

// Initialize data and start server
legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on: http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.log("Unable to start server: " + err);
    });
