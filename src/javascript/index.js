import "./icons"
import Swiper from "./swiper"

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

class Player {
  constructor(node) {
    this.root = typeof node === "string" ? document.querySelector(node) : node
    this.$ = selector => this.root.querySelector(selector)
    this.$$ = selector => this.root.querySelectorAll(selector)
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
        this.loadSong()
      })
  }

  bind() {
    let self = this
    this.$(".btn-play-pause").onclick = function () {
      if (this.classList.contains("play")) {
        self.audio.pause()
        this.classList.remove("play")
        this.classList.add("pause")
        this.querySelector("use").setAttribute("xlink:href", "#icon-play")
      } else if (this.classList.contains("pause")) {
        this.classList.remove("pause")
        this.classList.add("play")
        this.querySelector("use").setAttribute("xlink:href", "#icon-pause")
        self.audio.play()
      }
    }

    this.$(".btn-pre").onclick = function () {
      self.currentIndex = (self.currentIndex - 1 ) % self.songList.length
      self.loadSong()
      self.playSong()
    }

    this.$(".btn-next").onclick = function () {
      self.currentIndex = (self.currentIndex + 1 ) % self.songList.length
      self.loadSong()
      self.playSong()
    }

    //播放过程中时刻触发 ontimeupdate 方法
    this.audio.ontimeupdate = function(){
      self.locateLyric()
      self.setProgressBar()
    }

    let swiper = new Swiper(this.$(".panels"))
    swiper.on("swipLeft", function () {
      this.classList.remove("panel1")
      this.classList.add("panel2")
    })
    swiper.on("swipRight", function () {
      this.classList.remove("panel2")
      this.classList.add("panel1")
    })
  }

  playSong() {
   this.audio.oncanplaythrough = () => this.audio.play()
  }

  loadSong() {
    let songObj = this.songList[this.currentIndex]
    this.$(".header h1").innerText = songObj.title
    this.$(".header p").innerText = songObj.author + "-" + songObj.albumn
    this.audio.src = this.songList[this.currentIndex].url
    // 获取音乐时长
    this.audio.onloadedmetadata = ()=>this.$('.time-end').innerText = this.formateTime(this.audio.duration)
    this.loadLyrics()
  }

  loadLyrics() {
    fetch(this.songList[this.currentIndex].lyric)
      .then(res => res.json())
      .then(data => {
        this.setLyrics(data.lrc.lyric)
      })
  }

  locateLyric(){

  }

  setProgressBar(){

  }

  setLyrics(lyrics) {
    this.lyricIndex = 0
    //创建一个虚拟 DOM，插入到 DOM 树中
    let fragment = document.createDocumentFragment()
    let lyricsArr = []
    this.lyricsArr = lyricsArr
    //根据回车符，将歌词切割成一行一行
    lyrics.split(/\n/)
      .filter(str =>
        //匹配包含时间的那一项:[00:08.23]
        str.match(/\[.+?\]/))
      //处理每一行的歌词
      .forEach(line => {
        //将时间替换成 ''，得到歌词 str
        let str = line.replace(/\[.+?\]/g, "")
        line.match(/\[.+?\]/g).forEach(t => {
          //将时间的中括号去掉
          t = t.replace(/[\[\]]/g, "")
          //将歌曲时间转换成毫秒
          let milliseconds = parseInt(t.slice(0, 2)) * 60 * 1000 + parseInt(t.slice(3, 5)) * 1000 + parseInt(t.slice(6))
          lyricsArr.push([milliseconds, str])
        })
      })
    //歌词根据时间进行排序
    lyricsArr.sort((v1, v2) => {
      if (v1[0] > v2[0]) {return 1} else {return -1}
    })
      //创建 p 标签，填充歌词和歌曲时长
      .forEach(line=>{
      let node = document.createElement('p')
      node.setAttribute('data-time',line[0])
      node.innerText = line[1]
      fragment.appendChild(node)
    })
    //将虚拟DOM放在 container 中
    this.$('.panel-lyrics .container').innerHTML = ''
    this.$('.panel-lyrics .container').appendChild(fragment)
  }

  setLineToCenter(node) {
    //歌词容器的偏移量 = 歌词到容器顶部的距离 - 歌词屏幕的一半
    let offset = node.offsetTop - this.$(".container").offsetHeight / 2
    offset = offset > 0 ? offset : 0
    this.$(".container").style.transform = `translateY(-${offset}px)`
    this.$$(".container p").forEach(p => p.classList.remove("current"))
    node.style.classList.add("current")
  }


}

new Player("#player")