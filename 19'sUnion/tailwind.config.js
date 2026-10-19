/** Tailwind CSS production build config */
module.exports = {
  // Index.html (markup) + js/*.js (logic that used to be inline in Index.html,
  // kept in the scan so any utility classes used inside scripts stay generated)
  content: ["./Index.html", "./js/*.js"],
  theme: {
    extend: {}
  },
  plugins: []
};