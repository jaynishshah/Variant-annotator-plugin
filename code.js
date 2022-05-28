

// //load font for the text box to render
// async function loadFont() {

//     await figma.loadFontAsync({
//         family: 'Inter',
//         style: 'Regular',
//     });
  
//   };

//   (async() => {
//     await loadFont()

// // Check if the user has selected an object that's not a component instance
// if (figma.currentPage.selection.length !== 1) {
//     figma.closePlugin("Please select component instances to annotate")
// }
// else if (selectedInstance.type !== 'INSTANCE') {
//     figma.closePlugin("Please select component instances to annotate")
// }

// // Check if the user has selected an object that's a component instance
// // Create a text box
// else if (selectedInstance.type === 'INSTANCE') {
//     const nodes = [];
//         for (let i = 0; i < 1; i++) {
//             const text = figma.createText();
//              text.x = positionX;
//              text.y = positionY;
//              text.fontSize = 16;
//              text.characters = "this is a component instance";
//             figma.currentPage.appendChild(text);
//             nodes.push(text);
//         }
//         figma.currentPage.selection = nodes;
//     //    figma.viewport.scrollAndZoomIntoView(nodes);
//     figma.closePlugin("Annotating Variants")
// }
// })();

// Check if the user has selected an object that's not a component instance
if (figma.currentPage.selection.length === 0) {
    figma.closePlugin("Nothing selected. Please select component instances to annotate.")
}

async function main() {

//Defining a component instance
let selectedInstance = figma.currentPage.selection[0];
let positionX = (selectedInstance.absoluteRenderBounds.x);
let positionY = (selectedInstance.absoluteRenderBounds.y) - 80;

const instancePropInfo = selectedInstance.variantProperties;
var propString = '';
for (let key in instancePropInfo) {
    //console.log(key + ':' + theme[key]);
    if (!propString) {
        propString = key + ':' + instancePropInfo[key];
    } else {
        propString += '\n' + key + ':' + instancePropInfo[key];
    }
}

//let instancePropText = JSON.stringify(instancePropInfo);
//let variantPropText = instancePropText.valueOf();

await figma.loadFontAsync({
            family: 'Inter',
            style: 'Regular',
        });

if (selectedInstance.type !== 'INSTANCE') {
    figma.closePlugin("Please select component instances to annotate")
}

// Check if the user has selected an object that's a component instance
// Create a text box
else if (selectedInstance.type === 'INSTANCE') {
    const nodes = [];
        for (let i = 0; i < 1; i++) {
            const text = figma.createText();
             text.fontSize = 16;
             text.characters = propString;
             text.x = positionX;
             text.y = positionY-(text.absoluteRenderBounds.height);
            figma.currentPage.appendChild(text);
            nodes.push(text);
        }
        figma.currentPage.selection = nodes;
    //    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.closePlugin("Annotating Variants")
}

}

main();