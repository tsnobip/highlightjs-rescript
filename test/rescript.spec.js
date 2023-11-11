import fs from "fs";
import hljs from "highlight.js/lib/common";
import * as path from "path";
import * as glob from "glob";
import rescript from "../src/languages/rescript.js";
import chai from "chai";

const expect = chai.expect;

hljs.registerLanguage("rescript", rescript);

describe("highlightjs-rescript", () => {
  it("should detect correct language", () => {
    // Load the input file...
    const input = fs.readFileSync(
      new URL("./detect/rescript/default.txt", import.meta.url),
      "utf-8"
    );

    const { language } = hljs.highlightAuto(input);
    expect(language).to.equal("rescript");
  });

  process.chdir("./test");
  const filenames = glob.sync("./markup/rescript/*.expect.txt");
  filenames.forEach(function (filename) {
    const testName = path.basename(filename, ".expect.txt");
    const sourceName = filename.replace(/\.expect/, "");
    it("should generate correct markup for " + testName, () => {
      // Load the input file...
      const input = fs.readFileSync(
        new URL(sourceName, import.meta.url),
        "utf-8"
      );

      // Do the highlight...
      const { value: result, language } = hljs.highlight(input, {
        language: "rescript",
      });
      expect(language).to.equal("rescript");

      // Check the output is what we expect...
      const expected = fs.readFileSync(
        new URL(filename, import.meta.url),
        "utf-8"
      );
      expect(result).to.equal(expected);
    });
  });
});
