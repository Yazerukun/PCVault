import { copyFileSync } from 'node:fs'

copyFileSync(new URL('../src/data/games.json', import.meta.url), new URL('../public/games.json', import.meta.url))
console.log('synced games.json -> public/games.json')