const transition = document.querySelector('.transition')

const pageTransitionIn = () => {
  return gsap
  .to(transition, { duration: .5, scaleY: 1, transformOrigin: 'bottom left'})
  };

const pageTransitionOut = container => {
  return gsap
    .timeline({ delay: 1 }) // More readable to put it here
    .add('start') // Use a label to sync screen and content animation
    .to(transition, {
      duration: 0.5,
      scaleY: 0,
      skewX: 0,
      transformOrigin: 'top left',
      ease: 'power1.out'
    }, 'start')
    .call(contentAnimation, [container], 'start')
}

const contentAnimation = container => {
  // GSAP methods can be chained and return directly a promise
  return gsap
    .timeline()
    .from(container.querySelector('.is-animated'), {
      duration: 0.5,
      translateY: 10,
      opacity: 0,
      stagger: 0.4
    })
    .from(mainNavigation, { duration: .5, translateY: -10, opacity: 0})
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
  transitions: [{
    async leave(data) {
      const done = this.async();

      data.current.container.remove()
      pageTransitionIn();
      await delay(1500);
      done();
    },

    async enter(data) {
      pageTransitionOut(data.next.container)
    },
    async once(data) {
      contentAnimation(data.next.container);
    }
  }]
});
