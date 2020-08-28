import test from 'ava';
import '@k2oss/k2-broker-core/test-framework';
import './index';

function mock(name: string, value: any) 
{
    global[name] = value;
}

test.skip('describe returns the hardcoded instance', async t => {
    let schema = null;
    mock('postSchema', function(result: any) {
        schema = result;
    });

    await Promise.resolve<void>(ondescribe());
    
    t.deepEqual(schema, {
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
                    "apiKey": {
                        displayName: "Key",
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
                        inputs: [ "city", "units", "apikey" ],
                        outputs: [ "weatherDescription", "temperature", "feelsLike" ]
                    }
                }
            }
        }
    });

    t.pass();
});

test.skip('execute fails with the wrong parameters', async t => {
    let error = await t.throwsAsync(Promise.resolve<void>(onexecute('test1', 'unused', {}, {})));
    
    t.deepEqual(error.message, 'The object test1 is not supported.');

    error = await t.throwsAsync(Promise.resolve<void>(onexecute('Weather', 'test2', {}, {})));
    
    t.deepEqual(error.message, 'The method test2 is not supported.');

    t.pass();
});

test('execute passes', async t => {

    let xhr: {[key:string]: any} = null;
    class XHR {
        public onreadystatechange: () => void;
        public readyState: number;
        public status: number;
        public responseText: string;
        private recorder: {[key:string]: any};

        constructor() {
            xhr = this.recorder = {};
            this.recorder.headers = {};
        }

        open(method: string, url: string) {
            this.recorder.opened = {method, url};   
        }

        setRequestHeader(key: string, value: string) {
            this.recorder.headers[key] = value;
        }

        send() {
            queueMicrotask(() =>
            {
                this.readyState = 4;
                this.status = 200;
                this.responseText = JSON.stringify(

                    {
                        "coord": {
                            "lon": -97.74,
                            "lat": 30.27
                        },
                        "weather": [
                            {
                                "id": 800,
                                "main": "Clear",
                                "description": "clear sky",
                                "icon": "01d"
                            }
                        ],
                        "base": "stations",
                        "main": {
                            "temp": 50.9,
                            "feels_like": 45.01,
                            "temp_min": 48,
                            "temp_max": 54,
                            "pressure": 1024,
                            "humidity": 61
                        },
                        "visibility": 16093,
                        "wind": {
                            "speed": 5.82,
                            "deg": 60
                        },
                        "clouds": {
                            "all": 1
                        },
                        "dt": 1581633749,
                        "sys": {
                            "type": 1,
                            "id": 5739,
                            "country": "US",
                            "sunrise": 1581599603,
                            "sunset": 1581639431
                        },
                        "timezone": -21600,
                        "id": 4671654,
                        "name": "Austin",
                        "cod": 200
                    }

                );
                this.onreadystatechange();
                delete this.responseText;
            });
        }
    }

    mock('XMLHttpRequest', XHR);

    let result: any = null;
    function pr(r: any) {
        result = r;
    }

    mock('postResult', pr);

    await Promise.resolve<void>(onexecute(
        'Weather', 'GetCurrentWeather', {}, {
            "city": "Miami,Florida",
            "units": "Imperial",
            "apiKey": "be97c93a9a2cd31dd93d8f0203dc2327"
        }));

    t.deepEqual(result, {
        "condition": "hurricanes",
        "temperature": "99.9",
        "feelsLike": 99.01
    });

    t.pass();

});