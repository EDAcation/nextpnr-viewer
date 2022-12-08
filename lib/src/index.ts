import { NextPNRViewer } from './viewer';
import { ViewerConfig } from './viewer.interface';

export default (div: HTMLDivElement, config: ViewerConfig) => new NextPNRViewer(div, config);
