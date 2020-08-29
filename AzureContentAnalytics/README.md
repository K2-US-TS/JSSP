# K2 TypeScript Broker for Azure Analytics

This is a sample JSSP Broker for Azure Analytics and is not an supported by K2.  Feel free to use/improve/enhance. Use at your own risks. Happy coding. 


# Features

  This version of the Azure Analytics broker supports the following interfaces:
  - **Text Analytics:**
    - ModerateText (based on content moderator v1.0 API)
    - GetSentiment (based on text analytics v3.0 API)
  - **Image Analytics:** (based on vision analytics v2.0 API)
    - ListCelebrities
    - ListTags
 
 # Service Keys and authentication
 This broker has a service key called "Subscription Key" which you need to obtain from Azure. This is the subscription key for both Text and Image Analytics resources.

## Getting Started

This template requires [Node.js](https://nodejs.org/) v12.14.1+ to run.

Install the dependencies and devDependencies:

```bash
npm install
```

See the documentation for [@k2oss/k2-broker-core](https://www.npmjs.com/package/@k2oss/k2-broker-core)
for more information about how to use the broker SDK package.

## Running Unit Tests
To run the unit tests, run:

```bash
npm test
```

You can also use a development build, for debugging and coverage gutters:

```bash
npm run test:dev
```

You will find the code coverage results in [coverage/index.html](./coverage/index.html).

## Building your bundled JS
When you're ready to build your broker, run the following command

```bash
npm run build
```

You will find the results in the [dist/index.js](./dist/index.js).

## Creating a service type
Once you have a bundled .js file, upload it to your repository (anonymously
accessible) and register the service type using the system SmartObject located
at System > Management > SmartObjects > SmartObjects > JavaScript Service
Provider and run the Create From URL method.

### License

MIT, found in the [LICENSE](./LICENSE) file.

[www.k2.com](https://www.k2.com)
