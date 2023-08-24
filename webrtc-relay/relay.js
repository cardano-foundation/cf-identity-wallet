import { mplex } from "@libp2p/mplex"
import { createLibp2p } from "libp2p"
import { noise } from "@chainsafe/libp2p-noise"
import { circuitRelayServer } from "libp2p/circuit-relay"
import { webSockets } from "@libp2p/websockets"
import { identifyService } from "libp2p/identify"
import { createFromJSON } from "@libp2p/peer-id-factory";
import { yamux } from "@chainsafe/libp2p-yamux"
const PORT = process.env.PORT || 51986

async function createServer() {
  const id = await createFromJSON({
    "id": "QmUDSANiD1VyciqTgUBTw9egXHAtmamrtR1sa8SNf4aPHa",
    "privKey": "CAAS4QQwggJdAgEAAoGBANK5DJC5wJ28USOLVEHXWXxN26oYE0dzNF2YSDVfx1TF/msWxDxxi8HWUZwBg1NVV9NO7rZYNacfVNw2q3/ZlWBg+kb/YdzPhmzSCEA4NDRKz2kVfNt1LmcoUk84w1rTGSkaxKjolQ5Nr2bp0dX6LzVHfBOxM61makwrlkhh91pBAgMBAAECgYEAu28qRBlVwXheW9V07tPUnwLKHzQnAejxbUclA4TcUwWCVlL73h/JhnNSSAf4fkltQ2H0Z3Fy1+LAothmF+S8Pk6njfRmtm0cn/j8QT2g0k987czWbKCXAIKbqJmo1zVn+RX9diFkxwEKD7BuO3tDiGjJQb2JQvgumZCf1xhdfLkCQQDzBBTxfhvxa7f4XsTKmuud/KiOYHCnU89aCUvfE0phKGOJWSKH60FTrbfdyXmL/eL4N0UggZ9nKZ+g8fVhg09jAkEA3ftE+2F89Sw90KiM1i/uaQD2gDBf6t2wRvI7KTLrWCXzd/AdEJxF5NNwD71NJm45h/3EZBT54uTdn+9Fd1abCwJAXJr7mCMkZtVTn9QNTd/HVccIPGlHxJvNclQEk5d4SpnnhFlxLTZbCJY0cNHr/YrcSRZWw1Jh+iAEcoKBrY0qXQJBAI5ZswvtoX9sBpwHaoF0LVQi7PCZlPj9fyyP7AZog+l8NNyGG21qeZvbR3Kgd5gceUJPJyDzHqg1Ejac7xQvcq8CQEQphlCAtORsb08LK95kzE8dediFeuc6FKx254qGjSRz7ir2hL54+kWDGeOaBVQoHmFA5LTwXoDOQLgWvgq7HUY=",
    "pubKey": "CAASogEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBANK5DJC5wJ28USOLVEHXWXxN26oYE0dzNF2YSDVfx1TF/msWxDxxi8HWUZwBg1NVV9NO7rZYNacfVNw2q3/ZlWBg+kb/YdzPhmzSCEA4NDRKz2kVfNt1LmcoUk84w1rTGSkaxKjolQ5Nr2bp0dX6LzVHfBOxM61makwrlkhh91pBAgMBAAE="
  })
  const server = await createLibp2p({
    peerId: id,
    addresses: {
      listen: [`/ip4/127.0.0.1/tcp/${PORT}/ws`]
    },
    transports: [
      webSockets()
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux(), mplex()
    ],
    services: {
      identify: identifyService(),
      relay: circuitRelayServer()
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true
      },
      advertise: {
        enabled: true,
      }
    }

  })
  console.log(`Node started with id ${server.peerId.toString()}`)
  console.log("Listening on:")
  server.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
  return server;
}

async function main() {
  console.log("Starting relay node...")
  let server; 
  server = await createServer();
  await server.start();
}

main();
