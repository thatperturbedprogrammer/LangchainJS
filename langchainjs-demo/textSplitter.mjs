import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs, { rename } from "fs";
import http from "http";
import formidable from "formidable";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Server & User uploaded file
http
  .createServer(async function (req, res) {
    if (req.url === "/fileupload" && req.method.toLowerCase() === "post") {
      const form = formidable({});

      try {
        const [fields, files] = await form.parse(req);

        const oldpath = files.filetoupload[0].filepath;
        const newpath =
          __dirname + "/" + files.filetoupload[0].originalFilename;

        rename(oldpath, newpath, async function (err) {
          if (err) {
            res.writeHead(500);
            return res.end("Error moving file.");
          }

          // Success!
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.write("File uploaded and moved.\n");

          try {
            const data = fs.readFileSync(newpath, "utf-8");

            const splitter = new RecursiveCharacterTextSplitter({
              chunkSize: 500,
              separators: ["\r\n", "\n\n", "\n", " ", "", "###"],
              chunkOverlap: 50,
            });

            const output = await splitter.createDocuments([data]);
            console.log("Splitted output: ", output);

            res.end("Chunks created. Check console.");
          } catch (error) {
            console.log("Error reading or splitting: ", error);
            res.end("File read/split failed.");
          }
        });
      } catch (err) {
        res.writeHead(500);
        res.end("Form parsing error.");
      }
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        '<form action="fileupload" method="post" enctype="multipart/form-data">'
      );
      res.write('<input type="file" name="filetoupload"><br>');
      res.write('<input type="submit">');
      res.write("</form>");
      return res.end();
    }
  })
  .listen(8080);

// Local File
// let textFromFile = "";
// try {
//   console.log("Reading file...");

//   const data = fs.readFileSync("textfile.txt", "utf-8");
//   // console.log("data: ", data);

//   textFromFile = data;

//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 500,
//     separators: ["\n\n", "\n", " ", "", "###"],
//     chunkOverlap: 50,
//   });
//   const output = await splitter.createDocuments([textFromFile]);

//   // console.log("Splitted output: ", output);
// } catch (error) {
//   console.log("all errors: ", error);
// }
