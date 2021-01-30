const aTag = document.querySelector(".button-a");
const aboutLi = document.querySelector(".to-about")

aTag.addEventListener("click", () => {
  // aTag.classList.add("anim");
  // document.querySelector(".unset").style.width = 'width: 100vw';
  document.querySelector(".index-title").style.display = 'none';
  document.querySelector(".set-class").classList.add("index-img");
  setTimeout(function() {
    window.location.assign("about.html");
  }, 1200)
});

aboutLi.addEventListener("click", () => {
  // aboutLi.classList.add("anim");
  // document.querySelector(".unset").style.width = 'width: 100vw';
  document.querySelector(".index-title").style.display = 'none';
  document.querySelector(".set-class").classList.add("index-img");
  setTimeout(function() {
    window.location.assign("about.html");
  }, 1200)
});
