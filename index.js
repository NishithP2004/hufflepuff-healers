const express = require("express");
require("dotenv").config();
const { GooglePaLM } = require('langchain/llms/googlepalm')
const admin = require('firebase-admin');
const app = express();
const cookieParser = require('cookie-parser');

var serviceAccount = require("./hufflepuff-healers-firebase-adminsdk-tc69a-6cdc3c6d05.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const PORT = process.env.PORT || 3000;

const server = require("http").createServer(app);
const io = require("socket.io")(server);

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

app.get("/", async (req, res) => {
    try {
        let token = req.cookies.token;
    if(!token) 
        res.redirect('/login')
    else {
        let user = await admin.auth().verifyIdToken(token);
        (Object.keys(user).length > 0)? res.sendFile(__dirname + "/public/index.html") : res.redirect("/login");
    }
    } catch(err) {
        if(err) {
            console.error(err);
            res.redirect('/login')
        }
    }
});

app.use(express.static(__dirname + "/public"));

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
})

app.get("/logout", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) 
            return res.status(401).send('User not authenticated');
        let user = await admin.auth().verifyIdToken(token);
        await admin.auth().revokeRefreshTokens(user.uid);

        res.clearCookie('token');
        res.redirect('/login')
    } catch (error) {
        console.error('Error signing out user:', error);
        res.status(500).send('Internal Server Error');
    }
})

io.on("connection", (client) => {
    console.log(`Connected to ${client.id}`);

    client.on('message', async (data) => {
        console.log(data)
        let aiResponse = await invokeAI(data.msg);
        io.to(data.id).emit('reply', {
            msg: aiResponse,
            from: 'AI'
        })
    })
});

async function invokeAI(input) {
    try {
        const model = new GooglePaLM({
            apiKey: process.env.GOOGLE_PALM_API_KEY,
            temperature: 0.2,
            modelName: "models/text-bison-001",
            maxOutputTokens: 1024,
            candidate_count: 1,
            top_k: 40,
            top_p: 0.95
        })

        const prompt = `
        SYSTEM: You are a practising Doctor and an expert in dermatology.
                Given an input highlighting the name of the disease and the symptomps experienced by a patient, 
                you can intelligently identify the remedies, and other parameters that can be used to diagnose and treat the said disease.
                Adopt the persona of a "Muffling Helper" from Harry Potter and paraphrase the result accordingly to be magical.
                Return the response as an HTML table having a border of 0 and cellpadding of 5px and cellspacing of 5px. 
                Also take into account what the user intends to say and respond accordingly.
                Avoid using markdown syntax and use pure HTML.

        INPUT: ${input}
        `
        let res = await model.call(prompt);
        console.log(res)
        
        return res;
    } catch(err) {
        if(err) {
            console.error(err);
            return null;
        }
    }
}

