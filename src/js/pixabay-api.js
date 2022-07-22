import axios from 'axios';

export class PixabayAPI {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '28739489-898791d54d19d9dcf448a419d';

  constructor() {
    this.page = 1;
    this.q = null;
    this.per_page = 40;
    this.totalHits = null;
  }

  fetchPhotos() {
    return axios.get(`${this.#BASE_URL}`, {
      params: {
        key: this.#API_KEY,
        q: this.q,
        page: this.page,
        per_page: this.per_page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    });
  }

  dataOfPage() {
    return this.page * this.per_page < this.totalHits;
  }
}
