import Main from "@/components/main";
import csv from "csv-parser";
import fs from "fs";
import { resolve } from "path";
import { promisify } from "util";
import { Transform } from "stream";
import { Suspense } from "react";
import { App } from "antd";

const pipeline = promisify(require("stream").pipeline);

async function getSymbolsFromFile(filePath: string) {
  const symbols: string[] = [];
  await pipeline(
    fs.createReadStream(filePath),
    csv(),
    new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        symbols.push(chunk.Symbol);
        callback();
      },
    })
  );
  return symbols;
}

export default async function Home() {
  const symbols = await getSymbolsFromFile(
    resolve(process.cwd(), "src/files/nasdaq_screener_1708931824036.csv")
  );

  return (
    <main>
      <App>
        <Suspense fallback="loading">
          <Main symbols={symbols} />
        </Suspense>
      </App>
    </main>
  );
}
