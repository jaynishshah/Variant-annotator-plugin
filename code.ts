if (figma.currentPage.selection.length === 0) {
  figma.closePlugin("Nothing selected. Please select component instances to annotate.");
}

function sanitizeName(name: string): string {
  return name.replace(/#\d+(?::\d+)*$/, '');
}

async function main() {
  await figma.loadFontAsync({ family: 'Roboto Mono', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto Mono', style: 'Bold' });

  const selectedInstances = figma.currentPage.selection;

  for (const item of selectedInstances) {
    if (item.type !== 'INSTANCE') {
      figma.closePlugin('Please select ONLY component instances to annotate.');
      return;
    }

    const variantProps = item.variantProperties || {};
    const componentProps: { [key: string]: any } = (item as any).componentProperties || {};

    const hasVariantProps = Object.keys(variantProps).length > 0;
    const hasComponentProps = Object.keys(componentProps).length > 0;
    if (!hasVariantProps && !hasComponentProps) {
      figma.closePlugin('No variant or component properties found.');
      return;
    }

    const positionX = item.absoluteRenderBounds!.x;
    const positionY = item.absoluteRenderBounds!.y - 80;
    const mainComponent = item.mainComponent;
    const componentName =
      mainComponent &&
      mainComponent.parent?.type === 'COMPONENT_SET' &&
      item.name === mainComponent.name
        ? mainComponent.parent.name
        : item.name;

    const sanitizedComponentName = sanitizeName(componentName);

    const lines: string[] = [sanitizedComponentName];

    for (const key in variantProps) {
      const sanitizedKey = sanitizeName(key);
      let value = variantProps[key];
      if (typeof value === 'string') {
        value = sanitizeName(value);
      }
      lines.push(`${sanitizedKey}: ${value}`);
    }

    for (const key in componentProps) {
      const sanitizedKey = sanitizeName(key);
      const prop = componentProps[key];
      if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
        continue;
      }
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
}

main();
