"use strict";
exports.__esModule = true;
var applicationinsights_common_1 = require("@microsoft/applicationinsights-common");
var applicationinsights_telemetryfilter_1 = require("./applicationinsights-telemetryfilter");
var guid_typescript_1 = require("guid-typescript");
var chai_1 = require("chai");
require("mocha");
var msftDomain = 'https://www.microsoft.com/';
var githubDomain = 'https://www.github.com/';
var testMethod = 'POST';
function setupInitialTelemetry() {
    var remoteDependencyData = applicationinsights_common_1.TelemetryItemCreator.create(new applicationinsights_common_1.RemoteDependencyData(null, "|" + guid_typescript_1.Guid.create().toString().replace('-', '') + "." + guid_typescript_1.Guid.create().toString().replace('-', '').substring(0, 16), 'absoluteurl', testMethod + " " + githubDomain, 10, true, // success
    200, "" + testMethod, // method
    'Ajax', 'correlationcontext', null, // properties (don't pass, any sanitizer makes a JSON string from it and we need the object)
    null // measurements
    ), applicationinsights_common_1.RemoteDependencyData.dataType, "Microsoft.ApplicationInsights." + guid_typescript_1.Guid.create().toString().replace('-', ''), {}.logger, null, // customproperties,
    null // systemproperties
    );
    return remoteDependencyData;
}
describe('TelemetryFilter', function () {
    var filteringPlugin = new applicationinsights_telemetryfilter_1.TelemetryFilterPlugin();
    it('Should remove Request-Id from captured headers', function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var inboundHeaders = {
            requestHeaders: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
                'Content-Type': 'application/text+xml',
                'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32'
            }
        };
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredHeaders: {
                        'Request-Id': null
                    }
                },
                _a)
        };
        remoteDependencyData.baseData.properties = inboundHeaders;
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.properties).to.not.have.nested.property('Request-Id', 'nested property should be removed');
    });
    it("Should replace Content-Type in captured headers with hardcoded 'application/json'", function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var inboundHeaders = {
            requestHeaders: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
                'Content-Type': 'application/text+xml',
                'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32'
            }
        };
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredHeaders: {
                        'Content-Type': ['application/json']
                    }
                },
                _a)
        };
        remoteDependencyData.baseData.properties = inboundHeaders;
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Content-Type', 'application/json', 'Content-Type should be replaced');
    });
    it('Should replace Authorization in captured headers with a regex replacement', function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var inboundHeaders = {
            requestHeaders: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
                'Content-Type': 'application/text+xml',
                'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32'
            }
        };
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredHeaders: {
                        Authorization: [/^(.*?) .*$/gi, '$1 **TOKEN REMOVED**']
                    }
                },
                _a)
        };
        remoteDependencyData.baseData.properties = inboundHeaders;
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Authorization', 'Bearer **TOKEN REMOVED**', 'Authorization should be replace with backreference');
    });
    it('Should have 2 captured headers remaining, both changed', function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var inboundHeaders = {
            requestHeaders: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CGg60fQsuBdBheYYCX76Egj4AfStIz35qwQzfvlkl8A',
                'Content-Type': 'application/text+xml',
                'Request-Id': '|f87b17b2e0ff4da29c310faf937353bc.4113ec4e10154b32'
            }
        };
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredHeaders: {
                        Authorization: [/^(.*?) .*$/gi, '$1 **TOKEN REMOVED**'],
                        'Content-Type': ['application/json'],
                        'Request-Id': null
                    }
                },
                _a)
        };
        remoteDependencyData.baseData.properties = inboundHeaders;
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(Object.keys(remoteDependencyData.baseData.properties.requestHeaders)).to.have.lengthOf(2);
        chai_1.expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Authorization', 'Bearer **TOKEN REMOVED**', 'Authorization should be replace with backreference');
        chai_1.expect(remoteDependencyData.baseData.properties.requestHeaders).to.have.property('Content-Type', 'application/json', 'Content-Type should be replaced');
        chai_1.expect(remoteDependencyData.baseData.properties).to.not.have.nested.property('Request-Id', 'nested property should be removed');
    });
    it("Should throw RangeError when misconfigured  for 'name' property to remove unitary property (invalid for AI)", function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredName: [null]
                },
                _a)
        };
        filteringPlugin.initialize(extensionConfig, null, null, null);
        chai_1.expect(function () {
            filteringPlugin.processTelemetry(remoteDependencyData, null);
        }).to["throw"](RangeError);
    });
    it("Should replace the URL in the 'name' property with hardcoded " + msftDomain, function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredName: ["" + msftDomain]
                },
                _a)
        };
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.name).to.equal(msftDomain);
    });
    it("Should replace the URL in the 'name' property with regular expression captured", function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredName: [/^(.*?) .*$/gi, '$1 **NAME URL REMOVED**']
                },
                _a)
        };
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.name).to.equal(testMethod + " **NAME URL REMOVED**");
    });
    it("Should throw RangeError when misconfigured for 'data' property to remove unitary property (invalid for AI)", function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredData: [null]
                },
                _a)
        };
        filteringPlugin.initialize(extensionConfig, null, null, null);
        chai_1.expect(function () {
            filteringPlugin.processTelemetry(remoteDependencyData, null);
        }).to["throw"](RangeError);
    });
    it("Should replace the URL in the 'data' property with hardcoded " + msftDomain, function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredData: ["" + msftDomain]
                },
                _a)
        };
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.data).to.equal(msftDomain);
    });
    it("Should replace the URL in the 'data' property with regular expression captured", function () {
        var _a;
        var remoteDependencyData = setupInitialTelemetry();
        var extensionConfig = { extensionConfig: (_a = {},
                _a[filteringPlugin.identifier] = {
                    filteredData: [/^(.*?) .*$/gi, '$1 **DATA URL REMOVED**']
                },
                _a)
        };
        filteringPlugin.initialize(extensionConfig, null, null, null);
        filteringPlugin.processTelemetry(remoteDependencyData, null);
        chai_1.expect(remoteDependencyData.baseData.data).to.equal(testMethod + " **DATA URL REMOVED**");
    });
});
//# sourceMappingURL=TelemetryFilterPlugin.spec.js.map