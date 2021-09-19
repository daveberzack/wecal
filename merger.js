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
    response.writeHead(200);
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
        for ( const calendar of calendars ) {

            console.log("....");
            const response = await axios.get(calendar.url);
            console.log("response"+calendar.url);
            const splitLines = response.data.split(/\r?\n/);
            let currentEvent = [];
            let isEvent = false;
            splitLines.forEach(line => {
                if (/^BEGIN:VEVENT/.test(line)){
                    //console.log(output.length+":"+currentEvent)
                    if (currentEvent.length>0) output.push(currentEvent);
                    currentEvent = [];
                    isEvent = true;
                }
                if (isEvent) {
                    if (/^SUMMARY/.test(line)){
                        //console.log(calendar.prepend);
                        currentEvent.push("SUMMARY:"+calendar.prepend+"BOOKED");
                    }
                    else {
                        //console.log(line);
                        currentEvent.push(line);
                    }
                }
            });

        };

    } catch (error) {
        console.error(error);
    }

    console.log("OUTPUT:"+output.length)
    return output;
  }


http.createServer(onRequest).listen(8888);
console.log('Server has started');