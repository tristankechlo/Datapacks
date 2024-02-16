
/** folder where the generated zip files should be placed */
const outputFolder = "dist";

const targetVersion = "1.20.4";
const settings = [
  {
    name: "NoMoreFloatingIslands",
    mc: targetVersion,
    replace: {
      pack_format: Symbol("Test"),
      authors: ['Buecher_wurm']
    },
  },
];


export { settings, outputFolder };
