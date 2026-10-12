const story = document.querySelector('.product-story');
story.addEventListener('toggle', () => {
  if (!story.open) story.querySelector('video').pause();
});
