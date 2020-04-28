import { TelemetryItemCreator, RemoteDependencyData } from '@microsoft/applicationinsights-common';
import { IAppInsightsCore, ITelemetryItem } from "@microsoft/applicationinsights-core-js";
import { TelemetryFilterPlugin } from './applicationinsights-telemetryfilter';
import { Guid } from 'guid-typescript';
import { expect } from 'chai';
import 'mocha';

const goodTarget = 'https://reporting.somedomain.com/api/reports/clients/105659-7173/instances/108203-4dd8/documents/105203-e34a105203-19d9/info';
const msftDomain = 'https://www.microsoft.com/';
const testMethod = 'POST';

function setupInitialTelemetry() : ITelemetryItem {
  let remoteDependencyData = TelemetryItemCreator.create<RemoteDependencyData>(
    new RemoteDependencyData(
      null, 
      `|${Guid.create().toString().replace('-', '')}.${Guid.create().toString().replace('-', '').substring(0,16)}`,
      `${goodTarget}`, // this gets parsed by AI into 
      `${testMethod} ${goodTarget}`,
      10,
      true, // success
      200,
      `${testMethod}`, // method
      'Ajax',
      null,
      null, // properties (don't pass, any sanitizer makes a JSON string from it and we need the object)
      null // measurements
      ),
    RemoteDependencyData.dataType,
    `Microsoft.ApplicationInsights.${Guid.create().toString().replace('-', '')}`,
    ({} as IAppInsightsCore).logger,
    null, // customproperties,
    null // systemproperties
  );
  
  return remoteDependencyData;
}

describe('TelemetryFilter', () => {
  const filteringPlugin = new TelemetryFilterPlugin();

  it('Should remove Request-Id from captured headers', () => {

    let remoteDependencyData = setupInitialTelemetry();

    let inboundHeaders = { 
      requestHeaders: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
        'Content-Type': 'application/text+xml',
        'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32' 
      } 
    };
    
    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredHeaders: {
            'Request-Id': null,
          }
        }
      }
    };

    remoteDependencyData.baseData.properties = inboundHeaders;

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.properties).to.not.have.nested.property('Request-Id', 'nested property should be removed');
  });

  it(`Should replace Content-Type in captured headers with hardcoded 'application/json'`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let inboundHeaders = { 
      requestHeaders: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
        'Content-Type': 'application/text+xml',
        'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32' 
      } 
    };
    
    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredHeaders: {
            'Content-Type': [ 'application/json' ],
          }
        }
      }
    };

    remoteDependencyData.baseData.properties = inboundHeaders;

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Content-Type', 'application/json', 'Content-Type should be replaced');
  });

  it('Should replace Authorization in captured headers with a regex replacement', () => {

    let remoteDependencyData = setupInitialTelemetry();

    let inboundHeaders = { 
      requestHeaders: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
        'Content-Type': 'application/text+xml',
        'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32' 
      } 
    };
    
    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredHeaders: {
            Authorization: [ /^(.*?) .*$/gi, '$1 **TOKEN REMOVED**' ],
          }
        }
      }
    };

    remoteDependencyData.baseData.properties = inboundHeaders;

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Authorization', 'Bearer **TOKEN REMOVED**', 'Authorization should be replace with backreference');
  });

  it('Should have 2 captured headers remaining, both changed', () => {

    let remoteDependencyData = setupInitialTelemetry();

    let inboundHeaders = { 
      requestHeaders: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
        'Content-Type': 'application/text+xml',
        'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32' 
      } 
    };
    
    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredHeaders: {
            Authorization: [ /^(.*?) .*$/gi, '$1 **TOKEN REMOVED**' ],
            'Content-Type': [ 'application/json' ],
            'Request-Id': null,
          }
        }
      }
    };

    remoteDependencyData.baseData.properties = inboundHeaders;

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(Object.keys(remoteDependencyData.baseData.properties.requestHeaders)).to.have.lengthOf(2);
    expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Authorization', 'Bearer **TOKEN REMOVED**', 'Authorization should be replace with backreference');
    expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Content-Type', 'application/json', 'Content-Type should be replaced');
    expect(remoteDependencyData.baseData.properties).to.not.have.nested.property('Request-Id', 'nested property should be removed');
  });

  it(`Should throw RangeError when misconfigured  for 'name' property to remove unitary property (invalid for AI)`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredName: [ null ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);

    expect(() => {
      filteringPlugin.processTelemetry(remoteDependencyData, null);
    }).to.throw(RangeError);
  });

  it(`Should replace the URL in the 'name' property with hardcoded ${msftDomain}`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredName: [ `${msftDomain}` ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.name).to.equal(msftDomain);
  });

  it(`Should replace the URL in the 'name' property with regular expression captured`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredName: [ /^(.*?) .*$/gi, '$1 **NAME URL REMOVED**' ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.name).to.equal(`${testMethod} **NAME URL REMOVED**`);
  });

  it(`Should throw RangeError when misconfigured for 'data' property to remove unitary property (invalid for AI)`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredData: [ null ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);

    expect(() => {
      filteringPlugin.processTelemetry(remoteDependencyData, null);
    }).to.throw(RangeError);
  });

  it(`Should replace the URL in the 'data' property with hardcoded ${msftDomain}`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredData: [ `${msftDomain}` ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.data).to.equal(msftDomain);
  });

  it(`Should replace the URL in the 'data' property with regular expression captured`, () => {

    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          filteredData: [ /^(.*?) .*$/gi, '$1 **DATA URL REMOVED**' ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.data).to.equal(`${testMethod} **DATA URL REMOVED**`);
  });

  it(`Should remove potentially sensitive data from 'name' and 'data' property`, () => {
    
    let remoteDependencyData = setupInitialTelemetry();

    let extensionConfig : any = { extensionConfig : {
        [filteringPlugin.identifier]: {
          //'https://reporting.somedomain.com/api/reports/clients/105659-7173/instances/108203-4dd8/documents/105203-e34a105203-19d9/info';
          filteredName: [ /^(.*\/clients\/)[0-9]{6}-[0-9]{4}(\/instances\/)[0-9]{6}-[0-9a-z]{4}(\/documents\/)[0-9]{6}-[0-9a-z]{10}-[0-9a-z]{4}(\/info)$/gi, '$1000000-0000$2000000-0000$3000000-0000000000-0000$4' ],
          filteredData: [ /^(.*\/clients\/)[0-9]{6}-[0-9]{4}(\/instances\/)[0-9]{6}-[0-9a-z]{4}(\/documents\/)[0-9]{6}-[0-9a-z]{10}-[0-9a-z]{4}(\/info)$/gi, '$1000000-0000$2000000-0000$3000000-0000000000-0000$4' ]
        }
      }
    };

    filteringPlugin.initialize(extensionConfig, null, null, null);
    filteringPlugin.processTelemetry(remoteDependencyData, null);

    expect(remoteDependencyData.baseData.name).to.equal(`${testMethod} https://reporting.somedomain.com/api/reports/clients/000000-0000/instances/000000-0000/documents/000000-0000000000-0000/info`);
    expect(remoteDependencyData.baseData.data).to.equal(`${testMethod} https://reporting.somedomain.com/api/reports/clients/000000-0000/instances/000000-0000/documents/000000-0000000000-0000/info`);
  });
});