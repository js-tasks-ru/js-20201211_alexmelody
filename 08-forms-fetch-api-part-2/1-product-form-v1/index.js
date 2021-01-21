import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultProductData = {
    title: '',
    subcategory: '',
    description: '',
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1,
    images: [],
  };

  constructor(productId = '') {
    this.productId = productId;
    this.categoriesURL = new URL('api/rest/categories', BACKEND_URL);
    this.productsURL = new URL('api/rest/products', BACKEND_URL);
  }

  //--------------------- DOM processing ----------------------------------------
  async render() {
    const data = await this.loadData();

    this.renderProductData(data.categories, data.product);

    return this.element;
  }

  renderProductData(categories, product) {
    const element = document.createElement('div');

    element.innerHTML = product
      ? this.getProductFormHTML(categories, product)
      : this.getErrorPageHTML();

    this.element = element.firstElementChild;

    if (product) {
      this.subElements = this.getSubElements(this.element);
      this.setFormData(product);
      this.initEventListeners();
    }
  }

  getErrorPageHTML() {
    return `<div>
      <h1 class="page-title">Ошибка загрузки данных</h1>
      <p>Продукт ${escapeHtml(this.productId)} не найден</p>
    </div>`;
  }

  getProductFormHTML(
    categories,
    product = {
      images: []
    }) {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            ${this.getImageListHTML(product.images)}
            <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.getCategoryListHTML(categories)}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="${this.defaultProductData.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${this.defaultProductData.discount}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${this.defaultProductData.quantity}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
            ${this.inCreateMode ? "Добавить" : "Сохранить"} товар
            </button>
          </div>
        </form>
      </div>
  `;
  }

  getCategoryListHTML(categories = []) {
    const html = `
      <select class="form-control" id="subcategory" name="subcategory">
        ${categories.map(category => this.getCategoryHTML(category)).join('')}
      </select>
    `;

    return html;
  }

  getCategoryHTML({
                    title = '',
                    subcategories = [],
                  } = {}) {
    const html = subcategories.map(subcategory =>
      `<option value=${subcategory.id}>${title} &gt; ${subcategory.title}</option>`
    ).join('');

    return html;
  }

  getImageListHTML(images = []) {
    return `
      <ul class="sortable-list" data-element="imageListContainer">
          ${images.map(image => this.getImageHTML(image.url, image.source)).join('')}
      </ul>     
    `;
  }

  getImageHTML(url, source) {
    const imgName = escapeHtml(source);
    const imgURL = escapeHtml(url);

    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${imgName}" src="${imgURL}">
          <span>${imgName}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  createImageItem(url, source) {
    const dummy = document.createElement('div');

    dummy.innerHTML = this.getImageHTML(url, source);

    return dummy.firstElementChild;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  // getSubElements(element) {
  //   // const elements = element.querySelectorAll('[data-element], [name]');
  //   const elements = element.querySelectorAll('[data-element]');
  //
  //   const subElements = [...elements].reduce((resultObj, subElement) => {
  //     const key = subElement.name || subElement.dataset.element;
  //     resultObj[key] = subElement;
  //     return resultObj;
  //   }, {});
  //
  //   return subElements;
  // }

  setFormData(product) {
    const { productForm } = this.subElements;
    const excludedFields = ['images', 'subcategory'];
    const formFields = Object.keys(this.defaultProductData).filter(key => !excludedFields.includes(key));

    for (const field of formFields) {
      // this.subElements[field].value = product[field];
      const element = productForm.querySelector(`#${field}`);

      element.value = product[field] || this.defaultProductData[field];
    }

    // if (!this.inCreateMode) {
    //   this.subElements.subcategory.value = product.subcategory;
    // }
  }

  getFormData() {
    const { productForm } = this.subElements;

    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const formFields = Object.keys(this.defaultProductData).filter(key => !excludedFields.includes(key));

    const product = {};
    product.id = this.productId;

    for (const field of formFields) {
      product[field] = formatToNumber.includes(field)
        ? parseInt(productForm.querySelector(`#${field}`).value)
        : productForm.querySelector(`#${field}`).value;
    }

    product.images = this.getProductFormImages();
    return product;
  }

  getProductFormImages() {
    const { imageListContainer } = this.subElements;
    const imageElements = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    const images = new Array();

    imageElements.forEach(image =>
      images.push({
        url: image.src,
        source: image.alt
      })
    );
    return images;
  }

  //--------------------- Events processing ----------------------------------------

  initEventListeners() {
    const { productForm, imageListContainer, uploadImage } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    imageListContainer.addEventListener('click', this.onImageDelete);
    uploadImage.addEventListener('click', this.onImageUpload);
  }

  onImageDelete = event => {
    if (event.target.alt !== 'delete') {
      return;
    }

    const imageItem = event.target.closest('li');

    if (!imageItem) {
      return;
    }

    imageItem.remove();
  }

  onImageUpload = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    // TODO: replace to addEventListener?
    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        try {
          const result = await fetchJson('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
            body: formData
          });

          imageListContainer.append(this.createImageItem(result.data.link, file.name));

        } catch (error) {

          console.error('Image upload error: ', error);

        } finally {
          uploadImage.classList.remove('is-loading');
          uploadImage.disabled = false;

          // Remove input from body
          fileInput.remove();
        }
      }
    };

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  }

  dispatchEvent(id) {
    const event = this.inCreateMode
      ? new CustomEvent('product-saved')
      : new CustomEvent('product-updated', { detail: id });

    this.element.dispatchEvent(event);
  }

  onSubmit = () => {
    this.save();
  };

  //--------------------- Data processing ----------------------------------------
  // save() {
  //   const product = this.getFormData();
  //   this.saveProductData(product);
  // }

  async save() {
    const productData = this.getFormData();

    try {
      const result = await fetchJson(this.productsURL, {
        method: this.inCreateMode ? 'PUT' : 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('Error when saving product data: ', error);
    }
  }

  async loadData() {
    const [categories, [product]] = await Promise.all([
      this.loadCategories(),
      this.loadProduct(),
    ]);

    return {
      product,
      categories
    }
  }

  async loadCategories({
                         _sort = 'weight',
                         _refs = 'subcategory',
                       } = {}) {
    const categoriesURL = new URL(this.categoriesURL);

    categoriesURL.searchParams.set('_sort', _sort);
    categoriesURL.searchParams.set('_refs', _refs);

    return fetchJson(categoriesURL);
  }

  async loadProduct({
                      id = this.productId,
                    } = {}) {
    if (this.inCreateMode) {
      return Promise.resolve([this.defaultProductData]);
    }

    const productsURL = new URL(this.productsURL);
    productsURL.searchParams.set('id', id);

    return fetchJson(productsURL);
  }

  //--------------------- Other methods ----------------------------------------
  get inCreateMode() {
    return !this.productId;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

}
