"use strict";

const $showsList = $("#shows-list");
const $infoArea = $("#info-area");
const $infoList = $("#info-list");
const $searchForm = $("#search-form");
const $infoAreHeader = $("#infoAreaHeader")
const missingImage = "https://tinyurl.com/tv-missing"
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
const testCast = []
async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
 
  const shows = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`)
 return shows.data.map(mappedShow => {
  const show = mappedShow.show
  getEpisodesOfShow(show.id)
  getCastOfShow(show.id)


  return {
  id: show.id,
  name: show.name,
  summary: show.summary,
  image: show.image ? show.image.medium : missingImage
  }
})
  
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name} poster" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-warning">${show.name}</h5>
             <div class="text-white"><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
             <button class="btn btn-outline-light btn-sm Show-getCast">Cast</button>

           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);
  $infoArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const allEpisodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)
  const showId = id;
  return allEpisodes.data.map(episode => {
   return {
    showId,
    id: episode.id,
    title: episode.name,
    season: episode.season,
    num: episode.number,
    summary: episode.summary
    }
    // populateEpisodes(episodes)
    // console.log(episodes) 
  }) 
}

async function getCastOfShow(id){
  const cast = await axios.get(`https://api.tvmaze.com/shows/${id}/cast`)
  return cast.data.map(person => {

    return {
     actor: person.person.name,
     character: person.character.name
     }
    })
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
  $infoList.empty()
  $infoAreHeader.text("Episodes")

  if(episodes.length === 0) {
    let episodeListItem = document.createElement("li")
    episodeListItem.innerText = `There is no episode information available`
    $infoList.append(episodeListItem)

    $infoList.append(episodeListItem)
  }

 
    for(let episode of episodes){
      let episodeListItem = document.createElement("li")

      episodeListItem.innerText = `${episode.title} (Season ${episode.season}, Episode ${episode.num})`
      $infoList.append(episodeListItem)
    }

  $infoArea.show();

}

function populateCast(cast) { 
  $infoList.empty()
  $infoAreHeader.text("Cast")

  if(cast.length === 0) {
    let castListItem = document.createElement("li")

    castListItem.innerText = `There is no cast information available`

    $infoList.append(castListItem)
  }

    for(let castMem of cast){
      let castListItem = document.createElement("li")

      castListItem.innerText = `${castMem.actor} as ${castMem.character}`
      $infoList.append(castListItem)
    }
  
  $infoArea.show();
}


async function displayEpisodes(evt) {
 
  const showId = $(evt.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes)
}

async function displayCast(evt) {
 
  const showId = $(evt.target).closest(".Show").data("show-id");

  const cast = await getCastOfShow(showId);
  populateCast(cast)
}

$showsList.on("click", ".Show-getEpisodes", displayEpisodes);
$showsList.on("click", ".Show-getCast", displayCast);

