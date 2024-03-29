
/** folder where the generated zip files should be placed */
const outputFolder = "dist";

const targetVersion = "1.20.4";
const settings = [
  {
    name: "NoMoreFloatingIslands",
    mc: targetVersion,
    version: "1.0.0",
    replace: {
      pack_format: 15,
      authors: ['Buecher_wurm']
    },
  },
];


export { settings, outputFolder };
