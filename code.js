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
            const componentName = item.mainComponent ? item.mainComponent.name : item.name;
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
            figma.currentPage.appendChild(text);
            text.x = positionX;
            text.y = positionY - text.height;
        }
        figma.closePlugin('Annotating Variants');
    });
}
main();
