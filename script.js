document.addEventListener("DOMContentLoaded", () => {
  const movieContainer = document.getElementById('movieContainer');
  const searchInput = document.getElementById('searchInput');
  const theaterSelect = document.getElementById('theaterSelect');

  fetch('https://www.finnkino.fi/xml/TheatreAreas')
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      const areas = data.querySelectorAll('TheatreArea');
      areas.forEach(area => {
        const id = area.querySelector('ID').textContent;
        const name = area.querySelector('Name').textContent;
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        theaterSelect.appendChild(option);
      });
    });

  theaterSelect.addEventListener('change', () => fetchMovies(theaterSelect.value));

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      card.style.display = title.includes(term) ? '' : 'none';
    });
  });

  function fetchMovies(theaterId) {
    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`)
      .then(response => response.text())
      .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
      .then(data => {
        const shows = Array.from(data.querySelectorAll('Show'));
        const movieMap = {};

        shows.forEach(show => {
          const id = show.querySelector('EventID').textContent;
          const title = show.querySelector('Title').textContent;
          const image = show.querySelector('EventLargeImagePortrait')?.textContent || 'https://via.placeholder.com/150';
          const time = show.querySelector('dttmShowStart').textContent.substring(11, 16);
          const desc = show.querySelector('ShortSynopsis')?.textContent || 'No description available.';

          if (!movieMap[id]) {
            movieMap[id] = { id, title, image, description: desc, showtimes: [] };
          }
          movieMap[id].showtimes.push(time);
        });

        renderMovies(Object.values(movieMap));
      });
  }

  function renderMovies(movies) {
    movieContainer.innerHTML = '';
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" />
        <h2>${movie.title}</h2>
        <p>${movie.description}</p>
        <div class="showtimes">
          ${movie.showtimes.map(t => `<span>${t}</span>`).join('')}
        </div>
      `;
      movieContainer.appendChild(card);
    });
  }
});
