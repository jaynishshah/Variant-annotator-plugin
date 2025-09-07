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
            const lines = [
                { text: componentName, boldLength: componentName.length },
            ];
            for (const key in variantProps) {
                const line = `${key}: ${variantProps[key]}`;
                lines.push({ text: line, boldLength: key.length + 1 });
            }
            for (const key in componentProps) {
                const prop = componentProps[key];
                if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
                    continue;
                }
                const value = typeof prop === 'object' && prop !== null && 'value' in prop
                    ? prop.value
                    : prop;
                const line = `${key}: ${value}`;
                lines.push({ text: line, boldLength: key.length + 1 });
            }
            const container = figma.createFrame();
            container.layoutMode = 'VERTICAL';
            container.paddingTop = container.paddingBottom = 8;
            container.paddingLeft = container.paddingRight = 8;
            container.itemSpacing = 4;
            container.cornerRadius = 2;
            for (const line of lines) {
                const lineFrame = figma.createFrame();
                lineFrame.layoutMode = 'HORIZONTAL';
                lineFrame.fills = [];
                const textNode = figma.createText();
                textNode.fontName = { family: 'Inter', style: 'Regular' };
                textNode.fontSize = 16;
                textNode.characters = line.text;
                textNode.setRangeFontName(0, line.boldLength, {
                    family: 'Inter',
                    style: 'Bold',
                });
                lineFrame.appendChild(textNode);
                container.appendChild(lineFrame);
            }
            figma.currentPage.appendChild(container);
            container.x = positionX;
            container.y = positionY - container.height;
        }
        figma.closePlugin('Annotating Variants');
    });
}
main();
