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
  },
  {
    image: "../images/gallery/avali3.png",
    title: ":3",
    artist: "tagtherobot",
    artistUrl: "https://www.instagram.com/tagtherobot/"
  },
  {
    image: "../images/gallery/oo.gif",
    title: ":o.o",
    artist: "Choccky",
    artistUrl: "https://milkchoccky.github.io/commsheets/"
  },
  {
    image: "../images/gallery/emeccmonster.png",
    title: "Pixel art with my fav energy drink",
    artist: "Emecc",
    artistUrl: "https://emecc-arts.uwu.ai/"
  },
  {
    image: "../images/gallery/chocckyfreeheadshot.jpg",
    title: "Free headshot I got",
    artist: "Choccky",
    artistUrl: "https://milkchoccky.github.io/commsheets/"
  },
  {
    image: "../images/gallery/veightradekmousbite.png",
    title: "PIVOOO",
    artist: "mouse.bite",
    artistUrl: "https://mouscomms.carrd.co"
  },
  {
    image: "../images/gallery/veightoxvabatsy.png",
    title: "Oxvička :3",
    artist: "Batsy",
    artistUrl: "https://www.instagram.com/batsy__bat/"
  },
  {
    image: "../images/gallery/veightgeeking.png",
    title: "Geeking",
    artist: "fuji",
    artistUrl: "https://linktr.ee/chiilliipepper"
  },
  {
    image: "../images/gallery/blue.png",
    title: "👁️",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/cry.png",
    title: "sad",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/evil.png",
    title: "evil veight",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/hi.png",
    title: "hiiiiiiiii",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/lollipop.png",
    title: ":p",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/plead.png",
    title: "🥺",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/soyveight.png",
    title: "Soyjack Veight",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/sus.png",
    title: "Sussy Veight",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/uhh.png",
    title: "Uhh",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/yes.png",
    title: "👍",
    artist: "kwujick",
    artistUrl: "https://www.instagram.com/kwujick.art/"
  },
  {
    image: "../images/gallery/flowers.gif",
    title: "for you :3",
    artist: "Choccky",
    artistUrl: "https://milkchoccky.github.io/commsheets/"
  },
  {
    image: "../images/gallery/heart.gif",
    title: "<3",
    artist: "Choccky",
    artistUrl: "https://milkchoccky.github.io/commsheets/"
  },
  {
    image: "../images/gallery/typing.gif",
    title: "me when my fav person",
    artist: "Choccky",
    artistUrl: "https://milkchoccky.github.io/commsheets/"
  }
];
const nsfwArt = [
  {
    image: "../images/gallery/veightpawblob.png",
    title: ":3",
    artist: "Blob",
    artistUrl: "https://discord.com/users/523147715195174912"
  },
  {
    image: "../images/gallery/pawveight.webp",
    title: "👍",
    artist: "Max",
    artistUrl: "https://www.instagram.com/br0ken.sorrow/"
  }
];

function getThumbnailPath(imagePath) {
  return imagePath
    .replace("../images/gallery/", "../images/gallery/thumbs/")
    .replace(/\.webp$/, ".png");
}

function renderGallery(entries, targetId, emptyMessage) {
  const target = document.querySelector(`#${targetId}`);

  if (!entries.length) {
    target.className = "empty-gallery";
    target.textContent = emptyMessage;
    return;
  }

  target.innerHTML = entries.map((art, index) => `
    <article class="art-card">
      <button class="art-image-link" type="button" data-gallery="${targetId}" data-gallery-index="${index}" aria-label="Open ${art.title} in full resolution">
        <img src="${getThumbnailPath(art.image)}" alt="${art.title}" loading="lazy">
      </button>
      <div class="art-info">
        <h3 class="art-title">${art.title}</h3>
        <div class="art-artist">by <a href="${art.artistUrl}" target="_blank" rel="noreferrer">${art.artist}</a></div>
      </div>
    </article>
  `).join("");
}

const imageModal = document.querySelector("#imageModal");
const fullResolutionImage = document.querySelector("#fullResolutionImage");
const closeImageModal = document.querySelector("#closeImageModal");
const previousImage = document.querySelector("#previousImage");
const nextImage = document.querySelector("#nextImage");
const galleries = {
  sfwGallery: sfwArt,
  nsfwGallery: nsfwArt
};
let currentGallery = [];
let currentImageIndex = 0;

function showImage(index) {
  currentImageIndex = (index + currentGallery.length) % currentGallery.length;
  const art = currentGallery[currentImageIndex];

  fullResolutionImage.src = art.image;
  fullResolutionImage.alt = art.title;
}

function closeFullResolutionImage() {
  imageModal.close();
  fullResolutionImage.removeAttribute("src");
  fullResolutionImage.alt = "";
  currentGallery = [];
  currentImageIndex = 0;
}

document.addEventListener("click", event => {
  const imageButton = event.target.closest(".art-image-link");

  if (imageButton) {
    currentGallery = galleries[imageButton.dataset.gallery];
    showImage(Number(imageButton.dataset.galleryIndex));
    imageModal.showModal();
  }
});

closeImageModal.addEventListener("click", closeFullResolutionImage);
previousImage.addEventListener("click", () => showImage(currentImageIndex - 1));
nextImage.addEventListener("click", () => showImage(currentImageIndex + 1));
imageModal.addEventListener("click", event => {
  if (event.target === imageModal) {
    closeFullResolutionImage();
  }
});
imageModal.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeFullResolutionImage();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(currentImageIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showImage(currentImageIndex + 1);
  }
});
imageModal.addEventListener("close", () => {
  fullResolutionImage.removeAttribute("src");
  fullResolutionImage.alt = "";
});

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
