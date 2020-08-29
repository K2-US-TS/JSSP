import '@k2oss/k2-broker-core';
const DebugTag = "=== USTS-ICM: ";

metadata = {
    systemName: "ImmersionAzureContentModeration",
    displayName: "Azure Content Moderation",
    description: "Content Moderation on Azure Process Text.",
    "configuration": {
        "Subscription Key": {
            "displayName": "Subscription Key",
            "type": "string"
        }
    }
};

ondescribe = async function({configuration}): Promise<void> {
    postSchema({
        objects: {
            "ModerateText": {
                displayName: "ModerateText",
                description: "ModerateText",
                properties: {
                    "inputText": {
                        displayName: "Input Text",
                        type: "extendedString",
                        extendedType: "k2.com/2019/memo" },
                    "debug": {
                        displayName: "debug",
                        type: "string"
                    },
                    "class1Score": {
                        displayName: "Class 1 Score",
                        type: "string"
                    },
                    "class2Score": {
                        displayName: "Class 2 Score",
                        type: "string"
                    },
                    "class3Score": {
                        displayName: "Class 3 Score",
                        type: "string"
                    },
                    "piiEmails": {
                        displayName: "PII Emails",
                        type: "string"
                    },
                    "piiSSNs": {
                        displayName: "PII SSNs",
                        type: "string"
                    },

                    "language": {
                        displayName: "Title",
                        type: "string"
                    },
                    "reviewNeeded": {
                        displayName: "Review Needed",
                        type: "boolean"
                    }
                },
                methods: {
                    "AnalyzeText": {
                        displayName: "AnalyzeText",
                        type: "read",
                        inputs: [ "inputText" ],
                        requiredInputs: ['inputText'],
                        outputs: [ "debug", "language", "reviewNeeded", "class1Score", "class2Score", "class3Score", "piiEmails", "piiSSNs" ]
                    }
                }
            },
            "ModerateImage": {
                displayName: "Moderate Image",
                description: "Azure Vision 2. 0 Image Analytics",
                properties: {
                    "imageURL": {
                        displayName: "imageURL",
                        type: "string"
                    },
                    "name": {
                        displayName: "name",
                        type: "string"
                    },
                    "confidence": {
                        displayName: "confidence",
                        type: "decimal"
                    },
                    "topPos": {
                        displayName: "topPos",
                        type: "number"
                    },
                    "leftPos": {
                        displayName: "leftPos",
                        type: "number"
                    },
                    "width": {
                        displayName: "width",
                        type: "number"
                    },
                    "height": {
                        displayName: "height",
                        type: "number"
                    },
                    "tag": {
                        displayName: "tag",
                        type: "string"
                    }
                },
                methods: {
                    "ListCelebrities": {
                        displayName: "ListCelebrities",
                        type: "list",
                        inputs: [ "imageURL"],
                        requiredInputs: [ "imageURL" ],
                        outputs: [ "name", "confidence", "leftPos", "topPos", "width", "height" ]
                    },
                    "ListTags": {
                        displayName: "ListTags",
                        type: "list",
                        inputs: [ "imageURL"],
                        requiredInputs: [ "imageURL"],
                        outputs: [ "tag" ]
                    }

                }
            },
            "TextAnalytics": {
                displayName: "Sentiment Analytics",
                description: "Text Analytics - Sentiment Analysis v3.0",
                properties: {
                    "language": {
                        displayName: "Language",
                        type: "string"
                    },
                    "value": {
                        displayName: "Value",
                        type: "extendedString",
                        extendedType: "k2.com/2019/memo"
                    },
                    "sentiment": {
                        displayName: "Sentiment",
                        type: "string"
                    },
                    "positive": {
                        displayName: "positive",
                        type: "decimal"
                    },
                    "neutral": {
                        displayName: "neutral",
                        type: "decimal"
                    },
                    "negative": {
                        displayName: "negative",
                        type: "decimal"
                    }
                },
                methods: {
                    "GetSentiment": {
                        displayName: "Analyze Sentiment",
                        type: "read",
                        inputs: [ "language","value" ],
                        outputs: ["sentiment", "positive", "neutral", "negative"]
                    }
                }
            }


        }
    });
}


onexecute = async function({objectName, methodName, parameters, properties, configuration, schema}): Promise<void> {
    switch (objectName)
    {
        case "ModerateText": await onexecuteModerateText(methodName, properties, parameters, configuration); break;
        case "ModerateImage": await onexecuteModerateImage(methodName, properties, parameters, configuration); break;
        case "TextAnalytics": await onexecuteTextAnalytics(methodName, properties, parameters, configuration); break;

        
        default: throw new Error("The object " + objectName + " is not supported.");
    }
}

