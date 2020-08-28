import '@k2oss/k2-broker-core';

const DebugTag = "=== OpenWeather === ";
const OpenWeatherURL = "http://api.openweathermap.org/data/2.5/weather/"

metadata = {
    "systemName": "ImmersionUSOpenWeather",
    "displayName": "OpenWeather JSSP Broker",
    "description": "A broker that gets weather information from OpenWeather.",
    "configuration": {
        "API Key": {
            "displayName": "API Key",
            "type": "string"
        }
    }

};

ondescribe = async function({configuration}): Promise<void> {
    postSchema({
        objects: {
            "Weather": {
                displayName: "Weather",
                description: "Open Weather API",
                properties: {
                    "city": {
                        displayName: "City",
                        type: "string"
                    },
                    "units": {
                        displayName: "Unit",
                        type: "string"
                    },
                    "condition": {
                        displayName: "condition",
                        type: "string"
                    },
                    "temperature": {
                        displayName: "temperature",
                        type: "decimal"
                    },
                    "feelsLike": {
                        displayName: "feelsLike",
                        type: "decimal"
                    }

                },
                methods: {
                    "GetCurrentWeather": {
                        displayName: "Get Current Weather",
                        type: "read",
                        inputs: [ "city", "units"],
                        outputs: [ "condition", "temperature", "feelsLike" ]
                    }
                }
            }
        }
    });
}

onexecute = async function({objectName, methodName, parameters, properties, configuration, schema}): Promise<void> {
    switch (objectName)
    {
        case "Weather": await onexecuteWeather(methodName, properties, parameters, configuration); break;
        default: throw new Error("The object " + objectName + " is not supported.");
    }
}

async function onexecuteWeather(methodName: string, properties: SingleRecord, parameters: SingleRecord, configuration:SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "GetCurrentWeather": await onexecuteGetCurrentWeather(properties, configuration); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

function onexecuteGetCurrentWeather(properties: SingleRecord, configuration: SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var apiKey=configuration["API Key"];
        var data = "";
        var xhr = new XMLHttpRequest();
        // xhr.withCredentials = true;

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                var obj = JSON.parse(xhr.responseText);
                console.log(`${DebugTag}`+"Response: "+xhr.responseText);
                postResult({
                    "condition": obj.weather[0].description,
                    "temperature": obj.main.temp,
                    "feelsLike": obj.main.feels_like
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };
        var qparm = "?q="+properties["city"]+"&units="+properties["units"]+"&apiKey="+apiKey;
        var url = OpenWeatherURL + qparm;

        console.log(`${DebugTag}`+"URL: "+url);

        xhr.open("GET", url);
        xhr.send();
    });
}