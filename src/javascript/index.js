import "./icons"

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

class Player {
  constructor(node) {
    this.root = typeof node === "string" ? $(node) : node
    this.songList = []
    this.currentIndex = 0
    this.audio = new Audio()
    this.start()
    this.bind()
  }

  start() {
    fetch("https://jirengu.github.io/data-mock/huawei-music/music-list.json")
      .then(res => res.json())
      .then(data => {
        this.songList = data
        this.audio.src = this.songList[this.currentIndex].url
      })
  }

  bind() {
    let self = this
    this.root.querySelector(".btn-play-pause").onclick = function () {
      if (this.classList.contains("play")) {
        self.audio.pause()
        this.classList.remove("play")
        this.classList.add("pause")
        this.querySelector("use").setAttribute("xlink:href", "#icon-pause")
      } else if (this.classList.contains("pause")) {
        this.classList.remove("pause")
        this.classList.add("play")
        this.querySelector("use").setAttribute("xlink:href", "#icon-play")
        self.audio.play()
      }
    }
  }

  playSong() {
    this.audio.play()
  }
}

new Player("#player")