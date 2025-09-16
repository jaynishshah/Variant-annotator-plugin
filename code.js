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
function sanitizeName(name) {
    return name.replace(/#\d+(?::\d+)*$/, '');
}
function main() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadFontAsync({ family: 'Roboto Mono', style: 'Regular' });
        yield figma.loadFontAsync({ family: 'Roboto Mono', style: 'Bold' });
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
            const sanitizedComponentName = sanitizeName(componentName);
            const lines = [sanitizedComponentName];
            for (const key in variantProps) {
                const sanitizedKey = sanitizeName(key);
                let value = variantProps[key];
                if (typeof value === 'string') {
                    value = sanitizeName(value);
                }
                lines.push(`${sanitizedKey}: ${value}`);
            }
            const defs = ((_b = item.mainComponent) === null || _b === void 0 ? void 0 : _b.componentPropertyDefinitions) || {};
            for (const key in componentProps) {
                const prop = componentProps[key];
                if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
                    continue;
                }
                const def = defs[key];
                if (def && typeof def === 'object') {
                    let isVisible = true;
                    const visibility = def.visible;
                    if (typeof visibility === 'boolean') {
                        isVisible = visibility;
                    }
                    else if (typeof visibility === 'string') {
                        const controller = componentProps[visibility];
                        const controllerValue = typeof controller === 'object' && controller !== null && 'value' in controller
                            ? controller.value
                            : controller;
                        isVisible = Boolean(controllerValue);
                    }
                    else if (visibility && typeof visibility === 'object') {
                        const propertyName = visibility.propertyName;
                        if (propertyName) {
                            const controller = componentProps[propertyName];
                            const controllerValue = typeof controller === 'object' && controller !== null && 'value' in controller
                                ? controller.value
                                : controller;
                            if ('value' in visibility) {
                                isVisible = controllerValue === visibility.value;
                            }
                            else {
                                isVisible = Boolean(controllerValue);
                            }
                        }
                    }
                    if (!isVisible) {
                        continue;
                    }
                }
                const sanitizedKey = sanitizeName(key);
                let value = typeof prop === 'object' && prop !== null && 'value' in prop ? prop.value : prop;
                if (typeof value === 'string') {
                    value = sanitizeName(value);
                }
                lines.push(`${sanitizedKey}: ${value}`);
            }
            const propString = lines.join('\n');
            const text = figma.createText();
            text.fontName = { family: 'Roboto Mono', style: 'Regular' };
            text.fontSize = 16;
            text.characters = propString;
            text.setRangeFontName(0, sanitizedComponentName.length, { family: 'Roboto Mono', style: 'Bold' });
            figma.currentPage.appendChild(text);
            text.x = positionX;
            text.y = positionY - text.height;
        }
        figma.closePlugin('Annotating Variants');
    });
}
main();
