const pageTransition = () => {
  let tl = gsap.timeline();

  tl.to(".transition", {
    duration: .5,
    scaleY: 1
  });
  tl.to(".transition", {
    duration: .5,
    scaleY: 0,
    delay: .1
  });
}

function delay(n) {
  n = n || 2000;
  return new Promise(done => {
    setTimeout(() => {
      done();
    }, n);
  });
}

barba.init({
  sync: true,
  transitions: [{
    async leave(data) {
      const done = this.async();

      pageTransition();
      await delay(1500);
      done();
    },

    async enter(data) {
      contentAnimation();
    },
    async once(data) {
      contentAnimation();
    }
  }]
});
