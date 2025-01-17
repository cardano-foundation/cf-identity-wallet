/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,html,css,scss}"],
  theme: {
    extend: {
      backgroundImage: {
        hero: "url('$bgImgs/museum.png')",
        lobby: "url('$bgImgs/IIW-lobby-2.png')",
        demo: "url('$bgImgs/IIW-photo.png')",
        locker: "url('$bgImgs/locker.png')",
      },
    },
  },
  plugins: [],
};
