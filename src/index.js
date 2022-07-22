import { PixabayAPI } from './js/pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import createGalleryCard from './templates/gallery-card.hbs';

const searchFormEl = document.querySelector('#search-form');
const photoGalleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

const pixabayAPI = new PixabayAPI();

const gallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  showCounter: false,
});

const onSearchFormSubmit = async event => {
  event.preventDefault();
  // console.log(event.target.elements.searchQuery.value);

  pixabayAPI.q = event.target.elements.searchQuery.value;
  pixabayAPI.page = 1;

  try {
    const response = await pixabayAPI.fetchPhotos();
    if (response.data.hits.length === 0) {
      photoGalleryEl.innerHTML = '';
      loadMoreBtnEl.classList.add('is-hidden');
      event.target.reset();

      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    pixabayAPI.totalHits = response.data.totalHits;

    if (response.data.totalHits <= pixabayAPI.per_page) {
      loadMoreBtnEl.classList.add('is-hidden');
    } else {
      loadMoreBtnEl.classList.remove('is-hidden');
    }

    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );

    // if (pixabayAPI.page > response.data.totalHits / 40) {
    //   loadMoreBtnEl.classList.add('is-hidden');
    //   Notiflix.Notify.warning(
    //     "We're sorry, but you've reached the end of search results."
    //   );
    // }

    photoGalleryEl.innerHTML = createGalleryCard(response.data.hits);

    // LIGHTBOX
    gallery.refresh();
  } catch (err) {
    console.log(err);
  }
};

const onLoadMoreBtn = async () => {
  if (!pixabayAPI.dataOfPage()) {
    loadMoreBtnEl.classList.add('is-hidden');

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
      loadMoreBtnEl.classList.add('is-hidden');

      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    photoGalleryEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCard(response.data.hits)
    );

    // SMOOTH SCROLL
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (err) {
    console.log(err);
  }
};

searchFormEl.addEventListener('submit', onSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', onLoadMoreBtn);
