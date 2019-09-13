
document.addEventListener("DOMContentLoaded", HentJson);

		let comics = [];
		let urlParams = new URLSearchParams(window.location.search);
		let myComicID = urlParams.get("title");
		let pageTtitle = document.querySelector("title");
		console.log(myComicID);

		async function HentJson() {
			const jsonData = await fetch("https://spreadsheets.google.com/feeds/list/1dg4qc964KOePUreY2UuREoemOWD7RGVbWd1le-WqfxI/od6/public/values?alt=json");
			comics = await jsonData.json();
			ShowComic()
			document.querySelector(".luk").addEventListener("click", () => {
				history.back();
			})
		}

		function ShowComic() {
			comics.feed.entry.forEach(c => {

				if (c.gsx$title.$t.toLowerCase() == myComicID) {
					document.querySelector(".myComic img").src = c.gsx$img.$t;
					document.querySelector(".myComic img").alt = c.gsx$title.$t;
					document.querySelector(".title").textContent = c.gsx$title.$t;
					document.querySelector(".myComic .rating").textContent = c.gsx$rating.$t + "/10";
					document.querySelector(".myComic .author").textContent = "Author: " + c.gsx$author.$t;
					document.querySelector(".myComic .review").textContent = c.gsx$review.$t;
					document.querySelector(".myComic .pro").textContent = "Pros: " + c.gsx$pros.$t;
					document.querySelector(".myComic .con").textContent = "Cons: " + c.gsx$cons.$t;
					pageTtitle.textContent = c.gsx$title.$t;
				}
			})
		}
