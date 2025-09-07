if (figma.currentPage.selection.length === 0) {
  figma.closePlugin("Nothing selected. Please select component instances to annotate.");
}
async function main() {
  var _a;
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
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
    const propDefinitions = (mainComponent === null || mainComponent === void 0 ? void 0 : mainComponent.componentPropertyDefinitions) || {};
    const keyNameMap = {};
    for (const key in propDefinitions) {
      const def = propDefinitions[key];
      if (def && typeof def === 'object' && 'name' in def) {
        keyNameMap[key] = def.name;
      }
    }
    const getPropName = (key) => keyNameMap[key] || key;
    const lines = [];
    const seen = new Set();
    const addLine = (line) => {
      if (!seen.has(line)) {
        lines.push(line);
        seen.add(line);
      }
    };
    addLine(componentName);
    for (const key in variantProps) {
      const name = getPropName(key);
      addLine(`${name}: ${variantProps[key]}`);
    }
    for (const key in componentProps) {
      const prop = componentProps[key];
      if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
        continue;
      }
      const value = typeof prop === 'object' && prop !== null && 'value' in prop ? prop.value : prop;
      const name = getPropName(key);
      addLine(`${name}: ${value}`);
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
}
main();
