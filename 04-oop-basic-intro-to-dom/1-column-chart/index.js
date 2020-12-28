export default class ColumnChart {
  childElements = {};
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getChartTemplate();

    this.element = element.firstElementChild;
    
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.childElements = this.getChildElements(this.element);
  }

  getChildElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((resultObj, subElement) => {
      resultObj[subElement.dataset.element] = subElement;

      return resultObj;
    }, {});
  }

  getChartTemplate() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getChartLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.value}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.getChartColumn()} 
        </div>
      </div>
    </div>      
    `;
  }

  getChartLink() {
    return (this.link) ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getChartColumn() {
    const maxValue = Math.max(...this.data);
    return this.data
      .map(value => {
        const scale = value / maxValue;
        return `<div style="--value: ${Math.floor(this.chartHeight * scale)}" data-tooltip="${(scale * 100).toFixed(0)}%"></div>`;
      })
      .join('');
  }

  update(newData = []) {
    this.data = newData;  // update the property "data" that is used in getChartColumn
    this.childElements.body.innerHTML = this.getChartColumn();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.childElements = {};
  }

}


