import { RemoteDependencyData, IPageViewTelemetry, IMetricTelemetry, IAppInsights, IConfig } from '@microsoft/applicationinsights-common';
import { IPlugin, IConfiguration, IAppInsightsCore, ITelemetryPlugin, BaseTelemetryPlugin, CoreUtils, ITelemetryItem, IProcessTelemetryContext, ITelemetryPluginChain, _InternalMessageId, LoggingSeverity, ICustomProperties } from "@microsoft/applicationinsights-core-js";
import { ITelemetryFilterExtensionConfig } from './Interfaces/ITelemetryFilterExtensionConfig';

export default class FilterPlugin extends BaseTelemetryPlugin {
    public priority : number = 200;
    public identifier: string = "TelemetryFilterPlugin";

    private _extensionConfig!: ITelemetryFilterExtensionConfig | undefined;

    initialize(config: IConfiguration & IConfig, core: IAppInsightsCore, extensions: IPlugin[], pluginChain?:ITelemetryPluginChain) {
        super.initialize(config, core, extensions, pluginChain);
        
        this._extensionConfig =
            config.extensionConfig && config.extensionConfig[this.identifier]
                ? (config.extensionConfig[this.identifier] as ITelemetryFilterExtensionConfig)
                : undefined;
    }

    /**
     * Filters out configured information from the telemetry event prior to sending it to Application Insights
     * @param event The event that needs to be processed
     */
    processTelemetry(event: ITelemetryItem, itemCtx?: IProcessTelemetryContext) {
        if(this._extensionConfig !== undefined) {
            // Only process RemoteDependency (Ajax and fetch requests)
            if(event.baseType === RemoteDependencyData.dataType) {
                this.processHeaders(event.baseData!.properties?.requestHeaders);
                this.replaceSimpleProperty(event.baseData, 'name', this._extensionConfig.filteredName);
                this.replaceSimpleProperty(event.baseData, 'data', this._extensionConfig.filteredData);
            }
        }

        this.processNext(event, itemCtx!);
    }

    private replaceSimpleProperty(baseData: any, propertyName: string, replacementConfig : string[2]) {
        let configItem = this.getPropertyCaseInsensitive(this._extensionConfig, `filtered${propertyName}`);
        if(baseData !== undefined && configItem !== undefined && replacementConfig !== undefined) {
            if(replacementConfig.length == 1) {
                if(replacementConfig[0] === null) {
                    throw new RangeError(`The replacement configuration for a unitary field (${configItem}) cannot be set without a replacement value`);
                } else {
                    baseData[propertyName] = replacementConfig[0];
                }
            } else {
                let currentValue = baseData[propertyName];
                if(currentValue !== undefined) {
                    let regexMatcher : string = replacementConfig[0];
                    let regexReplace : string = replacementConfig[1];
                    
                    if(regexMatcher.match(currentValue) !== null) {
                        baseData[propertyName] = currentValue.replace(regexMatcher, regexReplace);
                    }
                }
            }
        }
    }

    private processHeaders(headers: any) {
        if(headers !== undefined && this._extensionConfig.filteredHeaders !== undefined) {            
            CoreUtils.arrForEach(Object.keys(this._extensionConfig.filteredHeaders), filteredHeader => {
                // Ensure we ignore the case of the header
                let headerProperty = this.getPropertyCaseInsensitive(headers, filteredHeader);
                // In case we found a match between configured and case insensitive property of the headers
                if(filteredHeader !== undefined && headerProperty !== undefined) {
                    // If a replacement value is configured
                    if(this._extensionConfig?.filteredHeaders![filteredHeader]) {
                        const headerConfig = this._extensionConfig?.filteredHeaders![filteredHeader];
                        // Enter the replacement value
                        if(headerConfig.length == 1) {
                            headers[headerProperty] = headerConfig[0];
                        } else {
                            let currentValue : string = headers[headerProperty];
                            if(currentValue !== undefined) {
                                let regexMatcher : string = headerConfig[0];
                                let regexReplace : string = headerConfig[1];

                                if(regexMatcher.match(currentValue) !== null) {
                                    headers[headerProperty] = currentValue.replace(regexMatcher, regexReplace);
                                }
                            }
                        }
                    } else {
                        // Otherwise, silently delete the property
                        delete headers[headerProperty];
                    }
                }
            });
        }
    }

    private getPropertyCaseInsensitive(object : any, key : string) {
        return Object.keys(object).filter(function(k) {
            return k.toLowerCase() === key.toLowerCase();
        })[0];
    } 
}
