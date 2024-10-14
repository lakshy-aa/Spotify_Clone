console.log("let's write js");
let curr_song = new Audio();
let songs = [];
let curr_fold;

function convertSecondsToMinutesSeconds(seconds) {
  // Calculate the number of minutes and remaining seconds
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  // Add leading zeros if needed
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (remainingSeconds < 10) {
    remainingSeconds = "0" + remainingSeconds;
  }
  // Return the formatted time string
  return minutes + ":" + remainingSeconds;
}

async function getSongs(folder) {
  curr_fold=folder;
  let a = await fetch(`/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  songs=[];
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1].replaceAll("%20"," ").replace(".mp3",""));

    }
  }

  let songsUL = document
  .querySelector(".library-songs")
  .getElementsByTagName("ul")[0];
  songsUL.innerHTML="";
    for (const song of songs) {
       songsUL.innerHTML += `<li><img
        src="music.svg"
        alt="" class="invert">
      <div id="content">
        <div id="song-name"> ${song}</div>
       
      </div>
      
       <img  class="libplay" src="play-btn.svg" alt="">
      </li>`;
}
console.log(songs)
 // Attach the Event listner for playing the songs
 Array.from(
  document.querySelector(".library-songs").getElementsByTagName("li")
).forEach((e) => {
  e.addEventListener("click", function () {
    playMusic(e.querySelector("#song-name").innerHTML.trim());
  });
});

}

const playMusic = (track, pause = true) => {
  curr_song.src = `/${curr_fold}/` + track + ".mp3";
  if (pause) {
    curr_song.play();
    play.src = "pause.svg";
  }
  document.querySelector(".song-info").innerHTML = track;
  document.querySelector(".song-time").innerHTML = "00:00/00:00";
};


async function displayAlbums() {
  let a = await fetch(`/songs`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let mainViewCardContainer=document.querySelector(".main-view-card-container")
  let anchors=div.getElementsByTagName("a")
  anchors=Array.from(anchors)
  for (let i = 0; i < anchors.length; i++) {
    if(anchors[i].href.includes("/songs")  && !anchors[i].href.includes(".htaccess")){
    let folder=  (anchors[i].href.split("/").slice(-2)[0])

    //get the meta data of the folder
    let a = await fetch(`/songs/${folder}/info.json`);
    let response = await a.json();
    mainViewCardContainer.innerHTML +=`<div  data-folder=${folder} class="cards pointer">
          <img aria-hidden="false" draggable="false" loading="lazy"
            src="/songs/${folder}/cover.jpg">
          <div class="card-content">
            <h2>${response.title}</h2>
            <pre>${response.description}</pre>
          </div>
        </div>`
    }
    
  }
}

async function main() {
  //get all the songs
  await displayAlbums();
  await getSongs("songs/945");
  //curr_song.src="/songs/firstsong.mp3";
  playMusic(songs[0], false);
  //show all the songs in the paylist
  
 
  
  //attach the event listerner to play-bar buttons

  play.addEventListener("click", () => {
    if (curr_song.paused) {
      curr_song.play();
      play.src = "pause.svg";
    } else {
      curr_song.pause();
      play.src = "play-btn.svg";
    }
  });

  //  adding the event listner to curr-song

  curr_song.addEventListener("timeupdate", () => {
    document.querySelector(
      ".song-time"
    ).innerHTML = `${convertSecondsToMinutesSeconds(
      curr_song.currentTime
    )}/${convertSecondsToMinutesSeconds(curr_song.duration)}`;
    document.querySelector(".circle").style.left =
      (curr_song.currentTime / curr_song.duration) * 100 + "%";

    watched.style.width =
      (curr_song.currentTime / curr_song.duration) * 100 + "%";
      if(curr_song.currentTime == curr_song.duration){
        let j=songs.indexOf(curr_song.src.split(`${curr_fold}/`)[1].replaceAll("%20"," ").replace(".mp3",""));
        if(j<songs.length-1){
          playMusic(songs[j+1]);
      }else{
        playMusic(songs[0],false);
        play.src = "play-btn.svg";
      }
    }
  });

  //add event to volume
  volumectr.addEventListener("change", (e) => {
    curr_song.volume = parseInt(e.target.value) / 100;
  });

  //add an evl to seek bar

  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = e.offsetX / e.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = percent * 100 + "%";
    curr_song.currentTime = percent * curr_song.duration;
  });


  // add event listner to pre and next buttons

  previous.addEventListener("click", () => {
    let index = songs.indexOf(curr_song.src.split(`${curr_fold}/`)[1].replace(".mp3", "").replaceAll("%20"," "));
    console.log(index)
    if (index === 0) {
        index = songs.length; // Wrap around to the last song if at the start
    }
    playMusic(songs[index - 1]);
});

next.addEventListener("click", () => {
    let index = songs.indexOf(curr_song.src.split(`${curr_fold}/`)[1].replace(".mp3", "").replaceAll("%20"," "));
    console.log(index)
    if (index === songs.length - 1) {
        index = -1; // Wrap around to the first song if at the end
    }
    playMusic(songs[index + 1]);
});




 // add hover effect on buttons and cards in main-view
 let buttons = Array.from(
  document.querySelector(".main-view").getElementsByTagName("button")
);
let cards = Array.from(
  document.querySelector(".main-view-card-container").children
);

buttons.forEach((e) => {
  e.addEventListener("mouseover", () => {
    e.classList.add("border");
  });
  e.addEventListener("mouseout", () => {
    e.classList.remove("border");
  });
});

cards.forEach((e) => {
  e.addEventListener("mouseover", () => {
    e.classList.add("border");
  });
  e.addEventListener("mouseout", () => {
    e.classList.remove("border");
  });
});

 // add event listner to cards
 Array.from(document.querySelectorAll(".cards")).forEach(e => {
  e.addEventListener("click", async item=>{
    await getSongs(`songs/${item.currentTarget.dataset.folder}`)
  })

});

//add event listerner to volume


document.querySelector(".volume>img").addEventListener("click",(e)=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src=e.target.src.replace("volume.svg","mute.svg");
      curr_song.volume=0;
      volumectr.value=0;
    }
    else{
      e.target.src=e.target.src.replace("mute.svg","volume.svg");
      curr_song.volume=0.2;
      volumectr.value=20;
    }
})
}
 main();
