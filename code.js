

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
if (figma.currentPage.selection.length !== 1) {
    figma.closePlugin("Nothing selected. Please select component instances to annotate.")
}

async function main() {

//Defining a component instance
let selectedInstance = figma.currentPage.selection[0];
let positionX = (selectedInstance.x);
let positionY = (selectedInstance.y) - 100;

const instancePropInfo = [selectedInstance.variantProperties];
const instancePropText = JSON.stringify(instancePropInfo);

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
             text.x = positionX;
             text.y = positionY;
             text.fontSize = 16;
             text.characters = instancePropText;
            figma.currentPage.appendChild(text);
            nodes.push(text);
        }
        figma.currentPage.selection = nodes;
    //    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.closePlugin("Annotating Variants")
}

}

main();