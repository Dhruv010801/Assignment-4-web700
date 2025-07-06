/********************************************************************************
*  WEB700 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Katariya Dhruvkumar vinodkumar      Student ID:135914240      Date: 2025-07-06
*  Published URL: 
********************************************************************************/

const express = require("express");
const path = require("path");
const LegoData = require("./modules/legoSets");
const legoData = new LegoData();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.use(express.static(__dirname + '/public'));

app.get("/lego/sets", async (req, res) => {
    try {
        let sets;
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
            sets = await legoData.getAllSets();
        }
        res.json(sets);
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

app.get("/lego/sets/:set_num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.set_num);
        res.json(set);
    } catch (err) {
        res.status(404).send(err.message);
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on: http://localhost:${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log("Unable to start server: " + err);
});
