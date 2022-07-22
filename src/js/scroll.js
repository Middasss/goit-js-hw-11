import { PixabayAPI } from './pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import createGalleryCard from '../templates/gallery-card.hbs';

const searchFormEl = document.querySelector('#search-form');
const photoGalleryEl = document.querySelector('.gallery');
const scroll = document.querySelector('.target-el');

const pixabayAPI = new PixabayAPI();

// FUNC FOR SCROLLING
const onLoadMoreData = async () => {
  if (!pixabayAPI.dataOfPage()) {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }

  pixabayAPI.page += 1;

  try {
    const response = await pixabayAPI.fetchPhotos();

    pixabayAPI.totalHits = response.data.totalHits;

    if (pixabayAPI.totalHits < pixabayAPI.page * pixabayAPI.per_page) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    photoGalleryEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCard(response.data.hits)
    );
  } catch (err) {
    console.log(err);
  }
};

const observer = new IntersectionObserver(
  entry => {
    if (entry[0].isIntersecting) {
      onLoadMoreData();
    }
  },
  {
    root: null,
    rootMargin: '750px',
    threshold: 1,
  }
);

const gallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  showCounter: false,
});

const onSearchFormSubmit = async event => {
  event.preventDefault();
  // console.log(event.target.elements.searchQuery.value);

  pixabayAPI.q = event.target.elements.searchQuery.value;
  window.scrollTo({ top: 0 });
  pixabayAPI.page = 1;

  try {
    const response = await pixabayAPI.fetchPhotos();
    if (response.data.hits.length === 0) {
      photoGalleryEl.innerHTML = '';
      event.target.reset();

      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    pixabayAPI.totalHits = response.data.totalHits;

    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );

    photoGalleryEl.innerHTML = createGalleryCard(response.data.hits);

    observer.observe(scroll);
    // LIGHTBOX
    gallery.refresh();
  } catch (err) {
    console.log(err);
  }
};

searchFormEl.addEventListener('submit', onSearchFormSubmit);
