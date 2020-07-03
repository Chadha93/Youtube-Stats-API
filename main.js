// Options
const CLIENT_ID = '618161435852-84s5nrjvt6644chb2u9e7p9lmqf4ci4k.apps.googleusercontent.com'; // My personal ID
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest' // Youtube API resources
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';// youtube readonly 

const preloader = document.querySelector('.preloader');
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');
const channelData = document.getElementById('channel-data');

// set the default channel
const defaultChannel = 'tseries';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
  e.preventDefault();
  const channel = channelInput.value;

  getChannel(channel);
});

// Load auth2 library
function handleClientLoad() {
  // GAPI google client application interface (for calling the google apis)
  gapi.load('client:auth2', initClient);
}

if(authorizeButton==1)
document.getElementById("statement").innerHTML = "Log out From Google";
else
document.getElementById("statement").innerHTML = "Log In With Google";
// Init API client library and set up sign in listeners
function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    })
    .then(() => {
      // Listen for sign in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle initial sign in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    content.style.display = 'block';
    videoContainer.style.display = 'block';

    getChannel(defaultChannel);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    content.style.display = 'none';
    videoContainer.style.display = 'none';
  }
}

// Handle login
function handleAuthClick() {
  console.log("handle login excuted");
  gapi.auth2.getAuthInstance().signIn();
  
  document.getElementById("statement").innerHTML = "Log Out From This Account";
}

// Handle logout
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
  console.log("handleSignout exceued");
  location.reload();
}

// Display channel data
function showChannelData(data) {
  channelData.style.backgroundColor="#b31217";
  channelData.style.color="white";
  channelData.innerHTML = data;
  
}

// Get channel from API
function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: 'snippet,contentDetails,statistics',
      forUsername: channel
    })
    .then(response => {
      console.log(response);
      const channel = response.result.items[0];
      const output = `
      <ol class="collection">
        <li class="collection-item">Title: ${channel.snippet.title}</li>
        <li class="collection-item">ID: ${channel.id}</li>
        <li class="collection-item">Created On: ${channel.snippet.publishedAt}</li>
        <li class="collection-item">Subscribers: ${numberWithCommas(
        channel.statistics.subscriberCount
      )}</li>   
      <li class="collection-item">Views: ${numberWithCommas(
        channel.statistics.viewCount
      )}</li>
      <li class="collection-item">Videos: ${numberWithCommas(
        channel.statistics.videoCount
      )}</li>
      <li class = collection-item>Region: ${numberWithCommas(
        channel.snippet.country
      )}</li>
    </ol>
    <p>${channel.snippet.description}</p>
    <hr>
        <a id="visit-btn" class="btn black darken-2 btn-centre" target="_blank" href="https://youtube.com/${
          channel.snippet.customUrl
        }"style = "display:block; margin-right:auto; margin-left:auto;">Visit Channel</a>
        Copyright © 2020 Gaurav Chadha, All rights reserved.
      `;

      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;
      requestVideoPlaylist(playlistId);
    })
    .catch(err => alert('No Channel By That Name'));
}

// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function requestVideoPlaylist(playlistId) {
  const requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 8
  };

  const request = gapi.client.youtube.playlistItems.list(requestOptions);

  request.execute(response => {
    console.log(response);
    const playListItems = response.result.items;
    if (playListItems) {
      let output = '<br><h4 class="center-align">Latest Videos</h4>';

      // Loop through videos and append output
      playListItems.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
        
          <div class="col s3">
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
      });

      // Output videos
      videoContainer.innerHTML = output;
    } else {
      videoContainer.innerHTML = 'No Uploaded Videos';
    }
  });
}
