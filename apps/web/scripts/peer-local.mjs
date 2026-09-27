// Local PeerJS signalling server for testing online versus without the
// public broker: `npm run peer:local` (port 9000, or PEER_PORT), then open
// the game with ?peer=127.0.0.1:9000 in both tabs / browsers.
import { PeerServer } from 'peer';

const port = Number(process.env.PEER_PORT ?? 9000);
const server = PeerServer({ port, path: '/', host: '0.0.0.0', allow_discovery: false });
server.on('connection', (c) => console.log('+', c.getId()));
server.on('disconnect', (c) => console.log('-', c.getId()));
console.log(`PeerServer sur http://127.0.0.1:${port}/ — ouvrez le jeu avec ?peer=127.0.0.1:${port}`);
