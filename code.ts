if (figma.currentPage.selection.length === 0) {
  figma.closePlugin("Nothing selected. Please select component instances to annotate.");
}

async function main() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

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

    function createRow(rowTitle: string, rowValue: string) {
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
      const value =
        typeof prop === 'object' && prop !== null && 'value' in prop
          ? (prop as any).value
          : (prop as any);
      createRow(key, `${value}`);
    }

    figma.currentPage.appendChild(primaryFrame);
    primaryFrame.x = positionX;
    primaryFrame.y = positionY - primaryFrame.height;
  }

  figma.closePlugin('Annotating Variants');
}

main();
