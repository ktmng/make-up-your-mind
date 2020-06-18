'use strict';

const makeupURL = 'https://makeup-api.herokuapp.com/api/v1/products.json';

//watch form 
//prevent submit btn default 
//collect values for user input
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#makeup-type').val();
    const brand = $('#brand').val();
    const minPrice = $('#min-price-input').val();
    const maxPrice = $('#max-price-input').val();
    getMakeUp(searchTerm, brand, minPrice, maxPrice);
    getYoutubeVideo(searchTerm, brand);
  });
}

//format url 
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//get data from makeup heroku app api
function getMakeUp(searchTerm, brand, minPrice, maxPrice) {
  const params = {
    product_type: searchTerm,
    brand: brand,
    price_greater_than: minPrice,
    price_less_than: maxPrice,
  };
  
  const queryString = formatQueryParams(params)
  const url = makeupURL + '?' + queryString;
  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(` Oh No, Something went wrong w/ Getting the Products! ${err.message}`);
    });
}

//show the data from makeup heroku app api
function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  $('#sorry-msg').empty();

  //if there are no results, display a msg
  if(!Object.keys(responseJson).length){
    $('#sorry-msg').append(`Sorry, No Products Found For That Make-Up and/or Brand`);
  }
  // iterate through the items array
  for (let i = 0; i < responseJson.length; i++){
    
    // for each makeup object in the items array, add a list item to the results 
    //list with the full name, img, price, description, url
    $('#results-list').append(
      `<li class="each-product-result">
      <section class="product-info-no-description">
        <h3 class="product-name">${responseJson[i].name}</h3>
        <a class="product-img-url" href="${responseJson[i].product_link}" target=_blank>
          <img class="product-img" src="${responseJson[i].image_link}" alt="An image pertaining to the make-up product mentioned">
        </a>
        <p class="product-price-url">$${responseJson[i].price} | <a class="product-url" href="${responseJson[i].product_link}" target=_blank>link</a></p>
      </section>
      <span class="product-description">${responseJson[i].description}</span>
      </li>`
  )};

  //display the results section  
  $('#results').removeClass('hidden');

  //clear input after results load
  $('#makeup-type').val('')
  $('#brand').val('')
  $('#min-price-input').val('');
  $('#max-price-input').val('');
};

//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv  YOUTUBE API vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv  YOUTUBE API vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv  YOUTUBE API vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

const youtubeURL = 'https://www.googleapis.com/youtube/v3/search';

//get data from youtube data api
function getYoutubeVideo(searchTerm, brand) {
 const params = {
    part:'snippet',
    key:'AIzaSyCR1zVcnvVor0l3h3x8Zkx9X--58hZwJLk',
    q: searchTerm + brand + ' makeup',
    maxResults: 6,
    type: 'video',
    order: 'Relevance',
    safeSearch: 'strict',
    relevanceLanguage: 'en'
  };

  const queryString = formatQueryParams(params)
  const url = youtubeURL + '?' + queryString;
  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayYoutubeResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Oh No, Something went wrong w/ Getting the Videos! ${err.message}`);
    });
};

//show the data from youtube data api + call displayYoutubeModal(responseJson)
function displayYoutubeResults(responseJson) {
  console.log(responseJson);

  $('#yt-results-list').empty();
  $('#sorry-msg-yt').empty(); 

  if(!Object.keys(responseJson.items).length){
    $('#sorry-msg-yt').append(`Sorry, No Videos Found For That Make-Up and/or Brand`);
  }

  for (let i = 0; i < responseJson.items.length; i++){
    $('#yt-results-list').append(
      `<li class="each-yt-video">
      <a class="video-title-url" href="https://www.youtube.com/watch?v=${responseJson.items[i].id.videoId}?vq=hd1080" target=_blank>
        <h3 class="video-title">${responseJson.items[i].snippet.title}</h3>
      </a>
      
      <a class="channel-url"href="https://www.youtube.com/channel/${responseJson.items[i].snippet.channelId}" target=_blank>${responseJson.items[i].snippet.channelTitle}</a>

      <input class="thumbnail-img" type="image" src="${responseJson.items[i].snippet.thumbnails.high.url}"/>
      </li>`)
  };

  $('#yt-results').removeClass('hidden');
  displayYoutubeModal(responseJson);
};

//vvvvvvvvvvvvvvvvvv  POP-UP MODAL CONTAINING RESPECTIVE YT-VIDEO + CLOSE BUTTON vvvvvvvvvvvvvvvvvv
//vvvvvvvvvvvvvvvvvv  POP-UP MODAL CONTAINING RESPECTIVE YT-VIDEO + CLOSE BUTTON vvvvvvvvvvvvvvvvvv
//vvvvvvvvvvvvvvvvvv  POP-UP MODAL CONTAINING RESPECTIVE YT-VIDEO + CLOSE BUTTON vvvvvvvvvvvvvvvvvv

function displayYoutubeModal(responseJson) {
  for (let i = 0; i < responseJson.items.length; i++){

    let videoId = responseJson.items[i].id.videoId;

    let youtubeModal = document.getElementById("youtubeModal");

    let list = document.getElementById("yt-results-list");
    let video = list.getElementsByClassName("thumbnail-img")[i];

    let videoClose = document.getElementsByClassName("videoClose")[i];
    
    if(video) {
      video.onclick = (function() {
        youtubeModal.style.display = "block";
        $('.responsive-iframe').remove();
        $('.modal-content').append(
          `<iframe class="responsive-iframe" 
          src="https://www.youtube.com/embed/${videoId}?version=3&enablejsapi=1"
          frameborder="0" 
          allowfullscreen>
          </iframe>`);
      });
    };

    if(videoClose) {
      videoClose.onclick = (function() {
        youtubeModal.style.display = "none";
        $('.responsive-iframe').each(function(){
          this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
        });
      });
    };

  };
};

$(watchForm);