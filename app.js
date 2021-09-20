var http = require('http');
const https = require("https");
const axios = require("axios");

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
const onRequest = async (request, response) => {
    console.log("request");
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    let content = 'BEGIN:VCALENDAR\n';
    
    let events = await getData();
    events.forEach( event => {
        event.forEach( line => {
            content += line+"\n";
        });
    });

    content += 'END:VCALENDAR';
    console.log("write");
    response.write(content);
    response.end();
}

async function getData() {
    let output = [];

    try {
        for ( const calendar of calendars ) {

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


http.createServer(onRequest).listen(process.env.PORT, "0.0.0.0");
console.log('Server has started');