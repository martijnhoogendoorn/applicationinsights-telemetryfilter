import { IConfig } from '@microsoft/applicationinsights-common';
import { IPlugin, IConfiguration, IAppInsightsCore, BaseTelemetryPlugin, ITelemetryItem, IProcessTelemetryContext, ITelemetryPluginChain } from "@microsoft/applicationinsights-core-js";
export default class FilterPlugin extends BaseTelemetryPlugin {
    priority: number;
    identifier: string;
    private _extensionConfig;
    initialize(config: IConfiguration & IConfig, core: IAppInsightsCore, extensions: IPlugin[], pluginChain?: ITelemetryPluginChain): void;
    /**
     * Filters out configured information from the telemetry event prior to sending it to Application Insights
     * @param event The event that needs to be processed
     */
    processTelemetry(event: ITelemetryItem, itemCtx?: IProcessTelemetryContext): void;
    private replaceSimpleProperty;
    private processHeaders;
    private getPropertyCaseInsensitive;
}
