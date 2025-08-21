//import express from "express";
//import { julian, solar, moonposition } from "astronomia";
//import { planetposition } from "astronomia";

//// VSOP Data imports
//import vsopMercury from "astronomia/data/vsop87Bearth/mercury.js";
//import vsopVenus from "astronomia/data/vsop87Bearth/venus.js";
//import vsopMars from "astronomia/data/vsop87Bearth/mars.js";
//import vsopJupiter from "astronomia/data/vsop87Bearth/jupiter.js";
//import vsopSaturn from "astronomia/data/vsop87Bearth/saturn.js";

//const app = express();
//const PORT = 5000;

//// 🪐 Function: Get planet positions
//function getPlanets(jd) {
//    const planets = [];

//    planets.push({ name: "Su", lon: solar.apparentLongitude(jd) }); // Sun
//    planets.push({ name: "Mo", lon: moonposition.position(jd).lon }); // Moon

//    planets.push({
//        name: "Me",
//        lon: new planetposition.Planet(vsopMercury).position(jd).lon,
//    });

//    planets.push({
//        name: "Ve",
//        lon: new planetposition.Planet(vsopVenus).position(jd).lon,
//    });

//    planets.push({
//        name: "Ma",
//        lon: new planetposition.Planet(vsopMars).position(jd).lon,
//    });

//    planets.push({
//        name: "Ju",
//        lon: new planetposition.Planet(vsopJupiter).position(jd).lon,
//    });

//    planets.push({
//        name: "Sa",
//        lon: new planetposition.Planet(vsopSaturn).position(jd).lon,
//    });

//    const moonNode = moonposition.node(jd).lon;
//    planets.push({ name: "Ra", lon: moonNode });
//    planets.push({ name: "Ke", lon: (moonNode + 180) % 360 });

//    return planets;
//}

//// 🏠 Function: Generate Lagna Chart
//function generateChart(planets) {
//    const chart = {};
//    for (let i = 1; i <= 12; i++) chart[i] = [];

//    planets.forEach((p) => {
//        const house = Math.floor(p.lon / 30) + 1;
//        chart[house].push(p.name);
//    });

//    return chart;
//}

//// 🏠 Function: Generate Navamsa Chart
//function generateNavamsa(planets) {
//    const chart = {};
//    for (let i = 1; i <= 12; i++) chart[i] = [];

//    planets.forEach((p) => {
//        const sign = Math.floor(p.lon / 30) + 1;
//        const degreeInSign = p.lon % 30;
//        const navamsaHouse = Math.floor(degreeInSign / (30 / 9)) + 1;
//        const finalHouse = ((sign + navamsaHouse - 2) % 12) + 1;
//        chart[finalHouse].push(p.name);
//    });

//    return chart;
//}

//// 🌍 API Route
//app.get("/api/generateKundli", (req, res) => {
//    try {
//        const { dob, place } = req.query;

//        if (!dob) {
//            return res.status(400).json({ error: "DOB (date of birth) is required" });
//        }

//        const date = new Date(dob);
//        const jd = julian.CalendarGregorianToJD(
//            date.getUTCFullYear(),
//            date.getUTCMonth() + 1,
//            date.getUTCDate() +
//            (date.getUTCHours() + date.getUTCMinutes() / 60) / 24
//        );

//        const planets = getPlanets(jd);
//        const lagnaChart = generateChart(planets);
//        const navamsaChart = generateNavamsa(planets);

//        res.json({
//            place: place || "Unknown",
//            dob,
//            lagnaChart,
//            navamsaChart,
//        });
//    } catch (err) {
//        res.status(500).json({ error: err.message });
//    }
//});

//// 🚀 Server Start
//app.listen(PORT, () => {
//    console.log(`Server running at http://localhost:${PORT}`);
//});
import { julian, planetposition,data } from "astronomia";
import fs from "fs";
import { planetposition, data } from "astronomia";

const app = express();
app.use(bodyParser.json());

// Load planetary data from astronomia
const vsopMercury = new planetposition.Planet(data.vsop87bMercury);
const vsopVenus = new planetposition.Planet(data.vsop87bVenus);
const vsopMars = new planetposition.Planet(data.vsop87bMars);
const vsopJupiter = new planetposition.Planet(data.vsop87bJupiter);
const vsopSaturn = new planetposition.Planet(data.vsop87bSaturn);
const planets = {
    Su: earth,
    Mo: earth, // (Moon alag se calculate karna hoga, abhi earth ref le rahe)
    Me: mercury,
    Ve: venus,
    Ma: mars,
    Ju: jupiter,
    Sa: saturn
};

// Function: convert longitude to house number (1–12)
function getHouse(longitude, ascendant = 0) {
    let houseSize = 30; // 360 / 12
    let relative = (longitude - ascendant + 360) % 360;
    return Math.floor(relative / houseSize) + 1;
}

// API: Generate Kundli
app.post("/api/generateKundli", (req, res) => {
    try {
        const { date, time, place } = req.body;

        // Example: Date to Julian Day
        const jd = julian.CalendarGregorianToJD(
            date.year,
            date.month,
            date.day + time.hour / 24 + time.minute / 1440
        );

        let lagnaChart = {};
        let navamsaChart = {};
        for (let i = 1; i <= 12; i++) {
            lagnaChart[i] = [];
            navamsaChart[i] = [];
        }

        // Iterate all planets
        Object.entries(planets).forEach(([name, planetData]) => {
            const planet = new planetposition.Planet(planetData);
            const coord = planet.position(jd); // longitude in radians
            const longitude = (coord.lon * 180) / Math.PI;

            // Lagna chart
            const house = getHouse(longitude, 0);
            lagnaChart[house].push(name);

            // Navamsa chart (longitude * 9 / 30 = division)
            const navamsaHouse = Math.floor((longitude % 30) / (30 / 9)) + 1;
            navamsaChart[navamsaHouse].push(name);
        });

        res.json({
            place,
            lagnaChart,
            navamsaChart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Start server
app.listen(5000, () => {
    console.log("Astrology API running on port 5000");
});
