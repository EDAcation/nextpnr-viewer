import {NextPNRViewer} from './viewer';
import {ViewerConfig} from './viewer.interface';

export default (div: HTMLDivElement, config: Partial<ViewerConfig>) => new NextPNRViewer(div, config);
