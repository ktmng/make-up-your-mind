'use strict';

const makeupURL = 'https://makeup-api.herokuapp.com/api/v1/products.json';

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
};

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getMakeUp(searchTerm, brand, minPrice, maxPrice) {
  const params = {
    product_type: searchTerm,
    brand: brand,
    price_greater_than: minPrice,
    price_less_than: maxPrice,
  };
  
  const queryString = formatQueryParams(params);
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
};

function displayResults(responseJson) {
  console.log(responseJson);
  $('#results-list').empty();
  $('#sorry-msg').empty();

  if(!Object.keys(responseJson).length){
    $('#sorry-msg').append(`Sorry, No Products Found For That Make-Up and/or Brand`);
  };

  for (let i = 0; i < responseJson.length; i++){
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
    );
  };

  $('#results').removeClass('hidden');
  $('#makeup-type').val('');
  $('#brand').val('');
  $('#min-price-input').val('');
  $('#max-price-input').val('');
};



const youtubeURL = 'https://www.googleapis.com/youtube/v3/search';

function getYoutubeVideo(searchTerm, brand) {
  const params = {
    part:'snippet',
    key:'AIzaSyBynB4nEDy3uiO5JETdKMCyKDIS0fmFNBk',
    q: searchTerm + brand + ' makeup',
    maxResults: 6,
    type: 'video',
    order: 'Relevance',
    safeSearch: 'strict',
    relevanceLanguage: 'en'
  };

  const queryString = formatQueryParams(params);
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

function displayYoutubeResults(responseJson) {
  console.log(responseJson);

  $('#yt-results-list').empty();
  $('#sorry-msg-yt').empty(); 

  if(!Object.keys(responseJson.items).length){
    $('#sorry-msg-yt').append(`Sorry, No Videos Found For That Make-Up and/or Brand`);
  };

  for (let i = 0; i < responseJson.items.length; i++){
    $('#yt-results-list').append(
      `<li class="each-yt-video">
      <a class="video-title-url" href="https://www.youtube.com/watch?v=${responseJson.items[i].id.videoId}?vq=hd1080" target=_blank>
        <h3 class="video-title">${responseJson.items[i].snippet.title}</h3>
      </a>
      
      <a class="channel-url"href="https://www.youtube.com/channel/${responseJson.items[i].snippet.channelId}" target=_blank>${responseJson.items[i].snippet.channelTitle}</a>

      <input class="thumbnail-img" type="image" src="${responseJson.items[i].snippet.thumbnails.high.url}"/>
      </li>`
    );
  };

  $('#yt-results').removeClass('hidden');
  displayYoutubeModal(responseJson);
};

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

function generateLandingPage() { 
  return `
  <section class="landing-page">

    <img id="landing-page-title" src="images/muym-title.png" alt=""An image of the website's title, Make-Up Your Mind, and logo, a brain with eyelashes">

    <p class="landing-page-paragraph" id="landing-page-first-p">
    Combining online shopping and watching Youtube videos 
    <br>
    for make-up lovers
    </p>

    <p class="landing-page-paragraph" id="landing-page-second-p">
    Search for make-up products by type, brand, and price. 
    <br>
    Then, spend time looking through all the products you 
    <br>
    <i>definitely need in your make-up collection</i>
    <br>
    while watching videos from Youtube's beauty community.</p>
    <button id="lets-go-btn" type="submit">Let's Go!</button>
  </section> `;
} 

function renderLandingPage() {
  const addToHtml = generateLandingPage();
  $('body').html(addToHtml);
}

function handleSubmitButton() {
  let submitbutton = document.getElementById("lets-go-btn");
  if(submitbutton) {
      submitbutton.onclick = (function() {
        renderMainPage();
      });
    };
}

function generateMainPage() {
  console.log('generateMainPage ran');
  return `
  <img id="muym-title" src="images/muym-title.png" alt="An image of the website's title, Make-Up Your Mind, and logo, a brain with eyelashes">

  <form id="js-form">
    <section id="searchterm-brand">
      <label class="search-term" for="product-type" id="just-looking-at">Just Looking At</label>
      <input class="product-type input" type="text" name="product-type" id="makeup-type" placeholder="Make-Up Type" list="product-type-list">
        <datalist id="product-type-list">
            <option value="Blush">
            <option value="Bronzer">
            <option value="Eyebrow">
            <option value="Eyeliner">
            <option value="Eyeshadow">
            <option value="Foundation">
            <option value="Lip Liner">
            <option value="Lipstick">
            <option value="Mascara">
            <option value="Nail Polish">
        </datalist>

      <label class="search-term" for="brand" id="from">From</label>
      <input class="brand input" type="text" name="brand" id="brand" placeholder="Brand" list="brand-list">
        <datalist id="brand-list">
            <option value="Almay">
            <option value="Alva">
            <option value="Anna Sui">
            <option value="Annabelle">
            <option value="Benefit">
            <option value="Boosh">
            <option value="Burt's Bees">
            <option value="Butter London">
            <option value="C'est Moi">
            <option value="Cargo Cosmetics">
            <option value="China Glaze">
            <option value="Clinique">
            <option value="Coastal Classic Creation">
            <option value="Colourpop">
            <option value="Covergirl">
            <option value="Dalish">
            <option value="Deciem">
            <option value="Dior">
            <option value="Dr. Hauschka">
            <option value="e.l.f">
            <option value="Essie">
            <option value="Fenty">
            <option value="Glossier">
            <option value="Green People">
            <option value="Iman">
            <option value="L'oreal">
            <option value="Lotus Cosmetics USA">
            <option value="Maia's Mineral Galaxy">
            <option value="Marcelle">
            <option value="Marienatie">
            <option value="Maybelline">
            <option value="Milani">
            <option value="Mineral Fusion">
            <option value="Misa">
            <option value="Mistura">
            <option value="Moov">
            <option value="Nudus">
            <option value="NYX">
            <option value="ORLY">
            <option value="Pacifica">
            <option value="Penny Lane Organics">
            <option value="Physicians Formula">
            <option value="Piggy Paint">
            <option value="Pure Anada">
            <option value="Rejuva Minerals">
            <option value="Revlon">
            <option value="Sally B's Skin Yummies">
            <option value="Salon Perfect">
            <option value="Sante">
            <option value="Sinful Colours">
            <option value="Smashbox">
            <option value="Stila">
            <option value="Suncoat">
            <option value="w3llpeople">
            <option value="wet n wild">
            <option value="Zorah">
            <option value="Zorah Biocosmetiques">
        </datalist>
    </section>

    <section id="min-max">
      <label class="search-term" for="min-price" id="min">Minimum $</label>
      <input class="min-price input" type="number" name="min-price" id="min-price-input" placeholder="0">

      <label class="search-term" for="max-price" id="max">Maximum $</label>
      <input class="max-price input" type="number" name="max-price" id="max-price-input" placeholder="25">
    </section>

      <input id="submit-btn" type="submit" value="Show Me The Make-Up">

  </form>

    <p id="js-error-message" class="error-message"></p>

    <section id="yt-results" class="hidden">
      <h2 id="yt-results-title">⋯ Videos ⋯</h2>
      <h2 id="sorry-msg-yt"></h2>
      <ul id="yt-results-list">
      </ul>
    </section>

    <section id="results" class="hidden">
      <h2 id="results-title">⋯ Products ⋯</h2>
      <h2 id="sorry-msg"></h2>
      <ul id="results-list">
      </ul>
    </section>
  
    <div id="youtubeModal">
      <div class="modal-content">
        <span class="videoClose">&times;</span>
      </div>
    </div> `;
}

function renderMainPage() {
  const addToHtml = generateMainPage();
  $('body').html(addToHtml);
  watchForm();
}

function initApp() {
  renderLandingPage();
  handleSubmitButton();
}

initApp();