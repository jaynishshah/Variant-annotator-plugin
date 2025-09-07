if (figma.currentPage.selection.length === 0) {
  figma.closePlugin("Nothing selected. Please select component instances to annotate.");
}

figma.showUI(__html__, { width: 160, height: 60 });

async function main() {
  try {
    await Promise.all([
      figma.loadFontAsync({ family: 'Roboto Mono', style: 'Regular' }),
      figma.loadFontAsync({ family: 'Roboto Mono', style: 'Bold' }),
    ]);
  } catch {
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
    const componentProps: { [key: string]: any } = (item as any).componentProperties || {};

    const hasVariantProps = Object.keys(variantProps).length > 0;
    const hasComponentProps = Object.keys(componentProps).length > 0;
    if (!hasVariantProps && !hasComponentProps) {
      figma.notify(`Instance "${item.name}" has no annotatable properties.`);
      continue;
    }

    const bounds = item.absoluteRenderBounds!;
    const mainComponent = item.mainComponent;
    const componentName =
      mainComponent &&
      mainComponent.parent?.type === 'COMPONENT_SET' &&
      item.name === mainComponent.name
        ? mainComponent.parent.name
        : item.name;

    const linePairs: { title: string; value: string }[] = [
      { title: 'Component', value: componentName },
    ];

    for (const key in variantProps) {
      linePairs.push({ title: key, value: String(variantProps[key]) });
    }

    const definitions = (mainComponent as any)?.componentPropertyDefinitions || {};
    for (const key in componentProps) {
      const prop = componentProps[key];
      if (typeof prop === 'object' && prop !== null && prop.type === 'VARIANT') {
        continue;
      }
      const value =
        typeof prop === 'object' && prop !== null && 'value' in prop ? prop.value : prop;
      const name = (definitions as any)[key]?.name ?? key;
      linePairs.push({ title: name, value: String(value) });
    }

    const primaryFrame = figma.createFrame();
    primaryFrame.layoutMode = 'VERTICAL';
    primaryFrame.primaryAxisSizingMode = 'AUTO';
    primaryFrame.counterAxisSizingMode = 'AUTO';
    primaryFrame.paddingLeft = primaryFrame.paddingRight = 8;
    primaryFrame.paddingTop = primaryFrame.paddingBottom = 8;
    primaryFrame.itemSpacing = 4;
    primaryFrame.cornerRadius = 2;
    primaryFrame.fills = [
      { type: 'SOLID', color: { r: 18 / 255, g: 18 / 255, b: 18 / 255 }, opacity: 0.3 },
    ];
    primaryFrame.strokes = [
      { type: 'SOLID', color: { r: 123 / 255, g: 97 / 255, b: 1 } },
    ];
    primaryFrame.strokeWeight = 1;

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
      primaryFrame.appendChild(row);
    }

    figma.currentPage.appendChild(primaryFrame);
    primaryFrame.x = bounds.x;
    const offset = 16;
    primaryFrame.y = bounds.y - primaryFrame.height - offset;

    try {
      if ('createConnector' in figma) {
        const connector = figma.createConnector();
        connector.strokeWeight = 1;
        connector.strokes = [
          { type: 'SOLID', color: { r: 123 / 255, g: 97 / 255, b: 1 } },
        ];
        connector.connectorStart = {
          endpointNodeId: primaryFrame.id,
          magnet: 'AUTO',
        };
        connector.connectorEnd = { endpointNodeId: item.id, magnet: 'AUTO' };
        connector.connectorEndStrokeCap = 'ARROW_EQUILATERAL';
        figma.currentPage.appendChild(connector);
      } else {
        const line = figma.createLine();
        line.strokeWeight = 1;
        line.strokes = [
          { type: 'SOLID', color: { r: 123 / 255, g: 97 / 255, b: 1 } },
        ];
        const startX = primaryFrame.x + primaryFrame.width / 2;
        const startY = primaryFrame.y + primaryFrame.height;
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
    } catch (error) {
      console.error('Failed to create connector', error);
    }

    await new Promise((r) => setTimeout(r, 0));
  }

  figma.ui.postMessage({ type: 'complete' });
  figma.closePlugin('Annotating Variants');
}

main();
