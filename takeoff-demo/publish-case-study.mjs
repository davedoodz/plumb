import {cp, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Keep authored case-study files outside disposable render output.
const source = new URL('./case-study/', import.meta.url);
const destination = new URL('./out/case-study/', import.meta.url);
await mkdir(destination, {recursive: true});
await cp(source, destination, {recursive: true});
console.log(`Case study published to ${fileURLToPath(destination)}`);
