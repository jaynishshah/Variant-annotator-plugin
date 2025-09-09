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
figma.showUI(__html__, { width: 160, height: 60 });
function main() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Promise.all([
                figma.loadFontAsync({ family: 'Roboto Mono', style: 'Regular' }),
                figma.loadFontAsync({ family: 'Roboto Mono', style: 'Bold' }),
            ]);
        }
        catch (_e) {
            figma.closePlugin('Roboto Mono font is not available.');
            return;
        }
        const selectedInstances = figma.currentPage.selection;
        const total = selectedInstances.length;
        for (let index = 0; index < total; index++) {
            const item = selectedInstances[index];
            if (item.type !== 'INSTANCE') {
                figma.closePlugin('Please select ONLY component instances to annotate.');
                return;
            }
            figma.ui.postMessage({ type: 'progress', current: index + 1, total });
            const variantProps = item.variantProperties || {};
            const componentProps = item.componentProperties || {};
            const hasVariantProps = Object.keys(variantProps).length > 0;
            const hasComponentProps = Object.keys(componentProps).length > 0;
            if (!hasVariantProps && !hasComponentProps) {
                figma.notify(`Instance "${item.name}" has no annotatable properties.`);
                continue;
            }
            const bounds = (_a = item.absoluteRenderBounds) !== null && _a !== void 0 ? _a : {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
            };
            if (!item.absoluteRenderBounds) {
                figma.notify(`Instance "${item.name}" has no render bounds; using local coordinates.`);
            }
            const mainComponent = item.mainComponent;
            const componentName = mainComponent &&
                ((_b = mainComponent.parent) === null || _b === void 0 ? void 0 : _b.type) === 'COMPONENT_SET' &&
                item.name === mainComponent.name
                ? mainComponent.parent.name
                : item.name;
            const linePairs = [
                { title: 'Component', value: componentName },
            ];
            for (const key in variantProps) {
                linePairs.push({ title: key, value: String(variantProps[key]) });
            }
            const definitions = (mainComponent === null || mainComponent === void 0 ? void 0 : mainComponent.componentPropertyDefinitions) || {};
            for (const key in componentProps) {
                const prop = componentProps[key];
                if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
                    continue;
                }
                const value = typeof prop === 'object' && prop !== null && 'value' in prop ? prop.value : prop;
                const name = (_d = (_c = definitions[key]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : key;
                linePairs.push({ title: name, value: String(value) });
            }
            const annotationFrame = figma.createFrame();
            annotationFrame.layoutMode = 'VERTICAL';
            annotationFrame.primaryAxisSizingMode = 'AUTO';
            annotationFrame.counterAxisSizingMode = 'AUTO';
            annotationFrame.paddingLeft = annotationFrame.paddingRight = 8;
            annotationFrame.paddingTop = annotationFrame.paddingBottom = 8;
            annotationFrame.itemSpacing = 4;
            annotationFrame.cornerRadius = 2;
            annotationFrame.fills = [
                { type: 'SOLID', color: { r: 18 / 255, g: 18 / 255, b: 18 / 255 }, opacity: 0.3 },
            ];
            annotationFrame.strokes = [
                { type: 'SOLID', color: { r: 123 / 255, g: 97 / 255, b: 1 } },
            ];
            annotationFrame.strokeWeight = 1;
            for (const pair of linePairs) {
                const row = figma.createFrame();
                row.layoutMode = 'HORIZONTAL';
                row.primaryAxisSizingMode = 'AUTO';
                row.counterAxisSizingMode = 'AUTO';
                row.itemSpacing = 4;
                const titleNode = figma.createText();
                titleNode.fontName = { family: 'Roboto Mono', style: 'Regular' };
                titleNode.characters = `${pair.title}:`;
                titleNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                const valueNode = figma.createText();
                valueNode.fontName = { family: 'Roboto Mono', style: 'Regular' };
                valueNode.characters = pair.value;
                valueNode.fills = [{ type: 'SOLID', color: { r: 1, g: 0.839, b: 0.078 } }];
                row.appendChild(titleNode);
                row.appendChild(valueNode);
                annotationFrame.appendChild(row);
            }
            figma.currentPage.appendChild(annotationFrame);
            const offset = 16;
            annotationFrame.x = bounds.x + (bounds.width - annotationFrame.width) / 2;
            annotationFrame.y = bounds.y - annotationFrame.height - offset;
            try {
                if ('createConnector' in figma) {
                    const connector = figma.createConnector();
                    connector.strokeWeight = 1;
                    connector.strokes = [
                        { type: 'SOLID', color: { r: 123 / 255, g: 97 / 255, b: 1 } },
                    ];
                    connector.connectorStart = {
                        endpointNodeId: annotationFrame.id,
                        magnet: 'AUTO',
                    };
                    connector.connectorEnd = { endpointNodeId: item.id, magnet: 'AUTO' };
                    connector.connectorEndStrokeCap = 'ARROW_EQUILATERAL';
                    figma.currentPage.appendChild(connector);
                }
                else {
                    const line = figma.createLine();
                    line.strokeWeight = 1;
                    line.strokes = [
                        { type: 'SOLID', color: { r: 123 / 255, g: 97 / 255, b: 1 } },
                    ];
                    const startX = annotationFrame.x + annotationFrame.width / 2;
                    const startY = annotationFrame.y + annotationFrame.height;
                    const endX = item.x + item.width / 2;
                    const endY = item.y;
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    line.x = startX;
                    line.y = startY;
                    line.resize(length, 0);
                    line.rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
                    figma.currentPage.appendChild(line);
                }
            }
            catch (error) {
                console.error('Failed to create connector', error);
            }
            yield new Promise((r) => setTimeout(r, 0));
        }
        figma.ui.postMessage({ type: 'complete' });
        figma.closePlugin('Annotating Variants');
    });
}
main();
