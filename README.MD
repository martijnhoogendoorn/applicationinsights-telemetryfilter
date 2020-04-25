# Application Insights Telemetry Filtering Extension

## Getting Started
Add The filter to your app.
> *Note:* **Typings are included with this package**, so you do **not** need to install a separate typings package.

```console
npm i --save applicationinsights-telemetryfilter
```

## Basic usage

This Application Insights extension allows for filtering HTTP headers and URLs from the 'name' and 'data' properties flowing into telemetry. Setup is easy:

```js
import { TelemetryFilterPlugin } from './applicationinsights-telemetryfilter';
```

or using require:

```js
const telemetryFilterPlugin = require('applicationinsights-telemetryfilter');
```

then:

```js
const filteringPlugin = new telemetryFilterPlugin.TelemetryFilterPlugin();
const appInsights = new ApplicationInsights({ config: {
    /* ... */
    extensions = [filteringPlugin];
    extensionConfig = {
        [filteringPlugin.identifier]: {
            filteredHeaders: {
                Authorization: [ /^(.*?) .*$/gi, '$1 **TOKEN REMOVED**' ],
                'Content-Type': [ 'something replacing content-type' ],
                'Request-Id': null,
            },
            filteredName: [ /^(.*?) .*$/gi, '$1 **NAME URL REMOVED**' ],
            filteredData: [ /^(.*?) .*$/gi, '$1 **DATA URL REMOVED**' ]
        }
    }
 });

appInsights.loadAppInsights();
/* ... */
```

## Configuration options
The plugin scans the HTTP headers, as well as the 'name' and 'data' properties send to the telemetry server. It scans the headers using case-insensitive matching.

It can do three things for those three items:

1. Replace the value of the matching regular expression with another regular expression.

   ```js
   Authorization: [ /^(.*?) .*$/gi, '$1 **TOKEN REMOVED**' ]
   ```
    This expression matches anything for the Authorization header and captures what is in front of the first space character (typically, the type of authorization, i.e. Bearer, Basic, see [explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization))

    Notice the two elements in the array for the Authorization property. The first is used as the match and capture for the original value, the second is the replacement value.

2. Replace the value of the matching regular expression with a hardcoded value.

   ```js
   'Content-Type': [ 'application/json' ]
   ```

   This way, the HTTP header [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) is replaced, just as an example.
3. Remove the value.

   ```js
   'Request-Id': null
   ```

   The HTTP header will be removed by the filter, and won't show in Application Insights telemetry. The same goes for URLs in the 'name' and 'data' properties of the telemetry.

## Testing

The filter has tests, simply run

```console
npm test
```


