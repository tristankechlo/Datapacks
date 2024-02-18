
/** folder where the generated zip files should be placed */
const outputFolder = "dist";

const targetVersion = "1.19.4";
const settings = [
  {
    name: "NoMoreFloatingIslands",
    mc: targetVersion,
    replace: {
      pack_format: 12,
      authors: ['Buecher_wurm']
    },
  },
];


export { settings, outputFolder };
