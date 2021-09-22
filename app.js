var http = require('http');
const https = require("https");
const axios = require("axios");
const url = require('url');
const express = require("express");
const app = express();

const { MongoClient } = require('mongodb');





async function getCalendarGroup(groupName){
    //const uri = "mongodb://placesadmin:sdf234we@wecal-mongo.kr2lf.mongodb.net/wecal?retryWrites=true&w=majority";
    //const uri = "mongodb://placesadmin:sdf234we@main-shard-00-00-03xkr.mongodb.net:27017,main-shard-00-01-03xkr.mongodb.net:27017,main-shard-00-02-03xkr.mongodb.net:27017/main?ssl=true&replicaSet=Main-shard-0&authSource=admin&retryWrites=true"
    //const uri = "mongodb://localhost:27017/placesadmin:sdf234we@wecal-mongo.kr2lf.mongodb.net/wecal?retryWrites=true&w=majority";

    // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    // const database = client.db("wecal");
    // const groups = database.collection("groups");
    // await client.connect();

    // const group = await groups.findOne({name: groupName});

    const uri = "mongodb+srv://placesadmin:sdf234we@wecal.kr2lf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
      const collection = client.db("wecal").collection("groups");
      // perform actions on the collection object

      const group = collection.findOne({name: groupName});
      console.log(group);
      client.close();
    });


    
    
    // client.connect(err => {
    //   const collection = client.db("test").collection("devices");
    //   // perform actions on the collection object
    //   client.close();
    // });
console.log("db");

    const calendars = [
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1149.ics",
            prepend: "Avalon SC: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1213.ics",
            prepend: "Downtown: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1211.ics",
            prepend: "Love Shack: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1218.ics",
            prepend: "Moreno: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1208.ics",
            prepend: "Zen All: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1210.ics",
            prepend: "Zen Bunk: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1209.ics",
            prepend: "Zen Red: ",
        },
    ]
    console.log("group:"+group);
    //return group;
    return calendars;
}

async function getSampleGroup(groupName){

    const calendars = [
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1149.ics",
            prepend: "Avalon SC: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1213.ics",
            prepend: "Downtown: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1211.ics",
            prepend: "Love Shack: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1218.ics",
            prepend: "Moreno: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1208.ics",
            prepend: "Zen All: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1210.ics",
            prepend: "Zen Bunk: ",
        },
        {
            url: "https://www.smithlakerentals.com/vrp/vrpical/prop1209.ics",
            prepend: "Zen Red: ",
        },
    ]
    return calendars;
}


const onRequest = (request, response) => {
    
    const calendarName = url.parse(request.url,true).query.c;
    console.log("request:"+calendarName);

    if (calendarName){
        showCalendar(response, calendarName);
    }
    else {
        showForm(response);
    }
}

async function showCalendar(response, calendarName){
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    let content = 'BEGIN:VCALENDAR\n';
    
    let events = await getData();
    events.forEach( event => {
        event.forEach( line => {
            content += line+"\n";
        });
    });

    content += 'END:VCALENDAR';
    response.write(content);
    response.end();
}

async function getData() {
    let output = [];

    try {
        //const calendarGroup = await getCalendarGroup();
        const calendarGroup = await getSampleGroup();
        for ( const calendar of calendarGroup ) {

            const response = await axios.get(calendar.url);
            const splitLines = response.data.split(/\r?\n/);
            let currentEvent = [];
            let isEvent = false;
            splitLines.forEach(line => {
                if (/^BEGIN:VEVENT/.test(line)){
                    if (currentEvent.length>0) output.push(currentEvent);
                    currentEvent = [];
                    isEvent = true;
                }
                if (isEvent) {
                    if (/^SUMMARY/.test(line)){
                        currentEvent.push("SUMMARY:"+calendar.prepend+"BOOKED");
                    }
                    else {
                        currentEvent.push(line);
                    }
                }
            });

        };

    } catch (error) {
        console.error(error);
    }

    return output;
  }


//http.createServer(onRequest).listen(process.env.PORT, "0.0.0.0");

app.use(express.static(__dirname));

app.listen(8888, () => {
    console.log("Application started and Listening on port 8888");
});


app.get("/feed", (req, res) => {
    const calendarName = req.query.c;
    showCalendar(res, calendarName);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/form.html");
});

app.post("/", (req, res) => {
    res.sendFile(__dirname + "/confirm.html");
});
