var displayThumbnails = document.getElementById('thumbnailsDiv');
var flickrLightboxPhotos = {};
var lastPhotoId;

function clearSearchContents() {
  document.getElementById('searchBox').value = '';
};

function doSearch() {
  var httpRequest;
  var pageCount = 1;
  flickrLightboxPhotos = {};
  displayThumbnails.innerHTML = '';
  lastPhotoId = null;

  function setupPageDisplay() {
    document.getElementById('jumbotron').style.height='380px';
    document.getElementById('backToTopButton').style.display='block';
    document.getElementById('loadMoreButton').style.display='block';
  };
  setupPageDisplay();

  var pager = document.getElementById('loadMoreButton');
  if (pager) {
    pager.addEventListener('click', clickedLoadMore);
  }

  function clickedLoadMore() {
    pageCount++;
    flickrApiUrl += '&page=' + pageCount;
    makeRequest(flickrApiUrl);
  };

  var tags = document.getElementById('searchBox');

  var flickrApiUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=7f1075dd1213418aab4d5a69ed12357a&content_type=1&format=json&nojsoncallback=1&per_page=30&&tags=';
  flickrApiUrl += tags.value;

  makeRequest(flickrApiUrl);
};

function makeRequest(flickrApiUrl) {
  httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    alert('Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = handleFlickrResponse;
  httpRequest.open('GET', flickrApiUrl);
  httpRequest.send();
};

function showInLightbox(flickrImageId) {
  function buildMainImage(flickrImageId) {
    lbImage = document.getElementById('lb-image');
    photoUrlToDisplay = flickrLightboxPhotos[flickrImageId].url;
    lbImage.src = photoUrlToDisplay;
  };

  buildMainImage(flickrImageId);

  function buildTitle(flickrImageId) {
    lbTitle = document.getElementById('lb-title');
    photoTitleToDisplay = flickrLightboxPhotos[flickrImageId].title;
    lbTitle.innerHTML = '<h2>' + photoTitleToDisplay + '</h2>';
  };

  buildTitle(flickrImageId);

  function buildPrevButton(flickrImageId) {
    var prevButton = document.getElementsByClassName('lb-prev')[0];
    var prevPhotoId = flickrLightboxPhotos[flickrImageId].prevPhotoId;
    if (prevPhotoId) {

      showButton(prevButton);

      prevButton.onclick = function() {
        showInLightbox(prevPhotoId);
      };
    } else {

        hideButton(prevButton);
    }
  };

  buildPrevButton(flickrImageId);

  function buildNextButton(flickrImageId) {
    var nextButton = document.getElementsByClassName('lb-next')[0];
    var nextPhotoId = flickrLightboxPhotos[flickrImageId].nextPhotoId;
    if (nextPhotoId) {

      showButton(nextButton);

      nextButton.onclick = function() {
        showInLightbox(nextPhotoId);
      };

    } else {
      hideButton(nextButton);
    }
  };

  buildNextButton(flickrImageId);


  function showButton(e) {
    e.style.display='block';
  };

  function hideButton(e) {
    e.style.display='none';
  };
};

function buildImage(imageId) {
  var myImage = new Image();
  displayThumbnails.appendChild(myImage);
  var photoInfo = flickrLightboxPhotos[imageId];
  myImage.src = photoInfo.thumbnailUrl;
  myImage.alt = "Click to expand in lightbox";

  myImage.onclick = function() {
    document.getElementById('backToTopButton').style.display='none';
    var lb = document.getElementById('lightbox');
    lb.style.display='block';
    showInLightbox(imageId);
    var close = document.getElementsByClassName('lightbox-close')[0];
    close.onclick = function() {
      lb.style.display='none';
      document.getElementById('backToTopButton').style.display='block';
    };
  };
};

function renderPhotos(flickrResponse) {
  flickrResponse.photos.photo.forEach(function(photoObject) {
    var farmId = photoObject.farm;
    var serverId = photoObject.server;
    var id = photoObject.id;
    var secret = photoObject.secret;
    var title = photoObject.title;
    var thumbnailUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + id + '_' + secret + '_t.jpg';
    var largeUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + id + '_' + secret + '_b.jpg';
    var lightboxPhotoInfo = {'url': largeUrl,
                      'thumbnailUrl': thumbnailUrl,
                      'title': photoObject.title,
                      'prevPhotoId': lastPhotoId};

    flickrLightboxPhotos[photoObject.id] = lightboxPhotoInfo;

    if (lastPhotoId && flickrLightboxPhotos[lastPhotoId]) {
      flickrLightboxPhotos[lastPhotoId]['nextPhotoId'] = photoObject.id;
    }
    lastPhotoId = photoObject.id;
    buildImage(lastPhotoId);
  });
};

function handleFlickrResponse() {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      var flickrResponse = JSON.parse(httpRequest.responseText);
      renderPhotos(flickrResponse);
    } else {
      alert('There was a problem with the request.');
    }
  }
};
