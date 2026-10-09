/*
  To add artwork:
  1. Put the image in ../images/gallery/.
  2. Add an entry to the matching list below.
  3. Commit and push the new image and this file.
*/
const sfwArt = [
  {
    image: "../images/gallery/veightvilem.png",
    title: "Physical Badge",
    artist: "Vilém",
    artistUrl: "https://www.instagram.com/vilem.the.sharkmoth/"
  }
];
const nsfwArt = [];

function renderGallery(entries, targetId, emptyMessage) {
  const target = document.querySelector(`#${targetId}`);

  if (!entries.length) {
    target.className = "empty-gallery";
    target.textContent = emptyMessage;
    return;
  }

  target.innerHTML = entries.map(art => `
    <article class="art-card">
      <img src="${art.image}" alt="${art.title}">
      <div class="art-info">
        <h3 class="art-title">${art.title}</h3>
        <div class="art-artist">by <a href="${art.artistUrl}" target="_blank" rel="noreferrer">${art.artist}</a></div>
      </div>
    </article>
  `).join("");
}

renderGallery(sfwArt, "sfwGallery", "SFW artwork will appear here soon.");

const openNsfw = document.querySelector("#openNsfw");
const nsfwGallery = document.querySelector("#nsfwGallery");

openNsfw.addEventListener("click", () => {
  if (!confirm("This section contains adult artwork. Are you 18 or older?")) {
    return;
  }

  renderGallery(nsfwArt, "nsfwGallery", "NSFW artwork will appear here soon.");
  nsfwGallery.classList.remove("hidden");
  openNsfw.remove();
});
