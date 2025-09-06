var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
if (figma.currentPage.selection.length === 0) {
    figma.closePlugin("Nothing selected. Please select component instances to annotate.");
}
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        yield figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
        const selectedInstances = figma.currentPage.selection;
        for (const item of selectedInstances) {
            if (item.type !== 'INSTANCE') {
                figma.closePlugin('Please select ONLY component instances to annotate.');
                return;
            }
            const variantProps = item.variantProperties || {};
            const componentProps = item.componentProperties || {};
            const hasVariantProps = Object.keys(variantProps).length > 0;
            const hasComponentProps = Object.keys(componentProps).length > 0;
            if (!hasVariantProps && !hasComponentProps) {
                figma.closePlugin('No variant or component properties found.');
                return;
            }
            const positionX = item.absoluteRenderBounds.x;
            const positionY = item.absoluteRenderBounds.y - 80;
            const mainComponent = item.mainComponent;
            const componentName = mainComponent &&
                ((_a = mainComponent.parent) === null || _a === void 0 ? void 0 : _a.type) === 'COMPONENT_SET' &&
                item.name === mainComponent.name
                ? mainComponent.parent.name
                : item.name;
            const lines = [componentName];
            for (const key in variantProps) {
                lines.push(`${key}: ${variantProps[key]}`);
            }
            for (const key in componentProps) {
                const prop = componentProps[key];
                if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
                    continue;
                }
                const value = typeof prop === 'object' && prop !== null && 'value' in prop ? prop.value : prop;
                lines.push(`${key}: ${value}`);
            }
            const propString = lines.join('\n');
            const text = figma.createText();
            text.fontName = { family: 'Inter', style: 'Regular' };
            text.fontSize = 16;
            text.characters = propString;
            text.setRangeFontName(0, componentName.length, { family: 'Inter', style: 'Bold' });
            const frame = figma.createFrame();
            frame.layoutMode = 'VERTICAL';
            frame.counterAxisSizingMode = 'AUTO';
            frame.primaryAxisSizingMode = 'AUTO';
            frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 8;
            frame.strokes = [
                { type: 'SOLID', color: { r: 0.48235294, g: 0.38039216, b: 1 } },
            ];
            frame.strokeWeight = 1;
            frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            frame.appendChild(text);
            figma.currentPage.appendChild(frame);
            frame.x = positionX;
            frame.y = positionY - frame.height;
            const connector = figma.createConnector();
            connector.connectorStart = { endpointNodeId: frame.id, magnet: 'BOTTOM' };
            connector.connectorEnd = { endpointNodeId: item.id, magnet: 'TOP' };
            connector.connectorEndStrokeCap = 'ARROW_EQUILATERAL';
            connector.strokes = [
                { type: 'SOLID', color: { r: 0.48235294, g: 0.38039216, b: 1 } },
            ];
            connector.strokeWeight = 2;
            figma.currentPage.appendChild(connector);
        }
        figma.closePlugin('Annotating Variants');
    });
}
main();