async function onexecuteModerateText(methodName: string, properties: SingleRecord, parameters: SingleRecord, configuration:SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "AnalyzeText": await onexecuteAnalyzeText(parameters, properties, configuration); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

async function onexecuteModerateImage(methodName: string, properties: SingleRecord, parameters: SingleRecord, configuration:SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "ListCelebrities": await onexecuteListCelebrities(parameters, properties, configuration); break;
        case "ListTags": await onexecuteListTags(parameters, properties, configuration); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

async function onexecuteTextAnalytics(methodName: string, properties: SingleRecord, parameters: SingleRecord, configuration:SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "GetSentiment": await onexecuteGetSentiment(parameters, properties, configuration); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

function onexecuteAnalyzeText(parameters: SingleRecord, properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var xhr = new XMLHttpRequest();

        console.log(DebugTag+"onexecuteAnalyzeText");

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                var obj = JSON.parse(xhr.responseText);

                // Get PII Email List
                var emails=null;
                var emailList = '';

                if (obj.PII && (emails=obj.PII.Email)) {
                    //var length = Object.keys(emails).length;
                    var emailList = '';
                    for (var key in emails) {
                        console.log(`${DebugTag}Email Detected ====>${emails[key].Detected}`);
                        //console.log('Email type ====>' + emails[key].SubType);
                        //console.log('Index ====>' + emails[key].Index);
                        //console.log (' ++++ email length', emaillist.length);
                        if (emailList.length > 0)
                            emailList = emailList + ','+emails[key].Detected;
                        else
                            emailList = emails[key].Detected;               
                    }
                    console.log(DebugTag+" Email List "+ emailList);
                }

                //Get PII SSN
                var ssns=null;
                var ssnList='';
                if (obj.PII && (ssns=obj.PII.SSN)) {
                    for (var key in ssns) {
                        console.log(`${DebugTag}SSN Detected ====>${ssns[key].Text}`);
                        if (ssnList.length > 0)
                            ssnList = ssnList + ','+ssns[key].Text;
                        else
                            ssnList = ssns[key].Text;               

                    console.log(`${DebugTag}SSN Detected ====>${ssns[key].Text}`);
                    }
                }
      
  

                postResult({
                    "debug": "Add PII SSN",
                    "language": obj.Language,
                    "reviewNeeded": obj.Classification.ReviewRecommended,
                    "class1Score": obj.Classification.Category1.Score,
                    "class2Score":obj.Classification.Category2.Score,
                    "class3Score":obj.Classification.Category3.Score,
                    "piiEmails": emailList,
                    "piiSSNs": ssnList
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };

        var url = "https://eastus.api.cognitive.microsoft.com/contentmoderator/moderate/v1.0/ProcessText/Screen?autocorrect=true&PII=true&classify=true"

        xhr.open("POST", url);
        console.log ("=== Azure Content Analytics: Input Text ["+String(properties['inputText'])+"]");
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.setRequestHeader("Ocp-Apim-Subscription-Key", String(configuration["Subscription Key"]));
        xhr.send(String(properties['inputText']));
    });
}

function onexecuteListCelebrities(parameters: SingleRecord, properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        console.log(DebugTag+"onexecuteListCelebrities");
        var xhr = new XMLHttpRequest();

        var bodyData = JSON.stringify({"url": properties["imageURL"]});
        console.log(DebugTag+"Image URL"+bodyData );

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                console.log(DebugTag+"Response: "+xhr.responseText);

                var obj = JSON.parse(xhr.responseText);

                var cat = obj.categories;
                for (var key1 in cat) {
                    if ((cat[key1].name == 'people_') || (cat[key1].name == 'people_portrait')) {
                        var celebs = cat[key1].detail.celebrities
                        for (var key in celebs) {
                            postResult({
                                "name": celebs[key].name,
                                "confidence": celebs[key].confidence,
                                "leftPos": celebs[key].faceRectangle.left,
                                "topPos": celebs[key].faceRectangle.top,
                                "width": celebs[key].faceRectangle.width,
                                "height": celebs[key].faceRectangle.height
                            });
                        }
                    }
                }

                resolve();
            } catch (e) {
                reject(e);
            }
        };



        xhr.open("POST", "https://eastus.api.cognitive.microsoft.com/vision/v2.0/analyze?details=Celebrities");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Ocp-Apim-Subscription-Key", String(configuration["Subscription Key"]));


        xhr.send(bodyData);
    });
}

function onexecuteListTags(parameters: SingleRecord, properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var xhr = new XMLHttpRequest();
        console.log(DebugTag+"onexecuteListTags");

        var bodyData = JSON.stringify({"url": properties["imageURL"]});

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                var obj = JSON.parse(xhr.responseText);
                console.log(DebugTag+"Response"+xhr.responseText );

                var tags = obj.description.tags;
                for (var key in tags) {
                    postResult({
                        "tag": tags[key]
                    });
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        };


        xhr.open("POST", "https://eastus.api.cognitive.microsoft.com/vision/v2.0/analyze?visualFeatures=Description");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Ocp-Apim-Subscription-Key", String(configuration["Subscription Key"]));


        xhr.send(bodyData);
    });
}

function onexecuteGetSentiment(parameters: SingleRecord, properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var xhr = new XMLHttpRequest();

        console.log(DebugTag+"onexecuteGetSentiment");

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                var obj = JSON.parse(xhr.responseText);
                console.log(DebugTag+"Response"+xhr.responseText );

                postResult({
                    "sentiment": obj.documents[0].sentiment,
                    "positive": obj.documents[0].confidenceScores.positive,
                    "neutral":obj.documents[0].confidenceScores.neutral,
                    "negative":obj.documents[0].confidenceScores.negative
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };

        var url = "https://eastus.api.cognitive.microsoft.com/text/analytics/v3.0/sentiment"

        xhr.open("POST", url);

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader("Ocp-Apim-Subscription-Key", String(configuration["Subscription Key"]));

        var bodyData = JSON.stringify({"documents": [{"language": properties["language"],"id": "1", "text": properties["value"]}]});
        console.log(DebugTag+"body: "+bodyData);

        xhr.send(bodyData);
    });
}
