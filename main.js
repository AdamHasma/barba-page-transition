import barba from '@barba/core';

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

const contentAnimation = () => {
  let tl = gsap.timeline();
  tl.from(".left", {
    duration: 1.5,
    translateY: 50,
    opacity: 0
  });
  tl.to(".left", {
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
  });
}

const delay = n => {
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
