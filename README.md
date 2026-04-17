# Sharefile 🚀

Sharefile is a fast, secure, and modern peer-to-peer (P2P) file-sharing web application. It allows you to send files directly from one device to another through your browser without ever uploading the files to a central cloud server. 

## Features
* **Direct P2P Transfer:** Files are transferred directly between peers via WebRTC. Your data never touches a storage server, maximizing privacy and speed.

* **Extreme Performance Optimization:**
  * **Batched Disk I/O:** Reads large files from the disk in 4MB batches and synchronously slices them to prevent `ArrayBuffer` memory crashes and async overhead.
  * **Native WebRTC Backpressure:** Uses the official `bufferedamountlow` event instead of JavaScript polling to ensure the network pipe is saturated with zero dead time.
  * **Trickle ICE Enabled:** Dynamically discovers the absolute fastest local or external IP route between the two peers.
* **Modern Tech Stack:** Built with Next.js (App Router), React 19, and Tailwind CSS v4.

## How It Works
1. **The Handshake:** When you create or join a room, the app uses Pusher (WebSockets) to securely exchange tiny bits of connection data (SDP and ICE candidates) between the two browsers.
2. **The Connection:** Once the browsers find each other, `simple-peer` establishes a direct WebRTC DataChannel.
3. **The Transfer:** Files are chunked and sent directly over the local network (or internet) to the receiver. 

## Getting Started

### Prerequisites
Set a free account at [Pusher.com](https://pusher.com/) to handle the WebRTC signaling.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/princ0301/sharefile.git
   cd sharefile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root of your project and add Pusher App Keys:
   ```env
   PUSHER_APP_ID=your_app_id
   NEXT_PUBLIC_PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   NEXT_PUBLIC_PUSHER_CLUSTER=ap2
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) .

## Built With
* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Simple-Peer](https://github.com/feross/simple-peer)
* [Pusher](https://pusher.com/)
