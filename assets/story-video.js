document.querySelectorAll('.story-frame').forEach(frame => {
  const video = frame.querySelector('video');
  const button = frame.querySelector('.story-play');
  const error = frame.querySelector('.story-error');
  button.hidden = false;
  video.tabIndex = -1;
  button.addEventListener('click', async () => {
    button.hidden = true;
    error.hidden = true;
    video.tabIndex = 0;
    video.focus();
    try {
      await video.play();
    } catch {
      button.hidden = false;
      error.hidden = false;
      video.tabIndex = -1;
      button.focus();
    }
  });
});
