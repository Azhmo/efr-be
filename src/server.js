const express = require('express');
const path = require('path');
const mongo = require('./mongo');
const cors = require('cors');

const port = process.env.PORT || 8080;

const raceModel = require('./schemas/raceSchema');
const driverModel = require('./schemas/driverSchema');
const teamModel = require('./schemas/teamSchema');

mongo().then(() => {
    try {
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log(err);
    }
})

const app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', true);
    next();
})

app.get('/', (req, res) => res.send('Welcome to Express'));

app.post('/api/track', async (req, res) => {
    try {
        await raceModel.findOneAndUpdate({ name: req.body.name, tier: req.body.tier }, {
            ...req.body,
        }, { upsert: true });
        res.send(req.body)
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/api/driver', async (req, res) => {
    const driver = req.body;
    try {
        await driverModel.findOneAndUpdate(driver._id ? { _id: req.body._id } : { name: driver.name }, {
            ...req.body
        }, { upsert: true });
        res.send(req.body)
    } catch (err) {
        res.status(500).send(err);
    }
})

app.delete('/api/driver/:id', async (req, res) => {
    try {
        await driverModel.remove({ _id: req.params.id }, {
            ...req.body
        });
        res.send(req.body)
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/api/drivers', async (req, res) => {
    const drivers = req.body;
    try {
        drivers.forEach(async (driver) => {
            await driverModel.findOneAndUpdate({ name: driver.name }, {
                ...driver
            }, { upsert: true });
        })
        res.send(req.body);
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/api/addTeam', async (req, res) => {
    try {
        await teamModel.findOneAndUpdate({ name: req.body.name }, {
            ...req.body
        }, { upsert: true });
        res.send(req.body)
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/api/addTeams', async (req, res) => {
    const teams = req.body;
    try {
        teams.forEach(async (team) => {
            await teamModel.findOneAndUpdate({ name: team.name, tier: team.tier }, {
                ...team
            }, { upsert: true });
        })
        res.send(req.body)
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/api/tracks', async (req, res) => {
    try {
        await raceModel.find({}, (err, result) => {
            res.send(result);
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/api/nextGoldTierTrack', async (req, res) => {
    try {
        await raceModel.find({}, (err, result) => {
            const goldTierRaces = result.filter((track) => track.tier === 'gold');
            const now = Date.now();
            const nextTracks = goldTierRaces.filter((track) => new Date(track.date).getTime() > now);
            const nextTracksOrderedByDate = nextTracks.sort((a, b) => a.date - b.date);
            res.send(nextTracksOrderedByDate[0]);
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/api/nextSilverTierTrack', async (req, res) => {
    try {
        await raceModel.find({}, (err, result) => {
            const silverTierRaces = result.filter((track) => track.tier === 'silver');
            const now = Date.now();
            const nextTracks = silverTierRaces.filter((track) => new Date(track.date).getTime() > now);
            const nextTracksOrderedByDate = nextTracks.sort((a, b) => a.date - b.date);
            res.send(nextTracksOrderedByDate[0]);
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/api/drivers', async (req, res) => {
    try {
        await driverModel.find({}, (err, result) => {
            res.send(result);
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/api/driver/:id', async (req, res) => {
    try {
        await driverModel.find({ _id: req.params.id }, (err, result) => {
            res.send(result[0]);
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/api/teams', async (req, res) => {
    try {
        await teamModel.find({}, (err, result) => {
            res.send(result);
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

