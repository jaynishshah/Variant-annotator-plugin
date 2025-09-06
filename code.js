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
            const valueString = lines.slice(1).join('\n');
            const titleText = figma.createText();
            titleText.fontName = { family: 'Inter', style: 'Bold' };
            titleText.fontSize = 16;
            titleText.characters = componentName;
            titleText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            figma.currentPage.appendChild(titleText);
            const valueText = figma.createText();
            valueText.fontName = { family: 'Inter', style: 'Regular' };
            valueText.fontSize = 16;
            valueText.characters = valueString;
            valueText.fills = [
                { type: 'SOLID', color: { r: 1, g: 214 / 255, b: 20 / 255 } },
            ];
            figma.currentPage.appendChild(valueText);
            titleText.x = positionX;
            valueText.x = positionX;
            valueText.y = positionY - valueText.height;
            titleText.y = valueText.y - titleText.height;
        }
        figma.closePlugin('Annotating Variants');
    });
}
main();
