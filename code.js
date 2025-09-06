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
            const primaryFrame = figma.createFrame();
            primaryFrame.layoutMode = 'VERTICAL';
            primaryFrame.primaryAxisSizingMode = 'AUTO';
            primaryFrame.counterAxisSizingMode = 'AUTO';
            primaryFrame.fills = [];
            const title = figma.createText();
            title.fontName = { family: 'Inter', style: 'Bold' };
            title.fontSize = 16;
            title.characters = componentName;
            primaryFrame.appendChild(title);
            function createRow(rowTitle, rowValue) {
                const row = figma.createFrame();
                row.layoutMode = 'HORIZONTAL';
                row.primaryAxisSizingMode = 'AUTO';
                row.counterAxisSizingMode = 'AUTO';
                row.fills = [];
                const titleNode = figma.createText();
                titleNode.fontName = { family: 'Inter', style: 'Bold' };
                titleNode.fontSize = 16;
                titleNode.characters = `${rowTitle}:`;
                const valueNode = figma.createText();
                valueNode.fontName = { family: 'Inter', style: 'Regular' };
                valueNode.fontSize = 16;
                valueNode.characters = rowValue;
                row.appendChild(titleNode);
                row.appendChild(valueNode);
                primaryFrame.appendChild(row);
            }
            for (const key in variantProps) {
                createRow(key, `${variantProps[key]}`);
            }
            for (const key in componentProps) {
                const prop = componentProps[key];
                if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
                    continue;
                }
                const value = typeof prop === 'object' && prop !== null && 'value' in prop
                    ? prop.value
                    : prop;
                createRow(key, `${value}`);
            }
            figma.currentPage.appendChild(primaryFrame);
            primaryFrame.x = positionX;
            primaryFrame.y = positionY - primaryFrame.height;
        }
        figma.closePlugin('Annotating Variants');
    });
}
main();
