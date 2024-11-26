const sideTextAnim = document.querySelector(
  " section .title .side-text-animator"
);
const fiveRWords = ["RAJIN", "RESIK", "RAPIH", "RAWAT", "RINGKAS"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateSideText() {
  let index = 0;
  let targetWord = fiveRWords[index].split("");
  let word = sideTextAnim.children;
  let intialized = false;

  //First init animation
  if (!intialized) {
    while (word.length !== targetWord.length) {
      await appendLetterAnimation(targetWord, word);
      sideTextAnim.style.width = `${word.length * 55}px`;
    }
    index++;
    intialized = true;
  }

  await sleep(5000);

  targetWord = fiveRWords[index].split("");

  while (true) {
    let shouldBack = true;

    while ([...word].map((e) => e.innerHTML).join("") !== targetWord.join("")) {
      if (shouldBack) {
        await removeLetterAnimation(word);
      }

      if (!shouldBack) {
        await appendLetterAnimation(targetWord, word);
      }

      if (word.length <= 1) shouldBack = false;

      sideTextAnim.style.width = `${word.length * 55}px`;
    }

    index++;
    if (index == fiveRWords.length) index = 0;
    targetWord = fiveRWords[index].split("");

    await sleep(5000);
  }
}

async function appendLetterAnimation(targetWord, word) {
  let letter = document.createElement("h1");
  letter.innerText = targetWord[word.length];
  sideTextAnim.appendChild(letter);
  letter.classList.toggle("hide-to-show");
  await sleep(100);
  letter.classList.toggle("hide-to-show");
}

async function removeLetterAnimation(word) {
  const letter = word[word.length - 1];
  letter.classList.add("show-to-hide");
  await sleep(150);
  letter.remove();
}

animateSideText();

//Fluent
async function followingFluentCircleEffect() {
  const circle = document.querySelector("section .circle");

  let mouseX = 0;
  let mouseY = 0;
  let posX = 0;
  let posY = 0;

  let easeLevel = 0.05;

  function ease() {
    const rect = circle.getBoundingClientRect();

    const moveX = mouseX - (rect.left + circle.clientWidth / 2);
    const moveY = mouseY - (rect.top + circle.clientHeight / 2);

    posX += moveX * easeLevel;
    posY += moveY * easeLevel;
  }

  function update() {
    ease();
    circle.style.transform = `translate(${posX}px, ${posY}px)`;
    requestAnimationFrame(update);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  update();
}

followingFluentCircleEffect();

//3d Card

function cardParallaxEffect() {
  let mouseX = 0;
  let mouseY = 0;
  let posX = 0;
  let posY = 0;

  let prevCard = null;
  let revertTimeoutId = null;
  let card = null;
  let scrolling = false;

  function getCard() {
    card = document.elementFromPoint(mouseX, mouseY);

    while (card && !card.classList.contains("card")) {
      card = card.parentElement;
    }

    if (card) {
      card = card.children[0];
      if (card.textContent !== prevCard?.textContent) {
        prevCard = card;
        revert();
      }
    }

    if (!card) revert();
  }

  function getPos() {
    if (!card) return;

    const rect = card.getBoundingClientRect();

    posX = Math.round(((mouseY - rect.y) / rect.height) * -10) + 5;
    posY = Math.round(((mouseX - rect.x) / rect.width) * 10) - 5;
  }

  async function revert() {
    if (revertTimeoutId || !prevCard) return;

    revertTimeoutId = setTimeout(() => {
      const cardList = document.querySelector(
        "section .cards-collection .cards-container"
      );
      console.log("Reverting");

      for (const cardToRemove of cardList.children) {
        if (cardToRemove.children[0].textContent !== card?.textContent)
          cardToRemove.children[0].style.transform = `rotateX(${0}deg) rotateY(${0}deg)`;
        cardToRemove.classList.remove("card-not-hover");
      }

      revertTimeoutId = null;
      prevCard = card;
    }, 100);

    console.log("done");
  }

  notHoverTimeoutId = null;
  function update() {
    if (card && !scrolling) {
      getPos();
      card.style.transform = `rotateX(${posX}deg) rotateY(${posY}deg)`;

      if (!notHoverTimeoutId)
        notHoverTimeoutId = setTimeout(() => {
          const cardList = document.querySelector(
            "section .cards-collection .cards-container"
          );

          for (const cardToApply of cardList.children) {
            if (cardToApply.children[0].textContent !== card?.textContent)
              if (card) cardToApply.classList.add("card-not-hover");
          }

          notHoverTimeoutId = null;
        }, 100);
    }
    requestAnimationFrame(update);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    getCard();
  });

  const cardCollection = document.querySelector("section .cards-collection");

  function onScrolling() {}

  function onScrollingEnd() {}

  bounceScrolling(onScrolling, onScrollingEnd);

  cardCollection.onscroll = onScrolling;
  cardCollection.onscrollend = onScrollingEnd;

  update();
}

cardParallaxEffect();

function bounceScrolling(onScrolling, onScrollingEnd) {
  const damping = 0.8;
  const maxOffset = 400;

  const container = document.querySelector("section .cards-collection");
  const content = document.querySelector(
    "section .cards-collection .cards-container"
  );

  // states
  let offset = 0;
  let rendered = 0;
  let lastDis = 0;
  let backFlag = false;

  let timer;

  function resetFlag() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      backFlag = false;
    }, 30);
  }

  function render() {
    if (!offset && !rendered) {
      lastDis = 0;
      return requestAnimationFrame(render);
    }

    if (offset === 0) {
      onScrollingEnd();
    } else onScrolling();

    const dis = offset - rendered;

    if (lastDis * dis < 0) {
      backFlag = true;
    }

    lastDis = dis;

    // throw away float part
    const next = offset - ((dis * damping) | 0);

    content.style.transform = `translate3d(0, ${-next}px, 0)`;

    rendered = next;
    offset = (offset * damping) | 0;

    requestAnimationFrame(render);
  }

  render();

  // wheel delta normalizing
  // copied from smooth-scrollbar/src/utils/get-delta.js
  const DELTA_SCALE = {
    STANDARD: 1,
    OTHERS: -3,
  };

  const DELTA_MODE = [1.0, 28.0, 500.0];

  const getDeltaMode = (mode) => DELTA_MODE[mode] || DELTA_MODE[0];

  const getDelta = (evt) => {
    if ("deltaX" in evt) {
      const mode = getDeltaMode(evt.deltaMode);

      return {
        x: (evt.deltaX / DELTA_SCALE.STANDARD) * mode,
        y: (evt.deltaY / DELTA_SCALE.STANDARD) * mode,
      };
    }

    if ("wheelDeltaX" in evt) {
      return {
        x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
        y: evt.wheelDeltaY / DELTA_SCALE.OTHERS,
      };
    }

    // ie with touchpad
    return {
      x: 0,
      y: evt.wheelDelta / DELTA_SCALE.OTHERS,
    };
  };

  function isOntoEdge(delta) {
    const { scrollTop, scrollHeight, clientHeight } = container;

    const max = scrollHeight - clientHeight;

    return (scrollTop === 0 && delta <= 0) || (scrollTop === max && delta >= 0);
  }

  // wheel events handler
  ["wheel", "mousewheel"].forEach((name) => {
    container.addEventListener(name, (evt) => {
      const { y } = getDelta(evt);

      // check if scrolling onto very edge
      if (!isOntoEdge(y)) {
        return;
      }

      resetFlag();
      evt.preventDefault();

      if (!backFlag && y) {
        offset += (y * (maxOffset - Math.abs(offset))) / maxOffset;
      }
    });
  });
}

function onTitleClick() {
  const cardList = document.querySelector(
    "section .cards-collection .cards-container"
  );

  for (const card of cardList.children) {
    card.classList.toggle("card-clicked");
  }
}
