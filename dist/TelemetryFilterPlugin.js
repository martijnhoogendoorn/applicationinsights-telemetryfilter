"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var applicationinsights_common_1 = require("@microsoft/applicationinsights-common");
var applicationinsights_core_js_1 = require("@microsoft/applicationinsights-core-js");
var FilterPlugin = /** @class */ (function (_super) {
    tslib_1.__extends(FilterPlugin, _super);
    function FilterPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.priority = 200;
        _this.identifier = "TelemetryFilterPlugin";
        return _this;
    }
    FilterPlugin.prototype.initialize = function (config, core, extensions, pluginChain) {
        _super.prototype.initialize.call(this, config, core, extensions, pluginChain);
        this._extensionConfig =
            config.extensionConfig && config.extensionConfig[this.identifier]
                ? config.extensionConfig[this.identifier]
                : undefined;
    };
    /**
     * Filters out configured information from the telemetry event prior to sending it to Application Insights
     * @param event The event that needs to be processed
     */
    FilterPlugin.prototype.processTelemetry = function (event, itemCtx) {
        var _a;
        if (this._extensionConfig !== undefined) {
            // Only process RemoteDependency (Ajax and fetch requests)
            if (event.baseType === applicationinsights_common_1.RemoteDependencyData.dataType) {
                this.processHeaders((_a = event.baseData.properties) === null || _a === void 0 ? void 0 : _a.requestHeaders);
                this.replaceSimpleProperty(event.baseData, 'name', this._extensionConfig.filteredName);
                this.replaceSimpleProperty(event.baseData, 'data', this._extensionConfig.filteredData);
            }
        }
        this.processNext(event, itemCtx);
    };
    FilterPlugin.prototype.replaceSimpleProperty = function (baseData, propertyName, replacementConfig) {
        var configItem = this.getPropertyCaseInsensitive(this._extensionConfig, "filtered" + propertyName);
        if (baseData !== undefined && configItem !== undefined && replacementConfig !== undefined) {
            if (replacementConfig.length == 1) {
                if (replacementConfig[0] === null) {
                    throw new RangeError("The replacement configuration for a unitary field (" + configItem + ") cannot be set without a replacement value");
                }
                else {
                    baseData[propertyName] = replacementConfig[0];
                }
            }
            else {
                var currentValue = baseData[propertyName];
                if (currentValue) {
                    var regexMatcher = replacementConfig[0];
                    var regexReplace = replacementConfig[1];
                    if (currentValue.match(regexMatcher) !== null) {
                        baseData[propertyName] = currentValue.replace(regexMatcher, regexReplace);
                    }
                }
            }
        }
    };
    FilterPlugin.prototype.processHeaders = function (headers) {
        var _this = this;
        if (headers !== undefined && this._extensionConfig.filteredHeaders !== undefined) {
            applicationinsights_core_js_1.CoreUtils.arrForEach(Object.keys(this._extensionConfig.filteredHeaders), function (filteredHeader) {
                var _a, _b;
                // Ensure we ignore the case of the header
                var headerProperty = _this.getPropertyCaseInsensitive(headers, filteredHeader);
                // In case we found a match between configured and case insensitive property of the headers
                if (filteredHeader !== undefined && headerProperty !== undefined) {
                    // If a replacement value is configured
                    if (((_a = _this._extensionConfig) === null || _a === void 0 ? void 0 : _a.filteredHeaders)[filteredHeader]) {
                        var headerConfig = ((_b = _this._extensionConfig) === null || _b === void 0 ? void 0 : _b.filteredHeaders)[filteredHeader];
                        // Enter the replacement value
                        if (headerConfig.length == 1) {
                            headers[headerProperty] = headerConfig[0];
                        }
                        else {
                            var currentValue = headers[headerProperty];
                            if (currentValue) {
                                var regexMatcher = headerConfig[0];
                                var regexReplace = headerConfig[1];
                                if (currentValue.match(regexMatcher) !== null) {
                                    headers[headerProperty] = currentValue.replace(regexMatcher, regexReplace);
                                }
                            }
                        }
                    }
                    else {
                        // Otherwise, silently delete the property
                        delete headers[headerProperty];
                    }
                }
            });
        }
    };
    FilterPlugin.prototype.getPropertyCaseInsensitive = function (object, key) {
        return Object.keys(object).filter(function (k) {
            return k.toLowerCase() === key.toLowerCase();
        })[0];
    };
    return FilterPlugin;
}(applicationinsights_core_js_1.BaseTelemetryPlugin));
exports["default"] = FilterPlugin;
//# sourceMappingURL=TelemetryFilterPlugin.js.map