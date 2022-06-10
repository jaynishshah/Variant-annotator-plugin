// Check if the user has selected an object that's not a component instance 
if (figma.currentPage.selection.length === 0) {
    figma.closePlugin("Nothing selected. Please select component instances to annotate.")
}

async function main() {

    await figma.loadFontAsync({
        family: 'Inter',
        style: 'Regular',
    });

    const selectedInstance = figma.currentPage.selection;
    //console.log(selectedInstance);
    selectedInstance.forEach(runAnnotator);

    function runAnnotator(item, index, arr) {
        
        if (item.type !== 'INSTANCE') {
            figma.closePlugin("Please select ONLY component instances to annotate.")
        }

        if (item.variantProperties === null) {
            figma.closePlugin("No variant properties found.")
        } 
        
        else if (item.type === 'INSTANCE')  {
        //console.log(item);
        let positionX = (item.absoluteRenderBounds.x);
        let positionY = (item.absoluteRenderBounds.y) - 80;
        //console.log(positionX,positionY);
        const instancePropInfo = item.variantProperties;
        //console.log(instancePropInfo);

        var propString = '';
        for (let key in instancePropInfo) {
        //console.log(key + ':' + theme[key]);
        if (!propString) {
            propString = key + ':' + instancePropInfo[key];
        } else {
            propString += '\n' + key + ':' + instancePropInfo[key];
        }
        }
        //console.log(propString);

        const nodes = [];
        const text = figma.createText();
        text.fontSize = 16;
        text.characters = propString;
        text.x = positionX;
        text.y = positionY-(text.absoluteRenderBounds.height);
        figma.currentPage.appendChild(text);
        nodes.push(text);
        figma.closePlugin("Annotating Variants");
    }
    }

}

main();